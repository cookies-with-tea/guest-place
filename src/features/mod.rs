pub mod handlers;
pub mod hello_plugin;

use crate::core::redis::RedisService;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use axum::{Router, routing::get};
use crate::AppState;

#[derive(Debug, Serialize, Deserialize, Clone, utoipa::ToSchema, sqlx::FromRow)]
pub struct FeatureFlag {
    pub id: String,
    pub name: String,
    pub description: String,
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone, utoipa::ToSchema)]
pub struct FeatureFlagsUpdate {
    pub flags: Vec<FeatureFlag>,
}

#[derive(Debug, Clone)]
pub struct FeatureFlagService {
    pool: sqlx::PgPool,
    redis: Arc<RedisService>,
}

const FEATURE_FLAGS_KEY: &str = "gp_feature_flags";

impl FeatureFlagService {
    pub fn new(pool: sqlx::PgPool, redis: Arc<RedisService>) -> Self {
        Self { pool, redis }
    }

    pub async fn get_all(&self) -> anyhow::Result<Vec<FeatureFlag>> {
        // Try redis cache first
        if let Ok(Some(flags)) = self.redis.get::<Vec<FeatureFlag>>(FEATURE_FLAGS_KEY).await {
            if !flags.is_empty() {
                return Ok(flags);
            }
        }

        // Fetch from PostgreSQL
        let flags = sqlx::query_as::<_, FeatureFlag>(
            "SELECT id, name, description, enabled FROM feature_flags ORDER BY created_at ASC"
        )
        .fetch_all(&self.pool)
        .await?;

        // Cache in redis
        let _ = self.redis.set(FEATURE_FLAGS_KEY, &flags, None).await;

        Ok(flags)
    }

    pub async fn is_enabled(&self, id: &str) -> bool {
        let flags = self.get_all().await.unwrap_or_default();
        flags.iter().find(|f| f.id == id).map(|f| f.enabled).unwrap_or(false)
    }

    pub async fn update_flags(&self, flags: Vec<FeatureFlag>) -> anyhow::Result<()> {
        for flag in &flags {
            sqlx::query(
                r#"
                INSERT INTO feature_flags (id, name, description, enabled, updated_at)
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT (id) DO UPDATE
                SET name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    enabled = EXCLUDED.enabled,
                    updated_at = NOW()
                "#
            )
            .bind(&flag.id)
            .bind(&flag.name)
            .bind(&flag.description)
            .bind(flag.enabled)
            .execute(&self.pool)
            .await?;
        }

        let ids: Vec<String> = flags.iter().map(|f| f.id.clone()).collect();
        if !ids.is_empty() {
            let _ = sqlx::query("DELETE FROM feature_flags WHERE id NOT IN (SELECT unnest($1::text[]))")
                .bind(&ids)
                .execute(&self.pool)
                .await;
        } else {
            let _ = sqlx::query("DELETE FROM feature_flags")
                .execute(&self.pool)
                .await;
        }

        let _ = self.redis.set(FEATURE_FLAGS_KEY, &flags, None).await;
        Ok(())
    }
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(handlers::get_features).post(handlers::update_features))
}
