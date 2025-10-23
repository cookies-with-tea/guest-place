use std::collections::HashMap;

use axum::{http::StatusCode, Json};

use crate::core::dto::ApiResponse;

pub fn into_api_response<T: serde::Serialize>(
    status: StatusCode,
    data: Option<T>,
    errors: Option<HashMap<String, Vec<String>>>,
    messages: Option<Vec<String>>,
) -> Result<Json<ApiResponse<T>>, (StatusCode, Json<ApiResponse<T>>)> {
    let response = ApiResponse {
        data,
        errors,
        messages,
    };

    if status.is_success() {
        Ok(Json(response))
    } else {
        Err((status, Json(response)))
    }
}

pub fn error_map(key: &str, msg: &str) -> HashMap<String, Vec<String>> {
    let mut map = HashMap::new();
    map.insert(key.to_string(), vec![msg.to_string()]);
    map
}
