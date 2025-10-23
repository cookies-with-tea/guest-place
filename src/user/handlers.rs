use crate::core::dto::ApiResponse;
use crate::core::error::{format_error, internal_error};
use crate::user::dto::{CreateUserDTO, User, UserResponseDTO};
use crate::AppState;
use axum::extract::{Path, State};
use axum::routing::{get, post};
use sqlx::query_as;
use uuid::Uuid;

use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHasher,
};
use axum::{http::StatusCode, Json};
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
        (status = 201, description = "Пользователь успешно создан"),
        (status = 409, description = "Пользователь с таким номером телефона уже существует"),
        (status = 500, description = "Ошибка при создании пользователя")
    ),
    tag = "User",
    operation_id = "create_user",
)]
async fn create(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateUserDTO>,
) -> Result<StatusCode, (StatusCode, String)> {
    if let Some(phone) = &payload.phone {
        let existing_user =
            sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM education_user WHERE phone = $1")
                .bind(phone)
                .fetch_one(&state.pool)
                .await
                .map_err(|_| {
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "Ошибка запроса к базе данных".to_string(),
                    )
                })?;

        if existing_user > 0 {
            return Err((
                StatusCode::CONFLICT,
                "Пользователь с таким номером телефона уже существует".to_string(),
            ));
        }
    }

    let password_hash = match hash_password(&payload.password) {
        Ok(hash) => hash,
        Err(_) => {
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "Ошибка хеширования пароля".to_string(),
            ))
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
        Ok(_) => Ok(StatusCode::CREATED),
        Err(_) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            "Ошибка создания пользователя".to_string(),
        )),
    }
}

#[utoipa::path(
  get,
  path = "/api/v1/user",
  responses(
        (status = 200, description = "Успешное получение списка пользователей", body = ApiResponse<Vec<User>>),
        (status = 500, description = "Ошибка базы данных")
  ),
  tag = "User",
  operation_id = "get_all_users",
)]
async fn get_all(
    state: State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Vec<UserResponseDTO>>>, (StatusCode, Json<ApiResponse<()>>)> {
    match query_as::<_, UserResponseDTO>("
        SELECT
            uuid,
            first_name,
            second_name,
            last_name,
            phone,
            avatar,
            birth_date,
            created_at
        FROM education_user
    ")
        .fetch_all(&state.pool)
        .await
    {
        Ok(users) => {
            let response = ApiResponse {
                data: Some(users),
                errors: None,
                messages: None,
            };
            Ok(Json(response))
        }
        Err(_) => {
            let errors = format_error(
                "database",
                vec![
                    "Database connection failed".to_string(),
                    "Check your query or database status".to_string(),
                ],
            );

            let response = ApiResponse {
                data: None,
                errors: Some(errors),
                messages: Some(vec!["An error occurred while fetching users.".to_string()]),
            };
            Err((StatusCode::INTERNAL_SERVER_ERROR, Json(response)))
        }
    }
}

#[utoipa::path(
  get,
  path = "/api/v1/user/{uuid}",
  params(
        ("uuid" = Uuid, Path, description = "UUID пользователя")
  ),
  responses(
        (status = 200, description = "Успешное получение пользователя", body = UserResponseDTO),
        (status = 404, description = "Пользователь не найден"),
        (status = 500, description = "Ошибка базы данных")
  ),
  tag = "User",
  operation_id = "get_user_by_uuid",
)]
async fn get_one(
    State(state): State<Arc<AppState>>,
    Path(uuid): Path<Uuid>,
) -> Result<Json<UserResponseDTO>, (StatusCode, String)> {
    let result = sqlx::query_as::<_, User>("SELECT * FROM education_user WHERE uuid = $1")
        .bind(uuid)
        .fetch_optional(&state.pool)
        .await
        .map_err(internal_error)?;

    match result {
        Some(user) => {
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

            Ok(Json(user_response))
        }
        None => Err((StatusCode::NOT_FOUND, "Пользователь не найден.".to_string())),
    }
}
/*async fn delete_user(Path(id): Path<i32>, state: Arc<AppState>) -> StatusCode {
    let _ = sqlx::query("DELETE FROM education_user WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(internal_error)
        .unwrap();

    StatusCode::OK
}*/

pub fn routing() -> OpenApiRouter<Arc<AppState>> {
    OpenApiRouter::new()
        .route("/", post(create))
        .route("/", get(get_all))
        .route("/{uuid}", get(get_one))
}
