use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde_json::Value;
use std::sync::Arc;
use uuid::Uuid;

use crate::core::dto::ApiResponse;
use crate::AppState;

use super::model::{CreateMenuDTO, Menu, UpdateMenuDTO};

#[utoipa::path(
    get,
    path = "/api/v1/menus",
    responses(
        (status = 200, body = ApiResponse<Vec<Menu>>),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Menus",
    security(("bearer_auth" = []))
)]
pub async fn get_menus(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Vec<Menu>>>, (StatusCode, Json<ApiResponse<()>>)> {
    let menus = sqlx::query_as::<_, Menu>(
        "SELECT id, name, location, items, created_at, updated_at FROM menus ORDER BY created_at ASC",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error fetching menus: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Failed to fetch menus".to_string()]),
            }),
        )
    })?;

    Ok(Json(ApiResponse {
        data: Some(menus),
        errors: None,
        messages: None,
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/menus/{id}",
    params(
        ("id" = String, Path, description = "Menu identifier (ID or location slug like header, footer, sidebar)")
    ),
    responses(
        (status = 200, body = ApiResponse<Menu>),
        (status = 404, description = "Menu not found"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Menus"
)]
pub async fn get_menu_by_location(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<ApiResponse<Menu>>, (StatusCode, Json<ApiResponse<()>>)> {
    let clean_loc = id.trim().to_lowercase();

    // Check if it might be a UUID first
    let menu = if let Ok(uuid) = Uuid::parse_str(&clean_loc) {
        sqlx::query_as::<_, Menu>(
            "SELECT id, name, location, items, created_at, updated_at FROM menus WHERE id = $1 OR location = $2",
        )
        .bind(uuid)
        .bind(&clean_loc)
        .fetch_optional(&state.pool)
        .await
    } else {
        sqlx::query_as::<_, Menu>(
            "SELECT id, name, location, items, created_at, updated_at FROM menus WHERE location = $1",
        )
        .bind(&clean_loc)
        .fetch_optional(&state.pool)
        .await
    }
    .map_err(|e| {
        eprintln!("Database error fetching menu by location: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Failed to fetch menu".to_string()]),
            }),
        )
    })?;

    match menu {
        Some(m) => Ok(Json(ApiResponse {
            data: Some(m),
            errors: None,
            messages: None,
        })),
        None => Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec![format!("Menu '{}' not found", id)]),
            }),
        )),
    }
}

#[utoipa::path(
    post,
    path = "/api/v1/menus",
    request_body = CreateMenuDTO,
    responses(
        (status = 201, body = ApiResponse<Menu>),
        (status = 400, description = "Bad Request"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Menus",
    security(("bearer_auth" = []))
)]
pub async fn create_menu(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateMenuDTO>,
) -> Result<(StatusCode, Json<ApiResponse<Menu>>), (StatusCode, Json<ApiResponse<()>>)> {
    let items = payload.items.unwrap_or_else(|| serde_json::json!([]));
    let location = payload.location.trim().to_lowercase();

    let menu = sqlx::query_as::<_, Menu>(
        r#"
        INSERT INTO menus (name, location, items)
        VALUES ($1, $2, $3)
        RETURNING id, name, location, items, created_at, updated_at
        "#,
    )
    .bind(payload.name)
    .bind(location)
    .bind(items)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error creating menu: {}", e);
        (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec![format!("Failed to create menu: {}", e)]),
            }),
        )
    })?;

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse {
            data: Some(menu),
            errors: None,
            messages: None,
        }),
    ))
}

#[utoipa::path(
    patch,
    path = "/api/v1/menus/{id}",
    params(
        ("id" = Uuid, Path, description = "Menu ID")
    ),
    request_body = UpdateMenuDTO,
    responses(
        (status = 200, body = ApiResponse<Menu>),
        (status = 404, description = "Menu not found"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Menus",
    security(("bearer_auth" = []))
)]
pub async fn update_menu(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateMenuDTO>,
) -> Result<Json<ApiResponse<Menu>>, (StatusCode, Json<ApiResponse<()>>)> {
    let location = payload.location.map(|l| l.trim().to_lowercase());

    let menu = sqlx::query_as::<_, Menu>(
        r#"
        UPDATE menus
        SET 
            name = COALESCE($1, name),
            location = COALESCE($2, location),
            items = COALESCE($3, items),
            updated_at = NOW()
        WHERE id = $4
        RETURNING id, name, location, items, created_at, updated_at
        "#,
    )
    .bind(payload.name)
    .bind(location)
    .bind(payload.items)
    .bind(id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error updating menu: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec![format!("Failed to update menu: {}", e)]),
            }),
        )
    })?;

    match menu {
        Some(m) => Ok(Json(ApiResponse {
            data: Some(m),
            errors: None,
            messages: None,
        })),
        None => Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Menu not found".to_string()]),
            }),
        )),
    }
}

#[utoipa::path(
    delete,
    path = "/api/v1/menus/{id}",
    params(
        ("id" = Uuid, Path, description = "Menu ID")
    ),
    responses(
        (status = 200, body = ApiResponse<Value>),
        (status = 404, description = "Menu not found"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Menus",
    security(("bearer_auth" = []))
)]
pub async fn delete_menu(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<Value>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = sqlx::query("DELETE FROM menus WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| {
            eprintln!("Database error deleting menu: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()> {
                    data: None,
                    errors: None,
                    messages: Some(vec!["Failed to delete menu".to_string()]),
                }),
            )
        })?;

    if result.rows_affected() == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Menu not found".to_string()]),
            }),
        ));
    }

    Ok(Json(ApiResponse {
        data: Some(serde_json::json!({ "deleted": true })),
        errors: None,
        messages: None,
    }))
}
