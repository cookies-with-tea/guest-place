pub mod handlers;
pub mod model;

use std::sync::Arc;
use axum::routing::get;
use axum::Router as AxRouter;
use crate::AppState;

pub fn public_router() -> AxRouter<Arc<AppState>> {
    AxRouter::new()
        .route("/{id}", get(handlers::get_menu_by_location))
}

pub fn protected_router() -> AxRouter<Arc<AppState>> {
    AxRouter::new()
        .route("/", get(handlers::get_menus).post(handlers::create_menu))
        .route("/{id}", axum::routing::patch(handlers::update_menu).delete(handlers::delete_menu))
}
