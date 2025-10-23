use crate::core::dto::ApiResponse;
use crate::user::dto::{CreateUserDTO, User, UserResponseDTO};
use crate::core::response::{into_api_response, error_map};
use crate::AppState;
use axum::extract::{Path, State};
use axum::routing::{get, post, delete};
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
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    if let Some(phone) = &payload.phone {
        let existing_user = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM education_user WHERE phone = $1")
            .bind(phone)
            .fetch_one(&state.pool)
            .await;

        match existing_user {
            Ok(count) if count > 0 => {
                return into_api_response(
                    StatusCode::CONFLICT,
                    None,
                    Some(error_map("phone", "Пользователь с таким номером телефона уже существует")),
                    Some(vec!["Конфликт: пользователь уже существует".to_string()]),
                );
            }
            Err(_) => {
                return into_api_response(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    None,
                    Some(error_map("database", "Ошибка запроса к базе данных")),
                    Some(vec!["Не удалось проверить существование пользователя".to_string()]),
                );
            }
            _ => {}
        }
    }

    let password_hash = match hash_password(&payload.password) {
        Ok(hash) => hash,
        Err(_) => {
            return into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("password", "Ошибка хеширования пароля")),
                Some(vec!["Не удалось обработать пароль".to_string()]),
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
        Ok(_) => into_api_response(
            StatusCode::CREATED,
            None,
            None,
            Some(vec!["Пользователь успешно создан".to_string()]),
        ),
        Err(_) => into_api_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            None,
            Some(error_map("database", "Ошибка создания пользователя")),
            Some(vec!["Не удалось создать пользователя".to_string()]),
        ),
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/user",
    responses(
        (status = 200, description = "Успешное получение списка пользователей", body = ApiResponse<Vec<UserResponseDTO>>),
        (status = 500, description = "Ошибка базы данных", body = ApiResponse<Vec<UserResponseDTO>>)
    ),
    tag = "User",
    operation_id = "get_all_users",
)]
async fn get_all(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Vec<UserResponseDTO>>>, (StatusCode, Json<ApiResponse<Vec<UserResponseDTO>>>)> {
    match query_as::<_, UserResponseDTO>(
        "SELECT uuid, first_name, second_name, last_name, phone, avatar, birth_date, created_at FROM education_user"
    )
    .fetch_all(&state.pool)
    .await
    {
        Ok(users) => into_api_response(StatusCode::OK, Some(users), None, None),
        Err(_) => into_api_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            None,
            Some(error_map("database", "Ошибка получения списка пользователей")),
            Some(vec!["Не удалось загрузить пользователей".to_string()]),
        ),
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/user/{uuid}",
    params(("uuid" = Uuid, Path, description = "UUID пользователя")),
    responses(
        (status = 200, description = "Успешное получение пользователя", body = ApiResponse<UserResponseDTO>),
        (status = 404, description = "Пользователь не найден", body = ApiResponse<UserResponseDTO>),
        (status = 500, description = "Ошибка базы данных", body = ApiResponse<UserResponseDTO>)
    ),
    tag = "User",
    operation_id = "get_user_by_uuid",
)]
async fn get_one(
    State(state): State<Arc<AppState>>,
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
        Ok(None) => into_api_response(
            StatusCode::NOT_FOUND,
            None,
            Some(error_map("user", "Пользователь не найден")),
            Some(vec!["Пользователь с указанным UUID отсутствует".to_string()]),
        ),
        Err(_) => into_api_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            None,
            Some(error_map("database", "Ошибка базы данных")),
            Some(vec!["Не удалось получить пользователя".to_string()]),
        ),
    }
}

#[utoipa::path(
    delete,
    path = "/api/v1/user/{uuid}",
    params(("uuid" = Uuid, Path, description = "UUID пользователя")),
    responses(
        (status = 200, description = "Успешное получение пользователя", body = ApiResponse<UserResponseDTO>),
        (status = 404, description = "Пользователь не найден", body = ApiResponse<UserResponseDTO>),
        (status = 500, description = "Ошибка базы данных", body = ApiResponse<UserResponseDTO>)
    ),
    tag = "User",
    operation_id = "delete_user_by_uuid",
)]
async fn delete_one(
    State(state): State<Arc<AppState>>,
    Path(uuid): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    // Сначала проверим, существует ли пользователь
    let exists = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM education_user WHERE uuid = $1)"
    )
    .bind(uuid)
    .fetch_one(&state.pool)
    .await;

    match exists {
        Ok(true) => {
            // Пользователь существует — удаляем
            let result = sqlx::query("DELETE FROM education_user WHERE uuid = $1")
                .bind(uuid)
                .execute(&state.pool)
                .await;

            match result {
                Ok(_) => into_api_response(
                    StatusCode::OK,
                    None,
                    None,
                    Some(vec!["Пользователь успешно удалён".to_string()]),
                ),
                Err(_) => into_api_response(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    None,
                    Some(error_map("database", "Ошибка при удалении пользователя")),
                    Some(vec!["Не удалось удалить пользователя".to_string()]),
                ),
            }
        }
        Ok(false) => {
            // Пользователь не найден
            into_api_response(
                StatusCode::NOT_FOUND,
                None,
                Some(error_map("user", "Пользователь не найден")),
                Some(vec!["Пользователь с указанным UUID отсутствует".to_string()]),
            )
        }
        Err(_) => {
            // Ошибка при проверке существования
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Ошибка запроса к базе данных")),
                Some(vec!["Не удалось проверить существование пользователя".to_string()]),
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
