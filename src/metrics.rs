use std::time::Duration;

use log::*;
use prometheus::{Encoder, TextEncoder};
use warp::log::Info;

/// Generate the content of /metrics prometheus metrics gathering endpoint.
///
pub fn generate_metrics() -> anyhow::Result<String> {
    // Gather the metrics.
    let mut buffer = vec![];
    let encoder = TextEncoder::new();
    let metric_families = prometheus::gather();
    encoder.encode(&metric_families, &mut buffer)?;
    Ok(String::from_utf8(buffer)?)
}

/// Collect generic data on the running process
pub fn launch_async_process_collector() {
    tokio::task::spawn(collect(Duration::from_secs(60)));
}

#[cfg(target_os = "linux")]
async fn collect(interval: Duration) {
    use prometheus::core::Collector;

    let process_collector = prometheus::process_collector::ProcessCollector::for_self();
    loop {
        debug!("Collecting process info");
        process_collector.collect();
        tokio::time::delay_for(interval).await;
    }
}

#[cfg(not(target_os = "linux"))]
async fn collect(interval: Duration) {
    loop {
        warn!("Collecting process info not available on this platform");
        tokio::time::sleep(interval).await;
    }
}

/// wrapper that handle request metrics
pub fn request_metrics() -> warp::log::Log<impl Fn(Info) + Clone> {
    let total = prometheus::IntCounterVec::new(
        prometheus::Opts::new("http_request_total", "HTTP requests handled"),
        &["method", "status"],
    )
    .unwrap();

    let request_duration = prometheus::Histogram::with_opts(
        prometheus::HistogramOpts::new("http_request_duration_seconds", "HTTP requests duration")
            .buckets(vec![
                0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0,
                25.0, 50.0, 100.0,
            ]),
    )
    .unwrap();
    prometheus::register(Box::new(request_duration.clone())).unwrap();
    prometheus::register(Box::new(total.clone())).unwrap();

    warp::log::custom(move |info| {
        if info.path().starts_with("/metrics") || info.path().starts_with("/health") {
            return;
        }
        total
            .clone()
            .get_metric_with_label_values(&[
                &info.method().to_string(),
                &format!("{}", info.status().as_u16()),
            ])
            .unwrap()
            .inc();

        request_duration.observe(info.elapsed().as_secs_f64());
    })
}
