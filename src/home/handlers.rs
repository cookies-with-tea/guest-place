use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use std::sync::Arc;

use crate::{
    AppState,
    core::{
        dto::ApiResponse,
        handlers::get_media_by_uuid,
        response::{error_map, into_api_response},
    },
    venues::model::Venue,
};

use super::dto::{
    HomeCategoryDTO, HomeInteractionItemDTO, HomeResponseDTO, UpdateHomeDTO,
};

#[derive(sqlx::FromRow, Debug)]
pub struct HomePageRecord {
    pub id: i32,
    pub title: String,
    pub subtitle: String,
    pub hero_map_button_text: String,
    pub hero_list_button_text: String,
    pub hero_guide_uuid: Option<uuid::Uuid>,
    pub categories_title: String,
    pub latest_section_title: String,
    pub latest_section_button_text: String,
    pub latest_section_button_link: String,
    pub popular_section_title: String,
    pub popular_section_button_text: String,
    pub popular_section_button_link: String,
    pub interactions_title: String,
    pub banner_title: String,
    pub banner_text: String,
    pub banner_guide_uuid: Option<uuid::Uuid>,
}

#[utoipa::path(
    get,
    path = "/api/v1/home",
    responses(
        (status = 200, body = ApiResponse<HomeResponseDTO>),
        (status = 500, body = ApiResponse<HomeResponseDTO>)
    ),
    tag = "Home",
    operation_id = "get_home",
)]
pub async fn get_home(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<HomeResponseDTO>>, (StatusCode, Json<ApiResponse<HomeResponseDTO>>)> {
    // 1. Fetch home_page main record
    let row = sqlx::query_as::<_, HomePageRecord>(
        r#"
        SELECT
            id, title, subtitle, hero_map_button_text, hero_list_button_text, hero_guide_uuid,
            categories_title, latest_section_title, latest_section_button_text, latest_section_button_link,
            popular_section_title, popular_section_button_text, popular_section_button_link,
            interactions_title, banner_title, banner_text, banner_guide_uuid
        FROM home_page
        ORDER BY id ASC
        LIMIT 1
        "#,
    )
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error fetching home page: {:?}", e);
        into_api_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            None,
            Some(error_map("database", "Failed to fetch home page")),
            None,
        )
        .expect_err("Success status passed to into_api_response")
    })?;

    let home_record = match row {
        Some(r) => r,
        None => {
            // Insert fallback row if empty
            let inserted = sqlx::query_as::<_, HomePageRecord>(
                r#"
                INSERT INTO home_page (
                    title, subtitle, hero_map_button_text, hero_list_button_text,
                    categories_title, latest_section_title, latest_section_button_text, latest_section_button_link,
                    popular_section_title, popular_section_button_text, popular_section_button_link,
                    interactions_title, banner_title, banner_text
                ) VALUES (
                    'СОЦИАЛЬНАЯ ИНТЕРАКТИВНАЯ ПЛАТФОРМА',
                    'Соединяем гостей и места\nОбщение, бронирование здесь и сейчас',
                    'Показать на карте',
                    'Показать списком',
                    'Места по категориям',
                    'Последние добавленные',
                    'Показать еще',
                    '/venues',
                    'Самые популярные',
                    'В каталог',
                    '/venues',
                    'Варианты взаимодействия с GP Platform',
                    'Для быстрого поиска Вы можете пользоваться всеми вариантами одновременно.',
                    'GP Платформа позволяет общаться напрямую здесь и сейчас. Мы за «прозрачные отношения»'
                )
                RETURNING
                    id, title, subtitle, hero_map_button_text, hero_list_button_text, hero_guide_uuid,
                    categories_title, latest_section_title, latest_section_button_text, latest_section_button_link,
                    popular_section_title, popular_section_button_text, popular_section_button_link,
                    interactions_title, banner_title, banner_text, banner_guide_uuid
                "#,
            )
            .fetch_one(&state.pool)
            .await
            .map_err(|e| {
                eprintln!("Failed to insert fallback home_page: {:?}", e);
                into_api_response(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    None,
                    Some(error_map("database", "Failed to initialize home page")),
                    None,
                )
                .expect_err("Success status passed")
            })?;
            inserted
        }
    };

    let home_id = home_record.id;

    // 2. Fetch categories
    let cat_rows = sqlx::query_as::<_, (i32, String, String, String, Option<uuid::Uuid>, i32)>(
        r#"
        SELECT id, title, slug, link, icon_uuid, sort_order
        FROM home_categories
        WHERE home_id = $1
        ORDER BY sort_order ASC, id ASC
        "#,
    )
    .bind(home_id)
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();

    let mut categories = Vec::new();
    for c in cat_rows {
        let icon = if let Some(uuid) = c.4 {
            get_media_by_uuid(&state, Some(uuid)).await.unwrap_or(None)
        } else {
            None
        };

        categories.push(HomeCategoryDTO {
            id: Some(c.0),
            title: c.1,
            slug: c.2,
            link: c.3,
            icon_uuid: c.4,
            icon,
            sort_order: c.5,
        });
    }

    // 3. Fetch interaction variants
    let interaction_rows = sqlx::query_as::<_, (i32, i32, String, String, String, String, bool, i32)>(
        r#"
        SELECT id, step_number, title, text, button_text, link, is_accent, sort_order
        FROM home_interactions
        WHERE home_id = $1
        ORDER BY sort_order ASC, step_number ASC, id ASC
        "#,
    )
    .bind(home_id)
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();

    let interactions = interaction_rows
        .into_iter()
        .map(|r| HomeInteractionItemDTO {
            id: Some(r.0),
            step_number: r.1,
            title: r.2,
            text: r.3,
            button_text: r.4,
            link: r.5,
            is_accent: r.6,
            sort_order: r.7,
        })
        .collect();

    // 4. Fetch 4 latest published venues
    let latest_venues = sqlx::query_as::<_, Venue>(
        r#"
        SELECT *
        FROM venues
        WHERE status = 'published'
        ORDER BY created_at DESC
        LIMIT 4
        "#,
    )
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();

    // 5. Fetch 4 popular published venues (by rating_score DESC, rating_reviews_count DESC)
    let popular_venues = sqlx::query_as::<_, Venue>(
        r#"
        SELECT *
        FROM venues
        WHERE status = 'published'
        ORDER BY rating_score DESC, rating_reviews_count DESC
        LIMIT 4
        "#,
    )
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();

    // 6. Media guides
    let hero_guide = get_media_by_uuid(&state, home_record.hero_guide_uuid).await.unwrap_or(None);
    let banner_guide = get_media_by_uuid(&state, home_record.banner_guide_uuid).await.unwrap_or(None);

    let response_data = HomeResponseDTO {
        title: home_record.title,
        subtitle: home_record.subtitle,
        hero_map_button_text: home_record.hero_map_button_text,
        hero_list_button_text: home_record.hero_list_button_text,
        hero_guide_uuid: home_record.hero_guide_uuid,
        hero_guide,
        categories_title: home_record.categories_title,
        categories,
        latest_section_title: home_record.latest_section_title,
        latest_section_button_text: home_record.latest_section_button_text,
        latest_section_button_link: home_record.latest_section_button_link,
        latest_venues,
        popular_section_title: home_record.popular_section_title,
        popular_section_button_text: home_record.popular_section_button_text,
        popular_section_button_link: home_record.popular_section_button_link,
        popular_venues,
        interactions_title: home_record.interactions_title,
        interactions,
        banner_title: home_record.banner_title,
        banner_text: home_record.banner_text,
        banner_guide_uuid: home_record.banner_guide_uuid,
        banner_guide,
    };

    into_api_response(StatusCode::OK, Some(response_data), None, None)
}

#[utoipa::path(
    put,
    path = "/api/v1/home",
    request_body = UpdateHomeDTO,
    responses(
        (status = 200, body = ApiResponse<HomeResponseDTO>),
        (status = 400, body = ApiResponse<HomeResponseDTO>),
        (status = 500, body = ApiResponse<HomeResponseDTO>)
    ),
    tag = "Home",
    operation_id = "update_home",
)]
pub async fn update_home(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<UpdateHomeDTO>,
) -> Result<Json<ApiResponse<HomeResponseDTO>>, (StatusCode, Json<ApiResponse<HomeResponseDTO>>)> {
    // 1. Get or create home_page id
    let home_id: i32 = sqlx::query_scalar("SELECT id FROM home_page ORDER BY id ASC LIMIT 1")
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map("database", "Failed to query home page")),
                None,
            )
            .expect_err("status")
        })?
        .unwrap_or(1);

    // 2. Update home_page columns if provided
    sqlx::query(
        r#"
        UPDATE home_page SET
            title = COALESCE($1, title),
            subtitle = COALESCE($2, subtitle),
            hero_map_button_text = COALESCE($3, hero_map_button_text),
            hero_list_button_text = COALESCE($4, hero_list_button_text),
            hero_guide_uuid = CASE WHEN $5 IS NOT NULL THEN $5 ELSE hero_guide_uuid END,
            categories_title = COALESCE($6, categories_title),
            latest_section_title = COALESCE($7, latest_section_title),
            latest_section_button_text = COALESCE($8, latest_section_button_text),
            latest_section_button_link = COALESCE($9, latest_section_button_link),
            popular_section_title = COALESCE($10, popular_section_title),
            popular_section_button_text = COALESCE($11, popular_section_button_text),
            popular_section_button_link = COALESCE($12, popular_section_button_link),
            interactions_title = COALESCE($13, interactions_title),
            banner_title = COALESCE($14, banner_title),
            banner_text = COALESCE($15, banner_text),
            banner_guide_uuid = CASE WHEN $16 IS NOT NULL THEN $16 ELSE banner_guide_uuid END,
            updated_at = NOW()
        WHERE id = $17
        "#,
    )
    .bind(&payload.title)
    .bind(&payload.subtitle)
    .bind(&payload.hero_map_button_text)
    .bind(&payload.hero_list_button_text)
    .bind(payload.hero_guide_uuid)
    .bind(&payload.categories_title)
    .bind(&payload.latest_section_title)
    .bind(&payload.latest_section_button_text)
    .bind(&payload.latest_section_button_link)
    .bind(&payload.popular_section_title)
    .bind(&payload.popular_section_button_text)
    .bind(&payload.popular_section_button_link)
    .bind(&payload.interactions_title)
    .bind(&payload.banner_title)
    .bind(&payload.banner_text)
    .bind(payload.banner_guide_uuid)
    .bind(home_id)
    .execute(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error updating home_page: {:?}", e);
        into_api_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            None,
            Some(error_map("database", "Failed to update home page")),
            None,
        )
        .expect_err("status")
    })?;

    // 3. Update categories if provided
    if let Some(cats) = payload.categories {
        let _ = sqlx::query("DELETE FROM home_categories WHERE home_id = $1")
            .bind(home_id)
            .execute(&state.pool)
            .await;

        for (idx, cat) in cats.iter().enumerate() {
            let sort_order = cat.sort_order.unwrap_or(idx as i32 + 1);
            let _ = sqlx::query(
                r#"
                INSERT INTO home_categories (home_id, title, slug, link, icon_uuid, sort_order)
                VALUES ($1, $2, $3, $4, $5, $6)
                "#,
            )
            .bind(home_id)
            .bind(&cat.title)
            .bind(&cat.slug)
            .bind(&cat.link)
            .bind(cat.icon_uuid)
            .bind(sort_order)
            .execute(&state.pool)
            .await;
        }
    }

    // 4. Update interactions if provided
    if let Some(interactions) = payload.interactions {
        let _ = sqlx::query("DELETE FROM home_interactions WHERE home_id = $1")
            .bind(home_id)
            .execute(&state.pool)
            .await;

        for (idx, item) in interactions.iter().enumerate() {
            let sort_order = item.sort_order.unwrap_or(idx as i32 + 1);
            let is_accent = item.is_accent.unwrap_or(false);
            let _ = sqlx::query(
                r#"
                INSERT INTO home_interactions (home_id, step_number, title, text, button_text, link, is_accent, sort_order)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                "#,
            )
            .bind(home_id)
            .bind(item.step_number)
            .bind(&item.title)
            .bind(&item.text)
            .bind(&item.button_text)
            .bind(&item.link)
            .bind(is_accent)
            .bind(sort_order)
            .execute(&state.pool)
            .await;
        }
    }

    get_home(State(state)).await
}
