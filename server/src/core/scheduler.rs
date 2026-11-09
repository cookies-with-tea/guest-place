use sqlx::{Pool, Postgres};
use uuid::Uuid;

/// Отложенная публикация контента (IDEAS.md) — раз в минуту переводит `pages` и
/// `content_entries` со status 'scheduled' и `scheduled_at <= NOW()` в 'published'.
/// По аналогии с уже существующим `auth::handlers::spawn_expired_refresh_token_cleanup`.
pub fn spawn_scheduled_publish_job(pool: Pool<Postgres>) {
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(60));
        loop {
            interval.tick().await;
            publish_due_pages(&pool).await;
            publish_due_content_entries(&pool).await;
        }
    });
}

async fn publish_due_pages(pool: &Pool<Postgres>) {
    let published: Vec<(Uuid,)> = match sqlx::query_as(
        "UPDATE pages
         SET status = 'published', published_at = COALESCE(published_at, scheduled_at), updated_at = NOW()
         WHERE status = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= NOW()
         RETURNING id",
    )
    .fetch_all(pool)
    .await
    {
        Ok(rows) => rows,
        Err(e) => {
            tracing::error!("Failed to auto-publish scheduled pages: {e}");
            return;
        }
    };

    for (id,) in published {
        tracing::info!("Auto-published scheduled page {id}");
        crate::audit::log_action(
            pool,
            None,
            "page.auto_publish",
            Some("page"),
            Some(&id.to_string()),
            None,
        )
        .await;
    }
}

async fn publish_due_content_entries(pool: &Pool<Postgres>) {
    let published: Vec<(Uuid,)> = match sqlx::query_as(
        "UPDATE content_entries
         SET status = 'published', published_at = COALESCE(published_at, scheduled_at), updated_at = NOW()
         WHERE status = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= NOW()
         RETURNING id",
    )
    .fetch_all(pool)
    .await
    {
        Ok(rows) => rows,
        Err(e) => {
            tracing::error!("Failed to auto-publish scheduled content entries: {e}");
            return;
        }
    };

    for (id,) in published {
        tracing::info!("Auto-published scheduled content entry {id}");
        crate::audit::log_action(
            pool,
            None,
            "content.auto_publish",
            Some("content_entry"),
            Some(&id.to_string()),
            None,
        )
        .await;
    }
}
