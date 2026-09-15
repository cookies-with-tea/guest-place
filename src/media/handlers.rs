use crate::core::dto::{ApiResponse, ApiResponseWithPagination, ApiPaginationDTO, PaginationDTO};
use crate::media::dto::{
  CreateMediaDTO,
  MediaFilterQuery,
  MediaItemDTO,
  MediaItemFromDb,
  UpdateMediaDTO,
  BulkUpdateMediaDTO,
};
use sqlx::{Postgres, QueryBuilder};
use crate::core::response::{error_map, into_api_response, into_api_response_with_pagination};
use serde_json::json;
use crate::AppState;
use axum::{
    extract::{multipart::MultipartRejection, DefaultBodyLimit, Multipart, Path, Query, State},
    http::StatusCode,
    routing::{delete, get, post, put, patch},
    Extension, Json, Router,
};
use std::sync::Arc;
use std::collections::{BTreeMap, HashMap};
use uuid::Uuid;
use axum::body::Bytes;
use crate::media::chunk::{
    ChunkManager, ChunkStatusResponse, ChunkUploadResultDTO, InitChunkUploadDTO, InitChunkUploadResponse,
};

#[utoipa::path(
    post,
    path = "/api/v1/media",
    tag = "Media",
    request_body(content = Vec<CreateMediaDTO>, content_type = "multipart/form-data"),
    responses(
        (status = 201, description = "Media uploaded successfully", body = ApiResponse<serde_json::Value>),
        (status = 400, description = "Invalid request"),
        (status = 413, description = "Quota exceeded"),
        (status = 500, description = "Internal server error")
    ),
    operation_id = "upload_media",
)]
pub async fn create(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    multipart: Result<Multipart, MultipartRejection>,
) -> Result<Json<ApiResponse<serde_json::Value>>, (StatusCode, Json<ApiResponse<serde_json::Value>>)> {
    let mut multipart = match multipart {
        Ok(m) => m,
        Err(e) => {
            let msg = state.i18n.t("media.invalid_request", &locale).await;
            return into_api_response(
                StatusCode::BAD_REQUEST,
                None,
                Some(error_map("file", &format!("Invalid multipart request: {}", e))),
                Some(vec![msg]),
            );
        }
    };
    let mut uploaded_items = Vec::new();
    let mut files: Vec<(String, Vec<u8>)> = Vec::new();
    let mut titles: BTreeMap<u32, String> = BTreeMap::new();
    let mut alts: BTreeMap<u32, String> = BTreeMap::new();
    let mut categories: BTreeMap<u32, String> = BTreeMap::new();
    let mut tags_map: BTreeMap<u32, Vec<String>> = BTreeMap::new();
    let mut upload_source = "site".to_string();
    let mut is_multiple = false;
    let mut convert_to_webp_global = true;
    let mut field_errors: HashMap<String, Vec<String>> = HashMap::new();

    loop {
        let field_result = multipart.next_field().await;
        let field = match field_result {
            Ok(Some(f)) => f,
            Ok(None) => break,
            Err(e) => {
                let msg = state.i18n.t("media.invalid_request", &locale).await;
                return Err((StatusCode::BAD_REQUEST, Json(ApiResponse { 
                    data: None, 
                    errors: Some(error_map("multipart", &format!("Stream error: {}", e))), 
                    messages: Some(vec![msg]) 
                })));
            }
        };

        let name = field.name().map(|n| n.to_string()).unwrap_or_default();
        if name == "file" {
            let file_name = field.file_name().map(|f| f.to_string()).unwrap_or_else(|| "file.bin".to_string());
            let data_result = field.bytes().await;
            let data = match data_result {
                Ok(b) => b.to_vec(),
                Err(e) => {
                    let msg = state.i18n.t("media.read_error", &locale).await;
                    return Err((StatusCode::BAD_REQUEST, Json(ApiResponse { 
                        data: None, 
                        errors: Some(error_map("field", &format!("Read error: {}", e))), 
                        messages: Some(vec![msg]) 
                    })));
                }
            };
            files.push((file_name, data));
        } else if name.starts_with("title_") {
            is_multiple = true;
            if let Ok(idx) = name["title_".len()..].parse::<u32>() {
                if let Ok(text) = field.text().await {
                    titles.insert(idx, text);
                }
            }
        } else if name.starts_with("alt_") {
            is_multiple = true;
            if let Ok(idx) = name["alt_".len()..].parse::<u32>() {
                if let Ok(text) = field.text().await {
                    alts.insert(idx, text);
                }
            }
        } else if name.starts_with("category_") {
            is_multiple = true;
            if let Ok(idx) = name["category_".len()..].parse::<u32>() {
                if let Ok(text) = field.text().await {
                    categories.insert(idx, text);
                }
            }
        } else if name.starts_with("tags_") {
            is_multiple = true;
            if let Ok(idx) = name["tags_".len()..].parse::<u32>() {
                if let Ok(text) = field.text().await {
                    let tags: Vec<String> = text.split(',').map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect();
                    tags_map.insert(idx, tags);
                }
            }
        } else if name == "title" {
            if let Ok(text) = field.text().await {
                titles.insert(0, text);
            }
        } else if name == "alt" {
            if let Ok(text) = field.text().await {
                alts.insert(0, text);
            }
        } else if name == "category" {
            if let Ok(text) = field.text().await {
                categories.insert(0, text);
            }
        } else if name == "tags" {
            if let Ok(text) = field.text().await {
                let tags: Vec<String> = text.split(',').map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect();
                tags_map.insert(0, tags);
            }
        } else if name == "source" {
            if let Ok(text) = field.text().await {
                upload_source = text;
            }
        } else if name == "convert_to_webp" {
            if let Ok(text) = field.text().await {
                convert_to_webp_global = text == "true";
            }
        }
    }

    // Validation
    if files.is_empty() {
        let msg = state.i18n.t("media.field.file_required", &locale).await;
        field_errors.entry("file".to_string()).or_default().push(msg);
    }

    for (idx, text) in &titles {
        if text.len() > 255 {
            let msg = state.i18n.t("media.field.title_too_long", &locale).await;
            let field_key = if *idx == 0 { "title".to_string() } else { format!("title_{}", idx) };
            field_errors.entry(field_key).or_default().push(msg);
        }
    }

    for (idx, text) in &alts {
        if text.len() > 255 {
            let msg = state.i18n.t("media.field.alt_too_long", &locale).await;
            let field_key = if *idx == 0 { "alt".to_string() } else { format!("alt_{}", idx) };
            field_errors.entry(field_key).or_default().push(msg);
        }
    }

    for (idx, text) in &categories {
        if text.len() > 64 {
            let msg = state.i18n.t("media.field.category_too_long", &locale).await;
            let field_key = if *idx == 0 { "category".to_string() } else { format!("category_{}", idx) };
            field_errors.entry(field_key).or_default().push(msg);
        }
    }

    if !field_errors.is_empty() {
        let msg = state.i18n.t("media.validation_error", &locale).await;
        return Err((StatusCode::BAD_REQUEST, Json(ApiResponse { 
            data: None, 
            errors: Some(field_errors), 
            messages: Some(vec![msg]) 
        })));
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
        match state.media_quota.check_quota(file_size).await {
            Ok(true) => {
                let media_uuid = Uuid::new_v4();
                let extension = std::path::Path::new(&file_name).extension().and_then(|ext| ext.to_str()).unwrap_or("bin");
                let final_name = std::path::Path::new(&file_name).file_stem().and_then(|s| s.to_str()).unwrap_or(&file_name).to_string();

                let save_result = if media_type_str == "image" && convert_to_webp_global {
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
                    let category = categories.get(&(i as u32)).cloned();
                    let tags = tags_map.get(&(i as u32)).cloned().unwrap_or_default();

                    let db_result = sqlx::query_as::<_, MediaItemFromDb>(
                        "INSERT INTO media (uuid, media_type, url, name, extension, title, alt, size_bytes, category, tags, source) VALUES ($1, $2::media_type, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING uuid, media_type, url, name, extension, title, alt, size_bytes, created_at, category, tags, source",
                    )
                    .bind(media_uuid)
                    .bind(media_type_str)
                    .bind(&full_url)
                    .bind(&final_name)
                    .bind(extension)
                    .bind(&title)
                    .bind(&alt)
                    .bind(file_size)
                    .bind(&category)
                    .bind(&tags)
                    .bind(&upload_source)
                    .fetch_one(&state.pool)
                    .await;

                    if let Ok(row) = db_result {
                        if media_type_str == "image" {
                            state.media_optimizer.process_image(row.uuid, relative_path.clone()).await;
                        }

                        uploaded_items.push(MediaItemDTO {
                            uuid: row.uuid.to_string(),
                            url: row.url,
                            name: row.name,
                            extension: row.extension,
                            title: row.title,
                            alt: row.alt,
                            category: row.category,
                            tags: row.tags,
                            size_bytes: row.size_bytes,
                            created_at: row.created_at,
                            source: row.source,
                            media_type: row.media_type,
                        });
                    }
                }
            },
            Ok(false) => {
                let msg = state.i18n.t("media.quota_exceeded", &locale).await;
                return Err((StatusCode::PAYLOAD_TOO_LARGE, Json(ApiResponse { data: None, errors: Some(error_map("quota", "exceeded")), messages: Some(vec![msg]) })));
            },
            Err(e) => {
                eprintln!("Quota check error: {:?}", e);
                let msg = state.i18n.t("media.db_error", &locale).await;
                return Err((StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: Some(error_map("database", "quota_check")), messages: Some(vec![msg]) })));
            }
        }
    }

    let response_data = if is_multiple {
        json!(uploaded_items)
    } else {
        json!(uploaded_items.first())
    };

    let msg = state.i18n.t("media.upload_success", &locale).await;
    Ok(Json(ApiResponse {
        data: Some(response_data),
        errors: None,
        messages: Some(vec![msg]),
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
    Extension(locale): Extension<String>,
    Query(filter): Query<MediaFilterQuery>,
) -> Result<Json<ApiResponseWithPagination<MediaItemDTO>>, (StatusCode, Json<ApiResponseWithPagination<MediaItemDTO>>)> {
    let page = filter.page.unwrap_or(1);
    let limit = filter.limit.unwrap_or(10);
    let offset = (page - 1) * limit;

    // 1. Build COUNT query
    let mut count_builder: QueryBuilder<Postgres> = QueryBuilder::new("SELECT COUNT(*) FROM media");
    let mut where_clause = false;

    apply_filters(&mut count_builder, &filter, &mut where_clause);

    let total_query = count_builder.build_query_scalar::<i64>().fetch_one(&state.pool).await;

    let total = match total_query {
        Ok(count) => count,
        Err(e) => {
            eprintln!("DB count error: {:?}", e);
            let msg = state.i18n.t("media.db_error", &locale).await;
            return into_api_response_with_pagination(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to fetch media count")),
                Some(vec![msg]),
            );
        }
    };

    let total_pages = (total as f64 / limit as f64).ceil() as i32;

    // 2. Build SELECT query
    let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(
        "SELECT uuid, media_type, url, name, extension, title, alt, size_bytes, created_at, category, tags, source FROM media"
    );
    
    let mut select_where_clause = false;
    apply_filters(&mut query_builder, &filter, &mut select_where_clause);

    // Sorting logic
    let sort_by = filter.sort_by.as_deref().unwrap_or("created_at");
    let sort_order = filter.sort_order.as_deref().unwrap_or("DESC");
    
    let allowed_sort_columns = ["name", "extension", "title", "alt", "size_bytes", "created_at", "category"];
    let final_sort_by = if allowed_sort_columns.contains(&sort_by) {
        sort_by
    } else {
        "created_at"
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
                    category: row.category,
                    tags: row.tags,
                    size_bytes: row.size_bytes,
                    created_at: row.created_at,
                    source: row.source,
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

            let msg = state.i18n.t("media.fetch_success", &locale).await;
            into_api_response_with_pagination(
                StatusCode::OK,
                Some(api_pagination),
                None,
                Some(vec![msg]),
            )
        }
        Err(e) => {
            eprintln!("DB fetch error: {:?}", e);
            let msg = state.i18n.t("media.db_error", &locale).await;
            into_api_response_with_pagination(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to fetch media list")),
                Some(vec![msg]),
            )
        }
    }
}

fn apply_filters<'a>(builder: &mut QueryBuilder<'a, Postgres>, filter: &'a MediaFilterQuery, where_clause: &mut bool) {
    if let Some(search) = &filter.search {
        if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
        builder.push("(name ILIKE ");
        builder.push_bind(format!("%{}%", search));
        builder.push(" OR title ILIKE ");
        builder.push_bind(format!("%{}%", search));
        builder.push(" OR alt ILIKE ");
        builder.push_bind(format!("%{}%", search));
        builder.push(")");
    }

    if let Some(categories_str) = &filter.category {
        if !categories_str.is_empty() {
            let split_categories: Vec<&str> = categories_str.split(',').collect();
            if !split_categories.is_empty() {
                if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
                builder.push("category IN (");
                let mut separated = builder.separated(", ");
                for cat in split_categories {
                    separated.push_bind(cat.trim());
                }
                builder.push(")");
            }
        }
    }

    if let Some(types_str) = &filter.media_type {
        if !types_str.is_empty() {
            let split_types: Vec<&str> = types_str.split(',').collect();
            if !split_types.is_empty() {
                if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
                builder.push("media_type::text IN (");
                let mut separated = builder.separated(", ");
                for t in split_types {
                    separated.push_bind(t.trim());
                }
                builder.push(")");
            }
        }
    }

    if let Some(tags_str) = &filter.tags {
        if !tags_str.is_empty() {
            let split_tags: Vec<&str> = tags_str.split(',').collect();
            if !split_tags.is_empty() {
                if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
                builder.push("tags && ARRAY[");
                let mut separated = builder.separated(", ");
                for t in split_tags {
                    separated.push_bind(t.trim());
                }
                builder.push("]::text[]");
            }
        }
    }

    if let Some(source) = &filter.source {
        if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
        builder.push("source = ");
        builder.push_bind(source);
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/media/{uuid}",
    tag = "Media",
    params(
        ("uuid" = Uuid, Path, description = "Media UUID")
    ),
    responses(
        (status = 200, description = "Media item fetched successfully", body = ApiResponse<MediaItemDTO>),
        (status = 404, description = "Media not found"),
        (status = 500, description = "Internal server error")
    ),
    operation_id = "get_media_by_uuid",
)]
pub async fn get_one(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Path(uuid): Path<Uuid>,
) -> Result<Json<ApiResponse<MediaItemDTO>>, (StatusCode, Json<ApiResponse<MediaItemDTO>>)> {
    let result = sqlx::query_as::<_, MediaItemFromDb>(
        "SELECT uuid, media_type, url, name, extension, title, alt, size_bytes, created_at, category, tags, source FROM media WHERE uuid = $1"
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
                category: media.category,
                tags: media.tags,
                size_bytes: media.size_bytes,
                created_at: media.created_at,
                source: media.source,
                media_type: media.media_type,
            };

            let msg = state.i18n.t("media.fetch_success", &locale).await;
            into_api_response(
                StatusCode::OK,
                Some(media_response),
                None,
                Some(vec![msg]),
            )
        }
        Ok(None) => {
            let msg = state.i18n.t("media.not_found", &locale).await;
            into_api_response(
                StatusCode::NOT_FOUND,
                None,
                Some(error_map("media", "Media not found")),
                Some(vec![msg]),
            )
        }
        Err(e) => {
            eprintln!("DB error: {:?}", e);
            let msg = state.i18n.t("media.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to fetch media")),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    put,
    path = "/api/v1/media/{uuid}",
    tag = "Media",
    request_body = UpdateMediaDTO,
    params(
        ("uuid" = Uuid, Path, description = "Media UUID")
    ),
    responses(
        (status = 200, description = "Media updated successfully", body = ApiResponse<MediaItemDTO>),
        (status = 404, description = "Media not found"),
        (status = 500, description = "Internal server error")
    ),
    operation_id = "update_media",
)]
pub async fn update(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Path(uuid): Path<Uuid>,
    Json(payload): Json<UpdateMediaDTO>,
) -> Result<Json<ApiResponse<MediaItemDTO>>, (StatusCode, Json<ApiResponse<MediaItemDTO>>)> {
    let mut field_errors: HashMap<String, Vec<String>> = HashMap::new();

    if let Some(name) = &payload.name {
        if name.len() > 255 {
            let msg = state.i18n.t("media.field.name_too_long", &locale).await;
            field_errors.entry("name".to_string()).or_default().push(msg);
        }
    }
    if let Some(title) = &payload.title {
        if title.len() > 255 {
            let msg = state.i18n.t("media.field.title_too_long", &locale).await;
            field_errors.entry("title".to_string()).or_default().push(msg);
        }
    }
    if let Some(alt) = &payload.alt {
        if alt.len() > 255 {
            let msg = state.i18n.t("media.field.alt_too_long", &locale).await;
            field_errors.entry("alt".to_string()).or_default().push(msg);
        }
    }
    if let Some(category) = &payload.category {
        if category.len() > 64 {
            let msg = state.i18n.t("media.field.category_too_long", &locale).await;
            field_errors.entry("category".to_string()).or_default().push(msg);
        }
    }

    if !field_errors.is_empty() {
        let msg = state.i18n.t("media.validation_error", &locale).await;
        return Err((StatusCode::BAD_REQUEST, Json(ApiResponse { 
            data: None, 
            errors: Some(field_errors), 
            messages: Some(vec![msg]) 
        })));
    }

    let mut has_updates = false;
    if payload.name.is_some() || payload.extension.is_some() || payload.title.is_some() || 
       payload.alt.is_some() || payload.category.is_some() || payload.tags.is_some() {
        has_updates = true;
    }

    if !has_updates {
        let msg = state.i18n.t("media.no_update_fields", &locale).await;
        return Err((StatusCode::BAD_REQUEST, Json(ApiResponse { 
            data: None, 
            errors: Some(error_map("update", "No fields to update")), 
            messages: Some(vec![msg]) 
        })));
    }

    let existing_media = sqlx::query_as::<_, MediaItemFromDb>(
        "SELECT uuid, media_type, url, name, extension, title, alt, size_bytes, created_at, category, tags, source FROM media WHERE uuid = $1"
    )
    .bind(uuid)
    .fetch_optional(&state.pool)
    .await;

    match existing_media {
        Ok(Some(_)) => {
            let mut update_query = "UPDATE media SET ".to_string();
            let mut query_param_index = 1;

            if let Some(_name) = &payload.name {
                update_query.push_str(&format!("name = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if let Some(_extension) = &payload.extension {
                update_query.push_str(&format!("extension = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if let Some(_title) = &payload.title {
                update_query.push_str(&format!("title = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if let Some(_alt) = &payload.alt {
                update_query.push_str(&format!("alt = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if let Some(_category) = &payload.category {
                update_query.push_str(&format!("category = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if let Some(_tags) = &payload.tags {
                update_query.push_str(&format!("tags = ${}, ", query_param_index));
                query_param_index += 1;
            }

            // Remove trailing comma and space
            if update_query.ends_with(", ") {
                update_query.truncate(update_query.len() - 2);
            }

            update_query.push_str(&format!(" WHERE uuid = ${}", query_param_index));

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

            if let Some(category) = &payload.category {
                query = query.bind(category.clone());
            }

            if let Some(tags) = &payload.tags {
                query = query.bind(tags);
            }

            query = query.bind(uuid);

            let result = query.execute(&state.pool).await;

            match result {
                Ok(_) => {
                    let updated_media = sqlx::query_as::<_, MediaItemFromDb>(
                        "SELECT uuid, media_type, url, name, extension, title, alt, size_bytes, created_at, category, tags, source FROM media WHERE uuid = $1"
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
                                category: media.category,
                                tags: media.tags,
                                size_bytes: media.size_bytes,
                                created_at: media.created_at,
                                source: media.source,
                                media_type: media.media_type,
                            };

                            let msg = state.i18n.t("media.update_success", &locale).await;
                            into_api_response(
                                StatusCode::OK,
                                Some(media_response),
                                None,
                                Some(vec![msg]),
                            )
                        }
                        Err(e) => {
                            eprintln!("DB error: {:?}", e);
                            let msg = state.i18n.t("media.db_error", &locale).await;
                            into_api_response(
                                StatusCode::INTERNAL_SERVER_ERROR,
                                None,
                                Some(error_map("database", "Failed to fetch updated media")),
                                Some(vec![msg]),
                            )
                        }
                    }
                }
                Err(e) => {
                    eprintln!("DB error: {:?}", e);
                    let msg = state.i18n.t("media.db_error", &locale).await;
                    into_api_response(
                        StatusCode::INTERNAL_SERVER_ERROR,
                        None,
                        Some(error_map("database", "Failed to update media")),
                        Some(vec![msg]),
                    )
                }
            }
        }
        Ok(None) => {
            let msg = state.i18n.t("media.not_found", &locale).await;
            into_api_response(
                StatusCode::NOT_FOUND,
                None,
                Some(error_map("media", "Media not found")),
                Some(vec![msg]),
            )
        }
        Err(e) => {
            eprintln!("DB error: {:?}", e);
            let msg = state.i18n.t("media.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to check media existence")),
                Some(vec![msg]),
            )
        }
    }
}


#[utoipa::path(
    delete,
    path = "/api/v1/media/{uuid}",
    tag = "Media",
    params(
        ("uuid" = Uuid, Path, description = "Media UUID")
    ),
    responses(
        (status = 200, description = "Media deleted successfully", body = ApiResponse<serde_json::Value>),
        (status = 404, description = "Media not found"),
        (status = 500, description = "Internal server error")
    ),
    operation_id = "delete_media_by_uuid",
)]
pub async fn delete_one(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
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
                    let msg = state.i18n.t("media.delete_success", &locale).await;
                    into_api_response(
                        StatusCode::OK,
                        None,
                        None,
                        Some(vec![msg]),
                    )
                }
                Err(e) => {
                    eprintln!("DB error: {:?}", e);
                    let msg = state.i18n.t("media.db_error", &locale).await;
                    into_api_response(
                        StatusCode::INTERNAL_SERVER_ERROR,
                        None,
                        Some(error_map("database", "Failed to delete media")),
                        Some(vec![msg]),
                    )
                }
            }
        }
        Ok(false) => {
            let msg = state.i18n.t("media.not_found", &locale).await;
            into_api_response(
                StatusCode::NOT_FOUND,
                None,
                Some(error_map("media", "Media not found")),
                Some(vec![msg]),
            )
        }
        Err(e) => {
            eprintln!("DB error: {:?}", e);
            let msg = state.i18n.t("media.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to check media existence")),
                Some(vec![msg]),
            )
        }
    }
}


#[utoipa::path(
    delete,
    path = "/api/v1/media",
    tag = "Media",
    responses(
        (status = 200, description = "All media deleted successfully", body = ApiResponse<serde_json::Value>),
        (status = 500, description = "Internal server error")
    ),
    operation_id = "delete_all_media",
)]
pub async fn delete_all(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = sqlx::query("DELETE FROM media")
        .execute(&state.pool)
        .await;

    match result {
        Ok(_) => {
            let msg = state.i18n.t("media.delete_success", &locale).await;
            into_api_response(
                StatusCode::OK,
                None,
                None,
                Some(vec![msg]),
            )
        }
        Err(e) => {
            eprintln!("DB error: {:?}", e);
            let msg = state.i18n.t("media.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to delete all media")),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    patch,
    path = "/api/v1/media/bulk",
    tag = "Media",
    request_body = BulkUpdateMediaDTO,
    responses(
        (status = 200, description = "Bulk media update successful", body = ApiResponse<serde_json::Value>),
        (status = 400, description = "Invalid request"),
        (status = 500, description = "Internal server error")
    ),
    operation_id = "update_bulk_media",
)]
pub async fn update_bulk(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Json(payload): Json<BulkUpdateMediaDTO>,
) -> Result<Json<ApiResponse<serde_json::Value>>, (StatusCode, Json<ApiResponse<serde_json::Value>>)> {
    let uuids: Vec<Uuid> = payload.uuids.iter()
        .filter_map(|s| Uuid::parse_str(s).ok())
        .collect();

    if uuids.is_empty() {
        let msg = state.i18n.t("media.invalid_request", &locale).await;
        return Err((StatusCode::BAD_REQUEST, Json(ApiResponse { 
            data: None, 
            errors: Some(error_map("uuids", "No valid UUIDs provided")), 
            messages: Some(vec![msg]) 
        })));
    }

    let mut update_query = "UPDATE media SET ".to_string();
    let mut query_param_index = 1;
    let mut has_updates = false;

    if let Some(_name) = &payload.data.name {
        update_query.push_str(&format!("name = ${}, ", query_param_index));
        query_param_index += 1;
        has_updates = true;
    }
    if let Some(_extension) = &payload.data.extension {
        update_query.push_str(&format!("extension = ${}, ", query_param_index));
        query_param_index += 1;
        has_updates = true;
    }
    if let Some(_title) = &payload.data.title {
        update_query.push_str(&format!("title = ${}, ", query_param_index));
        query_param_index += 1;
        has_updates = true;
    }
    if let Some(_alt) = &payload.data.alt {
        update_query.push_str(&format!("alt = ${}, ", query_param_index));
        query_param_index += 1;
        has_updates = true;
    }
    if let Some(_category) = &payload.data.category {
        update_query.push_str(&format!("category = ${}, ", query_param_index));
        query_param_index += 1;
        has_updates = true;
    }
    if let Some(_tags) = &payload.data.tags {
        update_query.push_str(&format!("tags = ${}, ", query_param_index));
        query_param_index += 1;
        has_updates = true;
    }

    if !has_updates {
        let msg = state.i18n.t("media.no_update_fields", &locale).await;
        return Err((StatusCode::BAD_REQUEST, Json(ApiResponse { 
            data: None, 
            errors: Some(error_map("update", "No fields to update")), 
            messages: Some(vec![msg]) 
        })));
    }

    // Remove trailing comma and space
    update_query.truncate(update_query.len() - 2);

    update_query.push_str(&format!(" WHERE uuid = ANY(${})", query_param_index));

    let mut query = sqlx::query(&update_query);

    if let Some(name) = &payload.data.name { query = query.bind(name); }
    if let Some(extension) = &payload.data.extension { query = query.bind(extension); }
    if let Some(title) = &payload.data.title { query = query.bind(title); }
    if let Some(alt) = &payload.data.alt { query = query.bind(alt); }
    if let Some(category) = &payload.data.category { query = query.bind(category); }
    if let Some(tags) = &payload.data.tags { query = query.bind(tags); }

    query = query.bind(uuids);

    let result = query.execute(&state.pool).await;

    match result {
        Ok(_) => {
            let msg = state.i18n.t("media.update_success", &locale).await;
            into_api_response(StatusCode::OK, Some(json!({"updated": true})), None, Some(vec![msg]))
        }
        Err(e) => {
            eprintln!("DB bulk update error: {:?}", e);
            let msg = state.i18n.t("media.db_error", &locale).await;
            into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, Some(error_map("database", "Bulk update failed")), Some(vec![msg]))
        }
    }
}

#[utoipa::path(
    post,
    path = "/api/v1/media/upload/chunk/init",
    tag = "Media",
    request_body = InitChunkUploadDTO,
    responses(
        (status = 200, description = "Chunk upload session initialized", body = ApiResponse<InitChunkUploadResponse>),
        (status = 400, description = "Invalid parameters"),
        (status = 413, description = "Quota exceeded")
    ),
    operation_id = "init_chunk_upload"
)]
pub async fn init_chunk_upload(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Json(payload): Json<InitChunkUploadDTO>,
) -> Result<Json<ApiResponse<InitChunkUploadResponse>>, (StatusCode, Json<ApiResponse<InitChunkUploadResponse>>)> {
    if payload.filename.trim().is_empty() || payload.total_chunks == 0 || payload.chunk_size == 0 || payload.total_size < 0 {
        let msg = state.i18n.t("media.invalid_request", &locale).await;
        return into_api_response(
            StatusCode::BAD_REQUEST,
            None,
            Some(error_map("chunk", "Invalid chunk upload parameters")),
            Some(vec![msg]),
        );
    }

    match state.media_quota.check_quota(payload.total_size).await {
        Ok(true) => {},
        Ok(false) => {
            let msg = state.i18n.t("media.quota_exceeded", &locale).await;
            return into_api_response(
                StatusCode::PAYLOAD_TOO_LARGE,
                None,
                Some(error_map("quota", "Storage quota exceeded")),
                Some(vec![msg]),
            );
        }
        Err(_) => {
            let msg = state.i18n.t("media.quota_error", &locale).await;
            return into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("quota", "Failed to check quota")),
                Some(vec![msg]),
            );
        }
    }

    let chunk_manager = ChunkManager::new("uploads");
    match chunk_manager.init_session(payload).await {
        Ok(resp) => {
            into_api_response(StatusCode::OK, Some(resp), None, None)
        }
        Err(e) => {
            let msg = state.i18n.t("media.upload_failed", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("chunk", &format!("Failed to initialize chunk session: {}", e))),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    post,
    path = "/api/v1/media/upload/chunk/{upload_id}/{chunk_index}",
    tag = "Media",
    params(
        ("upload_id" = Uuid, Path, description = "Upload session UUID"),
        ("chunk_index" = usize, Path, description = "Index of the chunk (0-based)")
    ),
    request_body(content = Vec<u8>, content_type = "application/octet-stream"),
    responses(
        (status = 200, description = "Chunk uploaded successfully", body = ApiResponse<ChunkUploadResultDTO>),
        (status = 400, description = "Invalid chunk"),
        (status = 404, description = "Session not found")
    ),
    operation_id = "upload_chunk"
)]
pub async fn upload_chunk(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Path((upload_id, chunk_index)): Path<(Uuid, usize)>,
    body: Bytes,
) -> Result<Json<ApiResponse<ChunkUploadResultDTO>>, (StatusCode, Json<ApiResponse<ChunkUploadResultDTO>>)> {
    if body.is_empty() {
        let msg = state.i18n.t("media.invalid_request", &locale).await;
        return into_api_response(
            StatusCode::BAD_REQUEST,
            None,
            Some(error_map("chunk", "Chunk body is empty")),
            Some(vec![msg]),
        );
    }

    let chunk_manager = ChunkManager::new("uploads");
    match chunk_manager.save_chunk(&upload_id, chunk_index, &body).await {
        Ok(res) => {
            into_api_response(StatusCode::OK, Some(res), None, None)
        }
        Err(e) => {
            let msg = state.i18n.t("media.upload_failed", &locale).await;
            into_api_response(
                StatusCode::BAD_REQUEST,
                None,
                Some(error_map("chunk", &format!("Failed to save chunk: {}", e))),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/media/upload/chunk/{upload_id}/status",
    tag = "Media",
    params(
        ("upload_id" = Uuid, Path, description = "Upload session UUID")
    ),
    responses(
        (status = 200, description = "Upload session status", body = ApiResponse<ChunkStatusResponse>),
        (status = 404, description = "Session not found")
    ),
    operation_id = "get_chunk_status"
)]
pub async fn get_chunk_status(
    State(_state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Path(upload_id): Path<Uuid>,
) -> Result<Json<ApiResponse<ChunkStatusResponse>>, (StatusCode, Json<ApiResponse<ChunkStatusResponse>>)> {
    let chunk_manager = ChunkManager::new("uploads");
    match chunk_manager.get_status(&upload_id).await {
        Ok(res) => into_api_response(StatusCode::OK, Some(res), None, None),
        Err(e) => {
            let msg = _state.i18n.t("media.not_found", &locale).await;
            into_api_response(
                StatusCode::NOT_FOUND,
                None,
                Some(error_map("session", &format!("Session not found: {}", e))),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    post,
    path = "/api/v1/media/upload/chunk/{upload_id}/complete",
    tag = "Media",
    params(
        ("upload_id" = Uuid, Path, description = "Upload session UUID")
    ),
    responses(
        (status = 201, description = "File assembled and saved successfully", body = ApiResponse<MediaItemDTO>),
        (status = 400, description = "Validation or checksum error"),
        (status = 413, description = "Quota exceeded"),
        (status = 500, description = "Internal server error")
    ),
    operation_id = "complete_chunk_upload"
)]
pub async fn complete_chunk_upload(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Path(upload_id): Path<Uuid>,
) -> Result<Json<ApiResponse<MediaItemDTO>>, (StatusCode, Json<ApiResponse<MediaItemDTO>>)> {
    let chunk_manager = ChunkManager::new("uploads");
    let (assembled_data, meta) = match chunk_manager.assemble(&upload_id).await {
        Ok(res) => res,
        Err(e) => {
            let msg = state.i18n.t("media.invalid_request", &locale).await;
            return into_api_response(
                StatusCode::BAD_REQUEST,
                None,
                Some(error_map("assemble", &format!("Assembly failed: {}", e))),
                Some(vec![msg]),
            );
        }
    };

    let file_name = meta.filename;
    let content_type = mime_guess::from_path(&file_name)
        .first()
        .map(|m| m.to_string())
        .unwrap_or_else(|| "application/octet-stream".to_string());

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

    let file_size = assembled_data.len() as i64;
    match state.media_quota.check_quota(file_size).await {
        Ok(true) => {},
        Ok(false) => {
            let msg = state.i18n.t("media.quota_exceeded", &locale).await;
            return into_api_response(
                StatusCode::PAYLOAD_TOO_LARGE,
                None,
                Some(error_map("quota", "Storage quota exceeded")),
                Some(vec![msg]),
            );
        }
        Err(_) => {
            let msg = state.i18n.t("media.quota_error", &locale).await;
            return into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("quota", "Failed to check quota")),
                Some(vec![msg]),
            );
        }
    }

    let media_uuid = Uuid::new_v4();
    let extension = std::path::Path::new(&file_name)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("bin");
    let final_name = std::path::Path::new(&file_name)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or(&file_name)
        .to_string();

    let convert_to_webp = meta.convert_to_webp.unwrap_or(true);
    let save_result = if media_type_str == "image" && convert_to_webp {
        let processed_data = state.media_storage.process_image(&assembled_data).await;
        if let Ok(p_data) = processed_data {
            state.media_storage.save_cas(&p_data, "webp").await
        } else {
            state.media_storage.save_cas(&assembled_data, extension).await
        }
    } else {
        state.media_storage.save_cas(&assembled_data, extension).await
    };

    let (_hash, relative_path) = match save_result {
        Ok(res) => res,
        Err(e) => {
            let msg = state.i18n.t("media.save_error", &locale).await;
            return into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("storage", &format!("Save error: {}", e))),
                Some(vec![msg]),
            );
        }
    };

    let full_url = format!("{}/uploads/{}", state.config.public_url, relative_path);
    let upload_source = meta.source.unwrap_or_else(|| "site".to_string());
    let tags = meta.tags.unwrap_or_default();

    let db_result = sqlx::query_as::<_, MediaItemFromDb>(
        "INSERT INTO media (uuid, media_type, url, name, extension, title, alt, size_bytes, category, tags, source) VALUES ($1, $2::media_type, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING uuid, media_type, url, name, extension, title, alt, size_bytes, created_at, category, tags, source",
    )
    .bind(media_uuid)
    .bind(media_type_str)
    .bind(&full_url)
    .bind(&final_name)
    .bind(extension)
    .bind(&meta.title)
    .bind(&meta.alt)
    .bind(file_size)
    .bind(&meta.category)
    .bind(&tags)
    .bind(&upload_source)
    .fetch_one(&state.pool)
    .await;

    match db_result {
        Ok(item) => {
            if media_type_str == "image" {
                state.media_optimizer.process_image(media_uuid, relative_path).await;
            }
            let dto = MediaItemDTO {
                uuid: item.uuid.to_string(),
                url: item.url,
                name: item.name,
                extension: item.extension,
                title: item.title,
                alt: item.alt,
                category: item.category,
                tags: item.tags,
                source: item.source,
                size_bytes: item.size_bytes,
                created_at: item.created_at,
                media_type: item.media_type,
            };
            let msg = state.i18n.t("media.upload_success", &locale).await;
            into_api_response(StatusCode::CREATED, Some(dto), None, Some(vec![msg]))
        }
        Err(e) => {
            let msg = state.i18n.t("media.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", &format!("Database error: {}", e))),
                Some(vec![msg]),
            )
        }
    }
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/upload/chunk/init", post(init_chunk_upload))
        .route("/upload/chunk/{upload_id}/{chunk_index}", post(upload_chunk).layer(DefaultBodyLimit::disable()))
        .route("/upload/chunk/{upload_id}/status", get(get_chunk_status))
        .route("/upload/chunk/{upload_id}/complete", post(complete_chunk_upload))
        .route("/", post(create).layer(DefaultBodyLimit::disable()))
        .route("/", get(get_all))
        .route("/{uuid}", get(get_one))
        .route("/{uuid}", put(update))
        .route("/{uuid}", delete(delete_one))
        .route("/bulk", patch(update_bulk))
        .route("/", delete(delete_all))
}

