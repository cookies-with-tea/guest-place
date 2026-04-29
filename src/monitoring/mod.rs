pub mod handlers;
pub mod service;

use axum::Router;
use std::sync::Arc;
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/stats/stream", axum::routing::get(handlers::get_stats_stream))
        .route("/logs", axum::routing::get(handlers::get_logs))
}
