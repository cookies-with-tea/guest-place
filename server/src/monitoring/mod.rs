pub mod handlers;
pub mod service;
pub mod dto;

use axum::Router;
use std::sync::Arc;
use crate::AppState;

/// `/health` остаётся публичным — типичный infra-healthcheck (балансировщик,
/// uptime-мониторинг) не несёт токена админки.
pub fn public_router() -> Router<Arc<AppState>> {
    Router::new().route("/health", axum::routing::get(handlers::get_health))
}

/// Всё остальное — живые CPU/memory-метрики процесса, весь live-лог сервера,
/// действия (module reload/alert) и поиск по админским данным — требует
/// auth_middleware.
pub fn protected_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/stats/stream", axum::routing::get(handlers::get_stats_stream))
        .route("/logs", axum::routing::get(handlers::get_logs))
        .route("/modules/{name}/reload", axum::routing::post(handlers::reload_module))
        .route("/alert", axum::routing::post(handlers::send_system_alert))
        .route("/search", axum::routing::get(handlers::global_search))
}
