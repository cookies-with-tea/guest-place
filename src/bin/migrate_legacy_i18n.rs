//! One-time migration (ROADMAP.md, section 4.3 step 7): rewrites content_entries whose Text
//! fields still hold the old `$t('key')` / `@t:key` / `i18n:key` hack (removed from the admin UI
//! in step 4 — ContentFormGenerator no longer renders or writes that format) into the current
//! tag format `{key:key}fallback{/key:key}` that UiRichTextField and the client both understand.
//! RichText fields are untouched: they were already raw HTML with no legacy wrapper format to
//! migrate away from (see step 4's note on why RichText intentionally isn't converted to the tag
//! format wholesale).
//!
//! Usage:
//!   cargo run --bin migrate_legacy_i18n -- [--locale=ru] [--dry-run]
//!
//! `--locale` picks which i18n_translations locale supplies the fallback text for each migrated
//! key (defaults to "ru", the project's default content locale — see
//! client/app/shared/lib/composables/useContentI18n.ts). `--dry-run` reports what would change
//! without writing anything or re-syncing content_translation_refs.

use guest_place::content::legacy_i18n_migration::migrate_legacy_i18n_strings;
use guest_place::content::translation_refs::sync_refs;
use sqlx::postgres::PgPoolOptions;
use std::collections::HashMap;
use std::env;
use uuid::Uuid;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv::from_path(std::path::Path::new("server/.env")).ok();
    dotenv::dotenv().ok();

    let args: Vec<String> = env::args().collect();
    let dry_run = args.iter().any(|a| a == "--dry-run");
    let locale = args
        .iter()
        .find_map(|a| a.strip_prefix("--locale="))
        .unwrap_or("ru")
        .to_string();

    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
        let user = env::var("POSTGRES_USER").unwrap_or_else(|_| "postgres".to_string());
        let pass = env::var("POSTGRES_PASSWORD").unwrap_or_else(|_| "postgres".to_string());
        let host = env::var("POSTGRES_HOST").unwrap_or_else(|_| "localhost".to_string());
        let port = env::var("POSTGRES_PORT").unwrap_or_else(|_| "5432".to_string());
        let db = env::var("POSTGRES_DB").unwrap_or_else(|_| "guest_place".to_string());
        format!("postgres://{}:{}@{}:{}/{}", user, pass, host, port, db)
    });

    println!("🔧 Connecting to database: {}", database_url);
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    println!("⚡ Applying database migrations...");
    sqlx::migrate!().run(&pool).await?;

    if dry_run {
        println!("🔍 Dry run — no changes will be written (locale: {locale})\n");
    } else {
        println!("🚀 Migrating legacy $t()/@t:/i18n: strings (locale: {locale})\n");
    }

    let translation_rows: Vec<(String, String)> =
        sqlx::query_as("SELECT key, value FROM i18n_translations WHERE locale = $1")
            .bind(&locale)
            .fetch_all(&pool)
            .await?;
    let translations: HashMap<String, String> = translation_rows.into_iter().collect();

    println!(
        "📚 Loaded {} translation(s) for locale '{}'",
        translations.len(),
        locale
    );

    let entries: Vec<(Uuid, sqlx::types::Json<serde_json::Value>)> =
        sqlx::query_as("SELECT id, data FROM content_entries")
            .fetch_all(&pool)
            .await?;

    println!("📄 Scanning {} content entries...\n", entries.len());

    let mut migrated_count = 0;

    for (id, data) in entries {
        let mut data = data.0;

        if migrate_legacy_i18n_strings(&mut data, &translations) {
            migrated_count += 1;

            println!("  ✓ entry {id}: legacy translation string(s) migrated");

            if !dry_run {
                sqlx::query(
                    "UPDATE content_entries SET data = $1, updated_at = NOW() WHERE id = $2",
                )
                .bind(&data)
                .bind(id)
                .execute(&pool)
                .await?;

                sync_refs(&pool, id, &data).await?;
            }
        }
    }

    println!(
        "\n{} entries {}.",
        migrated_count,
        if dry_run {
            "would be migrated"
        } else {
            "migrated"
        }
    );

    if dry_run && migrated_count > 0 {
        println!("Re-run without --dry-run to apply.");
    }

    Ok(())
}
