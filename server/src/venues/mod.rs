pub mod handlers;
pub mod model;

use std::sync::Arc;
use axum::routing::get;
use axum::Router as AxRouter;
use crate::AppState;

pub fn public_router() -> AxRouter<Arc<AppState>> {
    AxRouter::new()
        .route("/", get(handlers::get_venues))
        .route("/{id}", get(handlers::get_venue_by_id_or_slug))
}

pub fn protected_router() -> AxRouter<Arc<AppState>> {
    AxRouter::new()
        .route("/", axum::routing::post(handlers::create_venue))
        .route("/{id}", axum::routing::patch(handlers::update_venue).delete(handlers::delete_venue))
}
