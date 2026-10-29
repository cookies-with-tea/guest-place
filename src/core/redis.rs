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

    /// Атомарный INCR + EXPIRE-на-первом-инкременте — стандартный паттерн для
    /// скользящего окна (счётчик неудачных попыток логина и т.п.): TTL ставится только
    /// когда ключ только что создан, так что повторные инкременты внутри окна не
    /// отодвигают истечение заново.
    pub async fn increment_with_ttl(&self, key: &str, ttl_seconds: i64) -> anyhow::Result<i64> {
        let mut conn = self.pool.get().await?;
        let count: i64 = conn.incr(key, 1).await?;
        if count == 1 {
            let _: () = conn.expire(key, ttl_seconds).await?;
        }
        Ok(count)
    }

    pub async fn ping(&self) -> anyhow::Result<()> {
        let mut conn = self.pool.get().await?;
        let _ : String = redis::cmd("PING").query_async(&mut conn).await?;
        Ok(())
    }

    pub async fn delete_by_pattern(&self, pattern: &str) -> anyhow::Result<()> {
        let mut conn = self.pool.get().await?;
        let keys: Vec<String> = conn.keys(pattern).await?;
        if !keys.is_empty() {
            conn.del::<_, ()>(keys).await?;
        }
        Ok(())
    }
}
