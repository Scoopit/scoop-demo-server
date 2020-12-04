use anyhow::Context;
use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub bind_address: String,
    pub client_id: String,
    pub client_secret: String,
}
impl Config {
    pub fn try_from_env() -> anyhow::Result<Self> {
        envy::prefixed("APP_")
            .from_env()
            .context("Unable to read config from environment variables")
    }
}
