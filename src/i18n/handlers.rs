use crate::{
    core::{dto::ApiResponse, response::into_api_response},
    i18n::dto::{CreateTranslationDTO, LanguageDTO, TranslationDTO, TranslationInput},
    AppState,
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{delete, get, post},
    Extension, Json, Router,
};
use std::{collections::HashMap, sync::Arc};

#[utoipa::path(
    post,
    path = "/api/v1/i18n",
    request_body = TranslationInput,
    responses(
        (status = 201, description = "Translation(s) created or updated"),
        (status = 500, description = "Database error")
    ),
    tag = "I18n"
)]
pub async fn create_or_update(
    State(state): State<Arc<AppState>>,
    Json(input): Json<TranslationInput>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let dtos = match input {
        TranslationInput::Single(dto) => vec![dto],
        TranslationInput::Multiple(dtos) => dtos,
    };

    if dtos.is_empty() {
        return into_api_response(
            StatusCode::BAD_REQUEST,
            None,
            None,
            Some(vec!["No translations provided".to_string()]),
        );
    }

    let mut tx = state.pool.begin().await.map_err(|e| {
        eprintln!("Failed to start transaction: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            into_api_response_internal("Failed to save translations".to_string()),
        )
    })?;

    for dto in dtos {
        if let Err(e) = sqlx::query(
            r#"
            INSERT INTO i18n_translations (key, locale, value)
            VALUES ($1, $2, $3)
            ON CONFLICT (key, locale)
            DO UPDATE SET value = $3, updated_at = NOW()
            "#,
        )
        .bind(&dto.key)
        .bind(&dto.locale)
        .bind(&dto.value)
        .execute(&mut *tx)
        .await
        {
            eprintln!("DB error: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                into_api_response_internal("Failed to save one or more translations".to_string()),
            ));
        }
    }

    if let Err(e) = tx.commit().await {
        eprintln!("Failed to commit transaction: {}", e);
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            into_api_response_internal("Failed to save translations".to_string()),
        ));
    }

    state.i18n.clear_cache();
    into_api_response(
        StatusCode::CREATED,
        None,
        None,
        Some(vec!["Translations saved".to_string()]),
    )
}

use crate::core::dto::{ApiPaginationDTO, ApiResponseWithPagination, PaginationDTO};

#[utoipa::path(
    get,
    path = "/api/v1/i18n",
    params(
        ("locale" = String, Query, description = "Locale code, e.g. 'en', 'ru'"),
        ("page" = i32, Query, description = "Page number"),
        ("limit" = i32, Query, description = "Items per page"),
        ("search" = String, Query, description = "Search query"),
        ("namespace" = String, Query, description = "Namespace filter")
    ),
    responses(
        (status = 200, description = "Translations loaded", body = ApiResponseWithPagination<TranslationDTO>),
        (status = 500, description = "Database error")
    ),
    tag = "I18n"
)]
pub async fn get_all(
    State(state): State<Arc<AppState>>,
    axum::extract::Query(params): axum::extract::Query<std::collections::HashMap<String, String>>,
) -> Result<
    Json<ApiResponseWithPagination<TranslationDTO>>,
    (StatusCode, Json<ApiResponseWithPagination<TranslationDTO>>),
> {
    let locale = params.get("locale").cloned().unwrap_or_else(|| "en".to_string());
    let page = params.get("page").and_then(|p| p.parse::<i32>().ok()).unwrap_or(1);
    let limit = params.get("limit").and_then(|l| l.parse::<i32>().ok()).unwrap_or(10);
    let offset = ((page - 1) * limit) as i64;
    
    let search = params.get("search").map(|s| format!("%{}%", s.to_lowercase())).unwrap_or_else(|| "%".to_string());
    let namespace = params.get("namespace").map(|ns| format!("{}.%", ns)).unwrap_or_else(|| "%".to_string());

    let total = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM i18n_translations WHERE locale = $1 AND key LIKE $2 AND LOWER(key) LIKE $3"
    )
    .bind(&locale)
    .bind(&namespace)
    .bind(&search)
    .fetch_one(&state.pool)
    .await
    .unwrap_or(0);

    let total_pages = (total as f64 / limit as f64).ceil() as i32;

    match sqlx::query_as::<_, TranslationDTO>(
        "SELECT id, key, locale, value, created_at, updated_at FROM i18n_translations 
         WHERE locale = $1 AND key LIKE $2 AND LOWER(key) LIKE $3
         ORDER BY key ASC 
         LIMIT $4 OFFSET $5"
    )
    .bind(&locale)
    .bind(&namespace)
    .bind(&search)
    .bind(limit as i64)
    .bind(offset)
    .fetch_all(&state.pool)
    .await
    {
        Ok(translations) => Ok(Json(ApiResponseWithPagination {
            data: Some(ApiPaginationDTO {
                items: translations,
                pagination: PaginationDTO {
                    page,
                    total: Some(total as i32),
                    total_pages: Some(total_pages),
                    limit: Some(limit),
                },
            }),
            errors: None,
            messages: None,
        })),
        Err(e) => {
            eprintln!("DB error: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponseWithPagination {
                    data: None,
                    errors: None,
                    messages: Some(vec!["Failed to load translations".to_string()]),
                }),
            ))
        }
    }
}

#[utoipa::path(
    delete,
    path = "/api/v1/i18n/{key}/{locale}",
    params(
        ("key" = String, Path, description = "Translation key"),
        ("locale" = String, Path, description = "Locale code")
    ),
    responses(
        (status = 200, description = "Translation deleted"),
        (status = 500, description = "Database error")
    ),
    tag = "I18n"
)]
pub async fn delete_one(
    State(state): State<Arc<AppState>>,
    Path((key, locale)): Path<(String, String)>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = sqlx::query("DELETE FROM i18n_translations WHERE key = $1 AND locale = $2")
        .bind(&key)
        .bind(&locale)
        .execute(&state.pool)
        .await;

    match result {
        Ok(_) => {
            state.i18n.clear_cache();
            into_api_response(
                StatusCode::OK,
                None,
                None,
                Some(vec!["Translation deleted".to_string()]),
            )
        }
        Err(e) => {
            eprintln!("DB error: {}", e);
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                None,
                Some(vec!["Failed to delete translation".to_string()]),
            )
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/i18n/{dict_key}",
    params(
        ("dict_key" = String, Path, description = "Dictionary key prefix, e.g. 'user', 'general'")
    ),
    responses(
        (status = 200, description = "Translations loaded", body = Object),
        (status = 500, description = "Database error")
    ),
    tag = "I18n"
)]
pub async fn get_by_dict_key(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Path(dict_key): Path<String>,
) -> Result<Json<HashMap<String, String>>, (StatusCode, Json<ApiResponse<()>>)> {
    let pattern = format!("{}.%", dict_key);

    let rows: Result<Vec<(String, String)>, _> = sqlx::query_as::<_, (String, String)>(
        "SELECT key, value FROM i18n_translations WHERE locale = $1 AND key LIKE $2",
    )
    .bind(&locale)
    .bind(&pattern)
    .fetch_all(&state.pool)
    .await;

    match rows {
        Ok(translations) => {
            let map: HashMap<String, String> = translations.into_iter().collect();
            Ok(Json(map))
        }
        Err(e) => {
            eprintln!("DB error in get_by_dict_key: {}", e);
            let msg = state.i18n.t("general.db_error", &locale).await;
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                into_api_response_internal(msg),
            ))
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/i18n/languages",
    responses(
        (status = 200, description = "List of available languages", body = ApiResponse<Vec<LanguageDTO>>),
        (status = 500, description = "Database error")
    ),
    tag = "I18n"
)]
pub async fn get_languages(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Vec<LanguageDTO>>>, (StatusCode, Json<ApiResponse<Vec<LanguageDTO>>>)>
{
    let rows: Result<Vec<(String, String)>, _> = sqlx::query_as(
        r#"
        SELECT DISTINCT locale, value 
        FROM i18n_translations 
        WHERE key = 'languages.name.' || locale
        ORDER BY locale
        "#,
    )
    .fetch_all(&state.pool)
    .await;

    match rows {
        Ok(languages) => {
            let list: Vec<LanguageDTO> = languages
                .into_iter()
                .map(|(code, name)| LanguageDTO { code, name })
                .collect();

            // Fallback to defaults if no names found in DB
            if list.is_empty() {
                let fallback = vec![
                    LanguageDTO {
                        code: "en".to_string(),
                        name: "English".to_string(),
                    },
                    LanguageDTO {
                        code: "ru".to_string(),
                        name: "Русский".to_string(),
                    },
                ];
                return into_api_response(StatusCode::OK, Some(fallback), None, None);
            }

            into_api_response(StatusCode::OK, Some(list), None, None)
        }
        Err(e) => {
            eprintln!("DB error in get_languages: {}", e);
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                None,
                Some(vec!["Failed to load languages".to_string()]),
            )
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/i18n/namespaces",
    responses(
        (status = 200, description = "List of available namespaces", body = ApiResponse<Vec<String>>),
        (status = 500, description = "Database error")
    ),
    tag = "I18n"
)]
pub async fn get_namespaces(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Vec<String>>>, (StatusCode, Json<ApiResponse<Vec<String>>>)> {
    let rows: Result<Vec<(String,)>, _> = sqlx::query_as(
        r#"
        SELECT DISTINCT split_part(key, '.', 1) as namespace 
        FROM i18n_translations 
        WHERE key LIKE '%.%'
        ORDER BY namespace
        "#,
    )
    .fetch_all(&state.pool)
    .await;

    match rows {
        Ok(namespaces) => {
            let list: Vec<String> = namespaces.into_iter().map(|(ns,)| ns).collect();

            into_api_response(StatusCode::OK, Some(list), None, None)
        }
        Err(e) => {
            eprintln!("DB error in get_namespaces: {}", e);
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                None,
                Some(vec!["Failed to load namespaces".to_string()]),
            )
        }
    }
}

fn into_api_response_internal(message: String) -> Json<ApiResponse<()>> {
    Json(ApiResponse {
        data: None,
        errors: None,
        messages: Some(vec![message]),
    })
}

pub fn public_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/languages", get(get_languages))
        .route("/namespaces", get(get_namespaces))
        .route("/{dict_key}", get(get_by_dict_key))
}

pub fn protected_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", post(create_or_update))
        .route("/", get(get_all))
        .route("/{key}/{locale}", delete(delete_one))
}
