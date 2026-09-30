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
    dotenv::from_path(std::path::Path::new("server/.env")).ok();
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

    println!("⚡ Applying database migrations...");
    sqlx::migrate!().run(&pool).await?;

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
    let venues_schema_id = Uuid::new_v4();

    let blog_fields = json!([
        { "name": "title", "label": "Заголовок", "field_type": "text", "required": true },
        { "name": "summary", "label": "Краткое описание", "field_type": "text", "required": false },
        { "name": "content", "label": "Текст статьи", "field_type": "rich_text", "required": true },
        { "name": "featured", "label": "На главной", "field_type": "boolean", "required": false },
        { "name": "views", "label": "Просмотры", "field_type": "number", "required": false }
    ]);

    let faq_fields = json!([
        { "name": "question", "label": "Вопрос", "field_type": "text", "required": true },
        { "name": "answer", "label": "Ответ", "field_type": "rich_text", "required": true },
        { "name": "order", "label": "Порядок", "field_type": "number", "required": false }
    ]);

    let venues_fields = json!([
        { "name": "title", "label": "Название площадки", "field_type": "text", "required": true },
        { "name": "address", "label": "Адрес", "field_type": "text", "required": true },
        { "name": "metro", "label": "Метро", "field_type": "text", "required": false },
        { "name": "phone", "label": "Телефон", "field_type": "text", "required": false },
        { "name": "average_check", "label": "Средний чек (руб)", "field_type": "number", "required": false },
        { "name": "banquet_price_from", "label": "Банкетное меню от (руб)", "field_type": "number", "required": false },
        { "name": "rent_price_hour", "label": "Аренда от (руб/час)", "field_type": "number", "required": false },
        { "name": "halls_count", "label": "Количество залов", "field_type": "number", "required": false },
        { "name": "capacity_banquet", "label": "Вместимость банкет", "field_type": "text", "required": false },
        { "name": "capacity_buffet", "label": "Вместимость фуршет", "field_type": "text", "required": false },
        { "name": "capacity_theater", "label": "Вместимость конференция", "field_type": "text", "required": false },
        { "name": "area_sqm", "label": "Площадь кв.м", "field_type": "text", "required": false },
        { "name": "working_hours", "label": "Время работы", "field_type": "text", "required": false },
        { "name": "corkage_fee", "label": "Пробковый сбор", "field_type": "text", "required": false },
        { "name": "venue_types", "label": "Типы места", "field_type": "text", "required": false },
        { "name": "features", "label": "Особенности", "field_type": "text", "required": false },
        { "name": "cuisines", "label": "Кухня", "field_type": "text", "required": false },
        { "name": "services", "label": "Услуги", "field_type": "text", "required": false },
        { "name": "description", "label": "Подробное описание", "field_type": "rich_text", "required": false }
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

    let _ = sqlx::query(
        "INSERT INTO content_schemas (id, name, slug, fields, created_at, updated_at)
         VALUES ($1, 'Площадки (Venues)', 'venues', $2, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET fields = $2, updated_at = NOW()"
    )
    .bind(venues_schema_id)
    .bind(&venues_fields)
    .execute(&pool)
    .await;

    // Fetch the actual IDs in case of ON CONFLICT DO UPDATE
    let real_blog_id: Uuid = sqlx::query_scalar("SELECT id FROM content_schemas WHERE slug = 'blog'").fetch_one(&pool).await?;
    let real_faq_id: Uuid = sqlx::query_scalar("SELECT id FROM content_schemas WHERE slug = 'faq'").fetch_one(&pool).await?;
    let real_venues_id: Uuid = sqlx::query_scalar("SELECT id FROM content_schemas WHERE slug = 'venues'").fetch_one(&pool).await?;

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

    let sample_venues = [
        (
            "loft-forest-hall",
            json!({
                "title": "Банкетный зал лофт Форест Холл Banquet hall Loft Forest Hall",
                "address": "г. Москва Волоколамское шоссе, д.13",
                "metro": "Сокольники (5 мин пешком)",
                "phone": "+7 (495) 125 25 25",
                "average_check": 2500,
                "banquet_price_from": 4000,
                "rent_price_hour": 3000,
                "halls_count": 3,
                "capacity_banquet": "20/40/60",
                "capacity_buffet": "40/80/120",
                "capacity_theater": "60/100/140",
                "area_sqm": "50/100/120",
                "working_hours": "Пн - Чт: с 12:00 до 22:00, Пт - Вс: с 10:00 до 24:00",
                "corkage_fee": "есть",
                "venue_types": "Банкетный зал, Загородный ресторан, Ресторан для Банкета, Ресторан при отеле, Бизнес-площадка",
                "features": "Летняя веранда, Парковая зона, удобный подъезд",
                "cuisines": "Европейская, Русская",
                "services": "Wi-Fi, Бизнес-ланч, Выездная регистрация, Банкеты, Анимация, Тимбилдинг, Конференции, Презентации, Номерной фонд, Детская комната, Детское меню, Детская площадка, Живая музыка",
                "description": "<p>У Вас намечается банкет? Отлично! Приглашаем отметить ваше торжество в нашем загородном клубе на берегу Москва-реки. Мы уверены, что Вам понравится.</p><p>Загородный клуб — это особая атмосфера, со своей энергетикой и своим миром. Попадая на территорию комплекса, первое, что бросается в глаза, это единый стиль в котором выдержана вся инфраструктура.</p>"
            })
        ),
        (
            "the-led",
            json!({
                "title": "Ресторан с банкетным залом «The Лед»",
                "address": "г. Москва Сокольнический вал, д.1Б",
                "metro": "Сокольники (5 мин пешком)",
                "phone": "+7 (495) 987 65 43",
                "average_check": 3000,
                "banquet_price_from": 4500,
                "rent_price_hour": 3500,
                "halls_count": 2,
                "capacity_banquet": "35/100/150",
                "capacity_buffet": "50/120/180",
                "capacity_theater": "60/120/200",
                "area_sqm": "80/150",
                "working_hours": "Ежедневно с 11:00 до 23:00",
                "corkage_fee": "есть",
                "venue_types": "Ресторан с банкетным залом, Панорамный ресторан",
                "features": "Вид на парк, Летняя веранда, Собственная парковка",
                "cuisines": "Европейская, Итальянская",
                "services": "Wi-Fi, Живая музыка, Детская комната, Банкеты, Конференции",
                "description": "<p>Ресторан «The Лед» в Сокольниках — изысканная атмосфера, панорамные виды и безупречный сервис для вашего мероприятия.</p>"
            })
        )
    ];

    for (slug, data) in sample_venues {
        let entry_id = Uuid::new_v4();
        let _ = sqlx::query(
            "INSERT INTO content_entries (id, schema_id, slug, data, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, 'published', NOW(), NOW())
             ON CONFLICT (schema_id, slug) DO UPDATE SET data = $4, status = 'published', updated_at = NOW()"
        )
        .bind(entry_id)
        .bind(real_venues_id)
        .bind(slug)
        .bind(&data)
        .execute(&pool)
        .await;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 3.1. Seed Core Venues Table
    // ─────────────────────────────────────────────────────────────────────────────
    println!("🏰 Seeding core Venues into `venues` table...");
    let forest_halls = json!([
        { "id": "1", "name": "1 Атриум", "areaSqm": 50, "capacityBanquet": 25, "capacityBuffet": 40, "capacityTheater": 40, "extraDetails": "Панорамные окна" },
        { "id": "2", "name": "2 Сафари", "areaSqm": 100, "capacityBanquet": 50, "capacityBuffet": 50, "capacityTheater": 50, "extraDetails": "Сцена и бар" },
        { "id": "3", "name": "3 Королевский", "areaSqm": 200, "capacityBanquet": 50, "capacityBuffet": 50, "capacityTheater": 50, "extraDetails": "VIP-зона" }
    ]);
    let forest_rooms = json!([
        { "id": "1", "roomType": "Одноместный", "placement": "Одноместное", "priceRub": 2500, "extraInfo": "Стоимость доп.места + 1000 р." },
        { "id": "2", "roomType": "Двухместный номер с 2 отдельными кроватями", "placement": "Двухместное", "priceRub": 5000 },
        { "id": "3", "roomType": "Двухместный номер с 1 кроватью", "placement": "Двухместное", "priceRub": 5500, "extraInfo": "Дополнительно детская кроватка" }
    ]);
    let forest_photos = vec![
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80".to_string(),
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80".to_string(),
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80".to_string(),
    ];
    let forest_faq = json!([
        { "id": "1", "question": "Каков процент за обслуживание банкета?", "answer": "Сервисный сбор составляет 10% от суммы банкетного меню." },
        { "id": "2", "question": "Можно ли привезти свой алкоголь?", "answer": "Да, действует пробковый сбор." },
        { "id": "3", "question": "До какого часа можно шуметь на открытой веранде?", "answer": "Музыкальное сопровождение на открытой веранде разрешено до 23:00, после чего праздник может продолжиться в закрытых залах." }
    ]);
    let forest_menu_photos = vec![
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80".to_string(),
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80".to_string(),
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80".to_string(),
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80".to_string(),
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80".to_string(),
    ];
    let forest_reviews = json!([
        {
            "id": "rev-1",
            "author": "Юлия",
            "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
            "date": "20.03.2022",
            "rating": 5,
            "text": "Очень красиво и стильное место! Сервис на высшем уровне. Все прозрачно, никаких непонятных доп. услуг нет, практически все включено в стоимость аренды. Шикарный ламповый звук, очень атмосферно. Пространство большое, бар удобный, бармены профессионалы своего дела! Рекомендую данный лофт. 10 из 10!!"
        },
        {
            "id": "rev-2",
            "author": "Михаил",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
            "date": "15.04.2022",
            "rating": 5,
            "text": "Проводили здесь юбилей компании. Все гости в восторге от кухни и панорамных видов! Отдельное спасибо банкетному менеджеру за безупречную организацию тайминга."
        },
        {
            "id": "rev-3",
            "author": "Елена",
            "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
            "date": "02.05.2022",
            "rating": 5,
            "text": "Отличная летняя веранда и ухоженная территория парка. Свадебная фотосессия получилась потрясающей. Блюда на гриле заслуживают высшей оценки!"
        },
        {
            "id": "rev-4",
            "author": "Анна",
            "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80",
            "date": "18.06.2022",
            "rating": 5,
            "text": "Идеальная площадка для праздника на открытом воздухе и в зале одновременно. Профессиональный звук и свет сэкономили нам кучу времени на аренду аппаратуры."
        }
    ]);
    let forest_feed = json!([
        {
            "id": "feed-1",
            "author": "Банкетный зал Форест Холл",
            "authorAvatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
            "publishedAgo": "4 дня",
            "text": "Зимняя свадьба похожа на сказку. Пушистый снег на фотографиях, уютно оформленная площадка и романтичная атмосфера вечера при свечах.\n\nДекабрь уже подходит к концу, но впереди нас ждут январь и февраль с изобилием красивых дат!\n\nНапишите нам в Директ, чтобы узнать все детали и записаться на просмотр / Banquet hall Loft Forest Hall",
            "imageUrl": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
            "likesCount": 18,
            "isLiked": false
        },
        {
            "id": "feed-2",
            "author": "Банкетный зал Форест Холл",
            "authorAvatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
            "publishedAgo": "4 дня",
            "text": "Зимняя свадьба похожа на сказку. Пушистый снег на фотографиях, уютно оформленная площадка и романтичная атмосфера вечера при свечах.\n\nДекабрь уже подходит к концу, но впереди нас ждут январь и февраль с изобилием красивых дат!\n\nНапишите нам в Директ, чтобы узнать все детали и записаться на просмотр / Banquet hall Loft Forest Hall",
            "imageUrl": "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
            "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "likesCount": 24,
            "isLiked": false
        },
        {
            "id": "feed-3",
            "author": "Банкетный зал Форест Холл",
            "authorAvatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
            "publishedAgo": "1 неделю назад",
            "text": "Новое сезонное меню от нашего шеф-повара! Утиная грудка с ягодным соусом, фирменные стейки на открытом огне и нежнейшие десерты для ваших гостей.",
            "imageUrl": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
            "likesCount": 35,
            "isLiked": false
        }
    ]);
    let forest_pricing_table = json!({
        "categories": [
            { "label": "Средний чек", "value": "2 500 р.", "type": "merged" },
            { "label": "Стоимость банкетного меню от:", "value": "4 000 р.", "type": "merged" },
            { "label": "Стоимость фуршетного меню от:", "value": "1 200 р.", "type": "merged" },
            { "label": "Аренда / час. от:", "value": "3 000 р.", "type": "merged" },
            { "label": "Аренда площадки под мероприятие", "value": "пт-сб. 100 000 р. будни 80 000 р.", "type": "merged" },
            { "label": "Депозит (минимальная стоимость закрытия):", "largeHall": "200 000 р.", "smallHall": "120 000 р.", "allVenue": "300 000 р.", "type": "split" },
            { "label": "Что входит в депозит:", "value": "Еда, часть напитков", "type": "merged" },
            { "label": "Возможность своего алкоголя:", "value": "да", "type": "merged" },
            { "label": "Пробковый сбор:", "value": "от 300 р. за бутылку", "type": "merged" }
        ],
        "notes": [
            "Стоимость аренды может меняться в зависимости от сезона и дня недели.",
            "В декабре действуют специальные праздничные тарифы на закрытие зала.",
            "Бронирование даты подтверждается внесением задатка в размере 30%."
        ]
    });
    let forest_venue_types = vec![
        "Банкетный зал".to_string(), "Загородный ресторан".to_string(), "Ресторан для Банкета".to_string(),
        "Ресторан при отеле".to_string(), "Бизнес-площадка".to_string()
    ];
    let forest_features = vec!["Летняя веранда".to_string(), "Парковая зона".to_string(), "удобный подъезд".to_string()];
    let forest_cuisines = vec!["Европейская".to_string(), "Русская".to_string()];
    let forest_services = vec!["Wi-Fi".to_string(), "Бизнес-ланч".to_string(), "Банкеты".to_string(), "Номерной фонд".to_string()];
    let forest_equipment = vec!["Свет".to_string(), "Звук".to_string(), "микрофон".to_string(), "колонки".to_string(), "проектор".to_string()];

    let _ = sqlx::query(
        r#"
        INSERT INTO venues (
            slug, title, subtitle, description_html, phone, address, city,
            metro_station, metro_distance_minutes, metro_distance_text,
            average_check, banquet_price_from, rent_price_hour,
            corkage_fee_has, corkage_fee_desc, price_level, halls_count,
            capacity_banquet, capacity_buffet, capacity_theater, area_sqm,
            working_hours_weekdays, working_hours_weekends, rating_score, rating_reviews_count,
            venue_types, features, cuisines, services, parking, equipment,
            halls, rooms, gallery_photos, video_tour_url, has_online_tour, faq, feed,
            menu_photos, reviews, pricing_table, menu_url, rider_url, status
        ) VALUES (
            'loft-forest-hall', 'Банкетный зал лофт Форест Холл Banquet hall Loft Forest Hall',
            'Загородный клуб на берегу Москва-реки для идеальных свадеб и банкетов',
            '<p>У Вас намечается банкет? Отлично! Приглашаем отметить ваше торжество в нашем загородном клубе на берегу Москва-реки.</p>',
            '+7 (495) 125 25 25', 'г. Москва Волоколамское шоссе, д.13', 'Москва',
            'Сокольники', 5, '5 мин пешком',
            2500, 4000, 3000, true, 'есть', '$$$', 3,
            '20/40/60', '40/80/120', '60/100/140', '50/100/120',
            'Пн - Чт: с 12:00 до 22:00', 'Пт - Вс: с 10:00 до 24:00', 5.0, 4,
            $1, $2, $3, $4, 'на 5 А/М', $5,
            $6, $7, $8, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, $9, $10,
            $11, $12, $13, 'https://example.com/menu-forest-hall.pdf', 'https://example.com/rider-forest-hall.pdf', 'published'
        )
        ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title,
            subtitle = EXCLUDED.subtitle,
            description_html = EXCLUDED.description_html,
            halls = EXCLUDED.halls,
            rooms = EXCLUDED.rooms,
            gallery_photos = EXCLUDED.gallery_photos,
            faq = EXCLUDED.faq,
            feed = EXCLUDED.feed,
            menu_photos = EXCLUDED.menu_photos,
            reviews = EXCLUDED.reviews,
            pricing_table = EXCLUDED.pricing_table,
            menu_url = EXCLUDED.menu_url,
            rider_url = EXCLUDED.rider_url,
            updated_at = NOW()
        "#
    )
    .bind(&forest_venue_types)
    .bind(&forest_features)
    .bind(&forest_cuisines)
    .bind(&forest_services)
    .bind(&forest_equipment)
    .bind(&forest_halls)
    .bind(&forest_rooms)
    .bind(&forest_photos)
    .bind(&forest_faq)
    .bind(&forest_feed)
    .bind(&forest_menu_photos)
    .bind(&forest_reviews)
    .bind(&forest_pricing_table)
    .execute(&pool)
    .await;

    let _ = sqlx::query(
        r#"
        INSERT INTO venues (
            slug, title, subtitle, description_html, phone, address, city,
            metro_station, metro_distance_minutes, metro_distance_text,
            average_check, banquet_price_from, rent_price_hour,
            corkage_fee_has, corkage_fee_desc, price_level, halls_count,
            capacity_banquet, capacity_buffet, capacity_theater, area_sqm,
            working_hours_weekdays, working_hours_weekends, rating_score, rating_reviews_count,
            venue_types, features, cuisines, services, parking, equipment,
            halls, rooms, gallery_photos, status
        ) VALUES (
            'the-led', 'Ресторан с банкетным залом «The Лед»',
            'Панорамный ресторан в Сокольниках для незабываемых торжеств',
            '<p>Ресторан «The Лед» в Сокольниках — изысканная атмосфера и панорамные виды.</p>',
            '+7 (495) 987 65 43', 'г. Москва Сокольнический вал, д.1Б', 'Москва',
            'Сокольники', 5, '5 мин пешком',
            3000, 4500, 3500, true, 'есть', '$$$', 2,
            '35/100/150', '50/120/180', '60/120/200', '80/150',
            'Ежедневно с 11:00 до 23:00', 'Ежедневно с 11:00 до 23:00', 3.0, 23,
            $1, $2, $3, $4, 'Собственная парковка', $5,
            $6, $7, $8, 'published'
        )
        ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, updated_at = NOW()
        "#
    )
    .bind(&forest_venue_types)
    .bind(&forest_features)
    .bind(&forest_cuisines)
    .bind(&forest_services)
    .bind(&forest_equipment)
    .bind(&forest_halls)
    .bind(&forest_rooms)
    .bind(&forest_photos)
    .execute(&pool)
    .await?;
    println!("  ✓ Core venues seeded.");

    println!("🏰 Seeding extended catalog venues for pagination & filtering...");
    let mock_venues_list = vec![
        (
            "loft-river-side",
            "Лофт River Side на набережной",
            "Стильный двухуровневый лофт с видом на Москва-реку и открытой террасой",
            "<p>River Side — идеальное пространство для свадеб, вечеринок и презентаций на набережной.</p>",
            "+7 (495) 234 56 78", "г. Москва, Пречистенская наб., д. 15", "Москва",
            "Кропоткинская", 7, "7 мин пешком",
            3500, 4800, 4000, true, "от 350 р. бутылка", "$$$", 2,
            "40/90/140", "60/120/180", "80/140/200", "70/140",
            4.9, 38,
            vec!["Лофт".to_string(), "Банкетный зал".to_string()],
            vec!["У воды".to_string(), "Панорамный вид".to_string(), "Летняя веранда".to_string()],
            vec!["Европейская".to_string(), "Авторская".to_string()],
            vec!["Wi-Fi".to_string(), "Банкеты".to_string(), "Выездная регистрация".to_string()],
            vec!["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "crystal-ballroom",
            "Банкетный комплекс Crystal Ballroom",
            "Премиальный зал в Москва-Сити с панорамным остеклением и сценой",
            "<p>Роскошный банкетный комплекс с панорамным видом на столицу для статусных мероприятий.</p>",
            "+7 (495) 345 67 89", "г. Москва, Пресненская наб., д. 8, стр. 1", "Москва",
            "Деловой центр", 3, "3 мин пешком",
            6000, 8000, 7500, false, "нет", "$$$$", 3,
            "80/200/350", "120/300/500", "150/400/600", "150/300/600",
            4.9, 52,
            vec!["Банкетный зал".to_string(), "Бизнес-площадка".to_string()],
            vec!["Панорамный вид".to_string(), "Своя территория".to_string()],
            vec!["Европейская".to_string(), "Французская".to_string()],
            vec!["Wi-Fi".to_string(), "Бизнес-ланч".to_string(), "Банкеты".to_string(), "Анимация".to_string()],
            vec!["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "manor-kuskovo-park",
            "Усадьба Кусково Парк",
            "Историческая загородная резиденция в вековом парке у пруда",
            "<p>Кусково Парк — свадебная сказка на свежем воздухе среди вековых лип и живописных аллей.</p>",
            "+7 (495) 456 78 90", "г. Москва, ул. Юности, д. 2", "Москва",
            "Новогиреево", 12, "12 мин пешком",
            4000, 5000, 4500, true, "есть", "$$$", 2,
            "50/110/160", "70/150/220", "90/180/250", "90/180",
            4.7, 29,
            vec!["Загородный клуб".to_string(), "Банкетный зал".to_string()],
            vec!["Парковая зона".to_string(), "Своя территория".to_string(), "У воды".to_string()],
            vec!["Русская".to_string(), "Европейская".to_string(), "Кавказская".to_string()],
            vec!["Банкеты".to_string(), "Выездная регистрация".to_string(), "Номерной фонд".to_string()],
            vec!["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80".to_string()],
            false
        ),
        (
            "rooftop-skylight",
            "Панорамная веранда SkyLight",
            "Открытая крыша в самом центре Москвы с видом на кремлевские звезды",
            "<p>SkyLight — уютная веранда на крыше для камерных свадеб, дней рождения и романтичных закатов.</p>",
            "+7 (495) 567 89 01", "г. Москва, ул. Тверская, д. 22", "Москва",
            "Маяковская", 4, "4 мин пешком",
            3200, 4200, 3800, true, "есть", "$$$", 1,
            "30/60/90", "50/90/120", "60/100/140", "60/120",
            4.6, 19,
            vec!["Веранда".to_string(), "Ресторан".to_string()],
            vec!["Летняя веранда".to_string(), "Панорамный вид".to_string()],
            vec!["Итальянская".to_string(), "Европейская".to_string()],
            vec!["Wi-Fi".to_string(), "Банкеты".to_string()],
            vec!["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "veranda-silver-bor",
            "Шатёр и веранда Серебряный Бор",
            "Белоснежный шатёр на песчаном берегу в сосновом бору",
            "<p>Свадьба на природе в Серебряном Бору: собственный пирс, вековые сосны и свежий речной воздух.</p>",
            "+7 (495) 678 90 12", "г. Москва, 4-я линия Хорошёвского Серебряного Бора", "Москва",
            "Полежаевская", 15, "15 мин на транспорте",
            2800, 3800, 3200, true, "без сбора при заказе от 100 тыс.", "$$", 2,
            "60/130/200", "80/170/250", "100/200/300", "120/250",
            4.8, 41,
            vec!["Шатер".to_string(), "Веранда".to_string(), "Загородный клуб".to_string()],
            vec!["У воды".to_string(), "Парковая зона".to_string(), "Летняя веранда".to_string(), "Своя территория".to_string()],
            vec!["Европейская".to_string(), "Гриль / BBQ".to_string()],
            vec!["Банкеты".to_string(), "Анимация".to_string(), "Выездная регистрация".to_string()],
            vec!["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "loft-mansion-art",
            "Арт-особняк на Таганке",
            "Атмосферный кирпичный лофт XIX века с высокими потолками 6 метров",
            "<p>Исторический особняк с аутентичной кладкой, хрустальными люстрами и современным звуком.</p>",
            "+7 (495) 789 01 23", "г. Москва, ул. Гончарная, д. 7", "Москва",
            "Таганская", 5, "5 мин пешком",
            4500, 5500, 5000, false, "нет", "$$$", 2,
            "45/100/150", "65/130/180", "80/150/220", "80/160",
            4.7, 34,
            vec!["Лофт".to_string(), "Банкетный зал".to_string()],
            vec!["Своя территория".to_string(), "Панорамный вид".to_string()],
            vec!["Авторская".to_string(), "Европейская".to_string()],
            vec!["Wi-Fi".to_string(), "Тимбилдинг".to_string(), "Банкеты".to_string()],
            vec!["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "grand-hotel-hall",
            "Гранд Зал в отеле Монарх",
            "Пятизвездочный сервис, изысканный интерьер и номера для гостей",
            "<p>Идеальное решение для крупных торжеств: просторный зал без колонн и размещение гостей в номерах люкс.</p>",
            "+7 (495) 890 12 34", "г. Москва, Ленинградский пр-т, д. 31А, стр. 1", "Москва",
            "Динамо", 6, "6 мин пешком",
            5500, 7000, 6000, true, "есть", "$$$$", 3,
            "70/180/300", "100/250/400", "120/300/500", "140/320",
            5.0, 63,
            vec!["Отель".to_string(), "Банкетный зал".to_string()],
            vec!["Своя территория".to_string()],
            vec!["Европейская".to_string(), "Средиземноморская".to_string()],
            vec!["Wi-Fi".to_string(), "Номерной фонд".to_string(), "Банкеты".to_string(), "Бизнес-ланч".to_string()],
            vec!["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "white-loft-flacon",
            "Белый лофт на Флаконе",
            "Минималистичное светлое пространство в дизайн-квартале",
            "<p>Светлое чистое пространство с циклорамой и возможностью реализовать любую концепцию декора.</p>",
            "+7 (495) 901 23 45", "г. Москва, ул. Большая Новодмитровская, д. 36", "Москва",
            "Дмитровская", 7, "7 мин пешком",
            2200, 3200, 2500, true, "без сбора", "$$", 1,
            "30/70/100", "45/90/130", "60/110/150", "50/100",
            4.5, 17,
            vec!["Лофт".to_string()],
            vec!["Панорамный вид".to_string()],
            vec!["Фуршетное меню".to_string(), "Европейская".to_string()],
            vec!["Wi-Fi".to_string(), "Презентации".to_string(), "Банкеты".to_string()],
            vec!["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80".to_string()],
            false
        ),
        (
            "palace-tsaritsyno",
            "Дворцовый банкетный зал Царицыно",
            "Торжественная классика с лепниной и витражами рядом с парком",
            "<p>Величественный зал для грандиозных свадеб и юбилеев в шаговой доступности от музея-заповедника.</p>",
            "+7 (495) 012 34 56", "г. Москва, ул. Дольская, д. 1", "Москва",
            "Царицыно", 8, "8 мин пешком",
            3800, 4900, 4200, true, "есть", "$$$", 2,
            "60/140/220", "80/180/280", "100/220/350", "110/240",
            4.8, 45,
            vec!["Банкетный зал".to_string(), "Ресторан".to_string()],
            vec!["Парковая зона".to_string(), "Своя территория".to_string(), "Летняя веранда".to_string()],
            vec!["Русская".to_string(), "Европейская".to_string()],
            vec!["Банкеты".to_string(), "Выездная регистрация".to_string()],
            vec!["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "chalet-krylatskoe",
            "Шале Крылатские Холмы",
            "Альпийский уют из натурального бруса и каминный зал",
            "<p>Загородная атмосфера внутри Москвы: панорамный вид на холмы, открытый камин и блюда на открытом огне.</p>",
            "+7 (495) 123 98 76", "г. Москва, ул. Крылатская, д. 1", "Москва",
            "Крылатское", 10, "10 мин пешком",
            3400, 4600, 3900, true, "есть", "$$$", 2,
            "40/90/130", "60/120/170", "80/150/200", "75/150",
            4.7, 28,
            vec!["Загородный клуб".to_string(), "Ресторан".to_string(), "Веранда".to_string()],
            vec!["Летняя веранда".to_string(), "Парковая зона".to_string(), "Панорамный вид".to_string()],
            vec!["Альпийская".to_string(), "Европейская".to_string(), "Гриль / BBQ".to_string()],
            vec!["Банкеты".to_string(), "Анимация".to_string(), "Wi-Fi".to_string()],
            vec!["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "panoramic-lounge-77",
            "Lounge 77 на 54 этаже",
            "Клубный лаунж над облаками для статусных вечеринок и коктейлей",
            "<p>Невероятный вид на ночную Москву с высоты 200 метров, дизайнерская мебель и бар премиум-класса.</p>",
            "+7 (495) 234 87 65", "г. Москва, 1-й Красногвардейский пр-д, д. 21, стр. 2", "Москва",
            "Выставочная", 4, "4 мин пешком",
            5000, 6500, 6000, false, "нет", "$$$$", 1,
            "25/55/80", "40/80/110", "50/90/120", "60/120",
            4.9, 39,
            vec!["Ресторан".to_string(), "Лофт".to_string()],
            vec!["Панорамный вид".to_string()],
            vec!["Фьюжн".to_string(), "Японская".to_string(), "Европейская".to_string()],
            vec!["Wi-Fi".to_string(), "Банкеты".to_string()],
            vec!["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "country-estate-borodino",
            "Загородное поместье Бородино",
            "Обширная территория 3 гектара с прудом, беседками и банным комплексом",
            "<p>Идеальное место для многодневных свадеб и корпоративных ретритов вдали от городской суеты.</p>",
            "+7 (495) 345 76 54", "Московская обл., д. Бородино, ул. Озерная, д. 10", "Москва",
            "Строгино", 20, "20 мин на транспорте",
            4800, 6000, 5200, true, "есть", "$$$", 3,
            "90/200/350", "130/280/450", "160/350/550", "180/400",
            4.8, 55,
            vec!["Загородный клуб".to_string(), "Отель".to_string(), "Шатер".to_string()],
            vec!["У воды".to_string(), "Своя территория".to_string(), "Парковая зона".to_string(), "Летняя веранда".to_string()],
            vec!["Русская".to_string(), "Европейская".to_string()],
            vec!["Номерной фонд".to_string(), "Банкеты".to_string(), "Анимация".to_string(), "Выездная регистрация".to_string()],
            vec!["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "loft-mansarda-arbat",
            "Лофт Мансарда на Арбате",
            "Атмосферный лофт с кирпичными стенами, камином и выходом на крышу в историческом центре",
            "<p>Уютная мансарда в тихом переулке Старого Арбата для душевных свадеб и камерных праздников.</p>",
            "+7 (495) 111 22 33", "г. Москва, пер. Сивцев Вражек, д. 29", "Москва",
            "Смоленская", 5, "5 мин пешком",
            3200, 4200, 3500, true, "от 300 р.", "$$$", 2,
            "30/60/90", "45/85/120", "55/100/140", "65/120",
            4.8, 41,
            vec!["Лофт".to_string(), "Банкетный зал".to_string()],
            vec!["Летняя веранда".to_string(), "Панорамный вид".to_string()],
            vec!["Авторская".to_string(), "Европейская".to_string()],
            vec!["Wi-Fi".to_string(), "Банкеты".to_string()],
            vec!["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "villa-barvikha-club",
            "Вилла Ротшильд в Барвихе",
            "Закрытая приватная резиденция премиум-класса с бассейном и парковой зоной",
            "<p>Эксклюзивное поместье для роскошных торжеств с высоким уровнем конфиденциальности и безупречным сервисом.</p>",
            "+7 (495) 222 33 44", "Московская обл., пос. Барвиха, Рублево-Успенское ш., 42", "Москва",
            "Крылатское", 15, "15 мин на машине",
            7500, 9500, 9000, false, "нет", "$$$$", 3,
            "80/160/250", "120/220/350", "150/300/400", "200/450",
            5.0, 19,
            vec!["Загородный клуб".to_string(), "Отель".to_string(), "Банкетный зал".to_string()],
            vec!["Своя территория".to_string(), "Парковая зона".to_string(), "У воды".to_string()],
            vec!["Авторская".to_string(), "Французская".to_string(), "Итальянская".to_string()],
            vec!["Номерной фонд".to_string(), "Банкеты".to_string(), "Выездная регистрация".to_string()],
            vec!["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "orangerie-botanika",
            "Стеклянная оранжерея Botanika",
            "Светлое пространство из стекла и металла в окружении тропических растений",
            "<p>Оранжерея круглый год наполнена зеленью и естественным светом. Ощущение лета в любую погоду.</p>",
            "+7 (495) 333 44 55", "г. Москва, ул. Ботаническая, д. 4", "Москва",
            "Владыкино", 6, "6 мин пешком",
            3800, 5200, 4300, true, "есть", "$$$", 1,
            "50/110/160", "70/140/200", "90/180/240", "80/160",
            4.9, 47,
            vec!["Шатер".to_string(), "Банкетный зал".to_string(), "Веранда".to_string()],
            vec!["Парковая зона".to_string(), "Панорамный вид".to_string()],
            vec!["Европейская".to_string(), "Фьюжн".to_string()],
            vec!["Банкеты".to_string(), "Выездная регистрация".to_string(), "Wi-Fi".to_string()],
            vec!["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80".to_string()],
            false
        ),
        (
            "marina-yacht-resort",
            "Яхт-клуб & Ресторан Марина",
            "Банкетный павильон на причале с возможностью прибытия молодоженов на яхте",
            "<p>Морской бриз в черте города. Белоснежные шатры и террасы прямо над гладью Химкинского водохранилища.</p>",
            "+7 (495) 444 55 66", "г. Москва, Ленинградское ш., д. 39, стр. 6", "Москва",
            "Водный стадион", 8, "8 мин пешком",
            4200, 5600, 4800, true, "от 400 р.", "$$$", 2,
            "60/130/190", "80/180/260", "110/220/300", "100/210",
            4.7, 34,
            vec!["Ресторан".to_string(), "Веранда".to_string(), "Загородный клуб".to_string()],
            vec!["У воды".to_string(), "Летняя веранда".to_string(), "Панорамный вид".to_string()],
            vec!["Средиземноморская".to_string(), "Европейская".to_string(), "Рыбная".to_string()],
            vec!["Банкеты".to_string(), "Выездная регистрация".to_string()],
            vec!["https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "cube-flacon-space",
            "Арт-пространство Куб на Флаконе",
            "Индустриальный зал с высотой потолков 8 метров для масштабных событий и вечеринок",
            "<p>Трансформируемый зал на дизайн-заводе Flacon. Профессиональный свет, подвесные конструкции и акустика.</p>",
            "+7 (495) 555 66 77", "г. Москва, ул. Большая Новодмитровская, д. 36", "Москва",
            "Дмитровская", 5, "5 мин пешком",
            2800, 3900, 3600, true, "есть", "$$", 2,
            "50/120/180", "80/200/300", "120/300/450", "90/220",
            4.6, 58,
            vec!["Лофт".to_string(), "Бизнес-площадка".to_string()],
            vec!["Своя территория".to_string()],
            vec!["Фьюжн".to_string(), "Европейская".to_string()],
            vec!["Wi-Fi".to_string(), "Банкеты".to_string()],
            vec!["https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80".to_string()],
            false
        ),
        (
            "palace-tsaritsyno-hall",
            "Екатерининский Зал в Царицыно",
            "Дворцовая классика в стиле барокко с хрустальными люстрами и лепниной",
            "<p>Торжественный дворцовый интерьер подчеркнет грандиозность вашей свадьбы или юбилея.</p>",
            "+7 (495) 666 77 88", "г. Москва, ул. Дольская, д. 1", "Москва",
            "Орехово", 6, "6 мин пешком",
            5200, 6800, 5900, false, "нет", "$$$$", 2,
            "70/150/220", "100/220/320", "130/280/380", "120/250",
            4.9, 36,
            vec!["Банкетный зал".to_string(), "Отель".to_string()],
            vec!["Парковая зона".to_string(), "Своя территория".to_string()],
            vec!["Русская".to_string(), "Европейская".to_string(), "Французская".to_string()],
            vec!["Банкеты".to_string(), "Выездная регистрация".to_string()],
            vec!["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "river-lounge-terrace",
            "Терраса River Lounge на дебаркадере",
            "Уютный ресторан-веранда на плаву с плеском волн и легким ветерком",
            "<p>Незабываемая атмосфера у воды в центре города. Панорамные закаты и открытая гриль-станция.</p>",
            "+7 (495) 777 88 99", "г. Москва, Бережковская наб., д. 20Б", "Москва",
            "Киевская", 7, "7 мин пешком",
            3700, 4900, 4200, true, "есть", "$$$", 2,
            "40/85/130", "60/120/170", "80/150/210", "75/160",
            4.8, 43,
            vec!["Веранда".to_string(), "Ресторан".to_string()],
            vec!["У воды".to_string(), "Летняя веранда".to_string(), "Панорамный вид".to_string()],
            vec!["Гриль / BBQ".to_string(), "Европейская".to_string()],
            vec!["Банкеты".to_string(), "Wi-Fi".to_string()],
            vec!["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "loft-fabric-baumanskaya",
            "Лофт Фабрика 1890",
            "Краснокирпичный лофт с панорамными арочными окнами и винтажной лестницей",
            "<p>Историческое фабричное здание конца XIX века, бережно переоборудованное в современный ивент-холл.</p>",
            "+7 (495) 888 99 00", "г. Москва, ул. Бауманская, д. 53, стр. 2", "Москва",
            "Бауманская", 6, "6 мин пешком",
            3100, 4400, 3800, true, "от 350 р.", "$$$", 3,
            "45/95/140", "70/140/200", "85/170/230", "80/180",
            4.7, 51,
            vec!["Лофт".to_string(), "Банкетный зал".to_string()],
            vec!["Своя территория".to_string()],
            vec!["Европейская".to_string(), "Авторская".to_string()],
            vec!["Wi-Fi".to_string(), "Банкеты".to_string()],
            vec!["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80".to_string()],
            false
        ),
        (
            "chalet-polyana-resort",
            "Шале Поляна в сосновом бору",
            "Уютное деревянное шале с каминным залом, банным домом и лесными тропами",
            "<p>Аромат хвои, потрескивание дров в камине и панорамные окна с видом на вековые сосны.</p>",
            "+7 (495) 999 00 11", "Московская обл., Одинцовский р-н, пос. Сосны, д. 18", "Москва",
            "Славянский бульвар", 18, "18 мин на транспорте",
            4100, 5300, 4700, true, "есть", "$$$", 2,
            "35/75/110", "50/100/150", "65/130/180", "70/140",
            4.9, 32,
            vec!["Загородный клуб".to_string(), "Шатер".to_string()],
            vec!["Парковая зона".to_string(), "Своя территория".to_string()],
            vec!["Русская".to_string(), "Гриль / BBQ".to_string(), "Домашняя".to_string()],
            vec!["Номерной фонд".to_string(), "Банкеты".to_string(), "Выездная регистрация".to_string()],
            vec!["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        ),
        (
            "rooftop-neglinnaya",
            "Крыша Неглинная Руфтоп",
            "Стильная терраса на крыше особняка с видом на исторические переулки центра",
            "<p>Воздушная площадка под открытым небом с раздвижным прозрачным куполом на случай непогоды.</p>",
            "+7 (495) 123 78 90", "г. Москва, ул. Неглинная, д. 14, стр. 1A", "Москва",
            "Трубная", 3, "3 мин пешком",
            4500, 5900, 5100, false, "нет", "$$$$", 1,
            "40/80/120", "60/110/160", "75/140/190", "80/150",
            4.8, 37,
            vec!["Веранда".to_string(), "Лофт".to_string(), "Ресторан".to_string()],
            vec!["Панорамный вид".to_string(), "Летняя веранда".to_string()],
            vec!["Европейская".to_string(), "Авторская".to_string(), "Средиземноморская".to_string()],
            vec!["Wi-Fi".to_string(), "Банкеты".to_string()],
            vec!["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80".to_string(), "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80".to_string()],
            true
        )
    ];

    for v in &mock_venues_list {
        let _ = sqlx::query(
            r#"
            INSERT INTO venues (
                slug, title, subtitle, description_html, phone, address, city,
                metro_station, metro_distance_minutes, metro_distance_text,
                average_check, banquet_price_from, rent_price_hour,
                corkage_fee_has, corkage_fee_desc, price_level, halls_count,
                capacity_banquet, capacity_buffet, capacity_theater, area_sqm,
                rating_score, rating_reviews_count,
                venue_types, features, cuisines, services,
                gallery_photos, has_online_tour, status,
                halls, rooms, faq, feed, menu_photos, reviews, pricing_table
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7,
                $8, $9, $10,
                $11, $12, $13,
                $14, $15, $16, $17,
                $18, $19, $20, $21,
                $22, $23,
                $24, $25, $26, $27,
                $28, $29, 'published',
                $30, $31, $32, $33, $34, $35, $36
            )
            ON CONFLICT (slug) DO UPDATE SET
                title = EXCLUDED.title,
                subtitle = EXCLUDED.subtitle,
                description_html = EXCLUDED.description_html,
                average_check = EXCLUDED.average_check,
                banquet_price_from = EXCLUDED.banquet_price_from,
                rent_price_hour = EXCLUDED.rent_price_hour,
                capacity_banquet = EXCLUDED.capacity_banquet,
                rating_score = EXCLUDED.rating_score,
                rating_reviews_count = EXCLUDED.rating_reviews_count,
                venue_types = EXCLUDED.venue_types,
                features = EXCLUDED.features,
                gallery_photos = EXCLUDED.gallery_photos,
                has_online_tour = EXCLUDED.has_online_tour,
                updated_at = NOW()
            "#
        )
        .bind(v.0)
        .bind(v.1)
        .bind(v.2)
        .bind(v.3)
        .bind(v.4)
        .bind(v.5)
        .bind(v.6)
        .bind(v.7)
        .bind(v.8)
        .bind(v.9)
        .bind(v.10)
        .bind(v.11)
        .bind(v.12)
        .bind(v.13)
        .bind(v.14)
        .bind(v.15)
        .bind(v.16)
        .bind(v.17)
        .bind(v.18)
        .bind(v.19)
        .bind(v.20)
        .bind(v.21)
        .bind(v.22)
        .bind(&v.23)
        .bind(&v.24)
        .bind(&v.25)
        .bind(&v.26)
        .bind(&v.27)
        .bind(v.28)
        .bind(&forest_halls)
        .bind(&forest_rooms)
        .bind(&forest_faq)
        .bind(&forest_feed)
        .bind(&forest_menu_photos)
        .bind(&forest_reviews)
        .bind(&forest_pricing_table)
        .execute(&pool)
        .await;
    }
    println!("  ✓ {} total venues seeded successfully.", mock_venues_list.len() + 2);

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
