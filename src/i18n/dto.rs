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

#[derive(Serialize, ToSchema)]
pub struct LanguageDTO {
    pub code: String,
    pub name: String,
}
