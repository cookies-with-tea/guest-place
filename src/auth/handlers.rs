use crate::auth::dto::{AuthRefreshTokenDTO, AuthRequestDTO, AuthResponseDTO, Claims};
use crate::core::dto::ApiResponse;
use crate::core::response::{error_map, into_api_response};
use crate::user::dto::User;
use crate::AppState;
use argon2::{password_hash::PasswordHash, Argon2, PasswordVerifier};
use axum::routing::post;
use axum::Router;
use axum::{extract::Extension, extract::State, http::StatusCode, Json};
use chrono::{Duration, Utc};
use dotenv::dotenv;
use jsonwebtoken::{encode, EncodingKey, Header};
use sqlx::{query_as, Row};
use std::env;
use std::sync::Arc;
use uuid::Uuid;

fn verify_password(password: &str, hash: &str) -> bool {
    let parsed_hash = PasswordHash::new(hash).unwrap();
    Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok()
}

// Возвращает (token, expires_in_minutes)
fn generate_token(user_id: Uuid, expires_in_minutes: i64) -> (String, i64) {
    dotenv().ok();
    let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");

    // Конвертируем минуты → секунды для JWT
    let expires_in_seconds = expires_in_minutes * 60;
    let expiration = Utc::now() + Duration::seconds(expires_in_seconds);

    let claims = Claims {
        sub: user_id,
        exp: expiration.timestamp() as usize, // timestamp в секундах
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .unwrap();

    // Возвращаем ТОКЕН и срок в МИНУТАХ (для клиента)
    (token, expires_in_minutes)
}

pub fn generate_access_token(user_id: Uuid) -> (String, i64) {
    let minutes = env::var("ACCESS_TOKEN_LIFETIME_MINUTES")
        .unwrap_or_else(|_| "10".to_string()) // 10 минут по умолчанию
        .parse()
        .expect("ACCESS_TOKEN_LIFETIME_MINUTES must be a valid integer");
    generate_token(user_id, minutes)
}

pub fn generate_refresh_token(user_id: Uuid) -> (String, i64) {
    let minutes = env::var("REFRESH_TOKEN_TTL_MINUTES")
        .unwrap_or_else(|_| "1440".to_string()) // 24 часа по умолчанию
        .parse::<i64>()
        .expect("REFRESH_TOKEN_TTL_MINUTES must be a valid integer");
    generate_token(user_id, minutes)
}

fn get_refresh_token_ttl_minutes() -> i32 {
    env::var("REFRESH_TOKEN_TTL_MINUTES")
        .unwrap_or_else(|_| "1440".to_string())
        .parse()
        .expect("REFRESH_TOKEN_TTL_MINUTES must be a valid integer")
}

#[utoipa::path(
    post,
    path = "/api/v1/auth/login",
    request_body = AuthRequestDTO,
    responses(
        (status = 200, description = "Успешно", body = ApiResponse<AuthResponseDTO>),
        (status = 401, description = "Неверные учетные данные", body = ApiResponse<AuthResponseDTO>),
        (status = 500, description = "Ошибка базы данных", body = ApiResponse<AuthResponseDTO>)
    ),
    tag = "Auth"
)]
pub async fn login(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Json(payload): Json<AuthRequestDTO>,
) -> Result<Json<ApiResponse<AuthResponseDTO>>, (StatusCode, Json<ApiResponse<AuthResponseDTO>>)> {
    let user = match query_as::<_, User>("SELECT * FROM guest_user WHERE email = $1")
        .bind(&payload.email)
        .fetch_optional(&state.pool)
        .await
    {
        Ok(Some(user)) => user,
        Ok(None) => {
            let msg = state.i18n.t("auth.invalid_credentials", &locale).await;
            return into_api_response(
                StatusCode::UNAUTHORIZED,
                None,
                Some(error_map("auth", &msg)),
                Some(vec![msg]),
            );
        }
        Err(_) => {
            let msg = state.i18n.t("auth.database_error", &locale).await;
            return into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", &msg)),
                Some(vec![msg]),
            );
        }
    };

    if !verify_password(&payload.password, &user.password_hash) {
        let msg = state.i18n.t("auth.invalid_credentials", &locale).await;
        return into_api_response(
            StatusCode::UNAUTHORIZED,
            None,
            Some(error_map("auth", &msg)),
            Some(vec![msg]),
        );
    }

    let (access_token, access_expires_in) = generate_access_token(user.uuid);
    let (refresh_token, refresh_expires_in) = generate_refresh_token(user.uuid);

    let _ = sqlx::query(
        "INSERT INTO refresh_token (user_id, token, expires_at) \
         VALUES ($1, $2, NOW() + INTERVAL '1 minute' * $3)"
    )
    .bind(user.uuid)
    .bind(&refresh_token)
    .bind(get_refresh_token_ttl_minutes())
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
        Some(vec![state.i18n.t("auth.login_success", &locale).await]),
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
    Extension(locale): Extension<String>,
    Json(payload): Json<AuthRefreshTokenDTO>,
) -> Result<Json<ApiResponse<AuthResponseDTO>>, (StatusCode, Json<ApiResponse<AuthResponseDTO>>)> {
    let result =
        sqlx::query("SELECT user_id FROM refresh_token WHERE token = $1 AND expires_at > NOW()")
            .bind(&payload.refresh_token)
            .fetch_optional(&state.pool)
            .await;

    let user_id = match result {
        Ok(Some(row)) => row.get("user_id"),
        Ok(None) => {
            let msg = state
                .i18n
                .t("auth.refresh_invalid_or_expired", &locale)
                .await;
            return into_api_response(
                StatusCode::UNAUTHORIZED,
                None,
                Some(error_map("auth", &msg)),
                Some(vec![msg]),
            );
        }
        Err(_) => {
            let msg = state.i18n.t("auth.refresh_db_error", &locale).await;
            return into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", &msg)),
                Some(vec![msg]),
            );
        }
    };

    let (new_access_token, access_expires_in) = generate_access_token(user_id);
    let (new_refresh_token, refresh_expires_in) = generate_refresh_token(user_id);

    let _ = sqlx::query(
        "UPDATE refresh_token SET token = $1, expires_at = NOW() + INTERVAL '1 minute' * $2 WHERE user_id = $3"
    )
    .bind(&new_refresh_token)
    .bind(get_refresh_token_ttl_minutes())
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
        Some(vec![state.i18n.t("auth.refresh_success", &locale).await]),
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
    Extension(locale): Extension<String>,
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
            Some(vec![state.i18n.t("auth.logout_success", &locale).await]),
        ),
        Err(_) => {
            let msg = state.i18n.t("auth.logout_db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", &msg)),
                Some(vec![msg]),
            )
        }
    }
}

pub fn routing() -> Router<Arc<AppState>> {
    Router::new()
        .route("/login", post(login))
        .route("/logout", post(logout))
        .route("/refresh", post(refresh))
}
