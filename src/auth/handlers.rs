use crate::auth::dto::{AuthRefreshTokenDTO, AuthRequestDTO, AuthResponseDTO};
use crate::core::dto::ApiResponse;
use crate::core::response::{error_map, into_api_response};
use crate::user::dto::User;
use crate::AppState;
use argon2::{password_hash::PasswordHash, Argon2, PasswordVerifier};
use axum::routing::post;
use axum::{extract::State, http::StatusCode, Json};
use chrono::{Duration, Utc};
use dotenv::dotenv;
use jsonwebtoken::{encode, EncodingKey, Header};
use serde_derive::{Deserialize, Serialize};
use sqlx::{query_as, Row};
use std::env;
use std::sync::Arc;
use utoipa_axum::router::OpenApiRouter;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: Uuid,
    exp: usize,
}

fn verify_password(password: &str, hash: &str) -> bool {
    let parsed_hash = PasswordHash::new(hash).unwrap();
    Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok()
}

fn generate_token(user_id: Uuid, expires_in: i64) -> (String, i64) {
    dotenv().ok();
    let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let expiration = Utc::now() + Duration::seconds(expires_in);
    let claims = Claims {
        sub: user_id,
        exp: expiration.timestamp() as usize,
    };
    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .unwrap();
    (token, expires_in)
}

pub fn generate_access_token(user_id: Uuid) -> (String, i64) {
    let lifetime = env::var("ACCESS_TOKEN_LIFETIME").unwrap().parse().unwrap();
    generate_token(user_id, lifetime)
}

pub fn generate_refresh_token(user_id: Uuid) -> (String, i64) {
    let lifetime = env::var("REFRESH_TOKEN_LIFETIME").unwrap().parse().unwrap();
    generate_token(user_id, lifetime)
}

fn get_lifetime_token() -> String {
  return env::var("REFRESH_TOKEN_TTL_MINUTES")
      .unwrap_or_else(|_| "10080".to_string()) // 10080 = 7 дней
      .parse()
      .expect("REFRESH_TOKEN_TTL_MINUTES must be a valid integer");
}

#[utoipa::path(
    post,
    path = "/api/v1/auth/login",
    request_body = AuthRequestDTO,
    responses(
        (status = 200, description = "Успешная авторизация", body = ApiResponse<AuthResponseDTO>),
        (status = 401, description = "Неверный логин или пароль", body = ApiResponse<AuthResponseDTO>),
        (status = 500, description = "Ошибка базы данных", body = ApiResponse<AuthResponseDTO>)
    ),
    tag = "Auth"
)]
pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<AuthRequestDTO>,
) -> Result<Json<ApiResponse<AuthResponseDTO>>, (StatusCode, Json<ApiResponse<AuthResponseDTO>>)> {
    let user = match query_as::<_, User>("SELECT * FROM education_user WHERE phone = $1")
        .bind(&payload.phone)
        .fetch_optional(&state.pool)
        .await
    {
        Ok(Some(user)) => user,
        Ok(None) => {
            return into_api_response(
                StatusCode::UNAUTHORIZED,
                None,
                Some(error_map("auth", "Неверный логин или пароль")),
                Some(vec!["Проверьте правильность введённых данных".to_string()]),
            );
        }
        Err(_) => {
            return into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Ошибка запроса к базе данных")),
                Some(vec!["Не удалось найти пользователя".to_string()]),
            );
        }
    };

    if !verify_password(&payload.password, &user.password_hash) {
        return into_api_response(
            StatusCode::UNAUTHORIZED,
            None,
            Some(error_map("auth", "Неверный логин или пароль")),
            Some(vec!["Проверьте правильность введённых данных".to_string()]),
        );
    }

    let (access_token, access_expires_in) = generate_access_token(user.uuid);
    let (refresh_token, refresh_expires_in) = generate_refresh_token(user.uuid);

    let _ = sqlx::query(
        "INSERT INTO refresh_token (user_id, token, expires_at) \
         VALUES ($1, $2, NOW() + INTERVAL '1 minute' * $3)",
    )
    .bind(user.uuid)
    .bind(&refresh_token)
    .bind(get_lifetime_token())
    .execute(&state.pool)
    .await;

    into_api_response(
        StatusCode::OK,
        Some(AuthResponseDTO {
            access_token,
            access_expires_in,
            refresh_token,
            refresh_expires_in,
        }),
        None,
        Some(vec!["Авторизация успешна".to_string()]),
    )
}

#[utoipa::path(
    post,
    path = "/api/v1/auth/refresh",
    request_body = AuthRefreshTokenDTO,
    responses(
        (status = 200, description = "Успешное обновление токена", body = ApiResponse<AuthResponseDTO>),
        (status = 401, description = "Refresh-токен недействителен или истек", body = ApiResponse<AuthResponseDTO>),
        (status = 500, description = "Ошибка базы данных", body = ApiResponse<AuthResponseDTO>)
    ),
    tag = "Auth"
)]
pub async fn refresh(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<AuthRefreshTokenDTO>,
) -> Result<Json<ApiResponse<AuthResponseDTO>>, (StatusCode, Json<ApiResponse<AuthResponseDTO>>)> {
    let result = sqlx::query("SELECT user_id FROM refresh_token WHERE token = $1 AND expires_at > NOW()")
        .bind(&payload.refresh_token)
        .fetch_optional(&state.pool)
        .await;

    let user_id = match result {
        Ok(Some(row)) => row.get("user_id"),
        Ok(None) => {
            return into_api_response(
                StatusCode::UNAUTHORIZED,
                None,
                Some(error_map("auth", "Refresh-токен недействителен или истёк")),
                Some(vec!["Пожалуйста, войдите снова".to_string()]),
            );
        }
        Err(_) => {
            return into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Ошибка при проверке refresh-токена")),
                Some(vec!["Не удалось обновить токен".to_string()]),
            );
        }
    };

    let (new_access_token, access_expires_in) = generate_access_token(user_id);
    let (new_refresh_token, refresh_expires_in) = generate_refresh_token(user_id);

    let _ = sqlx::query(
        "UPDATE refresh_token SET token = $1, expires_at = NOW() + INTERVAL '1 minute' * $2 WHERE user_id = $3"
    )
    .bind(&new_refresh_token)
    .bind(get_lifetime_token())
    .bind(user_id)
    .execute(&state.pool)
    .await;

    into_api_response(
        StatusCode::OK,
        Some(AuthResponseDTO {
            access_token: new_access_token,
            access_expires_in,
            refresh_token: new_refresh_token,
            refresh_expires_in,
        }),
        None,
        Some(vec!["Токен успешно обновлён".to_string()]),
    )
}

#[utoipa::path(
    post,
    path = "/api/v1/auth/logout",
    request_body = AuthResponseDTO,
    responses(
        (status = 200, description = "Успешный выход"),
        (status = 500, description = "Ошибка базы данных")
    ),
    tag = "Auth"
)]
async fn logout(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<AuthResponseDTO>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = sqlx::query("DELETE FROM refresh_token WHERE token = $1")
        .bind(&payload.refresh_token)
        .execute(&state.pool)
        .await;

    match result {
        Ok(_) => into_api_response(
            StatusCode::OK,
            None,
            None,
            Some(vec!["Выход выполнен успешно".to_string()]),
        ),
        Err(_) => into_api_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            None,
            Some(error_map("database", "Ошибка при удалении refresh-токена")),
            Some(vec!["Не удалось завершить сеанс".to_string()]),
        ),
    }
}

pub fn routing() -> OpenApiRouter<Arc<AppState>> {
    OpenApiRouter::new()
        .route("/login", post(login))
        .route("/logout", post(logout))
        .route("/refresh", post(refresh))
}
