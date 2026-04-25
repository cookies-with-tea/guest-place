pub mod about;
pub mod auth;
pub mod core;
pub mod i18n;
pub mod media;
pub mod user;
pub mod mailer;
pub mod mfe;
pub mod features;
pub mod content;
pub mod guests;

pub use crate::core::dto::ApiResponse;

use crate::auth::middlewares::auth_middleware;
use crate::core::redis::RedisService;
use crate::features::FeatureFlagService;
use crate::media::quota::QuotaService;
use crate::i18n::middlewares::locale_middleware;
use crate::i18n::I18nService;
use axum::routing::{delete, get, post};
use axum::{middleware, Router};
use sqlx::{Pool, Postgres};
use std::sync::Arc;
use tower_http::{
    cors::CorsLayer,
    services::ServeDir,
};
use utoipa_swagger_ui::SwaggerUi;
use crate::media::storage::StorageService;

#[derive(Clone, Debug)]
pub struct AppState {
    pub pool: Pool<Postgres>,
    pub config: crate::core::app::AppConfig,
    pub i18n: I18nService,
    pub media_storage: Arc<StorageService>,
    pub redis: Arc<RedisService>,
    pub features: Arc<FeatureFlagService>,
    pub media_quota: Arc<QuotaService>,
    pub frontend_url: String,
    pub smtp_host: String,
    pub smtp_port: u16,
    pub smtp_username: String,
    pub smtp_password: String,
    pub smtp_from: String,
}

pub fn create_app(state: Arc<AppState>, openapi: utoipa::openapi::OpenApi, cors: CorsLayer) -> Router {
    let auth_layer = middleware::from_fn_with_state(state.clone(), auth_middleware);

    let user_router = user::handlers::public_router()
        .merge(user::handlers::protected_router().layer(auth_layer.clone()));
    
    let i18n_router = Router::new()
        .route("/{dict_key}", get(i18n::handlers::get_by_dict_key))
        .route("/", post(i18n::handlers::create_or_update).get(i18n::handlers::get_all).layer(auth_layer.clone()))
        .route("/{key}/{locale}", delete(i18n::handlers::delete_one).layer(auth_layer.clone()));

    let mfe_router = mfe::handlers::public_router()
        .merge(mfe::handlers::protected_router().layer(auth_layer.clone()));

    let app_router = Router::new()
        .route("/api/v1/health", get(|| async { "OK" }))
        .nest("/api/v1/auth", auth::handlers::router())
        .nest("/api/v1/user", user_router)
        .nest("/api/v1/i18n", i18n_router)
        .nest("/api/v1/mfe", mfe_router)
        .nest("/api/v1/media", media::handlers::router().layer(auth_layer.clone()))
        .nest("/api/v1/about", about::handlers::router())
        .nest("/api/v1/guests", guests::router())
        .nest("/api/v1/features", features::router().layer(auth_layer.clone()))
        .nest("/api/v1/content", content::router().layer(auth_layer))
        .nest_service("/uploads", ServeDir::new("uploads"))
        .layer(middleware::from_fn(locale_middleware))
        .with_state(state.clone());

    let swagger_router = Router::new()
        .merge(SwaggerUi::new("/docs").url("/swagger/openapi.json", openapi));

    app_router.merge(swagger_router).layer(cors)
}
