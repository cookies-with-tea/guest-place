pub mod handlers;
pub mod model;

use std::sync::Arc;
use axum::routing::{get, post};
use axum::Router as AxRouter;
use crate::AppState;

pub fn pages_public_router() -> AxRouter<Arc<AppState>> {
    AxRouter::new()
        .route("/", get(handlers::get_pages))
        .route("/sitemap.xml", get(handlers::get_sitemap_xml))
        .route("/{id}", get(handlers::get_page))
        .route("/{id}/breadcrumbs", get(handlers::get_page_breadcrumbs))
}

pub fn pages_protected_router() -> AxRouter<Arc<AppState>> {
    AxRouter::new()
        .route("/", post(handlers::create_page))
        .route("/{id}", axum::routing::patch(handlers::update_page).delete(handlers::delete_page))
}

pub fn block_types_public_router() -> AxRouter<Arc<AppState>> {
    AxRouter::new()
        .route("/", get(handlers::get_block_types))
        .route("/sync", post(handlers::sync_block_types))
}

pub fn block_types_protected_router() -> AxRouter<Arc<AppState>> {
    AxRouter::new()
        .route("/", post(handlers::create_block_type))
        .route("/{id}", axum::routing::patch(handlers::update_block_type).delete(handlers::delete_block_type))
}
