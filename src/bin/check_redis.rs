use deadpool_redis::{Config, Runtime};
use redis::AsyncCommands;
use dotenv::dotenv;
use std::env;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    
    let host = env::var("REDIS_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("REDIS_PORT").unwrap_or_else(|_| "6379".to_string());
    let password = env::var("REDIS_PASSWORD").ok();
    
    let redis_url = if let Some(pass) = password {
        format!("redis://:{}@{}:{}", pass, host, port)
    } else {
        format!("redis://{}:{}", host, port)
    };
    
    println!("Connecting to Redis at {}...", redis_url);
    
    let cfg = Config::from_url(&redis_url);
    let pool = cfg.create_pool(Some(Runtime::Tokio1))?;
    
    match pool.get().await {
        Ok(mut conn) => {
            println!("Pinging Redis...");
            let pong: String = redis::cmd("PING").query_async(&mut conn).await?;
            println!("Response: {}", pong);
            
            if pong == "PONG" {
                println!("✅ Redis CONNECTION is working!");
            }

            let test_key = "gp_test_connection";
            let test_value = "working";
            
            println!("Testing SET/GET for key: {}", test_key);
            conn.set_ex::<&str, &str, ()>(test_key, test_value, 60).await?;
            
            let retrieved: Option<String> = conn.get(test_key).await?;
            
            match retrieved {
                Some(val) if val == test_value => {
                    println!("✅ Redis READ/WRITE is working correctly!");
                },
                _ => {
                    println!("❌ Redis test FAILED. Could not retrieve test value.");
                }
            }
        },
        Err(e) => {
            println!("❌ Failed to connect to Redis: {}", e);
            println!("\nMake sure Redis server is running.");
            println!("If you are on Windows, you can start it via Docker or WSL:");
            println!("  docker run -d --name gp-redis -p 6379:6379 redis");
        }
    }

    Ok(())
}
