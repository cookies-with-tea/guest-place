use chrono::{NaiveDate, NaiveDateTime};
use serde_derive::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;
use sqlx::FromRow;

#[derive(Deserialize, Debug, ToSchema)]
pub struct CreateUserDTO {
    pub(crate) first_name: String,
    pub(crate) second_name: String,
    pub(crate) last_name: Option<String>,
    pub(crate) phone: Option<String>,
    pub(crate) birth_date: Option<NaiveDate>,
    pub(crate) password: String,
}

#[derive(Serialize, Debug, ToSchema, FromRow)]
pub struct UserResponseDTO {
    pub(crate) uuid: Uuid,
    pub(crate) first_name: String,
    pub(crate) second_name: String,
    pub(crate) last_name: Option<String>,
    pub(crate) phone: Option<String>,
    pub(crate) avatar: Option<String>,
    pub(crate) birth_date: Option<NaiveDate>,
    pub(crate) created_at: NaiveDateTime,
}

#[derive(Serialize, Debug, sqlx::FromRow, ToSchema)]
pub struct User {
    pub(crate) uuid: Uuid,
    pub(crate) first_name: String,
    pub(crate) second_name: String,
    pub(crate) last_name: Option<String>,
    pub(crate) password_hash: String,
    pub(crate) phone: Option<String>,
    pub(crate) avatar: Option<String>,
    pub(crate) birth_date: Option<NaiveDate>,
    pub(crate) created_at: NaiveDateTime,
}
