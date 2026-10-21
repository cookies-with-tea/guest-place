pub mod handlers;
pub mod model;

use std::sync::Arc;
use axum::routing::get;
use axum::Router as AxRouter;
use crate::AppState;

pub fn public_router() -> AxRouter<Arc<AppState>> {
    AxRouter::new()
        .route("/check", get(handlers::check_redirect))
        .route("/go/{*path}", get(handlers::handle_redirect_navigation))
}

pub fn protected_router() -> AxRouter<Arc<AppState>> {
    AxRouter::new()
        .route("/", get(handlers::get_redirects).post(handlers::create_redirect))
        .route("/{id}", axum::routing::patch(handlers::update_redirect).delete(handlers::delete_redirect))
}
