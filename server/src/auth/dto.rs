use serde_derive::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Deserialize, Debug, ToSchema)]
pub struct RegisterRequestDTO {
    pub email: String,
}

#[derive(Deserialize, Debug, ToSchema)]
pub struct CheckEmailCodeDTO {
    pub key: String,
}

#[derive(Deserialize, Debug, ToSchema)]
pub struct AuthRequestDTO {
    pub email: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct AuthResponseDTO {
    pub access_token: String,
    pub access_expires_in: i64,
    // Собирается тут как обычное поле, но на /login и /refresh никогда не доходит до
    // клиента: auth::cookies вырезает его из тела ответа и переносит в HttpOnly-cookie
    // (см. auth::cookies::move_refresh_token_to_cookie). OpenAPI-схема формально его
    // перечисляет, реальный HTTP-ответ — нет.
    pub refresh_token: String,
    pub refresh_expires_in: i64,
}
#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct AuthRefreshTokenDTO {
    pub refresh_token: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: uuid::Uuid,
    pub role: String,
    pub permissions: Vec<String>,
    pub exp: usize,
}
