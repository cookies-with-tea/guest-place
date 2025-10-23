use crate::core::app::AppConfig;
use crate::core::dto::ApiResponse;
use crate::core::error::internal_error;
use crate::media::dto::{CreateMediaDTO, MediaItemDTO, MediaItemFromDb, MediaUploadResponseDTO};
use crate::AppState;
use axum::routing::{get, post};
use axum::{
  extract::{Multipart, State},
  http::StatusCode,
  Json,
};
use std::{collections::HashMap, fs, path::PathBuf, sync::Arc};
use utoipa_axum::router::OpenApiRouter;
use uuid::Uuid;

#[utoipa::path(
  post,
  path = "/api/v1/media",
  tag = "Media",
  request_body(content = CreateMediaDTO, content_type = "multipart/form-data"),
  responses(
        (status = 201, description = "Media uploaded successfully", body = ApiResponse<MediaUploadResponseDTO>),
        (status = 500, description = "Internal server error")
  ),
  operation_id = "upload_media",
)]
pub async fn create(
    State(state): State<Arc<AppState>>,
    mut multipart: Multipart,
) -> (StatusCode, Json<ApiResponse<MediaUploadResponseDTO>>) {
    let mut file_name = String::new();
    let mut data = Vec::new();
    let mut content_type = None;
    let mut title = None;
    let mut alt = None;

    while let Some(field) = multipart.next_field().await.unwrap() {
        if field.name() == Some("file") {
            file_name = field
                .file_name()
                .map(|f| f.to_string())
                .unwrap_or_else(|| "file".to_string());
            data = field.bytes().await.unwrap().to_vec();
            content_type = mime_guess::from_path(&file_name)
                .first()
                .map(|mime| mime.to_string());
        } else if field.name() == Some("title") {
            title = Some(field.text().await.unwrap());
        } else if field.name() == Some("alt") {
            alt = Some(field.text().await.unwrap());
        }
    }

    let content_type = match content_type {
        Some(ct) if !ct.is_empty() => ct,
        _ => {
            return (
                StatusCode::BAD_REQUEST,
                Json(ApiResponse {
                    data: None,
                    errors: Some(HashMap::from([(
                        "content_type".to_string(),
                        vec!["Unable to determine content type from file".to_string()],
                    )])),
                    messages: Some(vec!["Failed to upload media".to_string()]),
                }),
            );
        }
    };

    let media_type = if content_type.starts_with("image/") {
        "image"
    } else if content_type.starts_with("video/") {
        "video"
    } else {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse {
                data: None,
                errors: Some(HashMap::from([(
                    "content_type".to_string(),
                    vec!["Unsupported media type".to_string()],
                )])),
                messages: Some(vec!["Failed to upload media".to_string()]),
            }),
        );
    };

    let uuid = Uuid::new_v4();
    let path_buf = PathBuf::from(&file_name);
    let extension = path_buf
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("bin");

    let relative_path = format!("media/{}/{}.{}", media_type, uuid, extension);
    let save_path = PathBuf::from(&relative_path);

    fs::create_dir_all(save_path.parent().unwrap()).unwrap();
    fs::write(&save_path, &data).unwrap();

    // Сформировать абсолютный путь
    let config = AppConfig::new(); // Или передай в состояние
    let full_url = format!(
        "{}/{}",
        config.public_url.trim_end_matches('/'),
        &relative_path
    );

    let _ = sqlx::query(
        "INSERT INTO media (uuid, media_type, url, title, alt) VALUES ($1, $2::media_type, $3, $4, $5)",
    )
    .bind(uuid)
    .bind(media_type)
    .bind(&full_url)
    .bind(title)
    .bind(alt)
    .execute(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("DB error: {:?}", e);
        internal_error(e)
    })
    .unwrap();

    (
        StatusCode::CREATED,
        Json(ApiResponse {
            data: Some(MediaUploadResponseDTO {
                uuid: uuid.to_string(),
                url: full_url,
            }),
            errors: None,
            messages: Some(vec!["Media uploaded successfully".to_string()]),
        }),
    )
}

#[utoipa::path(
  get,
  path = "/api/v1/media",
  tag = "Media",
  responses(
        (status = 200, description = "List of media", body = ApiResponse<Vec<MediaItemDTO>>),
        (status = 500, description = "Internal server error")
  ),
  operation_id = "get_all_media"
)]
pub async fn get_all(
    State(state): State<Arc<AppState>>,
) -> (StatusCode, Json<ApiResponse<Vec<MediaItemDTO>>>) {
    let rows = sqlx::query_as::<_, MediaItemFromDb>(
        r#"
        SELECT uuid, media_type, url, title, alt
        FROM media
        ORDER BY uuid DESC
        "#,
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("DB error: {:?}", e);
        internal_error(e)
    })
    .unwrap();

    let media_list = rows
        .into_iter()
        .map(|row| MediaItemDTO {
            uuid: row.uuid.to_string(),
            url: row.url,
            title: row.title,
            alt: row.alt,
            media_type: row.media_type,
        })
        .collect();

    (
        StatusCode::OK,
        Json(ApiResponse {
            data: Some(media_list),
            errors: None,
            messages: Some(vec!["Media fetched successfully".to_string()]),
        }),
    )
}

pub fn routing() -> OpenApiRouter<Arc<AppState>> {
    OpenApiRouter::new()
        .route("/", post(create))
        .route("/", get(get_all))
}
