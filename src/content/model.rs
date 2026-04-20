use serde_derive::{Deserialize, Serialize};
use sqlx::FromRow;
use utoipa::ToSchema;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(sqlx::Type, Debug, Clone, Copy, Serialize, Deserialize, ToSchema)]
#[sqlx(type_name = "content_field_type", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum FieldType {
    Text,
    RichText,
    Number,
    Boolean,
    Media,
    Date,
    Relation,
}

#[derive(Debug, Serialize, Deserialize, ToSchema, Clone)]
pub struct FieldDefinition {
    pub name: String,
    pub label: String,
    pub field_type: FieldType,
    #[serde(default)]
    pub required: bool,
    #[serde(default)]
    pub multiple: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub relation_to: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema)]
pub struct ContentSchema {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    #[schema(value_type = Vec<FieldDefinition>)]
    pub fields: sqlx::types::Json<Vec<FieldDefinition>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateSchemaDTO {
    pub name: String,
    pub slug: String,
    pub fields: Vec<FieldDefinition>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateSchemaDTO {
    pub name: Option<String>,
    pub slug: Option<String>,
    pub fields: Option<Vec<FieldDefinition>>,
}

#[derive(sqlx::Type, Debug, Clone, Copy, Serialize, Deserialize, ToSchema)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum ContentEntryStatus {
    Draft,
    Published,
}

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema)]
pub struct ContentEntry {
    pub id: Uuid,
    pub schema_id: Uuid,
    pub slug: String,
    #[schema(value_type = Object)]
    pub data: sqlx::types::Json<serde_json::Value>,
    pub status: ContentEntryStatus,
    #[schema(value_type = Object)]
    pub i18n: sqlx::types::Json<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateContentEntryDTO {
    pub schema_id: Uuid,
    pub slug: String,
    pub data: serde_json::Value,
    pub status: Option<ContentEntryStatus>,
    pub i18n: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateContentEntryDTO {
    pub slug: Option<String>,
    pub data: Option<serde_json::Value>,
    pub status: Option<ContentEntryStatus>,
    pub i18n: Option<serde_json::Value>,
}
