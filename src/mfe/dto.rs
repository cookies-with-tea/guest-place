use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, ToSchema, FromRow)]
pub struct Mfe {
    pub id: Uuid,
    pub name: String,
    pub display_name: String,
    pub url: String,
    pub scope: String,
    pub module: String,
    pub icon: Option<String>,
    pub version: Option<String>,
    pub category: String,
    pub order_index: i32,
    pub enabled: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateMfeDto {
    pub name: String,
    pub display_name: String,
    pub url: String,
    pub scope: String,
    pub module: String,
    pub icon: Option<String>,
    pub version: Option<String>,
    pub category: Option<String>,
    pub order_index: Option<i32>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateMfeDto {
    pub display_name: Option<String>,
    pub url: Option<String>,
    pub scope: Option<String>,
    pub module: Option<String>,
    pub icon: Option<String>,
    pub version: Option<String>,
    pub category: Option<String>,
    pub order_index: Option<i32>,
    pub enabled: Option<bool>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ManifestDto {
    pub remotes: Vec<RemoteDto>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct RemoteDto {
    pub name: String,
    pub display_name: String,
    pub url: String,
    pub scope: String,
    pub module: String,
    pub icon: Option<String>,
    pub version: Option<String>,
    pub category: String,
    pub order: i32,
}
