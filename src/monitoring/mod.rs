pub mod handlers;
pub mod service;

use axum::Router;
use std::sync::Arc;
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/stats", axum::routing::get(handlers::get_stats))
        .route("/logs", axum::routing::get(handlers::get_logs))
}
