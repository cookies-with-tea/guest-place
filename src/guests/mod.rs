pub mod dto;
pub mod handlers;

use axum::Router;
use axum::{
    routing::{get, put},
};
use std::sync::Arc;
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(handlers::get_guests).put(handlers::update_guests))
}
