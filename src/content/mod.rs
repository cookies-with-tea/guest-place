pub mod model;
pub mod handlers;

use std::sync::Arc;
use axum::Router as AxRouter;
use axum::routing::{get, post};
use crate::AppState;

pub fn public_router() -> AxRouter<Arc<AppState>> {
    AxRouter::new()
        .route("/schemas", get(handlers::get_schemas))
        .route("/schemas/{id}", get(handlers::get_schema))
        .route("/schemas/by-identifier/{identifier}", get(handlers::get_schema_by_identifier))
        .route("/schemas/{schema_id}/entries", get(handlers::get_entries))
        .route("/entries/{id}", get(handlers::get_entry))
}

pub fn protected_router() -> AxRouter<Arc<AppState>> {
    AxRouter::new()
        .route("/schemas", post(handlers::create_schema))
        .route("/schemas/{id}", axum::routing::patch(handlers::update_schema).delete(handlers::delete_schema))
        .route("/entries", post(handlers::create_entry))
        .route("/entries/{id}", axum::routing::patch(handlers::update_entry).delete(handlers::delete_entry))
        .route("/entries/{id}/versions", get(handlers::get_entry_versions))
        .route("/entries/{id}/versions/{version_id}/rollback", post(handlers::rollback_entry_version))
}

pub fn router() -> AxRouter<Arc<AppState>> {
    public_router().merge(protected_router())
}
