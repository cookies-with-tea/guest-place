use axum::{
    body::Body,
    extract::{FromRequest, Request}, // <-- ВАЖНО: FromRequest, а не FromRequestParts
    http::StatusCode,
};
use uuid::Uuid;

// Структура-обёртка для user_id
pub struct AuthenticatedUser(pub Uuid);

// Используем Body из axum
type InnerBody = Body;

impl<S> FromRequest<S, InnerBody> for AuthenticatedUser
// <-- ВАЖНО: Реализуем FromRequest
where
    S: Send + Sync,
{
    type Rejection = StatusCode;

    async fn from_request(
        // <-- ВАЖНО: Это метод FromRequest
        req: Request<InnerBody>,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        // Извлекаем user_id из extensions
        match req.extensions().get::<Uuid>().cloned() {
            Some(user_id) => Ok(AuthenticatedUser(user_id)),
            None => Err(StatusCode::UNAUTHORIZED),
        }
    }
}
