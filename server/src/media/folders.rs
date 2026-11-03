use axum::{
    extract::{Path, State},
    http::StatusCode,
    Extension, Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::core::dto::ApiResponse;
use crate::core::response::{error_map, into_api_response};
use crate::media::dto::{
    BatchMoveMediaDTO, CreateFolderDTO, MediaConfigDTO, MediaFolderDTO, MediaTagCountDTO,
    UpdateFolderDTO,
};
use crate::AppState;

#[utoipa::path(
    get,
    path = "/api/v1/media/folders",
    tag = "Media",
    responses(
        (status = 200, description = "List of media folders with item counts", body = ApiResponse<Vec<MediaFolderDTO>>),
        (status = 500, description = "Internal server error")
    ),
    operation_id = "get_media_folders",
)]
pub async fn get_folders(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
) -> Result<Json<ApiResponse<Vec<MediaFolderDTO>>>, (StatusCode, Json<ApiResponse<Vec<MediaFolderDTO>>>)> {
    let rows = sqlx::query_as::<_, MediaFolderDTO>(
        r#"
        SELECT 
            f.id, 
            f.name, 
            f.parent_id, 
            f.color, 
            f.created_at, 
            COUNT(m.uuid)::bigint AS item_count
        FROM media_folders f
        LEFT JOIN media m ON m.folder_id = f.id
        GROUP BY f.id, f.name, f.parent_id, f.color, f.created_at
        ORDER BY f.name ASC
        "#,
    )
    .fetch_all(&state.pool)
    .await;

    match rows {
        Ok(folders) => {
            let msg = state.i18n.t("media.folders_fetched", &locale).await;
            into_api_response(StatusCode::OK, Some(folders), None, Some(vec![msg]))
        }
        Err(e) => {
            eprintln!("Failed to fetch media folders: {:?}", e);
            let msg = state.i18n.t("media.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to fetch media folders")),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    post,
    path = "/api/v1/media/folders",
    tag = "Media",
    request_body = CreateFolderDTO,
    responses(
        (status = 201, description = "Folder created successfully", body = ApiResponse<MediaFolderDTO>),
        (status = 400, description = "Invalid folder payload"),
        (status = 500, description = "Internal server error")
    ),
    operation_id = "create_media_folder",
)]
pub async fn create_folder(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Json(payload): Json<CreateFolderDTO>,
) -> Result<Json<ApiResponse<MediaFolderDTO>>, (StatusCode, Json<ApiResponse<MediaFolderDTO>>)> {
    let trimmed_name = payload.name.trim();
    if trimmed_name.is_empty() {
        return into_api_response(
            StatusCode::BAD_REQUEST,
            None,
            Some(error_map("name", "Folder name cannot be empty")),
            Some(vec!["Folder name cannot be empty".to_string()]),
        );
    }

    let color = payload.color.unwrap_or_else(|| "#409EFF".to_string());

    let row = sqlx::query_as::<_, MediaFolderDTO>(
        r#"
        INSERT INTO media_folders (id, name, parent_id, color, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING id, name, parent_id, color, created_at, 0::bigint AS item_count
        "#,
    )
    .bind(Uuid::new_v4())
    .bind(trimmed_name)
    .bind(payload.parent_id)
    .bind(color)
    .fetch_one(&state.pool)
    .await;

    match row {
        Ok(folder) => {
            let msg = state.i18n.t("media.folder_created", &locale).await;
            into_api_response(StatusCode::CREATED, Some(folder), None, Some(vec![msg]))
        }
        Err(e) => {
            eprintln!("Failed to create media folder: {:?}", e);
            let msg = state.i18n.t("media.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to create folder")),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    put,
    path = "/api/v1/media/folders/{id}",
    tag = "Media",
    request_body = UpdateFolderDTO,
    responses(
        (status = 200, description = "Folder updated successfully", body = ApiResponse<MediaFolderDTO>),
        (status = 404, description = "Folder not found"),
        (status = 500, description = "Internal server error")
    ),
    operation_id = "update_media_folder",
)]
pub async fn update_folder(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateFolderDTO>,
) -> Result<Json<ApiResponse<MediaFolderDTO>>, (StatusCode, Json<ApiResponse<MediaFolderDTO>>)> {
    let mut query = sqlx::QueryBuilder::new("UPDATE media_folders SET ");
    let mut separated = query.separated(", ");

    if let Some(name) = &payload.name {
        let trimmed = name.trim();
        if !trimmed.is_empty() {
            separated.push("name = ");
            separated.push_bind_unseparated(trimmed);
        }
    }

    if let Some(color) = &payload.color {
        separated.push("color = ");
        separated.push_bind_unseparated(color);
    }

    if payload.parent_id.is_some() {
        separated.push("parent_id = ");
        separated.push_bind_unseparated(payload.parent_id);
    }

    query.push(" WHERE id = ");
    query.push_bind(id);
    query.push(" RETURNING id, name, parent_id, color, created_at, 0::bigint AS item_count");

    let result = query.build_query_as::<MediaFolderDTO>().fetch_optional(&state.pool).await;

    match result {
        Ok(Some(folder)) => {
            let msg = state.i18n.t("media.folder_updated", &locale).await;
            into_api_response(StatusCode::OK, Some(folder), None, Some(vec![msg]))
        }
        Ok(None) => into_api_response(
            StatusCode::NOT_FOUND,
            None,
            Some(error_map("id", "Folder not found")),
            Some(vec!["Folder not found".to_string()]),
        ),
        Err(e) => {
            eprintln!("Failed to update media folder: {:?}", e);
            let msg = state.i18n.t("media.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to update folder")),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    delete,
    path = "/api/v1/media/folders/{id}",
    tag = "Media",
    responses(
        (status = 200, description = "Folder deleted successfully", body = ApiResponse<bool>),
        (status = 404, description = "Folder not found"),
        (status = 500, description = "Internal server error")
    ),
    operation_id = "delete_media_folder",
)]
pub async fn delete_folder(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<bool>>, (StatusCode, Json<ApiResponse<bool>>)> {
    let result = sqlx::query("DELETE FROM media_folders WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await;

    match result {
        Ok(res) if res.rows_affected() > 0 => {
            let msg = state.i18n.t("media.folder_deleted", &locale).await;
            into_api_response(StatusCode::OK, Some(true), None, Some(vec![msg]))
        }
        Ok(_) => into_api_response(
            StatusCode::NOT_FOUND,
            None,
            Some(error_map("id", "Folder not found")),
            Some(vec!["Folder not found".to_string()]),
        ),
        Err(e) => {
            eprintln!("Failed to delete folder: {:?}", e);
            let msg = state.i18n.t("media.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to delete folder")),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    post,
    path = "/api/v1/media/batch/move",
    tag = "Media",
    request_body = BatchMoveMediaDTO,
    responses(
        (status = 200, description = "Media items moved successfully", body = ApiResponse<u64>),
        (status = 500, description = "Internal server error")
    ),
    operation_id = "batch_move_media",
)]
pub async fn batch_move_media(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Json(payload): Json<BatchMoveMediaDTO>,
) -> Result<Json<ApiResponse<u64>>, (StatusCode, Json<ApiResponse<u64>>)> {
    let result = sqlx::query(
        "UPDATE media SET folder_id = $1 WHERE uuid = ANY($2)",
    )
    .bind(payload.folder_id)
    .bind(&payload.uuids)
    .execute(&state.pool)
    .await;

    match result {
        Ok(res) => {
            let affected = res.rows_affected();
            let msg = state.i18n.t("media.batch_move_success", &locale).await;
            into_api_response(StatusCode::OK, Some(affected), None, Some(vec![msg]))
        }
        Err(e) => {
            eprintln!("Failed to batch move media: {:?}", e);
            let msg = state.i18n.t("media.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to batch move media")),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/media/tags",
    tag = "Media",
    responses(
        (status = 200, description = "List of all media tags with usage count", body = ApiResponse<Vec<MediaTagCountDTO>>),
        (status = 500, description = "Internal server error")
    ),
    operation_id = "get_media_tags",
)]
pub async fn get_media_tags(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
) -> Result<Json<ApiResponse<Vec<MediaTagCountDTO>>>, (StatusCode, Json<ApiResponse<Vec<MediaTagCountDTO>>>)> {
    let rows = sqlx::query_as::<_, (String, i64)>(
        r#"
        SELECT unnest(tags) AS tag, COUNT(*)::bigint AS count
        FROM media
        WHERE tags IS NOT NULL AND cardinality(tags) > 0
        GROUP BY tag
        ORDER BY count DESC, tag ASC
        "#,
    )
    .fetch_all(&state.pool)
    .await;

    match rows {
        Ok(list) => {
            let items: Vec<MediaTagCountDTO> = list
                .into_iter()
                .map(|(tag, count)| MediaTagCountDTO { tag, count })
                .collect();
            let msg = state.i18n.t("media.fetch_success", &locale).await;
            into_api_response(StatusCode::OK, Some(items), None, Some(vec![msg]))
        }
        Err(e) => {
            eprintln!("Failed to fetch media tags: {:?}", e);
            let msg = state.i18n.t("media.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to fetch tags")),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/media/config",
    tag = "Media",
    responses(
        (status = 200, description = "Media service configuration including CDN prefix", body = ApiResponse<MediaConfigDTO>),
    ),
    operation_id = "get_media_config",
)]
pub async fn get_media_config(
    State(state): State<Arc<AppState>>,
) -> Json<ApiResponse<MediaConfigDTO>> {
    let config = MediaConfigDTO {
        cdn_url: state.config.cdn_url.clone(),
        public_url: state.config.public_url.clone(),
        max_quota: state.config.media_quota_limit,
    };
    Json(ApiResponse {
        data: Some(config),
        errors: None,
        messages: None,
    })
}
