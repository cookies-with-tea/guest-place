use crate::core::dto::ApiResponse;
use crate::core::response::{error_map, into_api_response};
use crate::user::dto::{CreateUserDTO, User, UserResponseDTO};
use crate::AppState;
use axum::{
    extract::{Path, State, Extension},
    http::StatusCode,
    routing::{delete, get, post},
    Json,
};
use sqlx::query_as;
use uuid::Uuid;
use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHasher,
};
use std::sync::Arc;
use utoipa_axum::router::OpenApiRouter;

fn hash_password(password: &str) -> Result<String, argon2::password_hash::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2.hash_password(password.as_bytes(), &salt)?;
    Ok(password_hash.to_string())
}

#[utoipa::path(
    post,
    path = "/api/v1/user",
    request_body = CreateUserDTO,
    responses(
        (status = 201, description = "User created"),
        (status = 409, description = "User exists"),
        (status = 500, description = "Internal error")
    ),
    tag = "User",
    operation_id = "create_user",
)]
async fn create(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Json(payload): Json<CreateUserDTO>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    if let Some(phone) = &payload.phone {
        let existing_user =
            sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM education_user WHERE phone = $1")
                .bind(phone)
                .fetch_one(&state.pool)
                .await;

        match existing_user {
            Ok(count) if count > 0 => {
                let msg = state.i18n.t("user.phone_exists", &locale).await;
                return into_api_response(
                    StatusCode::CONFLICT,
                    None,
                    Some(error_map(&"phone".to_string(), &msg.clone())),
                    Some(vec![msg]),
                );
            }
            Err(_) => {
                let msg = state.i18n.t("user.check_exists_error", &locale).await;
                return into_api_response(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    None,
                    Some(error_map(&"database".to_string(), &msg.clone())),
                    Some(vec![msg]),
                );
            }
            _ => {}
        }
    }

    let password_hash = match hash_password(&payload.password) {
        Ok(hash) => hash,
        Err(_) => {
            let msg = state.i18n.t("user.password_hash_error", &locale).await;
            return into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map(&"password".to_string(), &msg.clone())),
                Some(vec![msg]),
            );
        }
    };

    let result = sqlx::query(
        "INSERT INTO education_user (
            first_name, second_name, last_name, phone, birth_date, password_hash
        ) VALUES ($1, $2, $3, $4, $5, $6)",
    )
    .bind(&payload.first_name)
    .bind(&payload.second_name)
    .bind(&payload.last_name)
    .bind(&payload.phone)
    .bind(&payload.birth_date)
    .bind(&password_hash)
    .execute(&state.pool)
    .await;

    match result {
        Ok(_) => {
            let msg = state.i18n.t("user.created", &locale).await;
            into_api_response(StatusCode::CREATED, None, None, Some(vec![msg]))
        }
        Err(_) => {
            let msg = state.i18n.t("general.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map(&"database".to_string(), &msg.clone())),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/user",
    responses(
        (status = 200, body = ApiResponse<Vec<UserResponseDTO>>),
        (status = 500, body = ApiResponse<Vec<UserResponseDTO>>)
    ),
    tag = "User",
    operation_id = "get_all_users",
)]
async fn get_all(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
) -> Result<
    Json<ApiResponse<Vec<UserResponseDTO>>>,
    (StatusCode, Json<ApiResponse<Vec<UserResponseDTO>>>),
> {
    match query_as::<_, UserResponseDTO>(
        "SELECT uuid, first_name, second_name, last_name, phone, avatar, birth_date, created_at FROM education_user"
    )
    .fetch_all(&state.pool)
    .await
    {
        Ok(users) => into_api_response(StatusCode::OK, Some(users), None, None),
        Err(_) => {
            let msg = state.i18n.t("general.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map(&"database".to_string(), &msg.clone())),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/user/{uuid}",
    params(("uuid" = Uuid, Path, description = "User UUID")),
    responses(
        (status = 200, body = ApiResponse<UserResponseDTO>),
        (status = 404, body = ApiResponse<UserResponseDTO>),
        (status = 500, body = ApiResponse<UserResponseDTO>)
    ),
    tag = "User",
    operation_id = "get_user_by_uuid",
)]
async fn get_one(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Path(uuid): Path<Uuid>,
) -> Result<Json<ApiResponse<UserResponseDTO>>, (StatusCode, Json<ApiResponse<UserResponseDTO>>)> {
    let result = sqlx::query_as::<_, User>("SELECT * FROM education_user WHERE uuid = $1")
        .bind(uuid)
        .fetch_optional(&state.pool)
        .await;

    match result {
        Ok(Some(user)) => {
            let user_response = UserResponseDTO {
                uuid: user.uuid,
                first_name: user.first_name,
                second_name: user.second_name,
                last_name: user.last_name,
                phone: user.phone,
                avatar: user.avatar,
                birth_date: user.birth_date,
                created_at: user.created_at,
            };
            into_api_response(StatusCode::OK, Some(user_response), None, None)
        }
        Ok(None) => {
            let msg = state.i18n.t("user.not_found", &locale).await;
            into_api_response(
                StatusCode::NOT_FOUND,
                None,
                Some(error_map(&"user".to_string(), &msg.clone())),
                Some(vec![msg]),
            )
        }
        Err(_) => {
            let msg = state.i18n.t("general.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map(&"database".to_string(), &msg.clone())),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    delete,
    path = "/api/v1/user/{uuid}",
    params(("uuid" = Uuid, Path, description = "User UUID")),
    responses(
        (status = 200, description = "User deleted"),
        (status = 404, description = "Not found"),
        (status = 500, description = "DB error")
    ),
    tag = "User",
    operation_id = "delete_user_by_uuid",
)]
async fn delete_one(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Path(uuid): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let exists = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM education_user WHERE uuid = $1)",
    )
    .bind(uuid)
    .fetch_one(&state.pool)
    .await;

    match exists {
        Ok(true) => {
            let result = sqlx::query("DELETE FROM education_user WHERE uuid = $1")
                .bind(uuid)
                .execute(&state.pool)
                .await;
            match result {
                Ok(_) => {
                    let msg = state.i18n.t("user.deleted", &locale).await;
                    into_api_response(StatusCode::OK, None, None, Some(vec![msg]))
                }
                Err(_) => {
                    let msg = state.i18n.t("general.db_error", &locale).await;
                    into_api_response(
                        StatusCode::INTERNAL_SERVER_ERROR,
                        None,
                        Some(error_map(&"database".to_string(), &msg.clone())),
                        Some(vec![msg]),
                    )
                }
            }
        }
        Ok(false) => {
            let msg = state.i18n.t("user.not_found", &locale).await;
            into_api_response(
                StatusCode::NOT_FOUND,
                None,
                Some(error_map(&"user".to_string(), &msg.clone())),
                Some(vec![msg]),
            )
        }
        Err(_) => {
            let msg = state.i18n.t("general.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map(&"database".to_string(), &msg.clone())),
                Some(vec![msg]),
            )
        }
    }
}

pub fn routing() -> OpenApiRouter<Arc<AppState>> {
    OpenApiRouter::new()
        .route("/", post(create))
        .route("/", get(get_all))
        .route("/{uuid}", get(get_one))
        .route("/{uuid}", delete(delete_one))
}
