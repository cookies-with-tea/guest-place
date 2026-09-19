use guest_place::core::app::AppConfig;
use guest_place::core::db::create_pool;
use guest_place::features::{FeatureFlag, FeatureFlagService};
use std::sync::Arc;

#[tokio::test]
async fn test_feature_flags_postgres_persistence() {
    dotenv::dotenv().ok();
    let config = AppConfig::new();
    let pool = create_pool(&config).await;
    let redis = Arc::new(guest_place::core::redis::RedisService::new(
        guest_place::core::db::create_redis_pool(&config),
    ));

    sqlx::migrate!().run(&pool).await.expect("Migrations failed");

    let service = FeatureFlagService::new(pool.clone(), redis.clone());

    // 1. Get initial flags (seeded from migration)
    let initial_flags = service.get_all().await.expect("Failed to get flags");
    assert!(!initial_flags.is_empty(), "Initial feature flags should be seeded");

    // 2. Add or update a flag
    let test_flag_id = "test_custom_mfe_flag";
    let mut updated_flags = initial_flags.clone();
    updated_flags.push(FeatureFlag {
        id: test_flag_id.to_string(),
        name: "Test Flag".to_string(),
        description: "Test Description".to_string(),
        enabled: true,
    });

    service.update_flags(updated_flags).await.expect("Failed to update flags");

    // 3. Verify in new service instance directly from DB
    let is_active = service.is_enabled(test_flag_id).await;
    assert!(is_active, "New flag should be enabled");

    // 4. Verify in PostgreSQL directly
    let row = sqlx::query_as::<_, (bool,)>("SELECT enabled FROM feature_flags WHERE id = $1")
        .bind(test_flag_id)
        .fetch_one(&pool)
        .await
        .expect("Flag not found in PostgreSQL");
    assert!(row.0, "PostgreSQL should have enabled = true");

    // Cleanup
    let _ = sqlx::query("DELETE FROM feature_flags WHERE id = $1")
        .bind(test_flag_id)
        .execute(&pool)
        .await;
}
