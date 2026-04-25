use crate::core::dto::{ApiResponse, ApiResponseWithPagination, ApiPaginationDTO, PaginationDTO};
use crate::media::dto::{
  CreateMediaDTO,
  MediaFilterQuery,
  MediaItemDTO,
  MediaItemFromDb,
  UpdateMediaDTO,
};
use sqlx::{Postgres, QueryBuilder};
use crate::core::response::{error_map, into_api_response, into_api_response_with_pagination};
use serde_json::json;
use crate::AppState;
use axum::{
    extract::{DefaultBodyLimit, Multipart, Path, Query, State},
    http::StatusCode,
    routing::{delete, get, post, put},
    Json, Router,
};
use std::sync::Arc;
use std::collections::BTreeMap;
use uuid::Uuid;

#[utoipa::path(
    post,
    path = "/api/v1/media",
    tag = "Media",
    request_body(content = Vec<CreateMediaDTO>, content_type = "multipart/form-data"),
    responses(
        (status = 201, description = "Media uploaded successfully", body = ApiResponse<serde_json::Value>),
        (status = 500, description = "Internal server error")
    ),
    operation_id = "upload_media",
)]
pub async fn create(
    State(state): State<Arc<AppState>>,
    mut multipart: Multipart,
) -> Result<Json<ApiResponse<serde_json::Value>>, (StatusCode, Json<ApiResponse<serde_json::Value>>)> {
    let mut uploaded_items = Vec::new();
    let mut files = Vec::new();
    let mut titles = BTreeMap::new();
    let mut alts = BTreeMap::new();
    let mut is_multiple = false;

    while let Some(field) = multipart.next_field().await.map_err(|e| (StatusCode::BAD_REQUEST, Json(ApiResponse { data: None, errors: Some(error_map("multipart", &format!("Stream error: {}", e))), messages: Some(vec!["Invalid multipart request".to_string()]) })))? {
        let name = field.name().map(|n| n.to_string()).unwrap_or_default();
        if name == "file" {
            let file_name = field.file_name().map(|f| f.to_string()).unwrap_or_else(|| "file.bin".to_string());
            let data = field.bytes().await.map_err(|e| (StatusCode::BAD_REQUEST, Json(ApiResponse { data: None, errors: Some(error_map("field", &format!("Read error: {}", e))), messages: Some(vec!["Could not read file data".to_string()]) })))?.to_vec();
            files.push((file_name, data));
        } else if name.starts_with("title_") {
            is_multiple = true;
            if let Ok(idx) = name["title_".len()..].parse::<u32>() {
                let text = field.text().await.map_err(|e| (StatusCode::BAD_REQUEST, Json(ApiResponse { data: None, errors: Some(error_map("field", &format!("Text error: {}", e))), messages: Some(vec!["Could not read field text".to_string()]) })))?;
                titles.insert(idx, text);
            }
        } else if name.starts_with("alt_") {
            is_multiple = true;
            if let Ok(idx) = name["alt_".len()..].parse::<u32>() {
                let text = field.text().await.map_err(|e| (StatusCode::BAD_REQUEST, Json(ApiResponse { data: None, errors: Some(error_map("field", &format!("Text error: {}", e))), messages: Some(vec!["Could not read field text".to_string()]) })))?;
                alts.insert(idx, text);
            }
        } else if name == "title" {
            let text = field.text().await.map_err(|e| (StatusCode::BAD_REQUEST, Json(ApiResponse { data: None, errors: Some(error_map("field", &format!("Text error: {}", e))), messages: Some(vec!["Could not read field text".to_string()]) })))?;
            titles.insert(0, text);
        } else if name == "alt" {
            let text = field.text().await.map_err(|e| (StatusCode::BAD_REQUEST, Json(ApiResponse { data: None, errors: Some(error_map("field", &format!("Text error: {}", e))), messages: Some(vec!["Could not read field text".to_string()]) })))?;
            alts.insert(0, text);
        }
    }

    if files.len() > 1 {
        is_multiple = true;
    }

    for (i, (file_name, data)) in files.into_iter().enumerate() {
        let content_type = mime_guess::from_path(&file_name).first().map(|mime| mime.to_string()).unwrap_or_else(|| "application/octet-stream".to_string());
        
        let (media_type_str, _) = if content_type.starts_with("image/") {
            ("image", crate::media::dto::MediaType::Image)
        } else if content_type.starts_with("video/") {
            ("video", crate::media::dto::MediaType::Video)
        } else if content_type.contains("pdf") || content_type.contains("document") || content_type.contains("msword") || content_type.contains("officedocument") || content_type.contains("text/csv") || content_type.contains("text/plain") {
            ("document", crate::media::dto::MediaType::Document)
        } else if content_type.contains("zip") || content_type.contains("tar") || content_type.contains("compressed") {
            ("archive", crate::media::dto::MediaType::Archive)
        } else {
            ("other", crate::media::dto::MediaType::Other)
        };

        let file_size = data.len() as i64;
        
        // Quota check
        if let Ok(true) = state.media_quota.check_quota(file_size).await {
            let media_uuid = Uuid::new_v4();
            let extension = std::path::Path::new(&file_name).extension().and_then(|ext| ext.to_str()).unwrap_or("bin");
            let final_name = std::path::Path::new(&file_name).file_stem().and_then(|s| s.to_str()).unwrap_or(&file_name).to_string();

            let save_result = if media_type_str == "image" {
                let processed_data = state.media_storage.process_image(&data).await;
                if let Ok(p_data) = processed_data {
                    state.media_storage.save_cas(&p_data, "webp").await
                } else {
                    state.media_storage.save_cas(&data, extension).await
                }
            } else {
                state.media_storage.save_cas(&data, extension).await
            };

            if let Ok((_hash, relative_path)) = save_result {
                let full_url = format!("{}/uploads/{}", state.config.public_url, relative_path);
                let title = titles.get(&(i as u32)).cloned();
                let alt = alts.get(&(i as u32)).cloned();

                let db_result = sqlx::query_as::<_, MediaItemFromDb>(
                    "INSERT INTO media (uuid, media_type, url, name, extension, title, alt, size_bytes) VALUES ($1, $2::media_type, $3, $4, $5, $6, $7, $8) RETURNING uuid, media_type, url, name, extension, title, alt, size_bytes, created_at",
                )
                .bind(media_uuid)
                .bind(media_type_str)
                .bind(&full_url)
                .bind(&final_name)
                .bind(extension)
                .bind(&title)
                .bind(&alt)
                .bind(file_size)
                .fetch_one(&state.pool)
                .await;

                if let Ok(row) = db_result {
                    uploaded_items.push(MediaItemDTO {
                        uuid: row.uuid.to_string(),
                        url: row.url,
                        name: row.name,
                        extension: row.extension,
                        title: row.title,
                        alt: row.alt,
                        size_bytes: row.size_bytes,
                        created_at: row.created_at,
                        media_type: row.media_type,
                    });
                }
            }
        }
    }

    let count = uploaded_items.len();
    let response_data = if is_multiple {
        json!(uploaded_items)
    } else {
        json!(uploaded_items.first())
    };

    Ok(Json(ApiResponse {
        data: Some(response_data),
        errors: None,
        messages: Some(vec![format!("{} files processed successfully", count)]),
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/media",
    tag = "Media",
    params(
        ("page" = i32, Query, description = "Page number"),
        ("limit" = i32, Query, description = "Items per page")
    ),
    responses(
        (status = 200, description = "List of media with pagination", body = ApiResponseWithPagination<MediaItemDTO>),
        (status = 500, description = "Internal server error", body = ApiResponseWithPagination<MediaItemDTO>)
    ),
    operation_id = "get_all_media"
)]
pub async fn get_all(
    State(state): State<Arc<AppState>>,
    Query(pagination): Query<MediaFilterQuery>,
) -> Result<Json<ApiResponseWithPagination<MediaItemDTO>>, (StatusCode, Json<ApiResponseWithPagination<MediaItemDTO>>)> {
    let page = pagination.page.unwrap_or(1);
    let limit = pagination.limit.unwrap_or(10);
    let offset = (page - 1) * limit;

    let total_query = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM media")
        .fetch_one(&state.pool)
        .await;

    let total = match total_query {
        Ok(count) => count,
        Err(e) => {
            eprintln!("DB error: {:?}", e);
            return into_api_response_with_pagination(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to fetch media count")),
                Some(vec!["Could not retrieve media count".to_string()]),
            );
        }
    };

    let total_pages = (total as f64 / limit as f64).ceil() as i32;

    let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(
        "SELECT uuid, media_type, url, name, extension, title, alt, size_bytes, created_at FROM media"
    );

    // Sorting logic
    let sort_by = pagination.sort_by.unwrap_or_else(|| "created_at".to_string());
    let sort_order = pagination.sort_order.unwrap_or_else(|| "DESC".to_string());
    
    let allowed_sort_columns = ["name", "extension", "title", "alt", "size_bytes", "created_at"];
    let final_sort_by = if allowed_sort_columns.contains(&sort_by.as_str()) {
        sort_by
    } else {
        "created_at".to_string()
    };
    
    let final_sort_order = if sort_order.to_uppercase() == "ASC" { "ASC" } else { "DESC" };

    query_builder.push(format!(" ORDER BY {} {}", final_sort_by, final_sort_order));
    query_builder.push(" LIMIT ");
    query_builder.push_bind(limit as i64);
    query_builder.push(" OFFSET ");
    query_builder.push_bind(offset as i64);

    let rows = query_builder.build_query_as::<MediaItemFromDb>().fetch_all(&state.pool).await;

    match rows {
        Ok(db_items) => {
            let media_list = db_items
                .into_iter()
                .map(|row| MediaItemDTO {
                    uuid: row.uuid.to_string(),
                    url: row.url,
                    name: row.name,
                    extension: row.extension,
                    title: row.title,
                    alt: row.alt,
                    size_bytes: row.size_bytes,
                    created_at: row.created_at,
                    media_type: row.media_type,
                })
                .collect();

            let pagination = PaginationDTO {
                page,
                total: Some(total as i32),
                total_pages: Some(total_pages),
                limit: Some(limit),
            };

            let api_pagination = ApiPaginationDTO {
                items: media_list,
                pagination: pagination,
            };

            into_api_response_with_pagination(
                StatusCode::OK,
                Some(api_pagination),
                None,
                Some(vec!["Media fetched successfully".to_string()]),
            )
        }
        Err(e) => {
            eprintln!("DB error: {:?}", e);
            into_api_response_with_pagination(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to fetch media list")),
                Some(vec!["Could not retrieve media records".to_string()]),
            )
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/media/{uuid}",
    tag = "Media",
    params(
        ("uuid" = String, Path, description = "Media UUID")
    ),
    responses(
        (status = 200, description = "Media item", body = ApiResponse<MediaItemDTO>),
        (status = 404, description = "Media not found", body = ApiResponse<MediaItemDTO>),
        (status = 500, description = "Internal server error", body = ApiResponse<MediaItemDTO>)
    ),
    operation_id = "get_one_media"
)]
pub async fn get_one(
    State(state): State<Arc<AppState>>,
    Path(uuid): Path<Uuid>,
) -> Result<Json<ApiResponse<MediaItemDTO>>, (StatusCode, Json<ApiResponse<MediaItemDTO>>)> {
    let result = sqlx::query_as::<_, MediaItemFromDb>(
        "SELECT uuid, media_type, url, name, extension, title, alt, size_bytes, created_at FROM media WHERE uuid = $1"
    )
    .bind(uuid)
    .fetch_optional(&state.pool)
    .await;

    match result {
        Ok(Some(media)) => {
            let media_response = MediaItemDTO {
                uuid: media.uuid.to_string(),
                url: media.url,
                name: media.name,
                extension: media.extension,
                title: media.title,
                alt: media.alt,
                size_bytes: media.size_bytes,
                created_at: media.created_at,
                media_type: media.media_type,
            };

            into_api_response(
                StatusCode::OK,
                Some(media_response),
                None,
                Some(vec!["Media fetched successfully".to_string()]),
            )
        }
        Ok(None) => {
            into_api_response(
                StatusCode::NOT_FOUND,
                None,
                Some(error_map("media", "Media not found")),
                Some(vec!["Media not found".to_string()]),
            )
        }
        Err(e) => {
            eprintln!("DB error: {:?}", e);
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to fetch media")),
                Some(vec!["Could not retrieve media".to_string()]),
            )
        }
    }
}

#[utoipa::path(
    put,
    path = "/api/v1/media/{uuid}",
    tag = "Media",
    params(
        ("uuid" = Uuid, Path, description = "Media UUID")
    ),
    request_body(content = UpdateMediaDTO, content_type = "application/json"),
    responses(
        (status = 200, description = "Media updated successfully", body = ApiResponse<MediaItemDTO>),
        (status = 400, description = "No fields to update", body = ApiResponse<MediaItemDTO>),
        (status = 404, description = "Media not found", body = ApiResponse<MediaItemDTO>),
        (status = 500, description = "Internal server error", body = ApiResponse<MediaItemDTO>)
    ),
    operation_id = "update_media"
)]
pub async fn update(
    State(state): State<Arc<AppState>>,
    Path(uuid): Path<Uuid>,
    Json(payload): Json<UpdateMediaDTO>,
) -> Result<Json<ApiResponse<MediaItemDTO>>, (StatusCode, Json<ApiResponse<MediaItemDTO>>)> {
    let existing_media = sqlx::query_as::<_, MediaItemFromDb>(
        "SELECT uuid, media_type, url, name, extension, title, alt, size_bytes, created_at FROM media WHERE uuid = $1"
    )
    .bind(uuid)
    .fetch_optional(&state.pool)
    .await;

    match existing_media {
        Ok(Some(_)) => {
            let mut update_query = "UPDATE media SET ".to_string();
            let mut query_param_index = 1;
            let mut has_updates = false;

            if let Some(_name) = &payload.name {
                update_query.push_str(&format!("name = ${}, ", query_param_index));
                query_param_index += 1;
                has_updates = true;
            }

            if let Some(_extension) = &payload.extension {
                update_query.push_str(&format!("extension = ${}, ", query_param_index));
                query_param_index += 1;
                has_updates = true;
            }

            if let Some(_title) = &payload.title {
                update_query.push_str(&format!("title = ${}, ", query_param_index));
                query_param_index += 1;
                has_updates = true;
            }

            if let Some(_alt) = &payload.alt {
                update_query.push_str(&format!("alt = ${}, ", query_param_index));
                query_param_index += 1;
                has_updates = true;
            }

            if !has_updates {
                return into_api_response(
                    StatusCode::BAD_REQUEST,
                    None,
                    Some(error_map("update", "No fields to update")),
                    Some(vec!["No fields provided for update".to_string()]),
                );
            }

            update_query.push_str(&format!("WHERE uuid = ${}", query_param_index));

            let mut query = sqlx::query(&update_query);

            if let Some(name) = &payload.name {
                query = query.bind(name.clone());
            }

            if let Some(extension) = &payload.extension {
                query = query.bind(extension.clone());
            }

            if let Some(title) = &payload.title {
                query = query.bind(title.clone());
            }

            if let Some(alt) = &payload.alt {
                query = query.bind(alt.clone());
            }

            query = query.bind(uuid);

            let result = query.execute(&state.pool).await;

            match result {
                Ok(_) => {
                    let updated_media = sqlx::query_as::<_, MediaItemFromDb>(
                        "SELECT uuid, media_type, url, name, extension, title, alt, size_bytes, created_at FROM media WHERE uuid = $1"
                    )
                    .bind(uuid)
                    .fetch_one(&state.pool)
                    .await;

                    match updated_media {
                        Ok(media) => {
                            let media_response = MediaItemDTO {
                                uuid: media.uuid.to_string(),
                                url: media.url,
                                name: media.name,
                                extension: media.extension,
                                title: media.title,
                                alt: media.alt,
                                size_bytes: media.size_bytes,
                                created_at: media.created_at,
                                media_type: media.media_type,
                            };

                            into_api_response(
                                StatusCode::OK,
                                Some(media_response),
                                None,
                                Some(vec!["Media updated successfully".to_string()]),
                            )
                        }
                        Err(e) => {
                            eprintln!("DB error: {:?}", e);
                            into_api_response(
                                StatusCode::INTERNAL_SERVER_ERROR,
                                None,
                                Some(error_map("database", "Failed to fetch updated media")),
                                Some(vec!["Could not retrieve updated media".to_string()]),
                            )
                        }
                    }
                }
                Err(e) => {
                    eprintln!("DB error: {:?}", e);
                    into_api_response(
                        StatusCode::INTERNAL_SERVER_ERROR,
                        None,
                        Some(error_map("database", "Failed to update media")),
                        Some(vec!["Could not update media".to_string()]),
                    )
                }
            }
        }
        Ok(None) => {
            into_api_response(
                StatusCode::NOT_FOUND,
                None,
                Some(error_map("media", "Media not found")),
                Some(vec!["Media not found".to_string()]),
            )
        }
        Err(e) => {
            eprintln!("DB error: {:?}", e);
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to check media existence")),
                Some(vec!["Could not check if media exists".to_string()]),
            )
        }
    }
}


pub async fn delete_one(
    State(state): State<Arc<AppState>>,
    Path(uuid): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let exists = sqlx::query_scalar::<_, bool>("SELECT EXISTS(SELECT 1 FROM media WHERE uuid = $1)")
        .bind(uuid)
        .fetch_one(&state.pool)
        .await;

    match exists {
        Ok(true) => {
            let result = sqlx::query("DELETE FROM media WHERE uuid = $1")
                .bind(uuid)
                .execute(&state.pool)
                .await;
            match result {
                Ok(_) => {
                    into_api_response(
                        StatusCode::OK,
                        None,
                        None,
                        Some(vec!["Media deleted successfully".to_string()]),
                    )
                }
                Err(e) => {
                    eprintln!("DB error: {:?}", e);
                    into_api_response(
                        StatusCode::INTERNAL_SERVER_ERROR,
                        None,
                        Some(error_map("database", "Failed to delete media")),
                        Some(vec!["Could not delete media".to_string()]),
                    )
                }
            }
        }
        Ok(false) => {
            into_api_response(
                StatusCode::NOT_FOUND,
                None,
                Some(error_map("media", "Media not found")),
                Some(vec!["Media not found".to_string()]),
            )
        }
        Err(e) => {
            eprintln!("DB error: {:?}", e);
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to check media existence")),
                Some(vec!["Could not check if media exists".to_string()]),
            )
        }
    }
}


pub async fn delete_all(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = sqlx::query("DELETE FROM media")
        .execute(&state.pool)
        .await;

    match result {
        Ok(_) => {
            into_api_response(
                StatusCode::OK,
                None,
                None,
                Some(vec!["All media deleted successfully".to_string()]),
            )
        }
        Err(e) => {
            eprintln!("DB error: {:?}", e);
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to delete all media")),
                Some(vec!["Could not delete all media".to_string()]),
            )
        }
    }
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", post(create).layer(DefaultBodyLimit::disable()))
        .route("/", get(get_all))
        .route("/{uuid}", get(get_one))
        .route("/{uuid}", put(update))
        .route("/{uuid}", delete(delete_one))
        .route("/", delete(delete_all))
}

