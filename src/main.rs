mod core;
mod auth;
mod media;
mod user;

use crate::core::app::AppConfig;
use crate::core::db::create_pool;
use axum::http::{HeaderName, Method};
use sqlx::{Pool, Postgres};
use std::sync::Arc;
use std::time::Duration;
use tower_http::{
  cors::{AllowHeaders, AllowMethods, AllowOrigin, CorsLayer},
  services::ServeDir,
};
use utoipa::{
  openapi::security::{ApiKey, ApiKeyValue, SecurityScheme},
  Modify, OpenApi,
};
use utoipa_axum::router::OpenApiRouter;
use utoipa_swagger_ui::SwaggerUi;

#[derive(Clone, Debug)]
struct AppState {
    pool: Pool<Postgres>,
}

#[derive(OpenApi)]
#[openapi(
  paths(
    crate::auth::handlers::login,
    crate::auth::handlers::logout,
    crate::auth::handlers::refresh,
    crate::user::handlers::create,
    crate::user::handlers::get_all,
    crate::user::handlers::get_one,
    crate::user::handlers::delete_one,
    crate::media::handlers::create,
    crate::media::handlers::get_all,
  ),
  modifiers(&SecurityAddon),
  tags(
        (name = "Auth", description = "Auth"),
        (name = "Media", description = "Media"),
        (name = "User", description = "User"),
  )
)]
struct ApiDoc;

struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "api_key",
                SecurityScheme::ApiKey(ApiKey::Header(ApiKeyValue::new("gp_apikey"))),
            )
        }
    }
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().init();
    dotenv::dotenv().ok();

    let config = AppConfig::new();
    let pool = create_pool(&config).await;
    let app_host = config.app_host.clone();
    let app_port = config.app_port.clone();

    let shared_state = Arc::new(AppState { pool: pool.clone() });

    // DEBT: Вынести в env
    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::list(vec![
            "http://localhost:8000".parse().unwrap(),
            "http://localhost:5500".parse().unwrap(),
            "http://127.0.0.1:5500".parse().unwrap(),
        ]))
        .allow_methods(AllowMethods::list(vec![
            Method::POST,
            Method::GET,
            Method::PUT,
            Method::DELETE,
        ]))
        .allow_headers(AllowHeaders::list(vec![
            HeaderName::from_static("content-type"),
            HeaderName::from_static("authorization"),
        ]))
        .allow_credentials(true)
        .max_age(Duration::from_secs(3600));

    let media_service = ServeDir::new("media");

    let (router, api) = OpenApiRouter::with_openapi(ApiDoc::openapi())
        .nest("/api/v1/auth", auth::handlers::routing())
        .nest("/api/v1/user", user::handlers::routing())
        .nest("/api/v1/media", media::handlers::routing())
        .with_state(shared_state.clone())
        .nest_service("/media", media_service)
        .split_for_parts();

    let router = router
        .merge(SwaggerUi::new("/docs").url("/swagger/openapi.json", api.clone()))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind(format!("{}:{}", { app_host }, { app_port }))
        .await
        .unwrap();

    println!("Server is running at http://{}:{}/", app_host, app_port);
    println!(
        "Swagger is running at http://{}:{}/docs",
        app_host, app_port
    );

    let _ = sqlx::migrate!().run(&pool.clone()).await;

    axum::serve(listener, router.into_make_service())
        .await
        .expect("Error");
}
