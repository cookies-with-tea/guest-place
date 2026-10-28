//! One-time migration (ROADMAP.md, section 9.3 step 2): retires the three hardcoded
//! "About"/"Guests"/"Platforms" MFEs (apps/admin-about, apps/admin-guests, apps/admin-platforms
//! + server/src/about, server/src/guests, server/src/platforms) in favor of the generic
//! Schema Builder content system that every other content-only page already uses.
//!
//! These three MFEs had no business logic beyond "load one fixed-shape JSON blob, save it
//! back" (confirmed by reading their composables and Rust handlers) — exactly what
//! `content_schemas`/`content_entries` already does for `global-settings` and friends, except
//! spread across 8 dedicated SQL tables per page with a bespoke Rust handler and a bespoke Vue
//! form for each. This creates one `ContentSchema` (singleton) per page, carries over the
//! existing content from the legacy tables into a matching `ContentEntry`, and leaves the
//! legacy tables/routes/MFEs in place until the migrated result is verified — their removal is
//! a separate, later migration (see ROADMAP.md section 1/9).
//!
//! Usage:
//!   cargo run --bin migrate_legacy_pages -- [--dry-run]

use guest_place::content::model::{FieldDefinition, FieldType};
use sqlx::postgres::PgPoolOptions;
use sqlx::{PgPool, Postgres, QueryBuilder};
use std::env;
use uuid::Uuid;

fn f(name: &str, label: &str, field_type: FieldType) -> FieldDefinition {
    FieldDefinition {
        name: name.to_string(),
        label: label.to_string(),
        field_type,
        required: false,
        multiple: false,
        relation_to: None,
        fields: None,
    }
}

fn nested(name: &str, label: &str, field_type: FieldType, fields: Vec<FieldDefinition>) -> FieldDefinition {
    FieldDefinition {
        name: name.to_string(),
        label: label.to_string(),
        field_type,
        required: false,
        multiple: false,
        relation_to: None,
        fields: Some(fields),
    }
}

fn opportunity_fields() -> Vec<FieldDefinition> {
    vec![
        f("title", "Заголовок", FieldType::Text),
        f("icon", "Иконка", FieldType::Media),
        nested(
            "items",
            "Пункты списка",
            FieldType::Repeater,
            vec![f("text", "Текст пункта", FieldType::Text)],
        ),
        f("link", "Ссылка", FieldType::Text),
        f("buttonText", "Текст кнопки", FieldType::Text),
    ]
}

fn icon_text_fields() -> Vec<FieldDefinition> {
    vec![
        f("text", "Текст", FieldType::Text),
        f("icon", "Иконка", FieldType::Media),
    ]
}

fn about_schema_fields() -> Vec<FieldDefinition> {
    vec![
        f("title", "Заголовок", FieldType::Text),
        f("description", "Описание", FieldType::RichText),
        f("heroGuide", "Hero — превью секции", FieldType::Media),
        f("opportunitiesGuide", "Opportunities — превью секции", FieldType::Media),
        f("leadershipGuide", "Leadership — превью секции", FieldType::Media),
        f("whoWeAreGuide", "Who We Are — превью секции", FieldType::Media),
        f("newsGuide", "News — превью секции", FieldType::Media),
        nested("opportunities", "Opportunities", FieldType::Repeater, opportunity_fields()),
        nested(
            "leadership",
            "Leadership",
            FieldType::Group,
            vec![
                f("title", "Заголовок", FieldType::Text),
                f("description", "Описание", FieldType::RichText),
                f("logo", "Логотип", FieldType::Media),
                nested("items", "Пункты", FieldType::Repeater, icon_text_fields()),
            ],
        ),
        nested(
            "whoWeAre",
            "Who We Are",
            FieldType::Repeater,
            vec![
                f("title", "Заголовок", FieldType::Text),
                f("description", "Описание", FieldType::RichText),
                f("image", "Картинка", FieldType::Media),
            ],
        ),
        nested(
            "news",
            "News",
            FieldType::Group,
            vec![
                f("title", "Заголовок", FieldType::Text),
                nested("items", "Пункты", FieldType::Repeater, icon_text_fields()),
            ],
        ),
    ]
}

fn guests_schema_fields() -> Vec<FieldDefinition> {
    vec![
        f("title", "Заголовок", FieldType::Text),
        f("heroGuide", "Hero — превью секции", FieldType::Media),
        f("opportunitiesGuide", "Opportunities — превью секции", FieldType::Media),
        f("interactionCardsGuide", "Interaction Cards — превью секции", FieldType::Media),
        f("searchPromoGuide", "Search Promo — превью секции", FieldType::Media),
        f("additionalServicesGuide", "Additional Services — превью секции", FieldType::Media),
        nested("opportunities", "Opportunities", FieldType::Repeater, opportunity_fields()),
        nested(
            "interactionCards",
            "Interaction Cards",
            FieldType::Repeater,
            vec![
                f("title", "Заголовок", FieldType::Text),
                f("text", "Текст", FieldType::RichText),
                f("buttonText", "Текст кнопки", FieldType::Text),
                f("link", "Ссылка", FieldType::Text),
                f("icon", "Иконка", FieldType::Media),
            ],
        ),
        nested(
            "searchPromo",
            "Search Promo",
            FieldType::Group,
            vec![
                f("title", "Заголовок", FieldType::Text),
                f("description", "Описание", FieldType::RichText),
            ],
        ),
        nested("additionalServices", "Additional Services", FieldType::Repeater, icon_text_fields()),
    ]
}

fn platforms_schema_fields() -> Vec<FieldDefinition> {
    vec![
        f("title", "Заголовок", FieldType::Text),
        f("description", "Описание", FieldType::RichText),
        f("heroGuide", "Hero — превью секции", FieldType::Media),
        f("opportunitiesGuide", "Opportunities — превью секции", FieldType::Media),
        f("toolsGuide", "Tools & Services — превью секции", FieldType::Media),
        nested("opportunities", "Opportunities", FieldType::Repeater, opportunity_fields()),
        nested(
            "toolsAndServices",
            "Tools & Services",
            FieldType::Group,
            vec![
                f("title", "Заголовок", FieldType::Text),
                f("logo", "Логотип", FieldType::Media),
                nested(
                    "items",
                    "Пункты",
                    FieldType::Repeater,
                    vec![
                        f("title", "Заголовок", FieldType::Text),
                        f("text", "Текст", FieldType::RichText),
                    ],
                ),
            ],
        ),
    ]
}

async fn upsert_schema(
    pool: &PgPool,
    name: &str,
    slug: &str,
    fields: Vec<FieldDefinition>,
) -> Result<Uuid, sqlx::Error> {
    let fields_json = serde_json::to_value(&fields).expect("FieldDefinition always serializes");

    sqlx::query_scalar::<_, Uuid>(
        "INSERT INTO content_schemas (name, slug, fields, is_singleton)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            fields = EXCLUDED.fields,
            is_singleton = true
         RETURNING id",
    )
    .bind(name)
    .bind(slug)
    .bind(fields_json)
    .fetch_one(pool)
    .await
}

async fn upsert_entry(
    pool: &PgPool,
    schema_id: Uuid,
    slug: &str,
    data: serde_json::Value,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO content_entries (schema_id, slug, data, status, published_at)
         VALUES ($1, $2, $3, 'published', NOW())
         ON CONFLICT (schema_id, slug) DO UPDATE SET
            data = EXCLUDED.data,
            status = 'published',
            published_at = COALESCE(content_entries.published_at, NOW())",
    )
    .bind(schema_id)
    .bind(slug)
    .bind(data)
    .execute(pool)
    .await?;

    Ok(())
}

fn uuid_str(u: Option<Uuid>) -> Option<String> {
    u.map(|v| v.to_string())
}

async fn opportunities_json(
    pool: &PgPool,
    table: &str,
    items_table: &str,
    fk_column: &str,
    fk_value: i32,
) -> Result<Vec<serde_json::Value>, sqlx::Error> {
    let mut qb: QueryBuilder<Postgres> = QueryBuilder::new("SELECT id, icon_uuid, title, link, button_text FROM ");
    qb.push(table);
    qb.push(" WHERE ");
    qb.push(fk_column);
    qb.push(" = ");
    qb.push_bind(fk_value);
    qb.push(" ORDER BY id");

    let rows: Vec<(i32, Option<Uuid>, String, String, String)> =
        qb.build_query_as().fetch_all(pool).await?;

    let mut result = Vec::new();

    for (opp_id, icon, title, link, button_text) in rows {
        let item_texts: Vec<String> = sqlx::query_scalar(&format!(
            "SELECT item_text FROM {items_table} WHERE opportunity_id = $1 ORDER BY id"
        ))
        .bind(opp_id)
        .fetch_all(pool)
        .await?;

        result.push(serde_json::json!({
            "title": title,
            "icon": uuid_str(icon),
            "items": item_texts.into_iter().map(|t| serde_json::json!({ "text": t })).collect::<Vec<_>>(),
            "link": link,
            "buttonText": button_text,
        }));
    }

    Ok(result)
}

async fn build_about_data(pool: &PgPool) -> Result<Option<serde_json::Value>, sqlx::Error> {
    let row: Option<(i32, String, String, Option<Uuid>, Option<Uuid>, Option<Uuid>, Option<Uuid>, Option<Uuid>)> =
        sqlx::query_as(
            "SELECT id, title, description, hero_guide_uuid, opportunities_guide_uuid, leadership_guide_uuid, who_we_are_guide_uuid, news_guide_uuid FROM about LIMIT 1",
        )
        .fetch_optional(pool)
        .await?;

    let Some((about_id, title, description, hero, opp_guide, lead_guide, who_guide, news_guide)) = row else {
        return Ok(None);
    };

    let opportunities = opportunities_json(
        pool,
        "about_opportunities",
        "about_opportunity_items",
        "about_id",
        about_id,
    )
    .await?;

    let lead_row: Option<(i32, Option<Uuid>, String, String)> = sqlx::query_as(
        "SELECT id, logo_uuid, title, description FROM about_leadership WHERE about_id = $1 LIMIT 1",
    )
    .bind(about_id)
    .fetch_optional(pool)
    .await?;

    let leadership = if let Some((lead_id, logo, l_title, l_desc)) = lead_row {
        let items: Vec<(Option<Uuid>, String)> = sqlx::query_as(
            "SELECT icon_uuid, text FROM about_leadership_items WHERE leadership_id = $1 ORDER BY id",
        )
        .bind(lead_id)
        .fetch_all(pool)
        .await?;

        serde_json::json!({
            "title": l_title,
            "description": l_desc,
            "logo": uuid_str(logo),
            "items": items.into_iter().map(|(icon, text)| serde_json::json!({ "text": text, "icon": uuid_str(icon) })).collect::<Vec<_>>(),
        })
    } else {
        serde_json::json!({ "title": "", "description": "", "logo": null, "items": [] })
    };

    let who_rows: Vec<(String, String, Option<Uuid>)> = sqlx::query_as(
        "SELECT title, description, image_uuid FROM about_who_we_are WHERE about_id = $1 ORDER BY id",
    )
    .bind(about_id)
    .fetch_all(pool)
    .await?;

    let who_we_are: Vec<_> = who_rows
        .into_iter()
        .map(|(title, description, image)| {
            serde_json::json!({ "title": title, "description": description, "image": uuid_str(image) })
        })
        .collect();

    let news_row: Option<(i32, String)> =
        sqlx::query_as("SELECT id, title FROM about_news WHERE about_id = $1 LIMIT 1")
            .bind(about_id)
            .fetch_optional(pool)
            .await?;

    let news = if let Some((news_id, n_title)) = news_row {
        let items: Vec<(Option<Uuid>, String)> = sqlx::query_as(
            "SELECT icon_uuid, text FROM about_news_items WHERE news_id = $1 ORDER BY id",
        )
        .bind(news_id)
        .fetch_all(pool)
        .await?;

        serde_json::json!({
            "title": n_title,
            "items": items.into_iter().map(|(icon, text)| serde_json::json!({ "text": text, "icon": uuid_str(icon) })).collect::<Vec<_>>(),
        })
    } else {
        serde_json::json!({ "title": "", "items": [] })
    };

    Ok(Some(serde_json::json!({
        "title": title,
        "description": description,
        "heroGuide": uuid_str(hero),
        "opportunitiesGuide": uuid_str(opp_guide),
        "leadershipGuide": uuid_str(lead_guide),
        "whoWeAreGuide": uuid_str(who_guide),
        "newsGuide": uuid_str(news_guide),
        "opportunities": opportunities,
        "leadership": leadership,
        "whoWeAre": who_we_are,
        "news": news,
    })))
}

async fn build_guests_data(pool: &PgPool) -> Result<Option<serde_json::Value>, sqlx::Error> {
    let row: Option<(i32, String, Option<Uuid>, Option<Uuid>, Option<Uuid>, Option<Uuid>, Option<Uuid>)> =
        sqlx::query_as(
            "SELECT id, title, hero_guide_uuid, opportunities_guide_uuid, interaction_cards_guide_uuid, search_promo_guide_uuid, additional_services_guide_uuid FROM guests LIMIT 1",
        )
        .fetch_optional(pool)
        .await?;

    let Some((guests_id, title, hero, opp_guide, cards_guide, promo_guide, services_guide)) = row else {
        return Ok(None);
    };

    let opportunities = opportunities_json(
        pool,
        "guests_opportunities",
        "guests_opportunity_items",
        "guests_id",
        guests_id,
    )
    .await?;

    let cards: Vec<(Option<Uuid>, String, String, String, String)> = sqlx::query_as(
        "SELECT icon_uuid, title, text, button_text, link FROM guests_interaction_cards WHERE guests_id = $1 ORDER BY id",
    )
    .bind(guests_id)
    .fetch_all(pool)
    .await?;

    let interaction_cards: Vec<_> = cards
        .into_iter()
        .map(|(icon, title, text, button_text, link)| {
            serde_json::json!({
                "title": title,
                "text": text,
                "buttonText": button_text,
                "link": link,
                "icon": uuid_str(icon),
            })
        })
        .collect();

    let promo_row: Option<(String, String)> = sqlx::query_as(
        "SELECT title, description FROM guests_search_promo WHERE guests_id = $1 LIMIT 1",
    )
    .bind(guests_id)
    .fetch_optional(pool)
    .await?;

    let search_promo = match promo_row {
        Some((p_title, p_desc)) => serde_json::json!({ "title": p_title, "description": p_desc }),
        None => serde_json::json!({ "title": "", "description": "" }),
    };

    let services: Vec<(Option<Uuid>, String)> = sqlx::query_as(
        "SELECT icon_uuid, text FROM guests_additional_services WHERE guests_id = $1 ORDER BY id",
    )
    .bind(guests_id)
    .fetch_all(pool)
    .await?;

    let additional_services: Vec<_> = services
        .into_iter()
        .map(|(icon, text)| serde_json::json!({ "text": text, "icon": uuid_str(icon) }))
        .collect();

    Ok(Some(serde_json::json!({
        "title": title,
        "heroGuide": uuid_str(hero),
        "opportunitiesGuide": uuid_str(opp_guide),
        "interactionCardsGuide": uuid_str(cards_guide),
        "searchPromoGuide": uuid_str(promo_guide),
        "additionalServicesGuide": uuid_str(services_guide),
        "opportunities": opportunities,
        "interactionCards": interaction_cards,
        "searchPromo": search_promo,
        "additionalServices": additional_services,
    })))
}

async fn build_platforms_data(pool: &PgPool) -> Result<Option<serde_json::Value>, sqlx::Error> {
    let row: Option<(i32, String, String, Option<Uuid>, Option<Uuid>, Option<Uuid>)> = sqlx::query_as(
        "SELECT id, title, description, hero_guide_uuid, opportunities_guide_uuid, tools_guide_uuid FROM platforms LIMIT 1",
    )
    .fetch_optional(pool)
    .await?;

    let Some((platforms_id, title, description, hero, opp_guide, tools_guide)) = row else {
        return Ok(None);
    };

    let opp_rows: Vec<(i32, Option<Uuid>, String, String, String)> = sqlx::query_as(
        "SELECT id, icon_uuid, title, link, button_text FROM platforms_opportunities WHERE platforms_id = $1 ORDER BY id",
    )
    .bind(platforms_id)
    .fetch_all(pool)
    .await?;

    let mut opportunities = Vec::new();

    for (opp_id, icon, o_title, link, button_text) in opp_rows {
        let items: Vec<String> = sqlx::query_scalar(
            "SELECT item_text FROM platforms_opportunity_items WHERE opportunity_id = $1 ORDER BY id",
        )
        .bind(opp_id)
        .fetch_all(pool)
        .await?;

        opportunities.push(serde_json::json!({
            "title": o_title,
            "icon": uuid_str(icon),
            "items": items.into_iter().map(|t| serde_json::json!({ "text": t })).collect::<Vec<_>>(),
            "link": link,
            "buttonText": button_text,
        }));
    }

    let tools_row: Option<(i32, Option<Uuid>, String)> = sqlx::query_as(
        "SELECT id, logo_uuid, title FROM platforms_tools WHERE platforms_id = $1 LIMIT 1",
    )
    .bind(platforms_id)
    .fetch_optional(pool)
    .await?;

    let tools_and_services = if let Some((tools_id, logo, t_title)) = tools_row {
        let items: Vec<(String, String)> = sqlx::query_as(
            "SELECT title, text FROM platforms_tools_items WHERE tools_id = $1 ORDER BY id",
        )
        .bind(tools_id)
        .fetch_all(pool)
        .await?;

        serde_json::json!({
            "title": t_title,
            "logo": uuid_str(logo),
            "items": items.into_iter().map(|(title, text)| serde_json::json!({ "title": title, "text": text })).collect::<Vec<_>>(),
        })
    } else {
        serde_json::json!({ "title": "", "logo": null, "items": [] })
    };

    Ok(Some(serde_json::json!({
        "title": title,
        "description": description,
        "heroGuide": uuid_str(hero),
        "opportunitiesGuide": uuid_str(opp_guide),
        "toolsGuide": uuid_str(tools_guide),
        "opportunities": opportunities,
        "toolsAndServices": tools_and_services,
    })))
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv::from_path(std::path::Path::new("server/.env")).ok();
    dotenv::dotenv().ok();

    let args: Vec<String> = env::args().collect();
    let dry_run = args.iter().any(|a| a == "--dry-run");

    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
        let user = env::var("POSTGRES_USER").unwrap_or_else(|_| "postgres".to_string());
        let pass = env::var("POSTGRES_PASSWORD").unwrap_or_else(|_| "postgres".to_string());
        let host = env::var("POSTGRES_HOST").unwrap_or_else(|_| "localhost".to_string());
        let port = env::var("POSTGRES_PORT").unwrap_or_else(|_| "5432".to_string());
        let db = env::var("POSTGRES_DB").unwrap_or_else(|_| "guest_place".to_string());
        format!("postgres://{}:{}@{}:{}/{}", user, pass, host, port, db)
    });

    println!("🔧 Connecting to database: {}", database_url);
    let pool = PgPoolOptions::new().max_connections(5).connect(&database_url).await?;

    println!("⚡ Applying database migrations...");
    sqlx::migrate!().run(&pool).await?;

    println!(
        "{} Migrating About/Guests/Platforms into Schema Builder singleton schemas{}\n",
        if dry_run { "🔍" } else { "🚀" },
        if dry_run { " (dry run)" } else { "" }
    );

    // About
    if let Some(data) = build_about_data(&pool).await? {
        println!("  ✓ about: found legacy data");

        if !dry_run {
            let schema_id = upsert_schema(&pool, "О платформе", "about", about_schema_fields()).await?;
            upsert_entry(&pool, schema_id, "about", data).await?;
            println!("    → migrated into content_schemas/content_entries (slug: about)");
        }
    } else {
        println!("  – about: no legacy row found, nothing to migrate");
    }

    // Guests
    if let Some(data) = build_guests_data(&pool).await? {
        println!("  ✓ guests: found legacy data");

        if !dry_run {
            let schema_id = upsert_schema(&pool, "Гостям", "guests", guests_schema_fields()).await?;
            upsert_entry(&pool, schema_id, "guests", data).await?;
            println!("    → migrated into content_schemas/content_entries (slug: guests)");
        }
    } else {
        println!("  – guests: no legacy row found, nothing to migrate");
    }

    // Platforms
    if let Some(data) = build_platforms_data(&pool).await? {
        println!("  ✓ platforms: found legacy data");

        if !dry_run {
            let schema_id = upsert_schema(&pool, "Площадкам", "platforms", platforms_schema_fields()).await?;
            upsert_entry(&pool, schema_id, "platforms", data).await?;
            println!("    → migrated into content_schemas/content_entries (slug: platforms)");
        }
    } else {
        println!("  – platforms: no legacy row found, nothing to migrate");
    }

    if dry_run {
        println!("\nRe-run without --dry-run to apply.");
    } else {
        println!("\nDone. Legacy tables/routes/MFEs are untouched — remove them in a follow-up once this is verified.");
    }

    Ok(())
}
