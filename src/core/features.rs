use crate::core::redis::RedisService;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FeatureFlag {
    pub id: String,
    pub name: String,
    pub description: String,
    pub enabled: bool,
}

#[derive(Debug, Clone)]
pub struct FeatureFlagService {
    redis: Arc<RedisService>,
}

const FEATURE_FLAGS_KEY: &str = "gp_feature_flags";

impl FeatureFlagService {
    pub fn new(redis: Arc<RedisService>) -> Self {
        Self { redis }
    }

    pub async fn get_all(&self) -> anyhow::Result<Vec<FeatureFlag>> {
        let flags: Option<Vec<FeatureFlag>> = self.redis.get(FEATURE_FLAGS_KEY).await?;
        Ok(flags.unwrap_or_default())
    }

    pub async fn is_enabled(&self, id: &str) -> bool {
        let flags = self.get_all().await.unwrap_or_default();
        flags.iter().find(|f| f.id == id).map(|f| f.enabled).unwrap_or(false)
    }

    pub async fn update_flags(&self, flags: Vec<FeatureFlag>) -> anyhow::Result<()> {
        self.redis.set(FEATURE_FLAGS_KEY, &flags, None).await?;
        Ok(())
    }
}
