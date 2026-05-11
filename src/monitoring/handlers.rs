use axum::{
    extract::{State, Path, Query},
    response::sse::{Event, Sse},
    http::StatusCode,
};
use std::sync::Arc;
use tokio_stream::wrappers::BroadcastStream;
use tokio_stream::StreamExt;
use crate::{AppState, ApiResponse, core::response::into_api_response};
use super::service::get_system_stats;
use super::dto::{SearchResult, GlobalSearchResponse};

use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;
use axum::Json;
use serde::{Serialize, Deserialize};

#[derive(Serialize, utoipa::ToSchema)]
pub struct HealthStatus {
    pub status: String,
    pub db: String,
    pub redis: String,
}

#[utoipa::path(
    get,
    path = "/api/v1/system/health",
    responses(
        (status = 200, description = "System health status", body = HealthStatus)
    ),
    tag = "System"
)]
pub async fn get_health(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<HealthStatus>>, (StatusCode, Json<ApiResponse<HealthStatus>>)> {
    let db_status = match sqlx::query("SELECT 1").execute(&state.pool).await {
        Ok(_) => "ok",
        Err(_) => "error",
    };

    let redis_status = match state.redis.ping().await {
        Ok(_) => "ok",
        Err(_) => "error",
    };

    let status = if db_status == "ok" && redis_status == "ok" {
        "ok"
    } else {
        "error"
    };

    let health = HealthStatus {
        status: status.to_string(),
        db: db_status.to_string(),
        redis: redis_status.to_string(),
    };

    into_api_response(StatusCode::OK, Some(health), None, None)
}

#[utoipa::path(
    get,
    path = "/api/v1/system/stats/stream",
    responses(
        (status = 200, description = "Stream system statistics via SSE")
    ),
    tag = "System"
)]
pub async fn get_stats_stream(
    State(state): State<Arc<AppState>>,
) -> Sse<impl tokio_stream::Stream<Item = Result<Event, std::convert::Infallible>>> {
    let (tx, rx) = mpsc::channel(1);

    tokio::spawn(async move {
        loop {
            let mfes = sqlx::query_as::<_, (String, String)>(
                "SELECT name, display_name FROM microfrontends"
            )
            .fetch_all(&state.pool)
            .await
            .unwrap_or_default();

            let stats = get_system_stats(mfes);
            let json = serde_json::to_string(&stats).unwrap_or_default();

            if tx.send(Ok(Event::default().data(json))).await.is_err() {
                break;
            }

            tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
        }
    });

    let stream = ReceiverStream::new(rx);
    Sse::new(stream).keep_alive(axum::response::sse::KeepAlive::default())
}

pub async fn get_logs(
    State(state): State<Arc<AppState>>,
) -> Sse<impl tokio_stream::Stream<Item = Result<Event, std::convert::Infallible>>> {
    let rx = state.log_tx.subscribe();
    let stream = BroadcastStream::new(rx).filter_map(|msg| {
        match msg {
            Ok(m) => Some(Ok(Event::default().data(m))),
            Err(_) => None,
        }
    });

    Sse::new(stream).keep_alive(axum::response::sse::KeepAlive::default())
}

#[utoipa::path(
    get,
    path = "/api/v1/events",
    responses(
        (status = 200, description = "Real-time system events via SSE")
    ),
    tag = "System"
)]
pub async fn get_events(
    State(state): State<Arc<AppState>>,
) -> Sse<impl tokio_stream::Stream<Item = Result<Event, std::convert::Infallible>>> {
    let rx = state.bus.subscribe();
    let stream = BroadcastStream::new(rx).filter_map(|msg| {
        match msg {
            Ok(event) => {
                let json = serde_json::to_string(&event).unwrap_or_default();
                let event_name = match &event {
                    crate::core::bus::SystemEvent::FileProcessed { .. } => "file_processed",
                    crate::core::bus::SystemEvent::ContentUpdated { .. } => "content_updated",
                    crate::core::bus::SystemEvent::ContentLocked { .. } => "content_locked",
                    crate::core::bus::SystemEvent::ConfigChanged { .. } => "config_changed",
                };
                Some(Ok(Event::default().event(event_name).data(json)))
            },
            Err(_) => None,
        }
    });

    Sse::new(stream).keep_alive(axum::response::sse::KeepAlive::default())
}

#[utoipa::path(
    post,
    path = "/api/v1/system/modules/{name}/reload",
    responses(
        (status = 200, description = "Module cache cleared and reload triggered"),
        (status = 404, description = "Module not found")
    ),
    params(
        ("name" = String, Path, description = "Module name")
    ),
    tag = "System"
)]
pub async fn reload_module(
    State(state): State<Arc<AppState>>,
    Path(name): Path<String>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    // 1. Check if module exists
    let exists = sqlx::query_scalar::<_, bool>("SELECT EXISTS(SELECT 1 FROM microfrontends WHERE name = $1)")
        .bind(&name)
        .fetch_one(&state.pool)
        .await
        .unwrap_or(false);

    if !exists && name != "orchestrator" {
        return Err((StatusCode::NOT_FOUND, Json(ApiResponse { 
            data: None, 
            errors: None, 
            messages: Some(vec!["Module not found".to_string()]) 
        })));
    }

    // 2. Clear backend caches for this module
    // We use Redis to store module configurations or data
    let cache_pattern = format!("mfe:cache:{}:*", name);
    if let Err(e) = state.redis.delete_by_pattern(&cache_pattern).await {
        eprintln!("Failed to clear Redis cache for {}: {}", name, e);
    }

    // 3. Log the reload action
    println!("[System] Forced reload for module: {}", name);

    Ok(Json(ApiResponse {
        data: None,
        errors: None,
        messages: Some(vec![format!("Module {} cache cleared", name)])
    }))
}

#[derive(Deserialize)]
pub struct SearchParams {
    pub q: String,
}

#[utoipa::path(
    get,
    path = "/api/v1/system/search",
    params(
        ("q" = String, Query, description = "Search query")
    ),
    responses(
        (status = 200, description = "Global search results", body = ApiResponse<GlobalSearchResponse>),
    ),
    tag = "System"
)]
pub async fn global_search(
    State(state): State<Arc<AppState>>,
    Query(params): Query<SearchParams>,
) -> Result<Json<ApiResponse<GlobalSearchResponse>>, (StatusCode, Json<ApiResponse<GlobalSearchResponse>>)> {
    let q = format!("%{}%", params.q.to_lowercase());
    let mut results = Vec::new();

    // 1. Search Users
    let users = sqlx::query(
        "SELECT id, first_name, last_name, email FROM users WHERE LOWER(first_name) LIKE $1 OR LOWER(last_name) LIKE $1 OR LOWER(email) LIKE $1 LIMIT 5"
    )
    .bind(&q)
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();

    use sqlx::Row;
    for u in users {
        results.push(SearchResult {
            category: "Users".to_string(),
            title: format!("{} {}", u.get::<Option<String>, _>("first_name").unwrap_or_default(), u.get::<Option<String>, _>("last_name").unwrap_or_default()),
            description: u.get::<String, _>("email"),
            url: format!("/users?edit={}", u.get::<uuid::Uuid, _>("id")),
            id: u.get::<uuid::Uuid, _>("id").to_string(),
        });
    }

    // 2. Search Content Entries
    let entries = sqlx::query(
        "SELECT e.id, e.slug, s.name as schema_name FROM content_entries e JOIN content_schemas s ON e.schema_id = s.id WHERE LOWER(e.slug) LIKE $1 LIMIT 5"
    )
    .bind(&q)
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();

    for e in entries {
        results.push(SearchResult {
            category: "Content".to_string(),
            title: e.get::<String, _>("slug"),
            description: format!("Schema: {}", e.get::<String, _>("schema_name")),
            url: format!("/content/entries/{}", e.get::<uuid::Uuid, _>("id")),
            id: e.get::<uuid::Uuid, _>("id").to_string(),
        });
    }

    // 3. Search Media
    let media = sqlx::query(
        "SELECT id, name, extension FROM media WHERE LOWER(name) LIKE $1 LIMIT 5"
    )
    .bind(&q)
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();

    for m in media {
        results.push(SearchResult {
            category: "Media".to_string(),
            title: m.get::<String, _>("name"),
            description: format!("Type: {}", m.get::<Option<String>, _>("extension").unwrap_or_default()),
            url: format!("/media?id={}", m.get::<uuid::Uuid, _>("id")),
            id: m.get::<uuid::Uuid, _>("id").to_string(),
        });
    }

    // 4. Search Translations
    let translations = sqlx::query(
        "SELECT key, locale, value FROM i18n_translations WHERE LOWER(key) LIKE $1 OR LOWER(value) LIKE $1 LIMIT 5"
    )
    .bind(&q)
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();

    for t in translations {
        results.push(SearchResult {
            category: "Translations".to_string(),
            title: t.get::<String, _>("key"),
            description: format!("[{}] {}", t.get::<String, _>("locale"), t.get::<String, _>("value")),
            url: format!("/translations?search={}", t.get::<String, _>("key")),
            id: format!("{}-{}", t.get::<String, _>("key"), t.get::<String, _>("locale")),
        });
    }

    into_api_response(StatusCode::OK, Some(GlobalSearchResponse { results }), None, None)
}
