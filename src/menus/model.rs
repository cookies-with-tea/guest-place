use chrono::{DateTime, Utc};
use serde_derive::{Deserialize, Serialize};
use sqlx::FromRow;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema, Clone)]
pub struct Menu {
    pub id: Uuid,
    pub name: String,
    pub location: String,
    #[schema(value_type = Object)]
    pub items: sqlx::types::Json<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateMenuDTO {
    pub name: String,
    pub location: String,
    pub items: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateMenuDTO {
    pub name: Option<String>,
    pub location: Option<String>,
    pub items: Option<serde_json::Value>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_menu_dto_serialization() {
        let json_data = r#"{"name":"Header Menu","location":"header","items":[{"id":"1","title":"About","type":"url","url":"/about"}]}"#;
        let dto: Result<CreateMenuDTO, _> = serde_json::from_str(json_data);
        assert!(dto.is_ok());
        let dto = dto.unwrap();
        assert_eq!(dto.name, "Header Menu");
        assert_eq!(dto.location, "header");
        assert!(dto.items.is_some());
    }
}

