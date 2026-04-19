use crate::{AppState, core::{dto::ApiResponse, response::into_api_response}};
use crate::mfe::dto::{Mfe, CreateMfeDto, UpdateMfeDto, ManifestDto, RemoteDto};
use axum::{
    Json, Router, extract::{Path, State}, http::StatusCode, routing::{delete, get, post, put}
};
use std::sync::Arc;
use uuid::Uuid;

#[utoipa::path(
    get,
    path = "/api/v1/mfe/manifest",
    responses(
        (status = 200, description = "Dynamic manifest generated", body = ManifestDto),
        (status = 500, description = "Database error")
    ),
    tag = "MFE"
)]
pub async fn get_manifest(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<ManifestDto>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = sqlx::query_as::<_, Mfe>(
        "SELECT * FROM microfrontends WHERE enabled = true ORDER BY order_index ASC"
    )
    .fetch_all(&state.pool)
    .await;

    match result {
        Ok(mfes) => {
            let remotes = mfes.into_iter().map(|m| RemoteDto {
                name: m.name,
                display_name: m.display_name,
                url: m.url,
                scope: m.scope,
                module: m.module,
                icon: m.icon,
                category: m.category,
                order: m.order_index,
            }).collect();
            
            into_api_response(StatusCode::OK, Some(ManifestDto { remotes }), None, None)
                .map_err(|(s, r)| (s, Json(ApiResponse { 
                    data: None, 
                    errors: r.0.errors.clone(), 
                    messages: r.0.messages.clone() 
                })))
        }
        Err(e) => {
            eprintln!("DB error fetching manifest: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse {
                    data: None,
                    errors: None,
                    messages: Some(vec!["Failed to generate manifest".to_string()]),
                }),
            ))
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/mfe",
    responses(
        (status = 200, description = "All microfrontends list", body = ApiResponse<Vec<Mfe>>),
        (status = 500, description = "Database error")
    ),
    tag = "MFE"
)]
pub async fn get_all(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Vec<Mfe>>>, (StatusCode, Json<ApiResponse<Vec<Mfe>>>)> {
    let result = sqlx::query_as::<_, Mfe>(
        "SELECT * FROM microfrontends ORDER BY order_index ASC"
    )
    .fetch_all(&state.pool)
    .await;

    match result {
        Ok(mfes) => into_api_response(StatusCode::OK, Some(mfes), None, None),
        Err(e) => {
            eprintln!("DB error fetching all mfes: {}", e);
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None::<Vec<Mfe>>,
                None,
                Some(vec!["Failed to fetch microfrontends".to_string()]),
            )
        }
    }
}

#[utoipa::path(
    post,
    path = "/api/v1/mfe",
    request_body = CreateMfeDto,
    responses(
        (status = 201, description = "Microfrontend created"),
        (status = 400, description = "Bad request"),
        (status = 500, description = "Database error")
    ),
    tag = "MFE"
)]
pub async fn create(
    State(state): State<Arc<AppState>>,
    Json(dto): Json<CreateMfeDto>,
) -> Result<Json<ApiResponse<Mfe>>, (StatusCode, Json<ApiResponse<Mfe>>)> {
    let result = sqlx::query_as::<_, Mfe>(
        r#"
        INSERT INTO microfrontends (name, display_name, url, scope, module, icon, category, order_index)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        "#
    )
    .bind(&dto.name)
    .bind(&dto.display_name)
    .bind(&dto.url)
    .bind(&dto.scope)
    .bind(&dto.module)
    .bind(&dto.icon)
    .bind(dto.category.unwrap_or_else(|| "system".to_string()))
    .bind(dto.order_index.unwrap_or(0))
    .fetch_one(&state.pool)
    .await;

    match result {
        Ok(mfe) => into_api_response(StatusCode::CREATED, Some(mfe), None, Some(vec!["MFE created".to_string()])),
        Err(e) => {
            eprintln!("DB error creating mfe: {}", e);
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None::<Mfe>,
                None,
                Some(vec!["Failed to create microfrontend".to_string()]),
            )
        }
    }
}

#[utoipa::path(
    put,
    path = "/api/v1/mfe/{id}",
    request_body = UpdateMfeDto,
    params(
        ("id" = Uuid, Path, description = "MFE ID")
    ),
    responses(
        (status = 200, description = "Microfrontend updated"),
        (status = 404, description = "Not found"),
        (status = 500, description = "Database error")
    ),
    tag = "MFE"
)]
pub async fn update(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(dto): Json<UpdateMfeDto>,
) -> Result<Json<ApiResponse<Mfe>>, (StatusCode, Json<ApiResponse<Mfe>>)> {
    let current = sqlx::query_as::<_, Mfe>("SELECT * FROM microfrontends WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| {
            eprintln!("DB error fetching mfe: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse {
                data: None,
                errors: None,
                messages: Some(vec!["Database error".to_string()]),
            }))
        })?
        .ok_or((StatusCode::NOT_FOUND, Json(ApiResponse {
            data: None,
            errors: None,
            messages: Some(vec!["MFE not found".to_string()]),
        })))?;

    let result = sqlx::query_as::<_, Mfe>(
        r#"
        UPDATE microfrontends
        SET display_name = $1, url = $2, scope = $3, module = $4, icon = $5, category = $6, order_index = $7, enabled = $8, updated_at = NOW()
        WHERE id = $9
        RETURNING *
        "#
    )
    .bind(dto.display_name.unwrap_or(current.display_name))
    .bind(dto.url.unwrap_or(current.url))
    .bind(dto.scope.unwrap_or(current.scope))
    .bind(dto.module.unwrap_or(current.module))
    .bind(dto.icon.or(current.icon))
    .bind(dto.category.unwrap_or(current.category))
    .bind(dto.order_index.unwrap_or(current.order_index))
    .bind(dto.enabled.unwrap_or(current.enabled))
    .bind(id)
    .fetch_one(&state.pool)
    .await;

    match result {
        Ok(mfe) => into_api_response(StatusCode::OK, Some(mfe), None, Some(vec!["MFE updated".to_string()])),
        Err(e) => {
            eprintln!("DB error updating mfe: {}", e);
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None::<Mfe>,
                None,
                Some(vec!["Failed to update microfrontend".to_string()]),
            )
        }
    }
}

#[utoipa::path(
    delete,
    path = "/api/v1/mfe/{id}",
    params(
        ("id" = Uuid, Path, description = "MFE ID")
    ),
    responses(
        (status = 200, description = "Microfrontend deleted"),
        (status = 404, description = "Not found"),
        (status = 500, description = "Database error")
    ),
    tag = "MFE"
)]
pub async fn delete_one(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = sqlx::query("DELETE FROM microfrontends WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await;

    match result {
        Ok(res) if res.rows_affected() > 0 => into_api_response(StatusCode::OK, None, None, Some(vec!["MFE deleted".to_string()])),
        Ok(_) => into_api_response(StatusCode::NOT_FOUND, None, None, Some(vec!["MFE not found".to_string()])),
        Err(e) => {
            eprintln!("DB error deleting mfe: {}", e);
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                None,
                Some(vec!["Failed to delete microfrontend".to_string()]),
            )
        }
    }
}

pub fn public_router() -> Router<Arc<AppState>> {
    Router::new().route("/manifest", get(get_manifest))
}

pub fn protected_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(get_all))
        .route("/", post(create))
        .route("/{id}", put(update))
        .route("/{id}", delete(delete_one))
}
