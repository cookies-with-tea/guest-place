use axum::{
    extract::{Query, State},
    http::StatusCode,
    Json,
};
use sqlx::{Postgres, QueryBuilder};
use std::sync::Arc;

use crate::core::dto::{ApiPaginationDTO, ApiResponseWithPagination, PaginationDTO};
use crate::core::response::error_map;
use crate::core::utils::{DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT};
use crate::AppState;

use super::model::{AuditLogEntry, AuditLogQuery};

#[utoipa::path(
    get,
    path = "/api/v1/audit",
    params(AuditLogQuery),
    responses(
        (status = 200, body = ApiResponseWithPagination<AuditLogEntry>),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Audit",
    security(("bearer_auth" = []))
)]
pub async fn list_audit_log(
    State(state): State<Arc<AppState>>,
    Query(filter): Query<AuditLogQuery>,
) -> Result<Json<ApiResponseWithPagination<AuditLogEntry>>, (StatusCode, Json<ApiResponseWithPagination<AuditLogEntry>>)> {
    let page = filter.page.unwrap_or(1).max(1);
    let limit = filter.limit.unwrap_or(DEFAULT_PAGE_LIMIT).clamp(1, MAX_PAGE_LIMIT);
    let offset = ((page - 1) as i64) * (limit as i64);

    let apply_filters = |builder: &mut QueryBuilder<Postgres>| {
        let mut has_where = false;

        if let Some(actor_user_id) = filter.actor_user_id {
            builder.push(if has_where { " AND " } else { " WHERE " });
            builder.push("actor_user_id = ");
            builder.push_bind(actor_user_id);
            has_where = true;
        }

        if let Some(action) = &filter.action {
            builder.push(if has_where { " AND " } else { " WHERE " });
            builder.push("action = ");
            builder.push_bind(action.clone());
            has_where = true;
        }

        if let Some(entity_type) = &filter.entity_type {
            builder.push(if has_where { " AND " } else { " WHERE " });
            builder.push("entity_type = ");
            builder.push_bind(entity_type.clone());
        }
    };

    // 1. Count query
    let mut count_builder: QueryBuilder<Postgres> = QueryBuilder::new("SELECT COUNT(*) FROM audit_log");
    apply_filters(&mut count_builder);

    let total: i64 = count_builder
        .build_query_scalar::<i64>()
        .fetch_one(&state.pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error counting audit log: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponseWithPagination::<AuditLogEntry> {
                    data: None,
                    errors: Some(error_map("database", "Failed to count audit log entries")),
                    messages: Some(vec!["Failed to count audit log entries".to_string()]),
                }),
            )
        })?;

    let total_pages = (total as f64 / limit as f64).ceil() as i32;

    // 2. Select query with pagination
    let mut select_builder: QueryBuilder<Postgres> = QueryBuilder::new("SELECT * FROM audit_log");
    apply_filters(&mut select_builder);
    select_builder.push(" ORDER BY created_at DESC LIMIT ");
    select_builder.push_bind(limit as i64);
    select_builder.push(" OFFSET ");
    select_builder.push_bind(offset);

    let entries = select_builder
        .build_query_as::<AuditLogEntry>()
        .fetch_all(&state.pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error fetching audit log: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponseWithPagination::<AuditLogEntry> {
                    data: None,
                    errors: Some(error_map("database", "Failed to fetch audit log entries")),
                    messages: Some(vec!["Failed to fetch audit log entries".to_string()]),
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
            items: entries,
            pagination,
        }),
        errors: None,
        messages: None,
    }))
}
