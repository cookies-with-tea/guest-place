use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use serde::Deserialize;
use serde_json::Value as JsonValue;
use sqlx::{Postgres, QueryBuilder};
use std::sync::Arc;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::core::dto::{ApiPaginationDTO, ApiResponse, ApiResponseWithPagination, PaginationDTO};
use crate::core::response::error_map;
use crate::AppState;

use super::model::{CreateVenueDTO, UpdateVenueDTO, Venue};

#[derive(Debug, Deserialize, ToSchema, Clone)]
pub struct VenuesQuery {
    pub search: Option<String>,
    pub status: Option<String>,
    pub venue_types: Option<String>,
    pub venue_type: Option<String>,
    pub features: Option<String>,
    pub feature: Option<String>,
    pub cuisines: Option<String>,
    pub services: Option<String>,
    pub city: Option<String>,
    pub metro_station: Option<String>,
    pub min_capacity: Option<i32>,
    pub max_capacity: Option<i32>,
    pub min_price: Option<i32>,
    pub max_price: Option<i32>,
    pub price_level: Option<String>,
    pub has_online_tour: Option<bool>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<i32>,
    pub limit: Option<i32>,
    pub offset: Option<i64>,
}

fn apply_venue_filters<'a>(
    builder: &mut QueryBuilder<'a, Postgres>,
    query: &'a VenuesQuery,
    where_clause: &mut bool,
) {
    // 1. Status filter (defaults to non-deleted, or matches status if provided and not "all")
    if let Some(ref status) = query.status {
        let trimmed = status.trim();
        if !trimmed.is_empty() && !trimmed.eq_ignore_ascii_case("all") {
            if !*where_clause {
                builder.push(" WHERE ");
                *where_clause = true;
            } else {
                builder.push(" AND ");
            }
            builder.push("status = ");
            builder.push_bind(trimmed);
        }
    }

    // 2. Search query (title, subtitle, address, metro_station, description_html, city)
    if let Some(ref search) = query.search {
        let trimmed = search.trim();
        if !trimmed.is_empty() {
            if !*where_clause {
                builder.push(" WHERE ");
                *where_clause = true;
            } else {
                builder.push(" AND ");
            }
            let pattern = format!("%{}%", trimmed);
            builder.push("(title ILIKE ");
            builder.push_bind(pattern.clone());
            builder.push(" OR subtitle ILIKE ");
            builder.push_bind(pattern.clone());
            builder.push(" OR address ILIKE ");
            builder.push_bind(pattern.clone());
            builder.push(" OR metro_station ILIKE ");
            builder.push_bind(pattern.clone());
            builder.push(" OR city ILIKE ");
            builder.push_bind(pattern.clone());
            builder.push(" OR description_html ILIKE ");
            builder.push_bind(pattern);
            builder.push(")");
        }
    }

    // 3. Venue Types (comma-separated or single)
    let venue_types_str = query.venue_types.as_deref().or(query.venue_type.as_deref());
    if let Some(types_raw) = venue_types_str {
        let types: Vec<&str> = types_raw
            .split(',')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();
        if !types.is_empty() {
            if !*where_clause {
                builder.push(" WHERE ");
                *where_clause = true;
            } else {
                builder.push(" AND ");
            }
            builder.push("(");
            for (i, t) in types.iter().enumerate() {
                if i > 0 {
                    builder.push(" OR ");
                }
                builder.push("array_to_string(venue_types, ' ') ILIKE ");
                builder.push_bind(format!("%{}%", t));
            }
            builder.push(")");
        }
    }

    // 4. Features (comma-separated or single)
    let features_str = query.features.as_deref().or(query.feature.as_deref());
    if let Some(features_raw) = features_str {
        let feats: Vec<&str> = features_raw
            .split(',')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();
        if !feats.is_empty() {
            if !*where_clause {
                builder.push(" WHERE ");
                *where_clause = true;
            } else {
                builder.push(" AND ");
            }
            builder.push("(");
            for (i, f) in feats.iter().enumerate() {
                if i > 0 {
                    builder.push(" OR ");
                }
                builder.push("array_to_string(features, ' ') ILIKE ");
                builder.push_bind(format!("%{}%", f));
            }
            builder.push(")");
        }
    }

    // 5. Cuisines
    if let Some(ref cuisines_raw) = query.cuisines {
        let items: Vec<&str> = cuisines_raw
            .split(',')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();
        if !items.is_empty() {
            if !*where_clause {
                builder.push(" WHERE ");
                *where_clause = true;
            } else {
                builder.push(" AND ");
            }
            builder.push("(");
            for (i, c) in items.iter().enumerate() {
                if i > 0 {
                    builder.push(" OR ");
                }
                builder.push("array_to_string(cuisines, ' ') ILIKE ");
                builder.push_bind(format!("%{}%", c));
            }
            builder.push(")");
        }
    }

    // 6. Services
    if let Some(ref services_raw) = query.services {
        let items: Vec<&str> = services_raw
            .split(',')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();
        if !items.is_empty() {
            if !*where_clause {
                builder.push(" WHERE ");
                *where_clause = true;
            } else {
                builder.push(" AND ");
            }
            builder.push("(");
            for (i, s) in items.iter().enumerate() {
                if i > 0 {
                    builder.push(" OR ");
                }
                builder.push("array_to_string(services, ' ') ILIKE ");
                builder.push_bind(format!("%{}%", s));
            }
            builder.push(")");
        }
    }

    // 7. City
    if let Some(ref city) = query.city {
        let trimmed = city.trim();
        if !trimmed.is_empty() {
            if !*where_clause {
                builder.push(" WHERE ");
                *where_clause = true;
            } else {
                builder.push(" AND ");
            }
            builder.push("city ILIKE ");
            builder.push_bind(format!("%{}%", trimmed));
        }
    }

    // 8. Metro station
    if let Some(ref metro) = query.metro_station {
        let trimmed = metro.trim();
        if !trimmed.is_empty() {
            if !*where_clause {
                builder.push(" WHERE ");
                *where_clause = true;
            } else {
                builder.push(" AND ");
            }
            builder.push("metro_station ILIKE ");
            builder.push_bind(format!("%{}%", trimmed));
        }
    }

    // 9. Online tour
    if let Some(has_tour) = query.has_online_tour {
        if !*where_clause {
            builder.push(" WHERE ");
            *where_clause = true;
        } else {
            builder.push(" AND ");
        }
        builder.push("has_online_tour = ");
        builder.push_bind(has_tour);
    }

    // 10. Price Level
    if let Some(ref pl) = query.price_level {
        let trimmed = pl.trim();
        if !trimmed.is_empty() {
            if !*where_clause {
                builder.push(" WHERE ");
                *where_clause = true;
            } else {
                builder.push(" AND ");
            }
            builder.push("price_level = ");
            builder.push_bind(trimmed);
        }
    }

    // 11. Price filters (min_price, max_price)
    if let Some(min_p) = query.min_price {
        if min_p > 0 {
            if !*where_clause {
                builder.push(" WHERE ");
                *where_clause = true;
            } else {
                builder.push(" AND ");
            }
            builder.push("(average_check >= ");
            builder.push_bind(min_p);
            builder.push(" OR banquet_price_from >= ");
            builder.push_bind(min_p);
            builder.push(" OR rent_price_hour >= ");
            builder.push_bind(min_p);
            builder.push(")");
        }
    }

    if let Some(max_p) = query.max_price {
        if max_p > 0 {
            if !*where_clause {
                builder.push(" WHERE ");
                *where_clause = true;
            } else {
                builder.push(" AND ");
            }
            builder.push("((average_check > 0 AND average_check <= ");
            builder.push_bind(max_p);
            builder.push(") OR (banquet_price_from > 0 AND banquet_price_from <= ");
            builder.push_bind(max_p);
            builder.push(") OR (rent_price_hour > 0 AND rent_price_hour <= ");
            builder.push_bind(max_p);
            builder.push("))");
        }
    }

    // 12. Capacity filters
    if let Some(min_cap) = query.min_capacity {
        if min_cap > 0 {
            if !*where_clause {
                builder.push(" WHERE ");
                *where_clause = true;
            } else {
                builder.push(" AND ");
            }
            builder.push("(capacity_banquet ILIKE ");
            builder.push_bind(format!("%{}%", min_cap));
            builder.push(" OR (CASE WHEN jsonb_typeof(halls) = 'array' THEN EXISTS (SELECT 1 FROM jsonb_array_elements(halls) h WHERE COALESCE((h->>'capacityBanquet')::int, 0) >= ");
            builder.push_bind(min_cap);
            builder.push(" OR COALESCE((h->>'capacityBuffet')::int, 0) >= ");
            builder.push_bind(min_cap);
            builder.push(") ELSE false END))");
        }
    }

    if let Some(max_cap) = query.max_capacity {
        if max_cap > 0 {
            if !*where_clause {
                builder.push(" WHERE ");
                *where_clause = true;
            } else {
                builder.push(" AND ");
            }
            builder.push("(capacity_banquet ILIKE ");
            builder.push_bind(format!("%{}%", max_cap));
            builder.push(" OR (CASE WHEN jsonb_typeof(halls) = 'array' THEN EXISTS (SELECT 1 FROM jsonb_array_elements(halls) h WHERE (COALESCE((h->>'capacityBanquet')::int, 0) > 0 AND COALESCE((h->>'capacityBanquet')::int, 0) <= ");
            builder.push_bind(max_cap);
            builder.push(") OR (COALESCE((h->>'capacityBuffet')::int, 0) > 0 AND COALESCE((h->>'capacityBuffet')::int, 0) <= ");
            builder.push_bind(max_cap);
            builder.push(")) ELSE false END))");
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/venues",
    params(
        ("search" = Option<String>, Query, description = "Search query for title, address, or metro"),
        ("status" = Option<String>, Query, description = "Status filter (e.g. published, draft, all)"),
        ("venue_types" = Option<String>, Query, description = "Comma-separated venue types (e.g. 'Банкетный зал,Лофт')"),
        ("features" = Option<String>, Query, description = "Comma-separated features (e.g. 'Летняя веранда,Парковая зона')"),
        ("city" = Option<String>, Query, description = "City filter (e.g. 'Москва')"),
        ("metro_station" = Option<String>, Query, description = "Metro station name filter"),
        ("min_price" = Option<i32>, Query, description = "Minimum price/average check"),
        ("max_price" = Option<i32>, Query, description = "Maximum price/average check"),
        ("min_capacity" = Option<i32>, Query, description = "Minimum capacity"),
        ("max_capacity" = Option<i32>, Query, description = "Maximum capacity"),
        ("has_online_tour" = Option<bool>, Query, description = "Filter venues with online 3D tour"),
        ("sort_by" = Option<String>, Query, description = "Sort field ('created_at', 'average_check', 'rating_score', 'title')"),
        ("sort_order" = Option<String>, Query, description = "Sort order ('asc' or 'desc')"),
        ("page" = Option<i32>, Query, description = "Page number (1-based, default: 1)"),
        ("limit" = Option<i32>, Query, description = "Items per page (default: 10, max: 100)"),
    ),
    responses(
        (status = 200, body = ApiResponseWithPagination<Venue>),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Venues"
)]
pub async fn get_venues(
    State(state): State<Arc<AppState>>,
    Query(query): Query<VenuesQuery>,
) -> Result<Json<ApiResponseWithPagination<Venue>>, (StatusCode, Json<ApiResponseWithPagination<Venue>>)> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(10).clamp(1, 100);
    let offset = query
        .offset
        .unwrap_or_else(|| ((page - 1) as i64) * (limit as i64));

    // 1. Count query
    let mut count_builder: QueryBuilder<Postgres> = QueryBuilder::new("SELECT COUNT(*) FROM venues");
    let mut count_where = false;
    apply_venue_filters(&mut count_builder, &query, &mut count_where);

    let total: i64 = count_builder
        .build_query_scalar::<i64>()
        .fetch_one(&state.pool)
        .await
        .map_err(|e| {
            eprintln!("Database error counting venues: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponseWithPagination::<Venue> {
                    data: None,
                    errors: Some(error_map("database", "Failed to count venues")),
                    messages: Some(vec!["Failed to count venues".to_string()]),
                }),
            )
        })?;

    let total_pages = (total as f64 / limit as f64).ceil() as i32;

    // 2. Select query with sorting and pagination
    let mut select_builder: QueryBuilder<Postgres> = QueryBuilder::new("SELECT * FROM venues");
    let mut select_where = false;
    apply_venue_filters(&mut select_builder, &query, &mut select_where);

    let sort_by_raw = query
        .sort_by
        .as_deref()
        .unwrap_or("created_at")
        .trim()
        .to_lowercase();
    let mut sort_order_raw = query
        .sort_order
        .as_deref()
        .unwrap_or("DESC")
        .trim()
        .to_uppercase();

    let (column, default_order) = match sort_by_raw.as_str() {
        "price_asc" => ("average_check", "ASC"),
        "price_desc" => ("average_check", "DESC"),
        "price" | "average_check" => ("average_check", "ASC"),
        "banquet_price" | "banquet_price_from" => ("banquet_price_from", "ASC"),
        "rent_price" | "rent_price_hour" => ("rent_price_hour", "ASC"),
        "rating" | "rating_score" => ("rating_score", "DESC"),
        "reviews" | "rating_reviews_count" => ("rating_reviews_count", "DESC"),
        "title" | "name" => ("title", "ASC"),
        "halls_count" => ("halls_count", "DESC"),
        "created_at" | "date" => ("created_at", "DESC"),
        _ => ("created_at", "DESC"),
    };

    if query.sort_order.is_none() && (sort_by_raw == "price_asc" || sort_by_raw == "price_desc") {
        sort_order_raw = default_order.to_string();
    }

    let final_sort_order = if sort_order_raw == "ASC" { "ASC" } else { "DESC" };

    select_builder.push(format!(" ORDER BY {} {}", column, final_sort_order));
    select_builder.push(" LIMIT ");
    select_builder.push_bind(limit as i64);
    select_builder.push(" OFFSET ");
    select_builder.push_bind(offset);

    let venues = select_builder
        .build_query_as::<Venue>()
        .fetch_all(&state.pool)
        .await
        .map_err(|e| {
            eprintln!("Database error fetching venues: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponseWithPagination::<Venue> {
                    data: None,
                    errors: Some(error_map("database", "Failed to fetch venues")),
                    messages: Some(vec!["Failed to fetch venues".to_string()]),
                }),
            )
        })?;

    let pagination = PaginationDTO {
        page,
        total: Some(total as i32),
        total_pages: Some(total_pages),
        limit: Some(limit),
    };

    Ok(Json(ApiResponseWithPagination {
        data: Some(ApiPaginationDTO {
            items: venues,
            pagination,
        }),
        errors: None,
        messages: None,
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/venues/{id}",
    params(
        ("id" = String, Path, description = "Venue ID (UUID) or unique slug")
    ),
    responses(
        (status = 200, body = ApiResponse<Venue>),
        (status = 404, description = "Venue not found"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Venues"
)]
pub async fn get_venue_by_id_or_slug(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<ApiResponse<Venue>>, (StatusCode, Json<ApiResponse<()>>)> {
    let clean = id.trim();

    let venue = if let Ok(uuid) = Uuid::parse_str(clean) {
        sqlx::query_as::<_, Venue>("SELECT * FROM venues WHERE id = $1 OR slug = $2")
            .bind(uuid)
            .bind(clean)
            .fetch_optional(&state.pool)
            .await
    } else {
        sqlx::query_as::<_, Venue>("SELECT * FROM venues WHERE slug = $1")
            .bind(clean)
            .fetch_optional(&state.pool)
            .await
    }
    .map_err(|e| {
        eprintln!("Database error fetching venue by identifier: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Failed to fetch venue".to_string()]),
            }),
        )
    })?;

    match venue {
        Some(v) => Ok(Json(ApiResponse {
            data: Some(v),
            errors: None,
            messages: None,
        })),
        None => Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec![format!("Venue '{}' not found", id)]),
            }),
        )),
    }
}

#[utoipa::path(
    post,
    path = "/api/v1/venues",
    request_body = CreateVenueDTO,
    responses(
        (status = 201, body = ApiResponse<Venue>),
        (status = 400, description = "Invalid payload"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Venues",
    security(("bearer_auth" = []))
)]
pub async fn create_venue(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateVenueDTO>,
) -> Result<(StatusCode, Json<ApiResponse<Venue>>), (StatusCode, Json<ApiResponse<()>>)> {
    let city = payload.city.unwrap_or_else(|| "Москва".to_string());
    let status = payload.status.unwrap_or_else(|| "published".to_string());
    let halls_val = payload.halls.unwrap_or_else(|| JsonValue::Array(vec![]));
    let rooms_val = payload.rooms.unwrap_or_else(|| JsonValue::Array(vec![]));
    let faq_val = payload.faq.unwrap_or_else(|| JsonValue::Array(vec![]));
    let feed_val = payload.feed.unwrap_or_else(|| JsonValue::Array(vec![]));
    let reviews_val = payload.reviews.unwrap_or_else(|| JsonValue::Array(vec![]));
    let pricing_table_val = payload.pricing_table.unwrap_or_else(|| JsonValue::Object(serde_json::Map::new()));
    let menu_photos = payload.menu_photos.unwrap_or_default();
    let venue_types = payload.venue_types.unwrap_or_default();
    let features = payload.features.unwrap_or_default();
    let cuisines = payload.cuisines.unwrap_or_default();
    let services = payload.services.unwrap_or_default();
    let equipment = payload.equipment.unwrap_or_default();
    let gallery_photos = payload.gallery_photos.unwrap_or_default();

    let venue = sqlx::query_as::<_, Venue>(
        r#"
        INSERT INTO venues (
            slug, title, subtitle, description_html, phone, address, city,
            metro_station, metro_distance_minutes, metro_distance_text, metro_line_color,
            coordinates_lat, coordinates_lng, average_check, banquet_price_from,
            rent_price_hour, corkage_fee_has, corkage_fee_desc, price_level,
            halls_count, capacity_banquet, capacity_buffet, capacity_theater,
            area_sqm, working_hours_weekdays, working_hours_weekends, rating_score,
            rating_reviews_count, venue_types, features, cuisines, services,
            parking, equipment, halls, rooms, gallery_photos, video_tour_url,
            has_online_tour, faq, feed, menu_photos, reviews, pricing_table,
            menu_url, rider_url, status, created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11,
            $12, $13, $14, $15,
            $16, $17, $18, $19,
            $20, $21, $22, $23,
            $24, $25, $26, $27,
            $28, $29, $30, $31, $32,
            $33, $34, $35, $36, $37, $38,
            $39, $40, $41, $42, $43, $44,
            $45, $46, $47, NOW(), NOW()
        )
        RETURNING *
        "#,
    )
    .bind(payload.slug)
    .bind(payload.title)
    .bind(payload.subtitle)
    .bind(payload.description_html)
    .bind(payload.phone)
    .bind(payload.address)
    .bind(city)
    .bind(payload.metro_station)
    .bind(payload.metro_distance_minutes)
    .bind(payload.metro_distance_text)
    .bind(payload.metro_line_color)
    .bind(payload.coordinates_lat)
    .bind(payload.coordinates_lng)
    .bind(payload.average_check.unwrap_or(0))
    .bind(payload.banquet_price_from.unwrap_or(0))
    .bind(payload.rent_price_hour.unwrap_or(0))
    .bind(payload.corkage_fee_has.unwrap_or(false))
    .bind(payload.corkage_fee_desc)
    .bind(payload.price_level.unwrap_or_else(|| "$$$".to_string()))
    .bind(payload.halls_count.unwrap_or(1))
    .bind(payload.capacity_banquet)
    .bind(payload.capacity_buffet)
    .bind(payload.capacity_theater)
    .bind(payload.area_sqm)
    .bind(payload.working_hours_weekdays)
    .bind(payload.working_hours_weekends)
    .bind(payload.rating_score.unwrap_or(5.0))
    .bind(payload.rating_reviews_count.unwrap_or(0))
    .bind(venue_types)
    .bind(features)
    .bind(cuisines)
    .bind(services)
    .bind(payload.parking)
    .bind(equipment)
    .bind(halls_val)
    .bind(rooms_val)
    .bind(gallery_photos)
    .bind(payload.video_tour_url)
    .bind(payload.has_online_tour.unwrap_or(true))
    .bind(faq_val)
    .bind(feed_val)
    .bind(menu_photos)
    .bind(reviews_val)
    .bind(pricing_table_val)
    .bind(payload.menu_url)
    .bind(payload.rider_url)
    .bind(status)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error creating venue: {}", e);
        (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec![format!("Failed to create venue: {}", e)]),
            }),
        )
    })?;

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse {
            data: Some(venue),
            errors: None,
            messages: None,
        }),
    ))
}

#[utoipa::path(
    patch,
    path = "/api/v1/venues/{id}",
    params(
        ("id" = Uuid, Path, description = "Venue ID")
    ),
    request_body = UpdateVenueDTO,
    responses(
        (status = 200, body = ApiResponse<Venue>),
        (status = 404, description = "Venue not found"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Venues",
    security(("bearer_auth" = []))
)]
pub async fn update_venue(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateVenueDTO>,
) -> Result<Json<ApiResponse<Venue>>, (StatusCode, Json<ApiResponse<()>>)> {
    let existing = sqlx::query_as::<_, Venue>("SELECT * FROM venues WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()> {
                    data: None,
                    errors: None,
                    messages: Some(vec![format!("Database error: {}", e)]),
                }),
            )
        })?;

    let ex = match existing {
        Some(v) => v,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(ApiResponse::<()> {
                    data: None,
                    errors: None,
                    messages: Some(vec![format!("Venue '{}' not found", id)]),
                }),
            ))
        }
    };

    let slug = payload.slug.unwrap_or(ex.slug);
    let title = payload.title.unwrap_or(ex.title);
    let subtitle = payload.subtitle.or(ex.subtitle);
    let description_html = payload.description_html.or(ex.description_html);
    let phone = payload.phone.or(ex.phone);
    let address = payload.address.unwrap_or(ex.address);
    let city = payload.city.unwrap_or(ex.city);
    let metro_station = payload.metro_station.or(ex.metro_station);
    let metro_distance_minutes = payload.metro_distance_minutes.or(ex.metro_distance_minutes);
    let metro_distance_text = payload.metro_distance_text.or(ex.metro_distance_text);
    let metro_line_color = payload.metro_line_color.or(ex.metro_line_color);
    let coordinates_lat = payload.coordinates_lat.or(ex.coordinates_lat);
    let coordinates_lng = payload.coordinates_lng.or(ex.coordinates_lng);
    let average_check = payload.average_check.or(ex.average_check);
    let banquet_price_from = payload.banquet_price_from.or(ex.banquet_price_from);
    let rent_price_hour = payload.rent_price_hour.or(ex.rent_price_hour);
    let corkage_fee_has = payload.corkage_fee_has.or(ex.corkage_fee_has);
    let corkage_fee_desc = payload.corkage_fee_desc.or(ex.corkage_fee_desc);
    let price_level = payload.price_level.or(ex.price_level);
    let halls_count = payload.halls_count.or(ex.halls_count);
    let capacity_banquet = payload.capacity_banquet.or(ex.capacity_banquet);
    let capacity_buffet = payload.capacity_buffet.or(ex.capacity_buffet);
    let capacity_theater = payload.capacity_theater.or(ex.capacity_theater);
    let area_sqm = payload.area_sqm.or(ex.area_sqm);
    let working_hours_weekdays = payload.working_hours_weekdays.or(ex.working_hours_weekdays);
    let working_hours_weekends = payload.working_hours_weekends.or(ex.working_hours_weekends);
    let rating_score = payload.rating_score.or(ex.rating_score);
    let rating_reviews_count = payload.rating_reviews_count.or(ex.rating_reviews_count);
    let venue_types = payload.venue_types.or(ex.venue_types).unwrap_or_default();
    let features = payload.features.or(ex.features).unwrap_or_default();
    let cuisines = payload.cuisines.or(ex.cuisines).unwrap_or_default();
    let services = payload.services.or(ex.services).unwrap_or_default();
    let parking = payload.parking.or(ex.parking);
    let equipment = payload.equipment.or(ex.equipment).unwrap_or_default();
    let halls = payload.halls.or(ex.halls).unwrap_or_else(|| JsonValue::Array(vec![]));
    let rooms = payload.rooms.or(ex.rooms).unwrap_or_else(|| JsonValue::Array(vec![]));
    let gallery_photos = payload.gallery_photos.or(ex.gallery_photos).unwrap_or_default();
    let video_tour_url = payload.video_tour_url.or(ex.video_tour_url);
    let has_online_tour = payload.has_online_tour.or(ex.has_online_tour);
    let faq = payload.faq.or(ex.faq).unwrap_or_else(|| JsonValue::Array(vec![]));
    let feed = payload.feed.or(ex.feed).unwrap_or_else(|| JsonValue::Array(vec![]));
    let menu_photos = payload.menu_photos.or(ex.menu_photos).unwrap_or_default();
    let reviews = payload.reviews.or(ex.reviews).unwrap_or_else(|| JsonValue::Array(vec![]));
    let pricing_table = payload.pricing_table.or(ex.pricing_table).unwrap_or_else(|| JsonValue::Object(serde_json::Map::new()));
    let menu_url = payload.menu_url.or(ex.menu_url);
    let rider_url = payload.rider_url.or(ex.rider_url);
    let status = payload.status.unwrap_or(ex.status);

    let updated = sqlx::query_as::<_, Venue>(
        r#"
        UPDATE venues SET
            slug = $1, title = $2, subtitle = $3, description_html = $4, phone = $5,
            address = $6, city = $7, metro_station = $8, metro_distance_minutes = $9,
            metro_distance_text = $10, metro_line_color = $11, coordinates_lat = $12,
            coordinates_lng = $13, average_check = $14, banquet_price_from = $15,
            rent_price_hour = $16, corkage_fee_has = $17, corkage_fee_desc = $18,
            price_level = $19, halls_count = $20, capacity_banquet = $21,
            capacity_buffet = $22, capacity_theater = $23, area_sqm = $24,
            working_hours_weekdays = $25, working_hours_weekends = $26,
            rating_score = $27, rating_reviews_count = $28, venue_types = $29,
            features = $30, cuisines = $31, services = $32, parking = $33,
            equipment = $34, halls = $35, rooms = $36, gallery_photos = $37,
            video_tour_url = $38, has_online_tour = $39, faq = $40, feed = $41,
            menu_photos = $42, reviews = $43, pricing_table = $44, menu_url = $45,
            rider_url = $46, status = $47, updated_at = NOW()
        WHERE id = $48
        RETURNING *
        "#,
    )
    .bind(slug)
    .bind(title)
    .bind(subtitle)
    .bind(description_html)
    .bind(phone)
    .bind(address)
    .bind(city)
    .bind(metro_station)
    .bind(metro_distance_minutes)
    .bind(metro_distance_text)
    .bind(metro_line_color)
    .bind(coordinates_lat)
    .bind(coordinates_lng)
    .bind(average_check)
    .bind(banquet_price_from)
    .bind(rent_price_hour)
    .bind(corkage_fee_has)
    .bind(corkage_fee_desc)
    .bind(price_level)
    .bind(halls_count)
    .bind(capacity_banquet)
    .bind(capacity_buffet)
    .bind(capacity_theater)
    .bind(area_sqm)
    .bind(working_hours_weekdays)
    .bind(working_hours_weekends)
    .bind(rating_score)
    .bind(rating_reviews_count)
    .bind(venue_types)
    .bind(features)
    .bind(cuisines)
    .bind(services)
    .bind(parking)
    .bind(equipment)
    .bind(halls)
    .bind(rooms)
    .bind(gallery_photos)
    .bind(video_tour_url)
    .bind(has_online_tour)
    .bind(faq)
    .bind(feed)
    .bind(menu_photos)
    .bind(reviews)
    .bind(pricing_table)
    .bind(menu_url)
    .bind(rider_url)
    .bind(status)
    .bind(id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error updating venue: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec![format!("Failed to update venue: {}", e)]),
            }),
        )
    })?;

    Ok(Json(ApiResponse {
        data: Some(updated),
        errors: None,
        messages: None,
    }))
}

#[utoipa::path(
    delete,
    path = "/api/v1/venues/{id}",
    params(
        ("id" = Uuid, Path, description = "Venue ID")
    ),
    responses(
        (status = 200, body = ApiResponse<bool>),
        (status = 404, description = "Venue not found"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Venues",
    security(("bearer_auth" = []))
)]
pub async fn delete_venue(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<bool>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = sqlx::query("DELETE FROM venues WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| {
            eprintln!("Database error deleting venue: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()> {
                    data: None,
                    errors: None,
                    messages: Some(vec!["Failed to delete venue".to_string()]),
                }),
            )
        })?;

    if result.rows_affected() == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec![format!("Venue '{}' not found", id)]),
            }),
        ));
    }

    Ok(Json(ApiResponse {
        data: Some(true),
        errors: None,
        messages: None,
    }))
}
