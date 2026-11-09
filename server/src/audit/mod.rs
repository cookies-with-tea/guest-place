pub mod handlers;
pub mod model;

use crate::AppState;
use axum::{routing::get, Router as AxRouter};
use std::sync::Arc;
use uuid::Uuid;

/// Пишет запись в журнал админских действий. `actor_email` берётся живым подзапросом
/// по `actor_user_id` в момент записи — так вызывающему коду (Claims несёт только
/// `sub`/`role`/`permissions`, без email) не нужно отдельно идти в БД за email, чтобы
/// передать его сюда. Никогда не роняет вызывающий запрос — ошибка записи только
/// логируется, основная операция (которая уже выполнилась к моменту вызова) не
/// откатывается и не возвращает ошибку клиенту из-за этого.
pub async fn log_action(
    pool: &sqlx::PgPool,
    actor_user_id: Option<Uuid>,
    action: &str,
    entity_type: Option<&str>,
    entity_id: Option<&str>,
    payload: Option<serde_json::Value>,
) {
    if let Err(e) = sqlx::query(
        "INSERT INTO audit_log (actor_user_id, actor_email, action, entity_type, entity_id, payload)
         VALUES ($1, (SELECT email FROM guest_user WHERE uuid = $1), $2, $3, $4, $5)",
    )
    .bind(actor_user_id)
    .bind(action)
    .bind(entity_type)
    .bind(entity_id)
    .bind(payload)
    .execute(pool)
    .await
    {
        tracing::error!("Failed to write audit log entry (action={}): {:?}", action, e);
    }
}

/// Требует permission `audit:read` (см. миграцию 20261109100000_audit_log) —
/// история всех админских действий, самая чувствительная read-операция в системе.
pub fn protected_router(state: Arc<AppState>) -> AxRouter<Arc<AppState>> {
    AxRouter::new()
        .route("/", get(handlers::list_audit_log))
        .route_layer(axum::middleware::from_fn_with_state(
            state,
            crate::auth::middlewares::require_audit_read,
        ))
}
