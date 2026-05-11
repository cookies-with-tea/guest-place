use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use utoipa::ToSchema;


#[derive(Deserialize, ToSchema)]
pub struct CreateTranslationDTO {
    pub key: String,
    pub locale: String,
    pub value: String,
}

#[derive(Deserialize, ToSchema)]
#[serde(untagged)]
pub enum TranslationInput {
    Single(CreateTranslationDTO),
    Multiple(Vec<CreateTranslationDTO>),
}

#[derive(Serialize, ToSchema, FromRow)]
pub struct TranslationDTO {
    id: uuid::Uuid,
    key: String,
    locale: String,
    value: String,
    created_at: NaiveDateTime,
    updated_at: NaiveDateTime,
}

#[derive(Serialize, ToSchema, FromRow)]
pub struct TranslationVersionDTO {
    pub id: uuid::Uuid,
    pub key: String,
    pub locale: String,
    pub value: String,
    pub version_number: i32,
    pub created_at: NaiveDateTime,
    pub comment: Option<String>,
}

#[derive(Serialize, ToSchema, FromRow)]
pub struct NamespaceDTO {
    pub id: uuid::Uuid,
    pub name: String,
    pub description: Option<String>,
    pub is_dynamic: bool,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Deserialize, ToSchema)]
pub struct CreateNamespaceDTO {
    pub name: String,
    pub description: Option<String>,
    pub is_dynamic: Option<bool>,
}

#[derive(Serialize, ToSchema)]
pub struct LanguageDTO {
    pub code: String,
    pub name: String,
}
