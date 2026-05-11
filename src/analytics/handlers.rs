use axum::{
    extract::State,
    Json, Router, routing::{get, post},
    http::StatusCode,
};
use std::sync::Arc;
use crate::{AppState, ApiResponse, core::response::into_api_response};
use super::dto::*;

#[utoipa::path(
    post,
    path = "/api/v1/analytics/session",
    request_body = StartSessionDto,
    responses(
        (status = 200, description = "Session started", body = ApiResponse<SessionResponseDto>)
    ),
    tag = "Analytics"
)]
pub async fn start_session(
    State(state): State<Arc<AppState>>,
    Json(dto): Json<StartSessionDto>,
) -> Result<Json<ApiResponse<SessionResponseDto>>, (StatusCode, Json<ApiResponse<SessionResponseDto>>)> {
    let result = sqlx::query_scalar(
        "INSERT INTO analytics_sessions (visitor_id, user_id, referer, user_agent) VALUES ($1, $2, $3, $4) RETURNING id"
    )
    .bind(dto.visitor_id)
    .bind(dto.user_id)
    .bind(dto.referer)
    .bind(dto.user_agent)
    .fetch_one(&state.pool)
    .await;

    match result {
        Ok(id) => into_api_response(StatusCode::OK, Some(SessionResponseDto { id }), None, None),
        Err(e) => {
            eprintln!("Failed to start session: {}", e);
            into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, None, Some(vec!["Failed to start session".to_string()]))
        },
    }
}

#[utoipa::path(
    post,
    path = "/api/v1/analytics/track",
    request_body = TrackEventDto,
    responses(
        (status = 200, description = "Event tracked")
    ),
    tag = "Analytics"
)]
pub async fn track_event(
    State(state): State<Arc<AppState>>,
    Json(dto): Json<TrackEventDto>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = sqlx::query(
        "INSERT INTO analytics_events (session_id, event_type, entity_id, entity_type, properties, path) VALUES ($1, $2, $3, $4, $5, $6)"
    )
    .bind(dto.session_id)
    .bind(dto.event_type)
    .bind(dto.entity_id)
    .bind(dto.entity_type)
    .bind(dto.properties.unwrap_or(serde_json::json!({})))
    .bind(dto.path)
    .execute(&state.pool)
    .await;

    match result {
        Ok(_) => into_api_response(StatusCode::OK, None, None, None),
        Err(e) => {
            eprintln!("Failed to track event: {}", e);
            into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, None, Some(vec!["Failed to track event".to_string()]))
        },
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/analytics/traffic",
    params(
        AnalyticsFilterQuery
    ),
    responses(
        (status = 200, description = "Traffic stats", body = ApiResponse<TrafficStatsDto>)
    ),
    tag = "Analytics"
)]
pub async fn get_traffic_stats(
    State(state): State<Arc<AppState>>,
    axum::extract::Query(params): axum::extract::Query<AnalyticsFilterQuery>,
) -> Result<Json<ApiResponse<TrafficStatsDto>>, (StatusCode, Json<ApiResponse<TrafficStatsDto>>)> {
    let days = params.days.unwrap_or(7);
    let result = sqlx::query(
        r#"
        SELECT 
            to_char(day, 'Mon DD') as label,
            count(DISTINCT visitor_id) as dau,
            count(analytics_sessions.id) as sessions
        FROM generate_series(
            current_date - (($1 - 1) * interval '1 day'), 
            current_date, 
            interval '1 day'
        ) as day
        LEFT JOIN analytics_sessions ON date_trunc('day', started_at) = day
        GROUP BY day
        ORDER BY day
        "#
    )
    .bind(days)
    .fetch_all(&state.pool)
    .await;

    match result {
        Ok(rows) => {
            use sqlx::Row;
            let mut stats = TrafficStatsDto::default();
            for row in rows {
                stats.labels.push(row.get::<String, _>("label"));
                stats.dau.push(row.get::<i64, _>("dau"));
                stats.sessions.push(row.get::<i64, _>("sessions"));
            }
            into_api_response(StatusCode::OK, Some(stats), None, None)
        },
        Err(e) => {
            eprintln!("Failed to fetch traffic stats: {}", e);
            into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, None, Some(vec!["Database error".to_string()]))
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/analytics/engagement",
    params(
        AnalyticsFilterQuery
    ),
    responses(
        (status = 200, description = "Engagement stats by entity", body = ApiResponse<Vec<EngagementStatsDto>>)
    ),
    tag = "Analytics"
)]
pub async fn get_engagement_stats(
    State(state): State<Arc<AppState>>,
    axum::extract::Query(params): axum::extract::Query<AnalyticsFilterQuery>,
) -> Result<Json<ApiResponse<Vec<EngagementStatsDto>>>, (StatusCode, Json<ApiResponse<Vec<EngagementStatsDto>>>)> {
    let days = params.days.unwrap_or(30);
    let result = sqlx::query(
        r#"
        SELECT 
            COALESCE(entity_id, 'unknown') as entity_id,
            count(*) FILTER (WHERE event_type = 'click') as clicks,
            count(*) FILTER (WHERE event_type = 'view') as views
        FROM analytics_events
        WHERE (entity_type = 'venue' OR entity_type IS NULL)
          AND created_at > current_date - ($1 * interval '1 day')
        GROUP BY entity_id
        ORDER BY views DESC
        LIMIT 10
        "#
    )
    .bind(days)
    .fetch_all(&state.pool)
    .await;

    match result {
        Ok(rows) => {
            use sqlx::Row;
            let stats = rows.into_iter().map(|row| EngagementStatsDto {
                entity_id: row.get::<String, _>("entity_id"),
                clicks: row.get::<i64, _>("clicks"),
                views: row.get::<i64, _>("views"),
            }).collect();
            into_api_response(StatusCode::OK, Some(stats), None, None)
        },
        Err(e) => {
            eprintln!("Failed to fetch engagement stats: {}", e);
            into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, None, Some(vec!["Database error".to_string()]))
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/analytics/summary",
    params(
        AnalyticsFilterQuery
    ),
    responses(
        (status = 200, description = "Analytics summary", body = ApiResponse<AnalyticsSummaryDto>)
    ),
    tag = "Analytics"
)]
pub async fn get_summary_stats(
    State(state): State<Arc<AppState>>,
    axum::extract::Query(params): axum::extract::Query<AnalyticsFilterQuery>,
) -> Result<Json<ApiResponse<AnalyticsSummaryDto>>, (StatusCode, Json<ApiResponse<AnalyticsSummaryDto>>)> {
    let days = params.days.unwrap_or(30);
    let result = sqlx::query(
        r#"
        WITH current_period AS (
            SELECT 
                count(DISTINCT visitor_id) as visitors,
                count(*) FILTER (WHERE event_type = 'click') as clicks,
                count(*) FILTER (WHERE event_type = 'view') as views,
                COALESCE(avg(duration_seconds), 0) as duration
            FROM analytics_sessions
            LEFT JOIN analytics_events ON analytics_sessions.id = analytics_events.session_id
            WHERE started_at > current_date - ($1 * interval '1 day')
        ),
        previous_period AS (
            SELECT 
                count(DISTINCT visitor_id) as visitors,
                count(*) FILTER (WHERE event_type = 'click') as clicks,
                count(*) FILTER (WHERE event_type = 'view') as views,
                COALESCE(avg(duration_seconds), 0) as duration
            FROM analytics_sessions
            LEFT JOIN analytics_events ON analytics_sessions.id = analytics_events.session_id
            WHERE started_at BETWEEN current_date - ($2 * interval '1 day') AND current_date - ($1 * interval '1 day')
        )
        SELECT 
            c.visitors::bigint as total_visitors,
            c.clicks::bigint as total_clicks,
            c.views::bigint as page_views,
            c.duration::bigint as avg_session_duration,
            CASE WHEN p.visitors = 0 THEN 0 ELSE ((c.visitors - p.visitors) * 100.0 / p.visitors)::real END as visitors_trend,
            CASE WHEN p.clicks = 0 THEN 0 ELSE ((c.clicks - p.clicks) * 100.0 / p.clicks)::real END as clicks_trend,
            CASE WHEN p.views = 0 THEN 0 ELSE ((c.views - p.views) * 100.0 / p.views)::real END as views_trend,
            CASE WHEN p.duration = 0 THEN 0 ELSE ((c.duration - p.duration) * 100.0 / p.duration)::real END as session_trend
        FROM current_period c, previous_period p
        "#
    )
    .bind(days)
    .bind(days * 2)
    .fetch_one(&state.pool)
    .await;

    match result {
        Ok(row) => {
            use sqlx::Row;
            let summary = AnalyticsSummaryDto {
                total_visitors: row.get::<i64, _>("total_visitors"),
                avg_session_duration: row.get::<i64, _>("avg_session_duration"),
                total_clicks: row.get::<i64, _>("total_clicks"),
                page_views: row.get::<i64, _>("page_views"),
                visitors_trend: row.get::<f32, _>("visitors_trend"),
                session_trend: row.get::<f32, _>("session_trend"),
                clicks_trend: row.get::<f32, _>("clicks_trend"),
                views_trend: row.get::<f32, _>("views_trend"),
            };
            into_api_response(StatusCode::OK, Some(summary), None, None)
        },
        Err(e) => {
            eprintln!("Failed to fetch summary stats: {}", e);
            into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, None, Some(vec!["Database error".to_string()]))
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/analytics/referrals",
    params(
        AnalyticsFilterQuery
    ),
    responses(
        (status = 200, description = "Referral sources", body = ApiResponse<Vec<ReferralDto>>)
    ),
    tag = "Analytics"
)]
pub async fn get_referral_stats(
    State(state): State<Arc<AppState>>,
    axum::extract::Query(params): axum::extract::Query<AnalyticsFilterQuery>,
) -> Result<Json<ApiResponse<Vec<ReferralDto>>>, (StatusCode, Json<ApiResponse<Vec<ReferralDto>>>)> {
    let days = params.days.unwrap_or(30);
    let result = sqlx::query(
        r#"
        SELECT 
            COALESCE(referer, 'Direct') as source,
            count(*) as count,
            (count(*) * 100.0 / NULLIF((SELECT count(*) FROM analytics_sessions WHERE started_at > current_date - ($1 * interval '1 day')), 0))::real as percentage
        FROM analytics_sessions
        WHERE started_at > current_date - ($1 * interval '1 day')
        GROUP BY source
        ORDER BY count DESC
        LIMIT 10
        "#
    )
    .bind(days)
    .fetch_all(&state.pool)
    .await;

    match result {
        Ok(rows) => {
            use sqlx::Row;
            let referrals = rows.into_iter().map(|row| ReferralDto {
                source: row.get::<String, _>("source"),
                count: row.get::<i64, _>("count"),
                percentage: row.get::<f32, _>("percentage"),
            }).collect();
            into_api_response(StatusCode::OK, Some(referrals), None, None)
        },
        Err(e) => {
            eprintln!("Failed to fetch referral stats: {}", e);
            into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, None, Some(vec!["Database error".to_string()]))
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/analytics/funnel",
    params(
        AnalyticsFilterQuery
    ),
    responses(
        (status = 200, description = "Conversion funnel", body = ApiResponse<Vec<FunnelStepDto>>)
    ),
    tag = "Analytics"
)]
pub async fn get_funnel_stats(
    State(state): State<Arc<AppState>>,
    axum::extract::Query(params): axum::extract::Query<AnalyticsFilterQuery>,
) -> Result<Json<ApiResponse<Vec<FunnelStepDto>>>, (StatusCode, Json<ApiResponse<Vec<FunnelStepDto>>>)> {
    let days = params.days.unwrap_or(30);
    let result = sqlx::query(
        r#"
        WITH filtered_sessions AS (
            SELECT id FROM analytics_sessions WHERE started_at > current_date - ($1 * interval '1 day')
        ),
        steps AS (
            SELECT 
                count(DISTINCT s.id) as total_sessions,
                count(DISTINCT session_id) FILTER (WHERE event_type = 'view' AND entity_type = 'venue') as venue_views,
                count(DISTINCT session_id) FILTER (WHERE event_type = 'click' AND entity_type = 'booking') as booking_clicks
            FROM filtered_sessions s
            LEFT JOIN analytics_events ON s.id = analytics_events.session_id
        )
        SELECT 'Total Sessions' as name, total_sessions as count, 100.0::real as percentage FROM steps
        UNION ALL
        SELECT 'Venue Views' as name, venue_views as count, (venue_views * 100.0 / NULLIF(total_sessions, 0))::real as percentage FROM steps
        UNION ALL
        SELECT 'Bookings' as name, booking_clicks as count, (booking_clicks * 100.0 / NULLIF(total_sessions, 0))::real as percentage FROM steps
        "#
    )
    .bind(days)
    .fetch_all(&state.pool)
    .await;

    match result {
        Ok(rows) => {
            use sqlx::Row;
            let funnel = rows.into_iter().map(|row| FunnelStepDto {
                name: row.get::<String, _>("name"),
                count: row.get::<i64, _>("count"),
                percentage: row.get::<f32, _>("percentage"),
            }).collect();
            into_api_response(StatusCode::OK, Some(funnel), None, None)
        },
        Err(e) => {
            eprintln!("Failed to fetch funnel stats: {}", e);
            into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, None, Some(vec!["Database error".to_string()]))
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/analytics/retention",
    responses(
        (status = 200, description = "User retention cohorts", body = ApiResponse<Vec<CohortRowDto>>)
    ),
    tag = "Analytics"
)]
pub async fn get_retention_stats(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Vec<CohortRowDto>>>, (StatusCode, Json<ApiResponse<Vec<CohortRowDto>>>)> {
    let result = sqlx::query(
        r#"
        WITH user_cohorts AS (
            SELECT 
                visitor_id,
                date_trunc('month', MIN(started_at)) as cohort_month
            FROM analytics_sessions
            GROUP BY visitor_id
        ),
        cohort_size AS (
            SELECT 
                cohort_month,
                count(*) as total_users
            FROM user_cohorts
            GROUP BY cohort_month
        ),
        user_activity AS (
            SELECT 
                DISTINCT s.visitor_id,
                date_trunc('month', s.started_at) as activity_month,
                u.cohort_month
            FROM analytics_sessions s
            JOIN user_cohorts u ON s.visitor_id = u.visitor_id
        ),
        retention_counts AS (
            SELECT 
                cohort_month,
                EXTRACT(MONTH FROM age(activity_month, cohort_month))::int as month_number,
                count(*) as user_count
            FROM user_activity
            GROUP BY cohort_month, month_number
        )
        SELECT 
            to_char(c.cohort_month, 'YYYY-MM') as cohort_month,
            c.total_users::bigint,
            ARRAY_AGG(
                (r.user_count * 100.0 / c.total_users)::real 
                ORDER BY r.month_number
            ) as retention_rates
        FROM cohort_size c
        LEFT JOIN retention_counts r ON c.cohort_month = r.cohort_month
        GROUP BY c.cohort_month, c.total_users
        ORDER BY c.cohort_month DESC
        LIMIT 6
        "#
    )
    .fetch_all(&state.pool)
    .await;

    match result {
        Ok(rows) => {
            use sqlx::Row;
            let cohorts = rows.into_iter().map(|row| CohortRowDto {
                cohort_month: row.get::<String, _>("cohort_month"),
                total_users: row.get::<i64, _>("total_users"),
                retention_rates: row.get::<Vec<f32>, _>("retention_rates"),
            }).collect();
            into_api_response(StatusCode::OK, Some(cohorts), None, None)
        },
        Err(e) => {
            eprintln!("Failed to fetch retention stats: {}", e);
            into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, None, Some(vec!["Database error".to_string()]))
        }
    }
}

pub fn public_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/session", post(start_session))
        .route("/track", post(track_event))
}

pub fn protected_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/traffic", get(get_traffic_stats))
        .route("/engagement", get(get_engagement_stats))
        .route("/summary", get(get_summary_stats))
        .route("/referrals", get(get_referral_stats))
        .route("/funnel", get(get_funnel_stats))
        .route("/retention", get(get_retention_stats))
}
