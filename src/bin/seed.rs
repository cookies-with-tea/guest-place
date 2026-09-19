use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHasher,
};
use chrono::{Duration, Utc};
use rand::Rng;
use serde_json::json;
use sqlx::postgres::PgPoolOptions;
use std::env;
use uuid::Uuid;

fn hash_password(password: &str) -> String {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    argon2
        .hash_password(password.as_bytes(), &salt)
        .expect("Failed to hash password")
        .to_string()
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv::dotenv().ok();

    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
        let user = env::var("POSTGRES_USER").unwrap_or_else(|_| "postgres".to_string());
        let pass = env::var("POSTGRES_PASSWORD").unwrap_or_else(|_| "postgres".to_string());
        let host = env::var("POSTGRES_HOST").unwrap_or_else(|_| "localhost".to_string());
        let port = env::var("POSTGRES_PORT").unwrap_or_else(|_| "5432".to_string());
        let db = env::var("POSTGRES_DB").unwrap_or_else(|_| "guest_place".to_string());
        format!("postgres://{}:{}@{}:{}/{}", user, pass, host, port, db)
    });

    println!("🌱 Connecting to database: {}", database_url);
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    println!("🚀 Starting Guest Place Seed Generator...\n");

    let mut rng = rand::thread_rng();
    let hashed_pw = hash_password("password123");

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. Seed Users (55+ users)
    // ─────────────────────────────────────────────────────────────────────────────
    println!("👤 Seeding 55+ users into `guest_user`...");

    let first_names_ru = [
        "Иван", "Алексей", "Михаил", "Дмитрий", "Сергей", "Андрей", "Артём", "Максим",
        "Анна", "Елена", "Ольга", "Татьяна", "Мария", "Екатерина", "София", "Полина",
    ];
    let last_names_ru = [
        "Иванов", "Смирнов", "Кузнецов", "Попов", "Васильев", "Петров", "Соколов", "Михайлов",
        "Новиков", "Фёдоров", "Морозов", "Волков", "Алексеев", "Лебедев", "Семёнов", "Егоров",
    ];
    let cities = ["Москва", "Санкт-Петербург", "Казань", "Сочи", "Екатеринбург", "Новосибирск", "Нижний Новгород"];

    let mut user_uuids = Vec::new();

    for i in 1..=55 {
        let fn_idx = rng.gen_range(0..first_names_ru.len());
        let ln_idx = rng.gen_range(0..last_names_ru.len());
        let city_idx = rng.gen_range(0..cities.len());
        let first = first_names_ru[fn_idx];
        let last = last_names_ru[ln_idx];
        let city = cities[city_idx];
        let email = format!("user{}@guestplace.local", i);
        let phone = format!("+7 (9{:02}) {:03}-{:02}-{:02}", rng.gen_range(10..99), rng.gen_range(100..999), rng.gen_range(10..99), rng.gen_range(10..99));
        let role = if i <= 3 { "admin" } else { "user" };
        let status = if i % 15 == 0 { "inactive" } else if i % 8 == 0 { "in_moderation" } else { "active" };
        let gender = if fn_idx < 8 { "male" } else { "female" };
        let birth_year = rng.gen_range(1980..2004);
        let birth_date = chrono::NaiveDate::from_ymd_opt(birth_year, rng.gen_range(1..=12), rng.gen_range(1..=28));

        let user_uuid = Uuid::new_v4();
        let query = format!(
            "INSERT INTO guest_user (uuid, first_name, last_name, email, phone, role, status, gender, city, birth_date, password_hash, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, '{}'::user_role, '{}'::user_status, $6, $7, $8, $9, $10, $11)
             ON CONFLICT (email) DO UPDATE SET updated_at = NOW()",
            role, status
        );

        let created_at = Utc::now() - Duration::days(rng.gen_range(1..180));

        let _ = sqlx::query(&query)
            .bind(user_uuid)
            .bind(first)
            .bind(last)
            .bind(&email)
            .bind(&phone)
            .bind(gender)
            .bind(city)
            .bind(birth_date)
            .bind(&hashed_pw)
            .bind(created_at)
            .bind(created_at)
            .execute(&pool)
            .await;

        user_uuids.push(user_uuid);
    }
    println!("  ✓ 55 users seeded successfully.");

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. Seed Media Library (18 items)
    // ─────────────────────────────────────────────────────────────────────────────
    println!("🖼️  Seeding media items into `media`...");

    let sample_media = [
        ("loft-main-hall", "png", "Лофт Главный Зал", "Просторный зал с панорамными окнами", "venues", 1920, 1080, 245000, "LEHV6nWB2yk8pyo0adR*.7kCMdnj", "#2c3e50"),
        ("rooftop-terrace", "webp", "Терраса на крыше", "Вид на исторический центр города", "venues", 2048, 1152, 184000, "L6PZfSi_.AyE_3t7t7R**0o#DgR4", "#34495e"),
        ("conference-room", "jpg", "Конференц-зал А", "Зал с мультимедийным оборудованием", "venues", 1600, 900, 153000, "L9AB:e00~q_3_3%M%Mof-;D%RjM{", "#7f8c8d"),
        ("avatar-ivan", "webp", "Аватар Иван", "Фотография профиля администратора", "avatars", 512, 512, 34000, "LGF5]+Yk^6#M@-5c,1J5@[Fe.7bH", "#4f46e5"),
        ("avatar-elena", "webp", "Аватар Елена", "Фотография профиля менеджера", "avatars", 512, 512, 31000, "L8H2xGof00ay~qj[00j[4nay-;ay", "#ec4899"),
        ("contract-template", "pdf", "Шаблон договора аренды", "Типовой договор бронирования", "documents", 0, 0, 89000, "", "#0f172a"),
        ("price-list-2026", "pdf", "Прайс-лист услуг 2026", "Официальные тарифы", "documents", 0, 0, 115000, "", "#0f172a"),
        ("banquet-setup", "webp", "Банкетная рассадка", "Оформление праздничного стола", "venues", 1920, 1280, 312000, "LKO2?2%2Tw=w]~RjWXof.AyE-;WB", "#d97706"),
        ("lounge-zone", "webp", "Лаунж-зона", "Мягкая мебель и приглушённый свет", "venues", 1800, 1200, 260000, "LPKn3qxuofof~qayayof?bt7Rjay", "#059669"),
        ("sound-system-spec", "pdf", "Спецификация звука", "Список звуковой аппаратуры", "documents", 0, 0, 45000, "", "#0f172a"),
    ];

    let mut media_uuids = Vec::new();

    for (name, ext, title, alt, cat, w, h, size, blur, col) in sample_media {
        let m_uuid = Uuid::new_v4();
        let url = format!("/uploads/{}.{}", name, ext);
        let m_type = if ext == "pdf" { "other" } else { "image" };
        let tags = vec![cat.to_string(), ext.to_string(), "seed".to_string()];

        let q = format!(
            "INSERT INTO media (uuid, media_type, url, name, extension, title, alt, category, tags, size_bytes, width, height, blurhash, dominant_color, source)
             VALUES ($1, '{}'::media_type, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'seed')
             ON CONFLICT (uuid) DO NOTHING",
            m_type
        );

        let _ = sqlx::query(&q)
            .bind(m_uuid)
            .bind(&url)
            .bind(name)
            .bind(ext)
            .bind(title)
            .bind(alt)
            .bind(cat)
            .bind(&tags)
            .bind(size as i64)
            .bind(if w > 0 { Some(w) } else { None })
            .bind(if h > 0 { Some(h) } else { None })
            .bind(if !blur.is_empty() { Some(blur) } else { None })
            .bind(col)
            .execute(&pool)
            .await;

        media_uuids.push(m_uuid);
    }
    println!("  ✓ 10 media items seeded.");

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. Seed Content Schemas & Entries
    // ─────────────────────────────────────────────────────────────────────────────
    println!("📑 Seeding Content Schemas & Entries...");

    let blog_schema_id = Uuid::new_v4();
    let faq_schema_id = Uuid::new_v4();

    let blog_fields = json!([
        { "name": "title", "label": "Заголовок", "fieldType": "text", "required": true },
        { "name": "summary", "label": "Краткое описание", "fieldType": "text", "required": false },
        { "name": "content", "label": "Текст статьи", "fieldType": "rich_text", "required": true },
        { "name": "featured", "label": "На главной", "fieldType": "boolean", "required": false },
        { "name": "views", "label": "Просмотры", "fieldType": "number", "required": false }
    ]);

    let faq_fields = json!([
        { "name": "question", "label": "Вопрос", "fieldType": "text", "required": true },
        { "name": "answer", "label": "Ответ", "fieldType": "rich_text", "required": true },
        { "name": "order", "label": "Порядок", "fieldType": "number", "required": false }
    ]);

    let _ = sqlx::query(
        "INSERT INTO content_schemas (id, name, slug, fields, created_at, updated_at)
         VALUES ($1, 'Блог и Новости', 'blog', $2, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET fields = $2, updated_at = NOW()"
    )
    .bind(blog_schema_id)
    .bind(&blog_fields)
    .execute(&pool)
    .await;

    let _ = sqlx::query(
        "INSERT INTO content_schemas (id, name, slug, fields, created_at, updated_at)
         VALUES ($1, 'Частые вопросы (FAQ)', 'faq', $2, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET fields = $2, updated_at = NOW()"
    )
    .bind(faq_schema_id)
    .bind(&faq_fields)
    .execute(&pool)
    .await;

    // Fetch the actual IDs in case of ON CONFLICT DO UPDATE
    let real_blog_id: Uuid = sqlx::query_scalar("SELECT id FROM content_schemas WHERE slug = 'blog'").fetch_one(&pool).await?;
    let real_faq_id: Uuid = sqlx::query_scalar("SELECT id FROM content_schemas WHERE slug = 'faq'").fetch_one(&pool).await?;

    let sample_articles = [
        ("kak-vybrat-ploshadku", "Как выбрать идеальную площадку для свадьбы", "Советы экспертов по рассадке, освещению и зонированию банкетных пространств.", 1240),
        ("trendy-event-2026", "Главные тренды мероприятий 2026 года", "Иммерсивные технологии, экологичный кейтеринг и персонализированные зоны комфорта для гостей.", 890),
        ("tehnicheskiy-rayder", "Что нужно знать о техническом райдере площадки", "Звуковое и световое оборудование, мощность электрической сети и акустика помещения.", 450),
        ("korporativ-na-kryshe", "Организация корпоратива на открытой крыше", "Пошаговый план подготовки и страховка от капризов переменчивой погоды.", 1680),
        ("novye-vozmozhnosti-guestplace", "Новые возможности экосистемы Guest Place", "Мягкая блокировка редактирования, SSE-уведомления и высокая производительность.", 2100),
    ];

    for (slug, title, summary, views) in sample_articles {
        let entry_id = Uuid::new_v4();
        let data = json!({
            "title": title,
            "summary": summary,
            "content": format!("<p>{}</p><p>Подробное руководство и практические рекомендации от ведущих организаторов индустрии гостеприимства.</p>", summary),
            "featured": true,
            "views": views
        });

        let _ = sqlx::query(
            "INSERT INTO content_entries (id, schema_id, slug, data, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, 'published', NOW(), NOW())
             ON CONFLICT (schema_id, slug) DO UPDATE SET data = $4, status = 'published', updated_at = NOW()"
        )
        .bind(entry_id)
        .bind(real_blog_id)
        .bind(slug)
        .bind(&data)
        .execute(&pool)
        .await;
    }

    let sample_faqs = [
        ("kak-zabronirovat", "Как оформить предварительное бронирование?", "<p>Выберите подходящую площадку в каталоге, укажите дату и нажмите кнопку «Забронировать». Наш менеджер свяжется с вами в течение 15 минут.</p>", 1),
        ("otmena-bronirovaniya", "Каковы условия отмены или переноса даты?", "<p>Бесплатная отмена возможна за 14 дней до согласованной даты мероприятия с полным возвратом депозита.</p>", 2),
        ("svoy-keytering", "Можно ли пригласить собственный кейтеринг?", "<p>Да, на большинстве площадок разрешён собственный кейтеринг при соблюдении регламента площадки.</p>", 3),
    ];

    for (slug, q, a, order) in sample_faqs {
        let entry_id = Uuid::new_v4();
        let data = json!({
            "question": q,
            "answer": a,
            "order": order
        });

        let _ = sqlx::query(
            "INSERT INTO content_entries (id, schema_id, slug, data, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, 'published', NOW(), NOW())
             ON CONFLICT (schema_id, slug) DO UPDATE SET data = $4, status = 'published', updated_at = NOW()"
        )
        .bind(entry_id)
        .bind(real_faq_id)
        .bind(slug)
        .bind(&data)
        .execute(&pool)
        .await;
    }
    println!("  ✓ Schemas & content entries seeded.");

    // ─────────────────────────────────────────────────────────────────────────────
    // 4. Seed Analytics Sessions & Events (Past 30 Days)
    // ─────────────────────────────────────────────────────────────────────────────
    println!("📊 Seeding Analytics events (sessions & events across past 30 days)...");

    let referrers = ["https://google.com", "https://yandex.ru", "https://t.me/guestplace", "direct", "https://vk.com"];
    let event_types = ["view", "click", "scroll", "conversion"];
    let paths = ["/", "/about", "/guests", "/platforms", "/catalog", "/contact"];

    let mut session_ids = Vec::new();

    for _ in 0..75 {
        let sess_id = Uuid::new_v4();
        let visitor_id = Uuid::new_v4();
        let days_ago = rng.gen_range(0..30);
        let hours_ago = rng.gen_range(0..24);
        let started_at = Utc::now() - Duration::days(days_ago) - Duration::hours(hours_ago);
        let duration = rng.gen_range(20..1200);
        let ended_at = started_at + Duration::seconds(duration as i64);
        let ref_idx = rng.gen_range(0..referrers.len());
        let referer = referrers[ref_idx];
        let ip = format!("192.168.{}.{}", rng.gen_range(1..254), rng.gen_range(1..254));

        let _ = sqlx::query(
            "INSERT INTO analytics_sessions (id, visitor_id, ip, user_agent, referer, started_at, ended_at, duration_seconds)
             VALUES ($1, $2, $3, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', $4, $5, $6, $7)"
        )
        .bind(sess_id)
        .bind(visitor_id)
        .bind(&ip)
        .bind(referer)
        .bind(started_at)
        .bind(ended_at)
        .bind(duration)
        .execute(&pool)
        .await;

        session_ids.push((sess_id, started_at));
    }

    let mut event_count = 0;
    for (sess_id, started_at) in &session_ids {
        let events_in_session = rng.gen_range(3..12);
        for j in 0..events_in_session {
            let ev_id = Uuid::new_v4();
            let ev_type = event_types[rng.gen_range(0..event_types.len())];
            let path = paths[rng.gen_range(0..paths.len())];
            let ev_time = *started_at + Duration::seconds((j * rng.gen_range(5..40)) as i64);

            let props = json!({
                "page": path,
                "browser": "Chrome",
                "viewport": "1920x1080",
                "button": if ev_type == "click" { "book_button" } else { "none" }
            });

            let _ = sqlx::query(
                "INSERT INTO analytics_events (id, session_id, event_type, path, properties, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6)"
            )
            .bind(ev_id)
            .bind(sess_id)
            .bind(ev_type)
            .bind(path)
            .bind(&props)
            .bind(ev_time)
            .execute(&pool)
            .await;

            event_count += 1;
        }
    }
    println!("  ✓ 75 sessions and {} analytics events seeded across past 30 days.", event_count);

    println!("\n✨ DATABASE SEEDING COMPLETED SUCCESSFULLY! ✨");
    Ok(())
}
