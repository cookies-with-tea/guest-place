pub mod model;
pub mod handlers;

use std::sync::Arc;
use axum::Router as AxRouter;
use axum::routing::{get, post};
use crate::AppState;

pub fn router() -> AxRouter<Arc<AppState>> {
    AxRouter::new()
        .route("/schemas", get(handlers::get_schemas).post(handlers::create_schema))
        .route("/schemas/{id}", get(handlers::get_schema).patch(handlers::update_schema).delete(handlers::delete_schema))
        .route("/schemas/by-identifier/{identifier}", get(handlers::get_schema_by_identifier))
        .route("/schemas/{schema_id}/entries", get(handlers::get_entries))
        .route("/entries", post(handlers::create_entry))
        .route("/entries/{id}", get(handlers::get_entry).patch(handlers::update_entry).delete(handlers::delete_entry))
}
