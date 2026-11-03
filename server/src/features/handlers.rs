use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use crate::AppState;
use crate::core::dto::ApiResponse;
use crate::features::{FeatureFlagsUpdate};
use std::sync::Arc;


#[utoipa::path(
    get,
    path = "/api/v1/features",
    responses(
        (status = 200, description = "Success")
    ),
    tag = "Features"
)]
pub async fn get_features(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    match state.features.get_all().await {
        Ok(flags) => (
            StatusCode::OK,
            Json(ApiResponse {
                data: Some(flags),
                errors: None,
                messages: None,
            }),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse {
                data: None,
                errors: Some(crate::core::response::error_map("features", &e.to_string())),
                messages: None,
            }),
        ),
    }
}

#[utoipa::path(
    post,
    path = "/api/v1/features",
    responses(
        (status = 200, description = "Success")
    ),
    tag = "Features"
)]
pub async fn update_features(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<FeatureFlagsUpdate>,
) -> impl IntoResponse {
    match state.features.update_flags(payload.flags).await {
        Ok(_) => (
            StatusCode::OK,
            Json(ApiResponse {
                data: Some(()),
                errors: None,
                messages: Some(vec!["Features updated successfully".to_string()]),
            }),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse {
                data: None,
                errors: Some(crate::core::response::error_map("features", &e.to_string())),
                messages: None,
            }),
        ),
    }
}
