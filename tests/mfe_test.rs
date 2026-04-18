use axum::http::StatusCode;
use axum_test::TestServer;
use std::sync::Arc;
use guest_platform::{create_app, AppState, core::db::create_pool, core::app::AppConfig};
use tower_http::cors::CorsLayer;
use utoipa::OpenApi;

#[derive(utoipa::OpenApi)]
#[openapi(paths())]
struct ApiDoc;

async fn setup_test_server() -> TestServer {
    dotenv::dotenv().ok();
    let config = AppConfig::new();
    let pool = create_pool(&config).await;
    
    let state = Arc::new(AppState {
        pool,
        i18n: guest_platform::i18n::I18nService::new(create_pool(&config).await),
        media_storage: Arc::new(guest_platform::media::storage::StorageService::new("tmp")),
        redis: Arc::new(guest_platform::core::redis::RedisService::new(guest_platform::core::db::create_redis_pool(&config))),
        features: Arc::new(guest_platform::core::features::FeatureFlagService::new(Arc::new(guest_platform::core::redis::RedisService::new(guest_platform::core::db::create_redis_pool(&config))))),
        frontend_url: "http://localhost:3000".to_string(),
        smtp_host: "localhost".to_string(),
        smtp_port: 587,
        smtp_username: "test".to_string(),
        smtp_password: "test".to_string(),
        smtp_from: "test@example.com".to_string(),
    });

    let openapi = ApiDoc::openapi();
    let cors = CorsLayer::permissive();
    let app = create_app(state, openapi, cors);
    
    TestServer::new(app)
}

#[tokio::test]
async fn test_mfe_get_all() {
    let server = setup_test_server().await;
    
    let response = server.get("/api/v1/mfe")
        .add_header("Authorization", "TestBearer")
        .await;
    response.assert_status(StatusCode::OK);
}

#[tokio::test]
async fn test_mfe_manifest() {
    let server = setup_test_server().await;
    
    let response = server.get("/api/v1/mfe/manifest").await;
    response.assert_status(StatusCode::OK);
}
