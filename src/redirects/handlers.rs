use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Redirect as AxumRedirect},
    Json,
};
use serde_json::Value;
use std::sync::Arc;
use uuid::Uuid;

use crate::core::dto::ApiResponse;
use crate::AppState;

use super::model::{
    CheckRedirectQuery, CheckRedirectResponse, CreateRedirectDTO, Redirect, UpdateRedirectDTO,
};

#[utoipa::path(
    get,
    path = "/api/v1/redirects",
    responses(
        (status = 200, body = ApiResponse<Vec<Redirect>>),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Redirects",
    security(("bearer_auth" = []))
)]
pub async fn get_redirects(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Vec<Redirect>>>, (StatusCode, Json<ApiResponse<()>>)> {
    let redirects = sqlx::query_as::<_, Redirect>(
        "SELECT id, source_path, target_path, status_code, is_active, hits, created_at, updated_at FROM redirects ORDER BY created_at DESC",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error fetching redirects: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Failed to fetch redirects".to_string()]),
            }),
        )
    })?;

    Ok(Json(ApiResponse {
        data: Some(redirects),
        errors: None,
        messages: None,
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/redirects/check",
    params(
        CheckRedirectQuery
    ),
    responses(
        (status = 200, body = ApiResponse<CheckRedirectResponse>),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Redirects"
)]
pub async fn check_redirect(
    State(state): State<Arc<AppState>>,
    Query(query): Query<CheckRedirectQuery>,
) -> Result<Json<ApiResponse<CheckRedirectResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let mut path = query.path.trim().to_string();
    if !path.starts_with('/') {
        path = format!("/{}", path);
    }
    // Also consider path without trailing slash
    let alt_path = if path.len() > 1 && path.ends_with('/') {
        path.trim_end_matches('/').to_string()
    } else {
        format!("{}/", path)
    };

    let redirect = sqlx::query_as::<_, Redirect>(
        "SELECT id, source_path, target_path, status_code, is_active, hits, created_at, updated_at FROM redirects WHERE (source_path = $1 OR source_path = $2) AND is_active = true LIMIT 1",
    )
    .bind(&path)
    .bind(&alt_path)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error checking redirect: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Failed to check redirect".to_string()]),
            }),
        )
    })?;

    if let Some(r) = redirect {
        // Increment hits counter in background
        let pool = state.pool.clone();
        let id = r.id;
        tokio::spawn(async move {
            let _ = sqlx::query("UPDATE redirects SET hits = hits + 1 WHERE id = $1")
                .bind(id)
                .execute(&pool)
                .await;
        });

        Ok(Json(ApiResponse {
            data: Some(CheckRedirectResponse {
                matched: true,
                target_path: Some(r.target_path),
                status_code: Some(r.status_code),
            }),
            errors: None,
            messages: None,
        }))
    } else {
        Ok(Json(ApiResponse {
            data: Some(CheckRedirectResponse {
                matched: false,
                target_path: None,
                status_code: None,
            }),
            errors: None,
            messages: None,
        }))
    }
}

pub async fn handle_redirect_navigation(
    State(state): State<Arc<AppState>>,
    Path(path): Path<String>,
) -> impl IntoResponse {
    let normalized = format!("/{}", path.trim_start_matches('/'));
    let redirect = sqlx::query_as::<_, Redirect>(
        "SELECT id, source_path, target_path, status_code, is_active, hits, created_at, updated_at FROM redirects WHERE source_path = $1 AND is_active = true LIMIT 1",
    )
    .bind(&normalized)
    .fetch_optional(&state.pool)
    .await;

    if let Ok(Some(r)) = redirect {
        let pool = state.pool.clone();
        let id = r.id;
        tokio::spawn(async move {
            let _ = sqlx::query("UPDATE redirects SET hits = hits + 1 WHERE id = $1")
                .bind(id)
                .execute(&pool)
                .await;
        });

        if r.status_code == 302 {
            AxumRedirect::temporary(&r.target_path).into_response()
        } else {
            AxumRedirect::permanent(&r.target_path).into_response()
        }
    } else {
        StatusCode::NOT_FOUND.into_response()
    }
}

#[utoipa::path(
    post,
    path = "/api/v1/redirects",
    request_body = CreateRedirectDTO,
    responses(
        (status = 201, body = ApiResponse<Redirect>),
        (status = 400, description = "Bad Request"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Redirects",
    security(("bearer_auth" = []))
)]
pub async fn create_redirect(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateRedirectDTO>,
) -> Result<(StatusCode, Json<ApiResponse<Redirect>>), (StatusCode, Json<ApiResponse<()>>)> {
    let mut source_path = payload.source_path.trim().to_string();
    if !source_path.starts_with('/') {
        source_path = format!("/{}", source_path);
    }
    let target_path = payload.target_path.trim().to_string();
    let status_code = payload.status_code.unwrap_or(301);
    let is_active = payload.is_active.unwrap_or(true);

    let redirect = sqlx::query_as::<_, Redirect>(
        r#"
        INSERT INTO redirects (source_path, target_path, status_code, is_active)
        VALUES ($1, $2, $3, $4)
        RETURNING id, source_path, target_path, status_code, is_active, hits, created_at, updated_at
        "#,
    )
    .bind(source_path)
    .bind(target_path)
    .bind(status_code)
    .bind(is_active)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error creating redirect: {}", e);
        (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec![format!("Failed to create redirect: {}", e)]),
            }),
        )
    })?;

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse {
            data: Some(redirect),
            errors: None,
            messages: None,
        }),
    ))
}

#[utoipa::path(
    patch,
    path = "/api/v1/redirects/{id}",
    params(
        ("id" = Uuid, Path, description = "Redirect ID")
    ),
    request_body = UpdateRedirectDTO,
    responses(
        (status = 200, body = ApiResponse<Redirect>),
        (status = 404, description = "Redirect not found"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Redirects",
    security(("bearer_auth" = []))
)]
pub async fn update_redirect(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateRedirectDTO>,
) -> Result<Json<ApiResponse<Redirect>>, (StatusCode, Json<ApiResponse<()>>)> {
    let source_path = payload.source_path.map(|mut s| {
        s = s.trim().to_string();
        if !s.starts_with('/') {
            s = format!("/{}", s);
        }
        s
    });
    let target_path = payload.target_path.map(|s| s.trim().to_string());

    let redirect = sqlx::query_as::<_, Redirect>(
        r#"
        UPDATE redirects
        SET 
            source_path = COALESCE($1, source_path),
            target_path = COALESCE($2, target_path),
            status_code = COALESCE($3, status_code),
            is_active = COALESCE($4, is_active),
            updated_at = NOW()
        WHERE id = $5
        RETURNING id, source_path, target_path, status_code, is_active, hits, created_at, updated_at
        "#,
    )
    .bind(source_path)
    .bind(target_path)
    .bind(payload.status_code)
    .bind(payload.is_active)
    .bind(id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error updating redirect: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec![format!("Failed to update redirect: {}", e)]),
            }),
        )
    })?;

    match redirect {
        Some(r) => Ok(Json(ApiResponse {
            data: Some(r),
            errors: None,
            messages: None,
        })),
        None => Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Redirect not found".to_string()]),
            }),
        )),
    }
}

#[utoipa::path(
    delete,
    path = "/api/v1/redirects/{id}",
    params(
        ("id" = Uuid, Path, description = "Redirect ID")
    ),
    responses(
        (status = 200, body = ApiResponse<Value>),
        (status = 404, description = "Redirect not found"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Redirects",
    security(("bearer_auth" = []))
)]
pub async fn delete_redirect(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<Value>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = sqlx::query("DELETE FROM redirects WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| {
            eprintln!("Database error deleting redirect: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()> {
                    data: None,
                    errors: None,
                    messages: Some(vec!["Failed to delete redirect".to_string()]),
                }),
            )
        })?;

    if result.rows_affected() == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Redirect not found".to_string()]),
            }),
        ));
    }

    Ok(Json(ApiResponse {
        data: Some(serde_json::json!({ "deleted": true })),
        errors: None,
        messages: None,
    }))
}
