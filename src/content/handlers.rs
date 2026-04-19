use std::sync::Arc;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde_json::Value;
use uuid::Uuid;

use crate::AppState;
use crate::core::dto::ApiResponse;
use crate::core::response::{into_api_response, error_map};
use super::model::{ContentSchema, CreateSchemaDTO, UpdateSchemaDTO};

#[utoipa::path(
    get,
    path = "/api/v1/content/schemas",
    responses(
        (status = 200, body = ApiResponse<Vec<ContentSchema>>),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Content",
    security(("bearer_auth" = []))
)]
pub async fn get_schemas(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Vec<ContentSchema>>>, (StatusCode, Json<ApiResponse<()>>)> {
    let schemas = sqlx::query_as::<_, ContentSchema>(
        "SELECT * FROM content_schemas ORDER BY created_at DESC"
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()> {
            data: None,
            errors: None,
            messages: Some(vec!["Database error".to_string()]),
        }))
    })?;

    Ok(Json(ApiResponse {
        data: Some(schemas),
        errors: None,
        messages: None,
    }))
}

#[utoipa::path(
    post,
    path = "/api/v1/content/schemas",
    request_body = CreateSchemaDTO,
    responses(
        (status = 201, body = ApiResponse<ContentSchema>),
        (status = 400, description = "Bad Request"),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Content",
    security(("bearer_auth" = []))
)]
pub async fn create_schema(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateSchemaDTO>,
) -> Result<Json<ApiResponse<ContentSchema>>, (StatusCode, Json<ApiResponse<()>>)> {
    let fields_json = serde_json::to_value(&payload.fields).map_err(|e| {
        eprintln!("JSON serialization error: {}", e);
        (StatusCode::BAD_REQUEST, Json(ApiResponse::<()> {
            data: None,
            errors: None,
            messages: Some(vec!["Invalid fields format".to_string()]),
        }))
    })?;

    let schema = sqlx::query_as::<_, ContentSchema>(
        "INSERT INTO content_schemas (name, slug, fields) VALUES ($1, $2, $3) RETURNING *"
    )
    .bind(&payload.name)
    .bind(&payload.slug)
    .bind(fields_json)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()> {
            data: None,
            errors: None,
            messages: Some(vec!["Database error".to_string()]),
        }))
    })?;

    Ok(Json(ApiResponse {
        data: Some(schema),
        errors: None,
        messages: None,
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/content/schemas/{id}",
    responses(
        (status = 200, body = ApiResponse<ContentSchema>),
        (status = 404, description = "Not Found"),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Content",
    params(
        ("id" = Uuid, Path, description = "Schema ID")
    ),
    security(("bearer_auth" = []))
)]
pub async fn get_schema(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<ContentSchema>>, (StatusCode, Json<ApiResponse<()>>)> {
    let schema = sqlx::query_as::<_, ContentSchema>(
        "SELECT * FROM content_schemas WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()> {
            data: None,
            errors: None,
            messages: Some(vec!["Database error".to_string()]),
        }))
    })?;

    match schema {
        Some(schema) => Ok(Json(ApiResponse {
            data: Some(schema),
            errors: None,
            messages: None,
        })),
        None => Err((StatusCode::NOT_FOUND, Json(ApiResponse::<()> {
            data: None,
            errors: None,
            messages: Some(vec!["Schema not found".to_string()]),
        }))),
    }
}

#[utoipa::path(
    patch,
    path = "/api/v1/content/schemas/{id}",
    request_body = UpdateSchemaDTO,
    responses(
        (status = 200, body = ApiResponse<ContentSchema>),
        (status = 404, description = "Not Found"),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Content",
    params(
        ("id" = Uuid, Path, description = "Schema ID")
    ),
    security(("bearer_auth" = []))
)]
pub async fn update_schema(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateSchemaDTO>,
) -> Result<Json<ApiResponse<ContentSchema>>, (StatusCode, Json<ApiResponse<()>>)> {
    let mut query = String::from("UPDATE content_schemas SET ");
    let mut parts = Vec::new();
    let mut arg_index = 1;

    if payload.name.is_some() {
        parts.push(format!("name = ${}", arg_index));
        arg_index += 1;
    }
    if payload.slug.is_some() {
        parts.push(format!("slug = ${}", arg_index));
        arg_index += 1;
    }
    if payload.fields.is_some() {
        parts.push(format!("fields = ${}", arg_index));
        arg_index += 1;
    }

    if parts.is_empty() {
        return Err((StatusCode::BAD_REQUEST, Json(ApiResponse::<()> {
            data: None,
            errors: None,
            messages: Some(vec!["No fields to update".to_string()]),
        })));
    }

    query.push_str(&parts.join(", "));
    query.push_str(&format!(", updated_at = NOW() WHERE id = ${} RETURNING *", arg_index));

    let mut sql_query = sqlx::query_as::<_, ContentSchema>(&query);
    if let Some(name) = payload.name { sql_query = sql_query.bind(name); }
    if let Some(slug) = payload.slug { sql_query = sql_query.bind(slug); }
    if let Some(fields) = payload.fields {
        let fields_json = serde_json::to_value(&fields).map_err(|_| (StatusCode::BAD_REQUEST, Json(ApiResponse::<()> {
            data: None,
            errors: None,
            messages: Some(vec!["Invalid fields".to_string()]),
        })))?;
        sql_query = sql_query.bind(fields_json);
    }
    sql_query = sql_query.bind(id);

    let schema = sql_query.fetch_optional(&state.pool).await.map_err(|e| {
        eprintln!("Database error: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()> {
            data: None,
            errors: None,
            messages: Some(vec!["Database error".to_string()]),
        }))
    })?;

    match schema {
        Some(schema) => Ok(Json(ApiResponse {
            data: Some(schema),
            errors: None,
            messages: None,
        })),
        None => Err((StatusCode::NOT_FOUND, Json(ApiResponse::<()> {
            data: None,
            errors: None,
            messages: Some(vec!["Schema not found".to_string()]),
        }))),
    }
}

#[utoipa::path(
    delete,
    path = "/api/v1/content/schemas/{id}",
    responses(
        (status = 200, body = ApiResponse<Value>),
        (status = 404, description = "Not Found"),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Content",
    params(
        ("id" = Uuid, Path, description = "Schema ID")
    ),
    security(("bearer_auth" = []))
)]
pub async fn delete_schema(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<serde_json::Value>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = sqlx::query("DELETE FROM content_schemas WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| {
            eprintln!("Database error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Database error".to_string()]),
            }))
        })?;

    if result.rows_affected() == 0 {
        return Err((StatusCode::NOT_FOUND, Json(ApiResponse::<()> {
            data: None,
            errors: None,
            messages: Some(vec!["Schema not found".to_string()]),
        })));
    }

    Ok(Json(ApiResponse {
        data: Some(serde_json::json!({ "success": true })),
        errors: None,
        messages: None,
    }))
}
