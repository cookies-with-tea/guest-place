pub mod handlers;
pub mod service;
pub mod dto;

use axum::Router;
use std::sync::Arc;
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/health", axum::routing::get(handlers::get_health))
        .route("/stats/stream", axum::routing::get(handlers::get_stats_stream))
        .route("/logs", axum::routing::get(handlers::get_logs))
        .route("/modules/{name}/reload", axum::routing::post(handlers::reload_module))
        .route("/search", axum::routing::get(handlers::global_search))
}
