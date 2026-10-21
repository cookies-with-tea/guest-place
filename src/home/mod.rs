pub mod dto;
pub mod handlers;

use std::sync::Arc;
use axum::{routing::get, Router};
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route(
            "/",
            get(handlers::get_home)
                .put(handlers::update_home)
                .patch(handlers::update_home),
        )
}
