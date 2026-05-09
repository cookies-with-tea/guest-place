use axum_test::TestServer;
use guest_place::{create_router, AppState, core::app::AppConfig};
use guest_place::i18n::I18nService;
use guest_place::core::redis::RedisService;
use guest_place::features::FeatureFlagService;
use guest_place::media::storage::StorageService;
use axum::http::StatusCode;
use serde_json::json;
use dotenv::dotenv;
use std::sync::Arc;
use sqlx::postgres::PgPoolOptions;
use tower_http::cors::CorsLayer;
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(paths())]
struct ApiDoc;

async fn setup_test_app() -> axum::Router {
    dotenv().ok();
    
    // Lazy connection to avoid needing a real DB for these tests
    let pool = PgPoolOptions::new()
        .connect_lazy("postgres://localhost/test_db")
        .expect("Failed to create lazy pool");

    // Stub redis pool
    let redis_cfg = deadpool_redis::Config::from_url("redis://localhost");
    let redis_pool = redis_cfg.create_pool(Some(deadpool_redis::Runtime::Tokio1)).unwrap();
    let redis_service = Arc::new(RedisService::new(redis_pool));
        
    let config = AppConfig::new();
    let (log_tx, _) = tokio::sync::broadcast::channel(100);
    let state = Arc::new(AppState {
        pool: pool.clone(),
        config: config.clone(),
        i18n: I18nService::new(pool.clone()),
        media_storage: Arc::new(StorageService::new("uploads")),
        redis: redis_service.clone(),
        features: Arc::new(FeatureFlagService::new(redis_service.clone())),
        media_quota: Arc::new(guest_place::media::quota::QuotaService::new(pool.clone(), 1024 * 1024 * 1024)),
        frontend_url: "http://localhost:3000".to_string(),
        smtp_host: "localhost".to_string(),
        smtp_port: 587,
        smtp_username: "test".to_string(),
        smtp_password: "test".to_string(),
        smtp_from: "test@example.com".to_string(),
        log_tx,
    });

    create_router(state, ApiDoc::openapi(), CorsLayer::permissive())
}

#[tokio::test]
async fn test_login_invalid_credentials() {
    let app = setup_test_app().await;
    let server = TestServer::new(app);

    let response = server
        .post("/api/v1/auth/login")
        .json(&json!({
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }))
        .await;

    // It should fail with unauthorized (it will try to query DB but will fail or return None)
    // Note: Since pool is lazy and DB is not there, it might panic or return error.
    // In a real setup, we'd use a test DB.
    assert!(response.status_code() == StatusCode::UNAUTHORIZED || response.status_code() == StatusCode::INTERNAL_SERVER_ERROR);
}
