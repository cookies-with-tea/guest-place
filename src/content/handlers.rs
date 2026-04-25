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

use super::model::{
    ContentSchema, CreateSchemaDTO, UpdateSchemaDTO,
    ContentEntry, ContentEntryStatus, CreateContentEntryDTO, UpdateContentEntryDTO,
    FieldDefinition, FieldType
};

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
    let mut fields = payload.fields;
    for field in &mut fields {
        field.name = to_snake_case(&field.name);
    }

    let fields_json = serde_json::to_value(&fields).map_err(|e| {
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
    if let Some(mut fields) = payload.fields {
        for field in &mut fields {
            field.name = to_snake_case(&field.name);
        }
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

// --- Entry Handlers ---

fn validate_entry_data(fields: &[FieldDefinition], data: &serde_json::Value) -> Result<(), String> {
    let obj = data.as_object().ok_or("Data must be a JSON object")?;

    for field in fields {
        let mut value = obj.get(&field.name);

        // If not found by exact name, try snake_case version (for compatibility)
        if value.is_none() {
            let snake_name = to_snake_case(&field.name);
            if snake_name != field.name {
                value = obj.get(&snake_name);
            }
        }
        
        if field.required && (value.is_none() || value.unwrap().is_null()) {
            return Err(format!("Field '{}' is required", field.label));
        }

        if let Some(val) = value {
            if !val.is_null() {
                // Basic type validation
                match field.field_type {
                    FieldType::Number => {
                        if !val.is_number() { return Err(format!("Field '{}' must be a number", field.label)); }
                    },
                    FieldType::Boolean => {
                        if !val.is_boolean() { return Err(format!("Field '{}' must be a boolean", field.label)); }
                    },
                    _ => {
                        if !val.is_string() && !val.is_object() && !val.is_array() {
                            return Err(format!("Field '{}' has invalid type", field.label));
                        }
                    }
                }
            }
        }
    }

    Ok(())
}

#[utoipa::path(
    get,
    path = "/api/v1/content/schemas/{schema_id}/entries",
    responses(
        (status = 200, body = ApiResponse<Vec<ContentEntry>>),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Content",
    params(
        ("schema_id" = Uuid, Path, description = "Schema ID")
    ),
    security(("bearer_auth" = []))
)]
pub async fn get_entries(
    State(state): State<Arc<AppState>>,
    Path(schema_id): Path<Uuid>,
) -> Result<Json<ApiResponse<Vec<ContentEntry>>>, (StatusCode, Json<ApiResponse<()>>)> {
    let entries = sqlx::query_as::<_, ContentEntry>(
        "SELECT * FROM content_entries WHERE schema_id = $1 ORDER BY created_at DESC"
    )
    .bind(schema_id)
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
        data: Some(entries),
        errors: None,
        messages: None,
    }))
}

#[utoipa::path(
    post,
    path = "/api/v1/content/entries",
    request_body = CreateContentEntryDTO,
    responses(
        (status = 201, body = ApiResponse<ContentEntry>),
        (status = 400, description = "Bad Request"),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Content",
    security(("bearer_auth" = []))
)]
pub async fn create_entry(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateContentEntryDTO>,
) -> Result<Json<ApiResponse<ContentEntry>>, (StatusCode, Json<ApiResponse<()>>)> {
    // 1. Get schema to validate data
    let schema = sqlx::query_as::<_, ContentSchema>(
        "SELECT * FROM content_schemas WHERE id = $1"
    )
    .bind(payload.schema_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()> {
        data: None, errors: None, messages: Some(vec!["Database error".to_string()]),
    })))?
    .ok_or((StatusCode::NOT_FOUND, Json(ApiResponse::<()> {
        data: None, errors: None, messages: Some(vec!["Schema not found".to_string()]),
    })))?;

    // 2. Validate data
    validate_entry_data(&schema.fields, &payload.data).map_err(|e| {
        (StatusCode::BAD_REQUEST, Json(ApiResponse::<()> {
            data: None, errors: None, messages: Some(vec![e]),
        }))
    })?;

    // 3. Insert entry
    let status = payload.status.unwrap_or(ContentEntryStatus::Draft);
    let i18n = payload.i18n.unwrap_or(serde_json::json!({}));

    let entry = sqlx::query_as::<_, ContentEntry>(
        "INSERT INTO content_entries (schema_id, slug, data, status, i18n) VALUES ($1, $2, $3, $4, $5) RETURNING *"
    )
    .bind(payload.schema_id)
    .bind(&payload.slug)
    .bind(sqlx::types::Json(payload.data))
    .bind(status)
    .bind(sqlx::types::Json(i18n))
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
        data: Some(entry),
        errors: None,
        messages: None,
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/content/entries/{id}",
    responses(
        (status = 200, body = ApiResponse<ContentEntry>),
        (status = 404, description = "Not Found"),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Content",
    params(
        ("id" = Uuid, Path, description = "Entry ID")
    ),
    security(("bearer_auth" = []))
)]
pub async fn get_entry(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<ContentEntry>>, (StatusCode, Json<ApiResponse<()>>)> {
    let entry = sqlx::query_as::<_, ContentEntry>(
        "SELECT * FROM content_entries WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()> {
        data: None, errors: None, messages: Some(vec!["Database error".to_string()]),
    })))?;

    match entry {
        Some(entry) => Ok(Json(ApiResponse {
            data: Some(entry),
            errors: None,
            messages: None,
        })),
        None => Err((StatusCode::NOT_FOUND, Json(ApiResponse::<()> {
            data: None,
            errors: None,
            messages: Some(vec!["Entry not found".to_string()]),
        }))),
    }
}

#[utoipa::path(
    patch,
    path = "/api/v1/content/entries/{id}",
    request_body = UpdateContentEntryDTO,
    responses(
        (status = 200, body = ApiResponse<ContentEntry>),
        (status = 400, description = "Bad Request"),
        (status = 404, description = "Not Found"),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Content",
    params(
        ("id" = Uuid, Path, description = "Entry ID")
    ),
    security(("bearer_auth" = []))
)]
pub async fn update_entry(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateContentEntryDTO>,
) -> Result<Json<ApiResponse<ContentEntry>>, (StatusCode, Json<ApiResponse<()>>)> {
    // 1. Get existing entry and schema for validation
    let entry = sqlx::query_as::<_, ContentEntry>(
        "SELECT * FROM content_entries WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()> {
        data: None, errors: None, messages: Some(vec!["Database error".to_string()]),
    })))?
    .ok_or((StatusCode::NOT_FOUND, Json(ApiResponse::<()> {
        data: None, errors: None, messages: Some(vec!["Entry not found".to_string()]),
    })))?;

    if let Some(ref data) = payload.data {
        let schema = sqlx::query_as::<_, ContentSchema>(
            "SELECT * FROM content_schemas WHERE id = $1"
        )
        .bind(entry.schema_id)
        .fetch_one(&state.pool)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()> {
            data: None, errors: None, messages: Some(vec!["Database error".to_string()]),
        })))?;

        validate_entry_data(&schema.fields, data).map_err(|e| {
            (StatusCode::BAD_REQUEST, Json(ApiResponse::<()> {
                data: None, errors: None, messages: Some(vec![e]),
            }))
        })?;
    }

    // 2. Dynamic Update
    let mut query = String::from("UPDATE content_entries SET ");
    let mut parts = Vec::new();
    let mut arg_index = 1;

    if payload.slug.is_some() { parts.push(format!("slug = ${}", arg_index)); arg_index += 1; }
    if payload.data.is_some() { parts.push(format!("data = ${}", arg_index)); arg_index += 1; }
    if payload.status.is_some() { parts.push(format!("status = ${}", arg_index)); arg_index += 1; }
    if payload.i18n.is_some() { parts.push(format!("i18n = ${}", arg_index)); arg_index += 1; }

    if parts.is_empty() {
        return Err((StatusCode::BAD_REQUEST, Json(ApiResponse::<()> {
            data: None, errors: None, messages: Some(vec!["No fields to update".to_string()]),
        })));
    }

    query.push_str(&parts.join(", "));
    query.push_str(&format!(", updated_at = NOW() WHERE id = ${} RETURNING *", arg_index));

    let mut sql_query = sqlx::query_as::<_, ContentEntry>(&query);
    if let Some(slug) = payload.slug { sql_query = sql_query.bind(slug); }
    if let Some(data) = payload.data { sql_query = sql_query.bind(sqlx::types::Json(data)); }
    if let Some(status) = payload.status { sql_query = sql_query.bind(status); }
    if let Some(i18n) = payload.i18n { sql_query = sql_query.bind(sqlx::types::Json(i18n)); }
    sql_query = sql_query.bind(id);

    let updated_entry = sql_query.fetch_one(&state.pool).await.map_err(|e| {
        eprintln!("Database error: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()> {
            data: None, errors: None, messages: Some(vec!["Database error".to_string()]),
        }))
    })?;

    Ok(Json(ApiResponse {
        data: Some(updated_entry),
        errors: None,
        messages: None,
    }))
}

#[utoipa::path(
    delete,
    path = "/api/v1/content/entries/{id}",
    responses(
        (status = 200, body = ApiResponse<Value>),
        (status = 404, description = "Not Found"),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Content",
    params(
        ("id" = Uuid, Path, description = "Entry ID")
    ),
    security(("bearer_auth" = []))
)]
pub async fn delete_entry(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<serde_json::Value>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = sqlx::query("DELETE FROM content_entries WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()> {
            data: None, errors: None, messages: Some(vec!["Database error".to_string()]),
        })))?;

    if result.rows_affected() == 0 {
        return Err((StatusCode::NOT_FOUND, Json(ApiResponse::<()> {
            data: None, errors: None, messages: Some(vec!["Entry not found".to_string()]),
        })));
    }

    Ok(Json(ApiResponse {
        data: Some(serde_json::json!({ "success": true })),
        errors: None,
        messages: None,
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/content/schemas/by-identifier/{identifier}",
    responses(
        (status = 200, body = ApiResponse<ContentSchema>),
        (status = 404, description = "Not Found"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Content",
    params(
        ("identifier" = String, Path, description = "Schema identifier")
    ),
    security(("bearer_auth" = []))
)]
pub async fn get_schema_by_identifier(
    State(state): State<Arc<AppState>>,
    Path(identifier): Path<String>,
) -> Result<Json<ApiResponse<ContentSchema>>, (StatusCode, Json<ApiResponse<()>>)> {
    let schema = sqlx::query_as::<_, ContentSchema>(
        "SELECT * FROM content_schemas WHERE slug = $1"
    )
    .bind(identifier)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()> {
            data: None, errors: None, messages: Some(vec!["Database error".to_string()]),
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
fn to_snake_case(s: &str) -> String {
    let mut result = String::new();
    for (i, c) in s.chars().enumerate() {
        if c.is_uppercase() {
            if i > 0 && !result.ends_with('_') {
                result.push('_');
            }
            result.push(c.to_lowercase().next().unwrap());
        } else {
            result.push(c);
        }
    }
    result
}
