pub mod about;
pub mod auth;
pub mod content;
pub mod core;
pub mod features;
pub mod guests;
pub mod i18n;
pub mod mailer;
pub mod media;
pub mod mfe;
pub mod user;
pub mod platforms;
pub mod monitoring;
pub mod analytics;

pub use crate::core::dto::ApiResponse;

use crate::auth::middlewares::auth_middleware;
use crate::core::app::AppConfig;
use crate::core::redis::RedisService;
use crate::features::FeatureFlagService;
use crate::i18n::middlewares::locale_middleware;
use crate::i18n::I18nService;
use crate::media::quota::QuotaService;
use crate::media::storage::StorageService;
use axum::{middleware, Router};
use sqlx::{Pool, Postgres};
use std::sync::Arc;
use tower_http::{
    cors::CorsLayer,
    services::ServeDir,
};
use utoipa_swagger_ui::SwaggerUi;

#[derive(Clone, Debug)]
pub struct AppState {
    pub pool: Pool<Postgres>,
    pub config: AppConfig,
    pub i18n: I18nService,
    pub media_storage: Arc<StorageService>,
    pub redis: Arc<RedisService>,
    pub features: Arc<FeatureFlagService>,
    pub media_quota: Arc<QuotaService>,
    pub media_optimizer: Arc<crate::media::optimizer::MediaOptimizer>,
    pub frontend_url: String,
    pub smtp_host: String,
    pub smtp_port: u16,
    pub smtp_username: String,
    pub smtp_password: String,
    pub smtp_from: String,
    pub log_tx: tokio::sync::broadcast::Sender<String>,
    pub bus: Arc<crate::core::bus::RealtimeBus>,
}

pub fn create_router(state: Arc<AppState>, openapi: utoipa::openapi::OpenApi, cors: CorsLayer) -> Router {
    let public_router = Router::new()
        .nest("/api/v1/auth", auth::handlers::router())
        .nest("/api/v1/user", user::handlers::public_router())
        .nest("/api/v1/i18n", i18n::handlers::public_router())
        .nest("/api/v1/mfe", mfe::handlers::public_router())
        .nest("/api/v1/media", media::handlers::router())
        .nest("/api/v1/about", about::handlers::router())
        .nest("/api/v1/guests", guests::router())
        .nest("/api/v1/platforms", platforms::handlers::router())
        .nest("/api/v1/features", features::router())
        .nest("/api/v1/analytics", analytics::handlers::public_router())
        .nest_service("/uploads", ServeDir::new("uploads"));

    let protected_router = Router::new()
        .nest("/api/v1/auth", auth::handlers::protected_router())
        .nest("/api/v1/user", user::handlers::protected_router())
        .nest("/api/v1/i18n", i18n::handlers::protected_router())
        .nest("/api/v1/mfe", mfe::handlers::protected_router())
        .nest("/api/v1/content", content::router())
        .nest("/api/v1/analytics", analytics::handlers::protected_router())
        .layer(middleware::from_fn_with_state(
            state.clone(),
            auth_middleware,
        ));

    let app_router = public_router
        .merge(protected_router)
        .nest("/api/v1/system", monitoring::router())
        .route("/api/v1/events", axum::routing::get(monitoring::handlers::get_events))
        .with_state(state.clone())
        .layer(middleware::from_fn(locale_middleware));

    app_router
        .merge(SwaggerUi::new("/docs").url("/swagger/openapi.json", openapi))
        .layer(cors)
}
