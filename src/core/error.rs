use crate::core::dto::ApiResponse;
use axum::http::StatusCode;
use axum::Json;
use std::collections::HashMap;

pub fn internal_error<E>(err: E) -> (StatusCode, String)
where
    E: std::error::Error,
{
    (StatusCode::INTERNAL_SERVER_ERROR, err.to_string())
}

pub fn format_error(key: &str, messages: Vec<String>) -> HashMap<String, Vec<String>> {
    let mut errors = HashMap::new();

    errors.insert(key.to_string(), messages);

    errors
}

pub fn api_response<T: serde::Serialize>(
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

pub fn api_error<T: serde::Serialize>(
    field: &str,
    message: &str,
    status: StatusCode,
) -> Result<Json<ApiResponse<T>>, (StatusCode, Json<ApiResponse<T>>)> {
    let mut errors = HashMap::new();
    errors.insert(field.to_string(), vec![message.to_string()]);

    api_response::<T>(status, None, Some(errors), Some(vec!["Ошибка".to_string()]))
    // DEBT: Вместо ошибка добавить текст
}
