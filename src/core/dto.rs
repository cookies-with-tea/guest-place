use serde_derive::{Deserialize, Serialize};
use sqlx::FromRow;
use std::collections::HashMap;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Serialize, Debug, ToSchema)]
pub struct ApiResponse<T: serde::Serialize> {
    pub(crate) data: Option<T>,
    pub(crate) errors: Option<HashMap<String, Vec<String>>>,
    pub(crate) messages: Option<Vec<String>>,
}

#[derive(Serialize, Debug, ToSchema)]
pub struct ApiPaginationDTO<T: serde::Serialize> {
  pub items: Vec<T>,
  pub pagination: PaginationDTO,
}

#[derive(Serialize, Debug, ToSchema)]
pub struct ApiResponseWithPagination<T: serde::Serialize> {
  pub(crate) data: Option<ApiPaginationDTO<T>>,
  pub(crate) errors: Option<HashMap<String, Vec<String>>>,
  pub(crate) messages: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize, Debug, FromRow, ToSchema)]
pub struct PaginationDTO {
    pub page: i32,                // default - 1
    pub total: Option<i32>,       // default - 0
    pub total_pages: Option<i32>, // default - 0
    pub limit: Option<i32>,       // default - 0
}

#[derive(Serialize, Deserialize, Debug, FromRow, ToSchema)]
pub struct IconTextDTO {
    pub title: Option<String>,
    pub icon: Option<String>,
    pub description: Option<String>,
}

// DEBT: Переименовать. ImageDTO используется не только для изображений.
#[derive(Serialize, Deserialize, Debug, FromRow, ToSchema)]
pub struct ImageDTO {
    pub(crate) url: String,
    pub(crate) alt: Option<String>,
    pub(crate) title: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, FromRow)]
pub struct AttractionRowDTO {
    pub icon: Option<String>,
    pub text: String,
    pub description: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, FromRow, ToSchema)]
pub struct AttractionDTO {
    pub(crate) uuid: Uuid,
    pub(crate) title: String,
    pub(crate) subtitle: Option<String>,
    pub(crate) items: Vec<IconTextDTO>,
}

// DEBT: Улучшить и использовать
impl<T: serde::Serialize> ApiResponse<T> {
  pub fn success(data: T) -> Self {
    ApiResponse {
      data: Some(data),
      errors: None,
      messages: None,
    }
  }

  pub fn error(messages: Vec<String>) -> Self {
    ApiResponse {
      data: None,
      errors: None,
      messages: Some(messages),
    }
  }
}
