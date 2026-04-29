use axum::{
    extract::State,
    response::sse::{Event, Sse},
};
use std::sync::Arc;
use tokio_stream::wrappers::BroadcastStream;
use tokio_stream::StreamExt;
use crate::{AppState, ApiResponse};
use super::service::{get_system_stats, SystemStats};

use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;

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
