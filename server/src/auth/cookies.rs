//! Мост между JSON-контрактом auth-эндпоинтов (как они написаны в `handlers.rs`, не
//! тронуты) и HttpOnly-cookie для refresh-токена.
//!
//! Раньше `access_token`/`refresh_token` оба уходили в тело ответа и хранились на
//! фронте в localStorage — украдены любым XSS. Теперь refresh_token (долгоживущий,
//! сутки по умолчанию) переносится в HttpOnly-cookie; access_token (10 минут) остаётся
//! в теле — короткого жития достаточно, чтобы не переписывать весь фронт на cookie-only
//! авторизацию. Сами handlers (`login`/`refresh`/`logout`/`logout_other_devices`)
//! не меняются: они как и раньше читают/пишут `refresh_token` через JSON — просто то,
//! что раньше было реальным телом запроса/ответа, здесь подставляется/вычищается на
//! уровне middleware, подвешенного только на эти четыре роута.
use axum::{
    body::{to_bytes, Body},
    extract::Request,
    http::{header, HeaderMap, HeaderValue},
    middleware::Next,
    response::Response,
};
use serde_json::Value;

const COOKIE_NAME: &str = "gp_refresh_token";
const COOKIE_PATH: &str = "/api/v1/auth";
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

fn build_set_cookie(value: &str, max_age_seconds: i64, secure: bool) -> HeaderValue {
    let secure_attr = if secure { "; Secure" } else { "" };
    let raw = format!(
        "{COOKIE_NAME}={value}; Path={COOKIE_PATH}; HttpOnly; SameSite=Lax; Max-Age={max_age_seconds}{secure_attr}"
    );
    HeaderValue::from_str(&raw).unwrap_or_else(|_| HeaderValue::from_static(""))
}

fn clear_set_cookie(secure: bool) -> HeaderValue {
    build_set_cookie("", 0, secure)
}

/// Подменяет тело запроса на `{"refresh_token": "<из cookie>"}` (пустая строка, если
/// cookie нет) — handler видит ровно тот JSON, который ожидал и раньше.
fn inject_refresh_token_body(req: Request) -> Request {
    let token = extract_cookie(req.headers(), COOKIE_NAME).unwrap_or_default();
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

/// Убирает `data.refresh_token` из JSON-ответа (если есть) и переносит его в
/// HttpOnly-cookie. `data.refresh_expires_in` (минуты) используется для `Max-Age`,
/// само поле в ответе остаётся — это не секрет, просто метаданные о времени жизни.
async fn move_refresh_token_to_cookie(res: Response) -> Response {
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
                build_set_cookie(&token, max_age_seconds, cookie_secure()),
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
/// `data.refresh_token` из ответа в cookie.
pub async fn login_cookie_bridge(req: Request, next: Next) -> Response {
    let res = next.run(req).await;
    move_refresh_token_to_cookie(res).await
}

/// `/refresh`: подставляем refresh-токен из cookie в тело запроса, а новый
/// (ротированный) refresh-токен из ответа — обратно в cookie.
pub async fn refresh_cookie_bridge(req: Request, next: Next) -> Response {
    let req = inject_refresh_token_body(req);
    let res = next.run(req).await;
    move_refresh_token_to_cookie(res).await
}

/// `/logout`: подставляем refresh-токен из cookie в тело запроса (handler удаляет
/// именно эту запись из `refresh_token`), после ответа — очищаем cookie независимо
/// от результата (пользователь попросил выйти — на клиенте сессии больше нет).
pub async fn logout_cookie_bridge(req: Request, next: Next) -> Response {
    let req = inject_refresh_token_body(req);
    let mut res = next.run(req).await;
    res.headers_mut()
        .append(header::SET_COOKIE, clear_set_cookie(cookie_secure()));
    res
}

/// `/logout/other` (защищённый роут): подставляем refresh-токен ТЕКУЩЕЙ сессии из
/// cookie в тело запроса — handler сам удаляет все остальные токены пользователя.
pub async fn inject_refresh_token_from_cookie(req: Request, next: Next) -> Response {
    let req = inject_refresh_token_body(req);
    next.run(req).await
}
