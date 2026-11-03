use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Deserialize, ToSchema)]
pub struct TrackEventDto {
    pub session_id: Uuid,
    pub event_type: String,
    pub entity_id: Option<String>,
    pub entity_type: Option<String>,
    pub properties: Option<serde_json::Value>,
    pub path: Option<String>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct StartSessionDto {
    pub visitor_id: Uuid,
    pub user_id: Option<Uuid>,
    pub referer: Option<String>,
    pub user_agent: Option<String>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct SessionResponseDto {
    pub id: Uuid,
}

#[derive(Debug, Serialize, ToSchema, Default)]
pub struct TrafficStatsDto {
    pub labels: Vec<String>,
    pub dau: Vec<i64>,
    pub sessions: Vec<i64>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct EngagementStatsDto {
    pub entity_id: String,
    pub clicks: i64,
    pub views: i64,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct FunnelStepDto {
    pub name: String,
    pub count: i64,
    pub percentage: f32, // Percentage of the first step
}

#[derive(Debug, Serialize, ToSchema)]
pub struct CohortRowDto {
    pub cohort_month: String,
    pub total_users: i64,
    pub retention_rates: Vec<f32>, // Percentages for Month 0, 1, 2, 3
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ReferralDto {
    pub source: String,
    pub count: i64,
    pub percentage: f32,
}

#[derive(Debug, serde::Deserialize, utoipa::IntoParams, Clone, Copy)]
pub struct AnalyticsFilterQuery {
    /// Number of days to look back
    pub days: Option<i32>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct AnalyticsSummaryDto {
    pub total_visitors: i64,
    pub avg_session_duration: i64,
    pub total_clicks: i64,
    pub page_views: i64,
    pub visitors_trend: f32,
    pub session_trend: f32,
    pub clicks_trend: f32,
    pub views_trend: f32,
}
