use serde::{Deserialize, Serialize};
use utoipa::{ToSchema, IntoParams};

#[derive(Debug, serde::Deserialize, ToSchema)]
pub struct CreateMediaDTO {
    pub name: Option<String>,
    pub title: Option<String>,
    pub alt: Option<String>,
    pub category: Option<String>,
    pub source: Option<String>,
    pub tags: Option<Vec<String>>,
    #[schema(format = Binary, content_media_type = "application/octet-stream")]
    pub file: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct MediaVariantDTO {
    pub path: String,
    pub url: String,
    pub width: u32,
    pub height: u32,
    pub format: String,
    pub size_bytes: i64,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, Default)]
#[serde(rename_all = "camelCase")]
pub struct MediaVariantsDTO {
    pub thumbnail: Option<MediaVariantDTO>,
    pub medium: Option<MediaVariantDTO>,
    pub large: Option<MediaVariantDTO>,
    pub original: Option<MediaVariantDTO>,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct MediaItemDTO {
    pub uuid: String,
    pub url: String,
    pub name: Option<String>,
    pub extension: Option<String>,
    pub title: Option<String>,
    pub alt: Option<String>,
    pub category: Option<String>,
    pub tags: Option<Vec<String>>,
    pub source: String,
    pub size_bytes: i64,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub media_type: MediaType,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub blurhash: Option<String>,
    pub optimized_path: Option<String>,
    pub variants: Option<serde_json::Value>,
    pub dominant_color: Option<String>,
    pub palette: Option<serde_json::Value>,
    pub exif: Option<serde_json::Value>,
}

impl From<MediaItemFromDb> for MediaItemDTO {
    fn from(row: MediaItemFromDb) -> Self {
        Self {
            uuid: row.uuid.to_string(),
            url: row.url,
            name: row.name,
            extension: row.extension,
            title: row.title,
            alt: row.alt,
            category: row.category,
            tags: row.tags,
            source: row.source,
            size_bytes: row.size_bytes,
            created_at: row.created_at,
            media_type: row.media_type,
            width: row.width,
            height: row.height,
            blurhash: row.blurhash,
            optimized_path: row.optimized_path,
            variants: row.variants,
            dominant_color: row.dominant_color,
            palette: row.palette,
            exif: row.exif,
        }
    }
}

#[derive(Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateMediaDTO {
    pub name: Option<String>,
    pub extension: Option<String>,
    pub title: Option<String>,
    pub alt: Option<String>,
    pub category: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct BulkUpdateMediaDTO {
    pub uuids: Vec<String>,
    pub data: UpdateMediaDTO,
}

#[derive(Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct BulkOptimizeMediaDTO {
    pub uuids: Vec<uuid::Uuid>,
}

#[derive(Deserialize, Debug, ToSchema, IntoParams, Clone)]
pub struct MediaFilterQuery {
    pub page: Option<i32>,
    pub limit: Option<i32>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub search: Option<String>,
    pub category: Option<String>,
    pub source: Option<String>,
    pub media_type: Option<String>,
    pub tags: Option<String>,
    pub min_size_bytes: Option<i64>,
    pub max_size_bytes: Option<i64>,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
}

#[derive(sqlx::FromRow, Debug)]
pub struct MediaItemFromDb {
    pub uuid: uuid::Uuid,
    pub url: String,
    pub name: Option<String>,
    pub extension: Option<String>,
    pub title: Option<String>,
    pub alt: Option<String>,
    pub category: Option<String>,
    pub tags: Option<Vec<String>>,
    pub source: String,
    pub size_bytes: i64,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub media_type: MediaType,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub blurhash: Option<String>,
    pub optimized_path: Option<String>,
    pub variants: Option<serde_json::Value>,
    pub dominant_color: Option<String>,
    pub palette: Option<serde_json::Value>,
    pub exif: Option<serde_json::Value>,
}

#[derive(sqlx::Type, Debug, Serialize, Deserialize, ToSchema, Clone, Copy)]
#[sqlx(type_name = "media_type", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum MediaType {
    Image,
    Video,
    Icon,
    Document,
    Archive,
    Other,
}
