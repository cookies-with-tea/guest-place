use crate::core::app::AppConfig;
use crate::core::dto::ApiResponse;
use crate::media::dto::{
  CreateMediaDTO,
  MediaItemDTO,
  MediaItemFromDb,
  MediaUploadResponseDTO,
};
use crate::core::response::{error_map, into_api_response};
use crate::AppState;
use axum::routing::{get, post};
use axum::{
    extract::{Multipart, State},
    http::StatusCode,
    Json,
};
use std::{fs, path::PathBuf, sync::Arc};
use utoipa_axum::router::OpenApiRouter;
use uuid::Uuid;

// --- UPLOAD MEDIA ---
#[utoipa::path(
    post,
    path = "/api/v1/media",
    tag = "Media",
    request_body(content = CreateMediaDTO, content_type = "multipart/form-data"),
    responses(
        (status = 201, description = "Media uploaded successfully", body = ApiResponse<MediaUploadResponseDTO>),
        (status = 400, description = "Invalid file or content type", body = ApiResponse<MediaUploadResponseDTO>),
        (status = 500, description = "Internal server error", body = ApiResponse<MediaUploadResponseDTO>)
    ),
    operation_id = "upload_media",
)]
pub async fn create(
    State(state): State<Arc<AppState>>,
    mut multipart: Multipart,
) -> Result<Json<ApiResponse<MediaUploadResponseDTO>>, (StatusCode, Json<ApiResponse<MediaUploadResponseDTO>>)> {
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
            return into_api_response(
                StatusCode::BAD_REQUEST,
                None,
                Some(error_map("content_type", "Unable to determine content type from file")),
                Some(vec!["Failed to upload media".to_string()]),
            );
        }
    };

    let media_type = if content_type.starts_with("image/") {
        "image"
    } else if content_type.starts_with("video/") {
        "video"
    } else {
        return into_api_response(
            StatusCode::BAD_REQUEST,
            None,
            Some(error_map("content_type", "Unsupported media type")),
            Some(vec!["Only images and videos are allowed".to_string()]),
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

    if let Err(e) = fs::create_dir_all(save_path.parent().unwrap()) {
        eprintln!("FS error (mkdir): {:?}", e);
        return into_api_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            None,
            Some(error_map("filesystem", "Failed to create upload directory")),
            Some(vec!["Server configuration error".to_string()]),
        );
    }

    if let Err(e) = fs::write(&save_path, &data) {
        eprintln!("FS error (write): {:?}", e);
        return into_api_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            None,
            Some(error_map("filesystem", "Failed to save file")),
            Some(vec!["Could not write file to disk".to_string()]),
        );
    }

    let config = AppConfig::new();
    let full_url = format!(
        "{}/{}",
        config.public_url.trim_end_matches('/'),
        &relative_path
    );

    let db_result = sqlx::query(
        "INSERT INTO media (uuid, media_type, url, title, alt) VALUES ($1, $2::media_type, $3, $4, $5)",
    )
    .bind(uuid)
    .bind(media_type)
    .bind(&full_url)
    .bind(title)
    .bind(alt)
    .execute(&state.pool)
    .await;

    if let Err(e) = db_result {
        eprintln!("DB error: {:?}", e);
        // Опционально: удалить файл, если запись в БД не удалась
        let _ = fs::remove_file(&save_path);
        return into_api_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            None,
            Some(error_map("database", "Failed to save media record")),
            Some(vec!["Could not register file in database".to_string()]),
        );
    }

    into_api_response(
        StatusCode::CREATED,
        Some(MediaUploadResponseDTO {
            uuid: uuid.to_string(),
            url: full_url,
        }),
        None,
        Some(vec!["Media uploaded successfully".to_string()]),
    )
}

// --- GET ALL MEDIA ---
#[utoipa::path(
    get,
    path = "/api/v1/media",
    tag = "Media",
    responses(
        (status = 200, description = "List of media", body = ApiResponse<Vec<MediaItemDTO>>),
        (status = 500, description = "Internal server error", body = ApiResponse<Vec<MediaItemDTO>>)
    ),
    operation_id = "get_all_media"
)]
pub async fn get_all(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Vec<MediaItemDTO>>>, (StatusCode, Json<ApiResponse<Vec<MediaItemDTO>>>)> {
    let rows = sqlx::query_as::<_, MediaItemFromDb>(
        r#"
        SELECT uuid, media_type, url, title, alt
        FROM media
        ORDER BY uuid DESC
        "#,
    )
    .fetch_all(&state.pool)
    .await;

    match rows {
        Ok(db_items) => {
            let media_list = db_items
                .into_iter()
                .map(|row| MediaItemDTO {
                    uuid: row.uuid.to_string(),
                    url: row.url,
                    title: row.title,
                    alt: row.alt,
                    media_type: row.media_type,
                })
                .collect();

            into_api_response(
                StatusCode::OK,
                 Some(media_list),
                None,
                Some(vec!["Media fetched successfully".to_string()]),
            )
        }
        Err(e) => {
            eprintln!("DB error: {:?}", e);
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to fetch media list")),
                Some(vec!["Could not retrieve media records".to_string()]),
            )
        }
    }
}

// --- ROUTING ---
pub fn routing() -> OpenApiRouter<Arc<AppState>> {
    OpenApiRouter::new()
        .route("/", post(create))
        .route("/", get(get_all))
}
