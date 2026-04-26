use crate::core::app::AppConfig;
use sqlx::postgres::PgPoolOptions;
use std::env;

#[derive(Clone, Debug)]
pub struct DatabaseConfig {
    pub db_engine: String,
    pub db_name: String,
    pub db_user: String,
    pub db_password: String,
    pub db_host: String,
    pub db_port: String,
}

impl DatabaseConfig {
    pub fn new() -> Self {
        let db_engine = env::var("APP_DB_ENGINE").expect("APP_DB_ENGINE must be set");
        let db_name = env::var("POSTGRES_DB").expect("POSTGRES_DB must be set");
        let db_user = env::var("POSTGRES_USER").expect("POSTGRES_USER must be set");
        let db_password = env::var("POSTGRES_PASSWORD").expect("POSTGRES_PASSWORD must be set");
        let db_host = env::var("POSTGRES_HOST").expect("POSTGRES_HOST must be set");
        let db_port = env::var("POSTGRES_PORT").unwrap_or_else(|_| "5432".to_string());

        DatabaseConfig {
            db_engine,
            db_name,
            db_user,
            db_password,
            db_host,
            db_port,
        }
    }

    pub fn connect_url(&self) -> String {
        let engine = if self.db_engine == "pg" { "postgres" } else { &self.db_engine };
        format!(
            "{}://{}:{}@{}:{}/{}?sslmode=prefer",
            engine, self.db_user, self.db_password, self.db_host, self.db_port, self.db_name
        )
    }
}

pub async fn create_pool(config: &AppConfig) -> sqlx::Pool<sqlx::Postgres> {
    let connect_url = config.db_config.connect_url();

    println!("Connecting to database: {}", connect_url);

    PgPoolOptions::new()
        .max_connections(5)
        .connect(&connect_url)
        .await
        .expect(&format!("Failed to connect to database at {}", connect_url))
}

pub fn create_redis_pool(config: &AppConfig) -> deadpool_redis::Pool {
    let redis_url = if let Some(password) = &config.redis_password {
        format!("redis://:{}@{}:{}", password, config.redis_host, config.redis_port)
    } else {
        format!("redis://{}:{}", config.redis_host, config.redis_port)
    };

    println!("Connecting to Redis: {}", redis_url);

    let cfg = deadpool_redis::Config::from_url(redis_url);
    cfg.create_pool(Some(deadpool_redis::Runtime::Tokio1))
        .expect("Failed to create Redis pool")
}
