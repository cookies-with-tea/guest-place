use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, ToSchema)]
pub struct CreateMediaDTO {
    pub name: Option<String>,
    pub title: Option<String>,
    pub alt: Option<String>,
    #[schema(format = Binary, content_media_type = "application/octet-stream")]
    pub file: String,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct MediaItemDTO {
  pub uuid: String,
  pub url: String,
  pub name: Option<String>,
  pub extension: Option<String>,
  pub title: Option<String>,
  pub alt: Option<String>,
  pub media_type: MediaType,
}

#[derive(Deserialize, Debug, ToSchema)]
pub struct UpdateMediaDTO {
    pub name: Option<String>,
    pub extension: Option<String>,
    pub title: Option<String>,
    pub alt: Option<String>,
}

#[derive(sqlx::FromRow, Debug)]
pub struct MediaItemFromDb {
  pub uuid: uuid::Uuid,
  pub url: String,
  pub name: Option<String>,
  pub extension: Option<String>,
  pub title: Option<String>,
  pub alt: Option<String>,
  pub media_type: MediaType,
}

#[derive(sqlx::Type, Debug, Serialize, Deserialize, ToSchema)]
#[sqlx(type_name = "media_type", rename_all = "lowercase")]
pub enum MediaType {
  Image,
  Video,
  Icon,
  Document,
  Archive,
  Other,
}
