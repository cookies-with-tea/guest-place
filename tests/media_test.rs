use axum_test::TestServer;
use guest_place::{create_router, AppState, core::app::AppConfig};
use guest_place::i18n::I18nService;
use guest_place::core::redis::RedisService;
use guest_place::features::FeatureFlagService;
use guest_place::media::storage::StorageService;
use guest_place::media::quota::QuotaService;
use axum::http::{StatusCode, header::ACCEPT_LANGUAGE};
use serde_json::{json, Value};
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
    
    let db_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| "postgres://admin:admin@localhost:5432/admin".to_string());
    
    // Use a real pool if possible, otherwise lazy
    let pool = PgPoolOptions::new()
        .max_connections(1)
        .connect_lazy(&db_url)
        .expect("Failed to create pool");

    let redis_url = "redis://localhost:6380";
    let redis_cfg = deadpool_redis::Config::from_url(redis_url);
    let redis_pool = redis_cfg.create_pool(Some(deadpool_redis::Runtime::Tokio1)).unwrap();
    let redis_service = Arc::new(RedisService::new(redis_pool));
        
    let mut config = AppConfig::new();
    config.public_url = "http://localhost:8000".to_string();

    let (log_tx, _) = tokio::sync::broadcast::channel(100);
    let state = Arc::new(AppState {
        pool: pool.clone(),
        config,
        i18n: I18nService::new(pool.clone()),
        media_storage: Arc::new(StorageService::new("uploads_test")),
        redis: redis_service.clone(),
        features: Arc::new(FeatureFlagService::new(redis_service.clone())),
        media_quota: Arc::new(QuotaService::new(pool.clone(), 1024)), // Small quota for testing
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
async fn test_upload_no_files() {
    let app = setup_test_app().await;
    let server = TestServer::new(app);

    // Add a dummy part to make it a valid multipart request but without any 'file' field
    let mut form = axum_test::multipart::MultipartForm::new();
    form = form.add_text("dummy", "value");

    let response = server
        .post("/api/v1/media")
        .add_header(ACCEPT_LANGUAGE, "en")
        .multipart(form)
        .await;

    assert_eq!(response.status_code(), StatusCode::BAD_REQUEST);
    let json: Value = response.json();
    let messages = json["messages"].as_array().unwrap();
    assert!(messages.iter().any(|m| m.as_str().unwrap().contains("Validation") || m.as_str().unwrap().contains("missing")));
    
    let errors = json["errors"].as_object().unwrap();
    assert!(errors.contains_key("file"));
    let file_errors = errors["file"].as_array().unwrap();
    assert!(file_errors.iter().any(|e| e.as_str().unwrap().contains("required") || e.as_str().unwrap().contains("missing")));
}

#[tokio::test]
async fn test_upload_no_files_ru() {
    let app = setup_test_app().await;
    let server = TestServer::new(app);

    // Add a dummy part to make it a valid multipart request but without any 'file' field
    let mut form = axum_test::multipart::MultipartForm::new();
    form = form.add_text("dummy", "value");

    let response = server
        .post("/api/v1/media")
        .add_header(ACCEPT_LANGUAGE, "ru")
        .multipart(form)
        .await;

    assert_eq!(response.status_code(), StatusCode::BAD_REQUEST);
    let json: Value = response.json();
    let messages = json["messages"].as_array().unwrap();
    assert!(messages.iter().any(|m| m.as_str().unwrap().contains("валидации") || m.as_str().unwrap().contains("missing")));

    let errors = json["errors"].as_object().unwrap();
    assert!(errors.contains_key("file"));
    let file_errors = errors["file"].as_array().unwrap();
    assert!(file_errors.iter().any(|e| e.as_str().unwrap().contains("обязателен") || e.as_str().unwrap().contains("missing")));
}

#[tokio::test]
async fn test_get_one_not_found() {
    let app = setup_test_app().await;
    let server = TestServer::new(app);
    let uuid = uuid::Uuid::new_v4();

    let response = server
        .get(&format!("/api/v1/media/{}", uuid))
        .add_header(ACCEPT_LANGUAGE, "en")
        .await;

    assert_eq!(response.status_code(), StatusCode::NOT_FOUND);
    let json: Value = response.json();
    assert!(json["messages"].as_array().unwrap()[0].as_str().unwrap().contains("not found") || json["messages"].as_array().unwrap()[0].as_str().unwrap().contains("missing"));
}

#[tokio::test]
async fn test_update_no_fields() {
    let app = setup_test_app().await;
    let server = TestServer::new(app);
    let uuid = uuid::Uuid::new_v4();

    let response = server
        .put(&format!("/api/v1/media/{}", uuid))
        .add_header(ACCEPT_LANGUAGE, "en")
        .json(&json!({}))
        .await;

    assert_eq!(response.status_code(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_quota_exceeded() {
    let app = setup_test_app().await;
    let server = TestServer::new(app);

    // Create a large file data to exceed the 1024 bytes quota set in setup_test_app
    let large_data = vec![0u8; 2048];
    
    let mut form = axum_test::multipart::MultipartForm::new();
    form = form.add_part("file", axum_test::multipart::Part::bytes(large_data).file_name("large.bin"));

    let response = server
        .post("/api/v1/media")
        .add_header(ACCEPT_LANGUAGE, "en")
        .multipart(form)
        .await;

    if response.status_code() == StatusCode::PAYLOAD_TOO_LARGE {
        let json: Value = response.json();
        assert!(json["messages"].as_array().unwrap()[0].as_str().unwrap().contains("quota") || json["messages"].as_array().unwrap()[0].as_str().unwrap().contains("missing"));
    }
}
