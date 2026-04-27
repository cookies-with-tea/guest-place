use axum::http::StatusCode;
use axum_test::TestServer;
use std::sync::Arc;
use guest_platform::{create_router, AppState, i18n::I18nService, core::db::create_pool, core::app::AppConfig};
use tower_http::cors::CorsLayer;
use utoipa::OpenApi;
use serde_json::json;

#[derive(utoipa::OpenApi)]
#[openapi(paths())]
struct ApiDoc;

async fn setup_test_server() -> TestServer {
    dotenv::dotenv().ok();
    let config = AppConfig::new();
    let pool = create_pool(&config).await;
    let i18n = I18nService::new(pool.clone());
    let redis = Arc::new(guest_platform::core::redis::RedisService::new(guest_platform::core::db::create_redis_pool(&config)));
    let features = Arc::new(guest_platform::features::FeatureFlagService::new(redis.clone()));
    
    let state = Arc::new(AppState {
        pool: pool.clone(),
        config: config.clone(),
        i18n,
        media_storage: Arc::new(guest_platform::media::storage::StorageService::new("tmp")),
        redis,
        features,
        media_quota: Arc::new(guest_platform::media::quota::QuotaService::new(pool.clone(), 1024 * 1024 * 1024)),
        frontend_url: "http://localhost:3000".to_string(),
        smtp_host: "localhost".to_string(),
        smtp_port: 587,
        smtp_username: "test".to_string(),
        smtp_password: "test".to_string(),
        smtp_from: "test@example.com".to_string(),
    });

    let openapi = ApiDoc::openapi();
    let cors = CorsLayer::permissive();
    let app = create_router(state, openapi, cors);
    
    TestServer::new(app)
}

#[tokio::test]
async fn test_i18n_get_dict() {
    let server = setup_test_server().await;
    
    // Using the public endpoint
    let response = server.get("/api/v1/i18n/general").await;
    response.assert_status(StatusCode::OK);
}

#[tokio::test]
async fn test_i18n_create_and_delete() {
    let server = setup_test_server().await;
    
    // Create
    let response = server.post("/api/v1/i18n")
        .add_header("Authorization", "TestBearer")
        .json(&json!({
            "key": "test_unit",
            "locale": "en",
            "value": "Test Value"
        })).await;
    response.assert_status(StatusCode::OK);
    
    // Delete
    let response = server.delete("/api/v1/i18n/test_unit/en")
        .add_header("Authorization", "TestBearer")
        .await;
    response.assert_status(StatusCode::OK);
}
