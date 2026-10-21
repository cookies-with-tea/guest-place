use chrono::{DateTime, Utc};
use serde_derive::{Deserialize, Serialize};
use sqlx::FromRow;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema, Clone)]
pub struct Redirect {
    pub id: Uuid,
    pub source_path: String,
    pub target_path: String,
    pub status_code: i32,
    pub is_active: bool,
    pub hits: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateRedirectDTO {
    pub source_path: String,
    pub target_path: String,
    pub status_code: Option<i32>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateRedirectDTO {
    pub source_path: Option<String>,
    pub target_path: Option<String>,
    pub status_code: Option<i32>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize, utoipa::IntoParams)]
pub struct CheckRedirectQuery {
    pub path: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CheckRedirectResponse {
    pub matched: bool,
    pub target_path: Option<String>,
    pub status_code: Option<i32>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_redirect_dto_deserialization() {
        let json_data = r#"{"source_path":"/old","target_path":"/new","status_code":301,"is_active":true}"#;
        let dto: Result<CreateRedirectDTO, _> = serde_json::from_str(json_data);
        assert!(dto.is_ok());
        let dto = dto.unwrap();
        assert_eq!(dto.source_path, "/old");
        assert_eq!(dto.target_path, "/new");
        assert_eq!(dto.status_code, Some(301));
        assert_eq!(dto.is_active, Some(true));
    }
}

