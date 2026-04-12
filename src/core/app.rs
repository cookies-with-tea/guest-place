use crate::core::DatabaseConfig;
use std::env;
use std::net::IpAddr;

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub app_host: IpAddr,
    pub app_port: u16,
    pub db_config: DatabaseConfig,
    pub public_url: String,
    pub redis_host: String,
    pub redis_port: u16,
    pub redis_password: Option<String>,
}

impl AppConfig {
    pub fn new() -> Self {
        let app_host_str = env::var("APP_HOST").expect("APP_HOST must be set");
        let app_host = app_host_str
            .parse()
            .expect("APP_HOST is not a valid IP address");

        let app_port_str = env::var("APP_PORT").expect("APP_PORT must be set");
        let app_port = app_port_str
            .parse()
            .expect("APP_PORT is not a valid port number");

        let db_config = DatabaseConfig::new();

        let public_url = env::var("PUBLIC_URL")
            .unwrap_or_else(|_| format!("http://{}:{}", app_host_str, app_port_str));

        let redis_host = env::var("REDIS_HOST").unwrap_or_else(|_| "localhost".to_string());
        let redis_port = env::var("REDIS_PORT")
            .unwrap_or_else(|_| "6379".to_string())
            .parse()
            .expect("REDIS_PORT is not a valid port number");
        let redis_password = env::var("REDIS_PASSWORD").ok().filter(|s| !s.is_empty());

        AppConfig {
            app_host,
            app_port,
            db_config,
            public_url,
            redis_host,
            redis_port,
            redis_password,
        }
    }
}
