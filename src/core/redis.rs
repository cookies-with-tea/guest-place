use deadpool_redis::Pool;
use redis::AsyncCommands;
use serde::{de::DeserializeOwned, Serialize};

#[derive(Debug, Clone)]
pub struct RedisService {
    pool: Pool,
}

impl RedisService {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn set<T: Serialize>(&self, key: &str, value: &T, ttl_seconds: Option<usize>) -> anyhow::Result<()> {
        let mut conn = self.pool.get().await?;
        let serialized = serde_json::to_string(value)?;
        
        if let Some(ttl) = ttl_seconds {
            conn.set_ex::<&str, String, ()>(key, serialized, ttl as u64).await?;
        } else {
            conn.set::<&str, String, ()>(key, serialized).await?;
        }
        
        Ok(())
    }

    pub async fn get<T: DeserializeOwned>(&self, key: &str) -> anyhow::Result<Option<T>> {
        let mut conn = self.pool.get().await?;
        let val: Option<String> = conn.get(key).await?;
        
        match val {
            Some(s) => Ok(Some(serde_json::from_str(&s)?)),
            None => Ok(None),
        }
    }

    pub async fn delete(&self, key: &str) -> anyhow::Result<()> {
        let mut conn = self.pool.get().await?;
        conn.del::<&str, ()>(key).await?;
        Ok(())
    }
}
