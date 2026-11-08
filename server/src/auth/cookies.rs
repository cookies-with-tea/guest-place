//! Мост между JSON-контрактом auth-эндпоинтов (как они написаны в `handlers.rs`, не
//! тронуты) и HttpOnly-cookie для access_token/refresh_token.
//!
//! Раньше оба токена уходили в тело ответа; `access_token` затем хранился на фронте в
//! `localStorage` и слался руками через заголовок `Authorization` — украден любым XSS.
//! Теперь оба токена переносятся в HttpOnly-cookie (см. IMPROVEMENTS.md): `refresh_token`
//! (долгоживущий) — в cookie с `Path=/api/v1/auth` (нужен только `/refresh`/`/logout`),
//! `access_token` (короткоживущий) — в cookie с `Path=/` (нужен на каждый защищённый
//! запрос, читает `auth_middleware`). Сами handlers (`login`/`refresh`/`logout`/
//! `logout_other_devices`) не меняются: они как и раньше читают/пишут токены через JSON —
//! то, что раньше было реальным телом запроса/ответа, здесь подставляется/вычищается на
//! уровне middleware, подвешенного только на эти роуты.
use axum::{
    body::{to_bytes, Body},
    extract::Request,
    http::{header, HeaderMap, HeaderValue},
    middleware::Next,
    response::Response,
};
use serde_json::Value;

const REFRESH_COOKIE_NAME: &str = "gp_refresh_token";
const REFRESH_COOKIE_PATH: &str = "/api/v1/auth";
pub(crate) const ACCESS_COOKIE_NAME: &str = "gp_access_token";
const ACCESS_COOKIE_PATH: &str = "/";
const MAX_RESPONSE_BYTES: usize = 64 * 1024;

fn cookie_secure() -> bool {
    std::env::var("PUBLIC_URL")
        .map(|url| url.starts_with("https://"))
        .unwrap_or(false)
}

fn extract_cookie(headers: &HeaderMap, name: &str) -> Option<String> {
    let raw = headers.get(header::COOKIE)?.to_str().ok()?;
    raw.split(';').find_map(|part| {
        let (key, value) = part.trim().split_once('=')?;
        (key == name).then(|| value.to_string())
    })
}

/// Читает access_token из HttpOnly-cookie — единственный источник личности на
/// защищённых роутах (см. `auth::middlewares::auth_middleware`).
pub(crate) fn extract_access_token(headers: &HeaderMap) -> Option<String> {
    extract_cookie(headers, ACCESS_COOKIE_NAME)
}

fn build_set_cookie(name: &str, value: &str, path: &str, max_age_seconds: i64, secure: bool) -> HeaderValue {
    let secure_attr = if secure { "; Secure" } else { "" };
    let raw = format!(
        "{name}={value}; Path={path}; HttpOnly; SameSite=Lax; Max-Age={max_age_seconds}{secure_attr}"
    );
    HeaderValue::from_str(&raw).unwrap_or_else(|_| HeaderValue::from_static(""))
}

fn clear_set_cookie(name: &str, path: &str, secure: bool) -> HeaderValue {
    build_set_cookie(name, "", path, 0, secure)
}

/// Подменяет тело запроса на `{"refresh_token": "<из cookie>"}` (пустая строка, если
/// cookie нет) — handler видит ровно тот JSON, который ожидал и раньше.
fn inject_refresh_token_body(req: Request) -> Request {
    let token = extract_cookie(req.headers(), REFRESH_COOKIE_NAME).unwrap_or_default();
    let (mut parts, _) = req.into_parts();
    let body_bytes = serde_json::json!({ "refresh_token": token }).to_string().into_bytes();
    parts
        .headers
        .insert(header::CONTENT_TYPE, HeaderValue::from_static("application/json"));
    parts
        .headers
        .insert(header::CONTENT_LENGTH, HeaderValue::from(body_bytes.len()));
    Request::from_parts(parts, Body::from(body_bytes))
}

/// Убирает `data.access_token`/`data.refresh_token` из JSON-ответа (если есть) и
/// переносит оба в свои HttpOnly-cookie. `data.access_expires_in`/`data.refresh_expires_in`
/// (минуты) используются для `Max-Age` каждого — сами поля в ответе остаются, это не
/// секрет, просто метаданные о времени жизни.
async fn move_tokens_to_cookies(res: Response) -> Response {
    let (mut parts, body) = res.into_parts();
    let Ok(bytes) = to_bytes(body, MAX_RESPONSE_BYTES).await else {
        return Response::from_parts(parts, Body::empty());
    };

    let Ok(mut value) = serde_json::from_slice::<Value>(&bytes) else {
        return Response::from_parts(parts, Body::from(bytes));
    };

    if let Some(data) = value.get_mut("data").and_then(Value::as_object_mut) {
        if let Some(Value::String(token)) = data.remove("refresh_token") {
            let max_age_seconds = data
                .get("refresh_expires_in")
                .and_then(Value::as_i64)
                .unwrap_or(1440)
                * 60;
            parts.headers.append(
                header::SET_COOKIE,
                build_set_cookie(REFRESH_COOKIE_NAME, &token, REFRESH_COOKIE_PATH, max_age_seconds, cookie_secure()),
            );
        }

        if let Some(Value::String(token)) = data.remove("access_token") {
            let max_age_seconds = data
                .get("access_expires_in")
                .and_then(Value::as_i64)
                .unwrap_or(10)
                * 60;
            parts.headers.append(
                header::SET_COOKIE,
                build_set_cookie(ACCESS_COOKIE_NAME, &token, ACCESS_COOKIE_PATH, max_age_seconds, cookie_secure()),
            );
        }
    }

    let new_body = serde_json::to_vec(&value).unwrap_or_else(|_| bytes.to_vec());
    parts
        .headers
        .insert(header::CONTENT_LENGTH, HeaderValue::from(new_body.len()));
    Response::from_parts(parts, Body::from(new_body))
}

/// `/login`: тело запроса (email/password) не трогаем, только переносим
/// `data.access_token`/`data.refresh_token` из ответа в cookie.
pub async fn login_cookie_bridge(req: Request, next: Next) -> Response {
    let res = next.run(req).await;
    move_tokens_to_cookies(res).await
}

/// `/refresh`: подставляем refresh-токен из cookie в тело запроса, а новую
/// (ротированную) пару токенов из ответа — обратно в cookie.
pub async fn refresh_cookie_bridge(req: Request, next: Next) -> Response {
    let req = inject_refresh_token_body(req);
    let res = next.run(req).await;
    move_tokens_to_cookies(res).await
}

/// `/logout`: подставляем refresh-токен из cookie в тело запроса (handler удаляет
/// именно эту запись из `refresh_token`), после ответа — очищаем обе cookie независимо
/// от результата (пользователь попросил выйти — на клиенте сессии больше нет).
pub async fn logout_cookie_bridge(req: Request, next: Next) -> Response {
    let req = inject_refresh_token_body(req);
    let mut res = next.run(req).await;
    res.headers_mut()
        .append(header::SET_COOKIE, clear_set_cookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH, cookie_secure()));
    res.headers_mut()
        .append(header::SET_COOKIE, clear_set_cookie(ACCESS_COOKIE_NAME, ACCESS_COOKIE_PATH, cookie_secure()));
    res
}

/// `/logout/other` (защищённый роут): подставляем refresh-токен ТЕКУЩЕЙ сессии из
/// cookie в тело запроса — handler сам удаляет все остальные токены пользователя.
pub async fn inject_refresh_token_from_cookie(req: Request, next: Next) -> Response {
    let req = inject_refresh_token_body(req);
    next.run(req).await
}
