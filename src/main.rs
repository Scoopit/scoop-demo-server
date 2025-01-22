use std::{net::SocketAddr, path::PathBuf, sync::Arc};

use config::Config;
use error::handle_errors;
use log::{debug, info};
use scoopit_api::{
    GetProfileRequest, GetTopicRequest, ScoopitAPIClient, SearchRequest, SearchRequestType,
};
use warp::{http, http::header, Filter};
mod config;
mod error;
mod metrics;
mod output;

const VERSION: &'static str = env!("CARGO_PKG_VERSION");

/// The resources that can be used when handling requests
struct ServerResources {
    scoopit_client: ScoopitAPIClient,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // generic setup & config parsing
    let _ = dotenvy::dotenv();
    env_logger::init();
    let config = Config::try_from_env()?;

    // create needed server resources.
    let server_resources = Arc::new(ServerResources {
        scoopit_client: ScoopitAPIClient::authenticate_with_client_credentials(
            Default::default(),
            &config.client_id,
            &config.client_secret,
        )
        .await?,
    });

    // launch metrics process collector (works only on linux)
    metrics::launch_async_process_collector();

    // request handlers
    let log = warp::log("access_log");
    let version = warp::path("version").and(warp::path::end()).map(|| VERSION);
    let health = warp::path("health").and(warp::path::end()).map(|| "OK");
    let metrics = warp::path("metrics")
        .and(warp::path::end())
        .map(|| metrics::generate_metrics().unwrap_or_else(|_e| String::new()));

    let get_topic = {
        let server_resources = server_resources.clone();
        warp::get()
            .and(warp::path("api"))
            .and(warp::path("topic"))
            .and(warp::path::param())
            .and(warp::path::end())
            .and_then(move |url_name| handle_errors(get_topic(url_name, server_resources.clone())))
    };

    let get_user = {
        let server_resources = server_resources.clone();
        warp::get()
            .and(warp::path("api"))
            .and(warp::path("user"))
            .and(warp::path::param())
            .and(warp::path::end())
            .and_then(move |short_name| {
                handle_errors(get_user(short_name, server_resources.clone()))
            })
    };

    let search = {
        let server_resources = server_resources.clone();
        warp::get()
            .and(warp::path("api"))
            .and(warp::path("search"))
            .and(warp::path::param())
            .and(warp::path::param())
            .and(warp::path::end())
            .and_then(move |search_type, query| {
                handle_errors(search(search_type, query, server_resources.clone()))
            })
    };

    let mut index_html = PathBuf::from(config.static_html());
    index_html.push("index.html");
    info!(
        "Serving static files from directory: {}",
        config.static_html()
    );
    info!("index.html path: {}", index_html.to_string_lossy());

    let serve_static_files = warp::filters::fs::dir(config.static_html().to_string());

    // serve index.html on some specific path handled by React Router
    let server_index_html = warp::get()
        .and(warp::path("topic").or(warp::path("search")).unify())
        .and(warp::fs::file(index_html));

    // 404 not found for all get requests not matching any filters
    let catch_all_not_found = warp::get().map(|| http::StatusCode::NOT_FOUND);

    warp::serve(
        health
            .or(version)
            .or(metrics)
            .or(get_topic)
            .or(get_user)
            .or(search)
            .or(serve_static_files)
            .or(server_index_html)
            .or(catch_all_not_found) // MUST be the last one!!!
            .with(log)
            .with(metrics::request_metrics())
            .with(warp::filters::reply::header(
                header::SERVER,
                format!("scoopit-api-demo {}", VERSION),
            )),
    )
    .run(config.bind_address.parse::<SocketAddr>()?)
    .await;

    Ok(())
}

async fn get_topic(
    url_name: String,
    resources: Arc<ServerResources>,
) -> anyhow::Result<Box<dyn warp::Reply>> {
    // Get from API
    let topic = resources
        .scoopit_client
        .get(GetTopicRequest {
            url_name: Some(url_name),

            ..Default::default()
        })
        .await?;
    //debug!("Topic: {:#?}", topic);
    // convert to json using our smaller types.
    Ok(Box::new(warp::reply::json(&output::TopicJsonOutput::from(
        topic,
    ))))
}

async fn get_user(
    short_name: String,
    resources: Arc<ServerResources>,
) -> anyhow::Result<Box<dyn warp::Reply>> {
    // Get from API
    let topic = resources
        .scoopit_client
        .get(GetProfileRequest {
            short_name: Some(short_name),
            ..Default::default()
        })
        .await?;

    // convert to json using our smaller types.
    Ok(Box::new(warp::reply::json(&output::UserJsonOutput::from(
        topic,
    ))))
}

async fn search(
    search_type: SearchRequestType,
    query: String,
    resources: Arc<ServerResources>,
) -> anyhow::Result<Box<dyn warp::Reply>> {
    let query = urlencoding::decode(&query)?;
    debug!("Searching: {}", query);
    // Get from API
    let results = resources
        .scoopit_client
        .get(SearchRequest {
            search_type,
            query: query.to_string(),
            lang: Some("fr".to_string()),
            ..Default::default()
        })
        .await?;

    // convert to json using our smaller types.
    Ok(Box::new(warp::reply::json(
        &output::SearchJsonOutput::from(results),
    )))
}
