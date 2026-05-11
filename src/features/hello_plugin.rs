use axum::{Router, routing::get, Json};
use std::sync::Arc;
use crate::AppState;
use crate::core::plugin::Plugin;

pub struct HelloPlugin;

impl Plugin for HelloPlugin {
    fn name(&self) -> &str {
        "hello-plugin"
    }

    fn version(&self) -> &str {
        "1.0.0"
    }

    fn setup(&self, _state: Arc<AppState>, router: Router) -> Router {
        router.route("/api/v1/hello", get(|| async { Json("Hello from Plugin!") }))
    }
}
