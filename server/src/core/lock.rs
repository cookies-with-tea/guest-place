use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    routing::{delete, get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::{
    auth::dto::Claims,
    core::{
        bus::SystemEvent,
        dto::ApiResponse,
        response::into_api_response,
    },
    AppState,
};

const DEFAULT_LOCK_TTL_SECONDS: usize = 45;

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct LockInfo {
    pub entity_type: String,
    pub entity_id: String,
    pub user_id: String,
    pub user_name: String,
    pub locked_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct LockStatusResponse {
    pub is_locked: bool,
    pub lock_info: Option<LockInfo>,
    pub is_own_lock: bool,
}

#[derive(Debug, Clone, Deserialize, utoipa::ToSchema)]
pub struct AcquireLockRequest {
    pub user_name: String,
    pub force: Option<bool>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ReleaseLockQuery {
    pub force: Option<bool>,
}

fn lock_key(entity_type: &str, entity_id: &str) -> String {
    format!("gp:lock:{}:{}", entity_type, entity_id)
}

#[utoipa::path(
    get,
    path = "/api/v1/locks/{entity_type}/{entity_id}",
    params(
        ("entity_type" = String, Path, description = "Entity type e.g. schema, entry"),
        ("entity_id" = String, Path, description = "Entity UUID or slug")
    ),
    responses(
        (status = 200, description = "Current lock status", body = ApiResponse<LockStatusResponse>)
    ),
    tag = "System"
)]
pub async fn get_lock_status(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path((entity_type, entity_id)): Path<(String, String)>,
) -> Result<Json<ApiResponse<LockStatusResponse>>, (StatusCode, Json<ApiResponse<LockStatusResponse>>)> {
    let key = lock_key(&entity_type, &entity_id);
    let lock_info: Option<LockInfo> = state.redis.get(&key).await.unwrap_or(None);
    let current_user_id = claims.sub.to_string();

    let (is_locked, is_own) = match &lock_info {
        Some(info) => (true, info.user_id == current_user_id),
        None => (false, false),
    };

    let response = LockStatusResponse {
        is_locked,
        lock_info,
        is_own_lock: is_own,
    };

    into_api_response(StatusCode::OK, Some(response), None, None)
}

#[utoipa::path(
    post,
    path = "/api/v1/locks/{entity_type}/{entity_id}",
    params(
        ("entity_type" = String, Path, description = "Entity type e.g. schema, entry"),
        ("entity_id" = String, Path, description = "Entity UUID or slug")
    ),
    request_body = AcquireLockRequest,
    responses(
        (status = 200, description = "Lock acquired or refreshed", body = ApiResponse<LockStatusResponse>),
        (status = 409, description = "Entity is locked by another user", body = ApiResponse<LockStatusResponse>)
    ),
    tag = "System"
)]
pub async fn acquire_lock(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path((entity_type, entity_id)): Path<(String, String)>,
    Json(payload): Json<AcquireLockRequest>,
) -> Result<Json<ApiResponse<LockStatusResponse>>, (StatusCode, Json<ApiResponse<LockStatusResponse>>)> {
    let key = lock_key(&entity_type, &entity_id);
    let existing_lock: Option<LockInfo> = state.redis.get(&key).await.unwrap_or(None);
    let current_user_id = claims.sub.to_string();

    let is_force = payload.force.unwrap_or(false);

    if let Some(existing) = &existing_lock {
        if existing.user_id != current_user_id && !is_force {
            let res = LockStatusResponse {
                is_locked: true,
                lock_info: Some(existing.clone()),
                is_own_lock: false,
            };
            return Err((
                StatusCode::CONFLICT,
                Json(ApiResponse {
                    data: Some(res),
                    errors: None,
                    messages: Some(vec![format!("Entity is locked by {}", existing.user_name)]),
                }),
            ));
        }
    }

    let new_lock = LockInfo {
        entity_type: entity_type.clone(),
        entity_id: entity_id.clone(),
        user_id: current_user_id.clone(),
        user_name: payload.user_name.clone(),
        locked_at: chrono::Utc::now().to_rfc3339(),
    };

    if let Err(e) = state.redis.set(&key, &new_lock, Some(DEFAULT_LOCK_TTL_SECONDS)).await {
        tracing::error!("Failed to acquire lock in Redis: {}", e);
    }

    state.bus.publish(SystemEvent::EntityLocked {
        entity_type,
        entity_id,
        user_id: current_user_id,
        user_name: payload.user_name,
    });

    let res = LockStatusResponse {
        is_locked: true,
        lock_info: Some(new_lock),
        is_own_lock: true,
    };

    into_api_response(StatusCode::OK, Some(res), None, None)
}

#[utoipa::path(
    delete,
    path = "/api/v1/locks/{entity_type}/{entity_id}",
    params(
        ("entity_type" = String, Path, description = "Entity type e.g. schema, entry"),
        ("entity_id" = String, Path, description = "Entity UUID or slug")
    ),
    responses(
        (status = 200, description = "Lock released successfully")
    ),
    tag = "System"
)]
pub async fn release_lock(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path((entity_type, entity_id)): Path<(String, String)>,
    Query(query): Query<ReleaseLockQuery>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let key = lock_key(&entity_type, &entity_id);
    let existing_lock: Option<LockInfo> = state.redis.get(&key).await.unwrap_or(None);
    let current_user_id = claims.sub.to_string();

    let is_force = query.force.unwrap_or(false);

    if let Some(existing) = existing_lock {
        if is_force || existing.user_id == current_user_id {
            let _ = state.redis.delete(&key).await;
            state.bus.publish(SystemEvent::EntityUnlocked {
                entity_type,
                entity_id,
            });
        }
    }

    into_api_response(StatusCode::OK, None, None, Some(vec!["Lock released".to_string()]))
}

/// Soft-locking для коллаборативного редактирования — все три операции
/// завязаны на личность вызывающего (`Claims.sub` как `user_id`), требуют
/// auth_middleware целиком, нет смысла в публичной части.
pub fn protected_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/{entity_type}/{entity_id}", get(get_lock_status))
        .route("/{entity_type}/{entity_id}", post(acquire_lock))
        .route("/{entity_type}/{entity_id}", delete(release_lock))
}
