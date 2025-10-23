use serde_derive::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Deserialize, Debug, ToSchema)]
pub struct AuthRequestDTO {
    pub phone: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct AuthResponseDTO {
    pub access_token: String,
    pub access_expires_in: i64,
    pub refresh_token: String,
    pub refresh_expires_in: i64,
}
#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct AuthRefreshTokenDTO {
    pub refresh_token: String,
}
