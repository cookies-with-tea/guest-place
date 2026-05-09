use axum::http::StatusCode;
use axum_test::TestServer;
use guest_place::{core::app::AppConfig, core::db::create_pool, create_router, AppState};
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use utoipa::OpenApi;

#[derive(utoipa::OpenApi)]
#[openapi(paths())]
struct ApiDoc;

async fn setup_test_server() -> TestServer {
    dotenv::dotenv().ok();
    let config = AppConfig::new();
    let pool = create_pool(&config).await;

    let redis = Arc::new(guest_place::core::redis::RedisService::new(
        guest_place::core::db::create_redis_pool(&config),
    ));
    let features = Arc::new(guest_place::features::FeatureFlagService::new(
        redis.clone(),
    ));
    let media_quota = Arc::new(guest_place::media::quota::QuotaService::new(
        pool.clone(),
        1024 * 1024 * 1024,
    ));

    sqlx::migrate!()
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    let (log_tx, _) = tokio::sync::broadcast::channel(100);
    let state = Arc::new(AppState {
        pool: pool.clone(),
        config: config.clone(),
        i18n: guest_place::i18n::I18nService::new(create_pool(&config).await),
        media_storage: Arc::new(guest_place::media::storage::StorageService::new("tmp")),
        redis,
        features,
        media_quota,
        frontend_url: "http://localhost:3000".to_string(),
        smtp_host: "localhost".to_string(),
        smtp_port: 587,
        smtp_username: "test".to_string(),
        smtp_password: "test".to_string(),
        smtp_from: "test@example.com".to_string(),
        log_tx,
    });

    let openapi = ApiDoc::openapi();
    let cors = CorsLayer::permissive();
    let app = create_router(state, openapi, cors);

    TestServer::new(app)
}

#[tokio::test]
async fn test_mfe_get_all() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/v1/mfe")
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
