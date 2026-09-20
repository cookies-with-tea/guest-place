use chrono::{DateTime, Utc};
use serde_derive::{Deserialize, Serialize};
use sqlx::FromRow;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema, Clone)]
pub struct BlockType {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    #[schema(value_type = Object)]
    pub schema: sqlx::types::Json<serde_json::Value>,
    pub category: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateBlockTypeDTO {
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub schema: serde_json::Value,
    pub category: Option<String>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateBlockTypeDTO {
    pub name: Option<String>,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub schema: Option<serde_json::Value>,
    pub category: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema, Clone)]
pub struct SyncBlockTypeItem {
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub schema: serde_json::Value,
    pub category: Option<String>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct SyncBlockTypesDTO {
    pub blocks: Vec<SyncBlockTypeItem>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema, Clone)]
pub struct Page {
    pub id: Uuid,
    pub title: String,
    pub slug: String,
    #[schema(value_type = Object)]
    pub blocks: sqlx::types::Json<serde_json::Value>,
    pub status: String,
    #[schema(value_type = Object)]
    pub seo: sqlx::types::Json<serde_json::Value>,
    pub published_at: Option<DateTime<Utc>>,
    pub published_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreatePageDTO {
    pub title: String,
    pub slug: String,
    pub blocks: Option<serde_json::Value>,
    pub status: Option<String>,
    pub seo: Option<serde_json::Value>,
    #[serde(default, deserialize_with = "crate::core::utils::empty_string_as_none")]
    pub published_at: Option<DateTime<Utc>>,
    #[serde(default, deserialize_with = "crate::core::utils::empty_string_as_none")]
    pub published_by: Option<Uuid>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdatePageDTO {
    pub title: Option<String>,
    pub slug: Option<String>,
    pub blocks: Option<serde_json::Value>,
    pub status: Option<String>,
    pub seo: Option<serde_json::Value>,
    #[serde(default, deserialize_with = "crate::core::utils::empty_string_as_none")]
    pub published_at: Option<DateTime<Utc>>,
    #[serde(default, deserialize_with = "crate::core::utils::empty_string_as_none")]
    pub published_by: Option<Uuid>,
}

#[derive(Debug, Deserialize, utoipa::IntoParams)]
pub struct GetPagesQuery {
    pub status: Option<String>,
}

#[derive(Debug, Deserialize, utoipa::IntoParams)]
pub struct GetPageQuery {
    pub preview: Option<bool>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deserialize_create_page_with_empty_strings() {
        let json_data = r#"{"title":"About","slug":"about","status":"draft","published_at":"","published_by":"","blocks":[],"seo":{"title":"","description":""}}"#;
        let dto: Result<CreatePageDTO, _> = serde_json::from_str(json_data);
        assert!(dto.is_ok());
        let dto = dto.unwrap();
        assert_eq!(dto.title, "About");
        assert_eq!(dto.published_at, None);
        assert_eq!(dto.published_by, None);
    }

    #[test]
    fn test_deserialize_create_page_with_valid_rfc3339() {
        let json_data = r#"{"title":"About","slug":"about","status":"published","published_at":"2026-09-20T12:00:00Z"}"#;
        let dto: Result<CreatePageDTO, _> = serde_json::from_str(json_data);
        assert!(dto.is_ok());
        let dto = dto.unwrap();
        assert!(dto.published_at.is_some());
    }
}

