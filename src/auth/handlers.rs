use crate::auth::dto::{AuthRefreshTokenDTO, AuthRequestDTO, AuthResponseDTO};
use crate::core::dto::ApiResponse;
use crate::core::error::{api_error, api_response, internal_error};
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

#[utoipa::path(
    post,
    path = "/api/v1/auth/login",
    request_body = AuthRequestDTO,
    responses(
        (status = 200, description = "Успешная авторизация", body = ApiResponse<AuthResponseDTO>),
        (status = 401, description = "Неверный логин или пароль"),
        (status = 500, description = "Ошибка базы данных")
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
            return api_error(
                "auth",
                "Неверный логин или пароль",
                StatusCode::UNAUTHORIZED,
            )
        }
        Err(_) => {
            return api_error(
                "database",
                "Ошибка запроса к базе данных",
                StatusCode::INTERNAL_SERVER_ERROR,
            )
        }
    };

    if !verify_password(&payload.password, &user.password_hash) {
        return api_error(
            "auth",
            "Неверный логин или пароль",
            StatusCode::UNAUTHORIZED,
        );
    }

    let (access_token, access_expires_in) = generate_access_token(user.uuid);
    let (refresh_token, refresh_expires_in) = generate_refresh_token(user.uuid);

    // DEBT: Изменить 7 days на данные из env.
    let _ = sqlx::query(
        "INSERT INTO refresh_token (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
    )
        .bind(user.uuid)
        .bind(&refresh_token)
        .execute(&state.pool)
        .await;

    api_response(
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
        (status = 200, description = "Успешное обновление токена", body = AuthResponseDTO),
        (status = 401, description = "Refresh-токен недействителен или истек"),
        (status = 500, description = "Ошибка базы данных")
    ),
    tag = "Auth"
)]
pub async fn refresh(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<AuthRefreshTokenDTO>,
) -> Result<Json<AuthResponseDTO>, StatusCode> {
    let result =
        sqlx::query("SELECT user_id FROM refresh_token WHERE token = $1 AND expires_at > NOW()")
            .bind(&payload.refresh_token)
            .fetch_optional(&state.pool)
            .await
            .map_err(|e| {
                eprintln!("Ошибка при поиске refresh_token: {:?}", e);
                internal_error(e)
            })
            .unwrap();

    match result {
        Some(row) => {
            let user_id: Uuid = row.get("user_id");
            let (new_access_token, access_expires_in) = generate_access_token(user_id);
            let (new_refresh_token, refresh_expires_in) = generate_refresh_token(user_id);

            let _ = sqlx::query("UPDATE refresh_token SET token = $1, expires_at = NOW() + INTERVAL '7 days' WHERE user_id = $2")
                .bind(&new_refresh_token)
                .bind(user_id)
                .execute(&state.pool)
                .await;

            Ok(Json(AuthResponseDTO {
                access_token: new_access_token,
                access_expires_in,
                refresh_token: new_refresh_token,
                refresh_expires_in,
            }))
        }
        None => {
            eprintln!("Ошибка: refresh_token не найден или просрочен.");
            Err(StatusCode::UNAUTHORIZED)
        }
    }
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
) -> StatusCode {
    let _ = sqlx::query("DELETE FROM refresh_token WHERE token = $1")
        .bind(&payload.refresh_token)
        .execute(&state.pool)
        .await
        .map_err(internal_error)
        .unwrap();

    StatusCode::OK
}

pub fn routing() -> OpenApiRouter<Arc<AppState>> {
    OpenApiRouter::new()
        .route("/login", post(login))
        .route("/logout", post(logout))
        .route("/refresh", post(refresh))
}
