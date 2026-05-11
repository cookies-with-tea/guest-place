use axum::Router;
use std::sync::Arc;
use crate::AppState;
use tracing::info;

pub trait Plugin: Send + Sync {
    fn name(&self) -> &str;
    fn version(&self) -> &str;
    fn setup(&self, _state: Arc<AppState>, router: Router) -> Router {
        router
    }
}

pub struct PluginManager {
    plugins: Vec<Box<dyn Plugin>>,
}

impl PluginManager {
    pub fn new() -> Self {
        Self {
            plugins: Vec::new(),
        }
    }

    pub fn register<P: Plugin + 'static>(&mut self, plugin: P) {
        info!("Registering plugin: {} v{}", plugin.name(), plugin.version());
        self.plugins.push(Box::new(plugin));
    }

    pub fn setup_plugins(&self, state: Arc<AppState>, mut router: Router) -> Router {
        for plugin in &self.plugins {
            router = plugin.setup(state.clone(), router);
        }
        router
    }
}
