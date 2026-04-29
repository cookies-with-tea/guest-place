use axum::{
    extract::State,
    response::sse::{Event, Sse},
};
use std::sync::Arc;
use tokio_stream::wrappers::BroadcastStream;
use tokio_stream::StreamExt;
use crate::{AppState, ApiResponse};
use super::service::{get_system_stats, SystemStats};

#[utoipa::path(
    get,
    path = "/api/v1/system/stats",
    responses(
        (status = 200, description = "Get system statistics", body = SystemStats)
    ),
    tag = "System"
)]
pub async fn get_stats(
    State(state): State<Arc<AppState>>,
) -> axum::Json<ApiResponse<SystemStats>> {
    let mfes = sqlx::query_as::<_, (String, String)>(
        "SELECT name, display_name FROM microfrontends"
    )
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();

    axum::Json(ApiResponse {
        data: Some(get_system_stats(mfes)),
        errors: None,
        messages: None,
    })
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
