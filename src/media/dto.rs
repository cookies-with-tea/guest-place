use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

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

#[derive(Deserialize, Debug, ToSchema, Clone)]
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
