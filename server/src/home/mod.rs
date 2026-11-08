pub mod dto;
pub mod handlers;

use std::sync::Arc;
use axum::{
    routing::{get, put},
    Router,
};
use crate::AppState;

pub fn public_router() -> Router<Arc<AppState>> {
    Router::new().route("/", get(handlers::get_home))
}

pub fn protected_router() -> Router<Arc<AppState>> {
    Router::new().route("/", put(handlers::update_home).patch(handlers::update_home))
}
