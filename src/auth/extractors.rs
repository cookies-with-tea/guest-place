use axum::{
    body::Body,
    extract::{FromRequest, Request},
    http::StatusCode,
};
use uuid::Uuid;

pub struct AuthenticatedUser(pub Uuid);

type InnerBody = Body;

impl<S> FromRequest<S, InnerBody> for AuthenticatedUser
where
    S: Send + Sync,
{
    type Rejection = StatusCode;

    async fn from_request(
        req: Request<InnerBody>,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        match req.extensions().get::<Uuid>().cloned() {
            Some(user_id) => Ok(AuthenticatedUser(user_id)),
            None => Err(StatusCode::UNAUTHORIZED),
        }
    }
}
