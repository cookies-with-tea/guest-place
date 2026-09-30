use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use serde_json::Value;
use std::sync::Arc;
use uuid::Uuid;

use crate::core::dto::ApiResponse;
use crate::AppState;

use super::model::{
    BlockType, BreadcrumbItem, CreateBlockTypeDTO, CreatePageDTO, GetPageQuery, GetPagesQuery,
    Page, SyncBlockTypesDTO, UpdateBlockTypeDTO, UpdatePageDTO,
};

#[utoipa::path(
    get,
    path = "/api/v1/pages",
    params(
        GetPagesQuery
    ),
    responses(
        (status = 200, body = ApiResponse<Vec<Page>>),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Pages"
)]
pub async fn get_pages(
    State(state): State<Arc<AppState>>,
    Query(query): Query<GetPagesQuery>,
) -> Result<Json<ApiResponse<Vec<Page>>>, (StatusCode, Json<ApiResponse<()>>)> {
    let pages_res = if let Some(ref status) = query.status {
        sqlx::query_as::<_, Page>(
            "SELECT id, title, slug, blocks, status, seo, parent_id, published_at, published_by, created_at, updated_at FROM pages WHERE status = $1 ORDER BY updated_at DESC",
        )
        .bind(status)
        .fetch_all(&state.pool)
        .await
    } else {
        sqlx::query_as::<_, Page>(
            "SELECT id, title, slug, blocks, status, seo, parent_id, published_at, published_by, created_at, updated_at FROM pages ORDER BY updated_at DESC",
        )
        .fetch_all(&state.pool)
        .await
    };

    let pages = pages_res.map_err(|e| {
        eprintln!("Database error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Failed to fetch pages".to_string()]),
            }),
        )
    })?;

    Ok(Json(ApiResponse {
        data: Some(pages),
        errors: None,
        messages: None,
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/pages/{id}",
    params(
        ("id" = String, Path, description = "Page ID or slug"),
        GetPageQuery
    ),
    responses(
        (status = 200, body = ApiResponse<Page>),
        (status = 404, description = "Page not found"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Pages"
)]
pub async fn get_page(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Query(query): Query<GetPageQuery>,
) -> Result<Json<ApiResponse<Page>>, (StatusCode, Json<ApiResponse<()>>)> {
    let clean = id.trim_start_matches('/').to_string();

    let (page_res, is_slug_lookup) = if let Ok(uuid) = Uuid::parse_str(&clean) {
        (
            sqlx::query_as::<_, Page>(
                "SELECT id, title, slug, blocks, status, seo, parent_id, published_at, published_by, created_at, updated_at FROM pages WHERE id = $1 OR slug = $2",
            )
            .bind(uuid)
            .bind(&clean)
            .fetch_optional(&state.pool)
            .await,
            false,
        )
    } else {
        (
            sqlx::query_as::<_, Page>(
                "SELECT id, title, slug, blocks, status, seo, parent_id, published_at, published_by, created_at, updated_at FROM pages WHERE slug = $1",
            )
            .bind(&clean)
            .fetch_optional(&state.pool)
            .await,
            true,
        )
    };

    let page = page_res.map_err(|e| {
        eprintln!("Database error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Failed to fetch page".to_string()]),
            }),
        )
    })?;

    match page {
        Some(p) => {
            // If requested by public slug and not published, require preview mode
            if is_slug_lookup && p.status != "published" && query.preview != Some(true) {
                return Err((
                    StatusCode::NOT_FOUND,
                    Json(ApiResponse::<()> {
                        data: None,
                        errors: None,
                        messages: Some(vec!["Page is not published yet".to_string()]),
                    }),
                ));
            }
            Ok(Json(ApiResponse {
                data: Some(p),
                errors: None,
                messages: None,
            }))
        }
        None => Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Page not found".to_string()]),
            }),
        )),
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/pages/{id}/breadcrumbs",
    params(
        ("id" = String, Path, description = "Page ID or slug")
    ),
    responses(
        (status = 200, body = ApiResponse<Vec<BreadcrumbItem>>),
        (status = 404, description = "Page not found"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Pages"
)]
pub async fn get_page_breadcrumbs(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<ApiResponse<Vec<BreadcrumbItem>>>, (StatusCode, Json<ApiResponse<()>>)> {
    let clean = id.trim_start_matches('/').to_string();

    let query_res = if let Ok(uuid) = Uuid::parse_str(&clean) {
        sqlx::query_as::<_, (Uuid, String, String)>(
            r#"
            WITH RECURSIVE page_tree AS (
                SELECT id, title, slug, parent_id, 1 as depth
                FROM pages
                WHERE id = $1 OR slug = $2
                UNION ALL
                SELECT p.id, p.title, p.slug, p.parent_id, pt.depth + 1
                FROM pages p
                JOIN page_tree pt ON p.id = pt.parent_id
            )
            SELECT id, title, slug
            FROM page_tree
            ORDER BY depth DESC
            "#,
        )
        .bind(uuid)
        .bind(&clean)
        .fetch_all(&state.pool)
        .await
    } else {
        sqlx::query_as::<_, (Uuid, String, String)>(
            r#"
            WITH RECURSIVE page_tree AS (
                SELECT id, title, slug, parent_id, 1 as depth
                FROM pages
                WHERE slug = $1
                UNION ALL
                SELECT p.id, p.title, p.slug, p.parent_id, pt.depth + 1
                FROM pages p
                JOIN page_tree pt ON p.id = pt.parent_id
            )
            SELECT id, title, slug
            FROM page_tree
            ORDER BY depth DESC
            "#,
        )
        .bind(&clean)
        .fetch_all(&state.pool)
        .await
    };

    let rows = query_res.map_err(|e| {
        eprintln!("Database error fetching breadcrumbs: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Failed to fetch breadcrumbs".to_string()]),
            }),
        )
    })?;

    if rows.is_empty() {
        return Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Page not found".to_string()]),
            }),
        ));
    }

    let items = rows
        .into_iter()
        .map(|(id, title, slug)| BreadcrumbItem { id, title, slug })
        .collect();

    Ok(Json(ApiResponse {
        data: Some(items),
        errors: None,
        messages: None,
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/pages/sitemap.xml",
    responses(
        (status = 200, description = "Sitemap XML", content_type = "application/xml")
    ),
    tag = "Pages"
)]
pub async fn get_sitemap_xml(
    State(state): State<Arc<AppState>>,
) -> impl axum::response::IntoResponse {
    let pages_res = sqlx::query_as::<_, (String, chrono::DateTime<chrono::Utc>)>(
        "SELECT slug, updated_at FROM pages WHERE status = 'published' ORDER BY updated_at DESC",
    )
    .fetch_all(&state.pool)
    .await;

    let base_url = state.frontend_url.trim_end_matches('/');

    let mut xml = String::from("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    xml.push_str("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

    let static_routes = [
        ("", "1.0", "daily"),
        ("about", "0.8", "weekly"),
        ("platforms", "0.8", "weekly"),
        ("guests", "0.8", "weekly"),
    ];

    let now_date = chrono::Utc::now().format("%Y-%m-%d").to_string();

    for (route, priority, freq) in static_routes {
        let loc = if route.is_empty() {
            format!("{}/", base_url)
        } else {
            format!("{}/{}", base_url, route)
        };
        xml.push_str(&format!(
            "  <url>\n    <loc>{}</loc>\n    <lastmod>{}</lastmod>\n    <changefreq>{}</changefreq>\n    <priority>{}</priority>\n  </url>\n",
            loc, now_date, freq, priority
        ));
    }

    if let Ok(pages) = pages_res {
        for (slug, updated_at) in pages {
            let lastmod = updated_at.format("%Y-%m-%d").to_string();
            let loc = format!("{}/p/{}", base_url, slug.trim_start_matches('/'));
            xml.push_str(&format!(
                "  <url>\n    <loc>{}</loc>\n    <lastmod>{}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n",
                loc, lastmod
            ));
        }
    }

    xml.push_str("</urlset>\n");

    axum::response::Response::builder()
        .header(axum::http::header::CONTENT_TYPE, "application/xml; charset=utf-8")
        .body(axum::body::Body::from(xml))
        .unwrap()
}

#[utoipa::path(
    post,
    path = "/api/v1/pages",
    request_body = CreatePageDTO,
    responses(
        (status = 201, body = ApiResponse<Page>),
        (status = 400, description = "Bad Request"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Pages",
    security(("bearer_auth" = []))
)]
pub async fn create_page(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreatePageDTO>,
) -> Result<(StatusCode, Json<ApiResponse<Page>>), (StatusCode, Json<ApiResponse<()>>)> {
    let clean_slug = payload.slug.trim_start_matches('/').to_string();
    let blocks = payload.blocks.unwrap_or_else(|| serde_json::json!([]));
    let status = payload.status.unwrap_or_else(|| "draft".to_string());
    let seo = payload.seo.unwrap_or_else(|| serde_json::json!({}));

    let published_at = if status == "published" {
        payload.published_at.or_else(|| Some(chrono::Utc::now()))
    } else {
        payload.published_at
    };

    let page = sqlx::query_as::<_, Page>(
        r#"
        INSERT INTO pages (title, slug, blocks, status, seo, parent_id, published_at, published_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, title, slug, blocks, status, seo, parent_id, published_at, published_by, created_at, updated_at
        "#,
    )
    .bind(payload.title)
    .bind(clean_slug)
    .bind(blocks)
    .bind(status)
    .bind(seo)
    .bind(payload.parent_id)
    .bind(published_at)
    .bind(payload.published_by)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error creating page: {}", e);
        (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec![format!("Failed to create page: {}", e)]),
            }),
        )
    })?;

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse {
            data: Some(page),
            errors: None,
            messages: None,
        }),
    ))
}

#[utoipa::path(
    patch,
    path = "/api/v1/pages/{id}",
    params(
        ("id" = Uuid, Path, description = "Page ID")
    ),
    request_body = UpdatePageDTO,
    responses(
        (status = 200, body = ApiResponse<Page>),
        (status = 404, description = "Page not found"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Pages",
    security(("bearer_auth" = []))
)]
pub async fn update_page(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdatePageDTO>,
) -> Result<Json<ApiResponse<Page>>, (StatusCode, Json<ApiResponse<()>>)> {
    let clean_slug = payload.slug.map(|s| s.trim_start_matches('/').to_string());
    let update_parent = payload.clear_parent == Some(true) || payload.parent_id.is_some();
    let new_parent_id = if payload.clear_parent == Some(true) {
        None
    } else {
        payload.parent_id
    };

    let page = sqlx::query_as::<_, Page>(
        r#"
        UPDATE pages
        SET 
            title = COALESCE($1, title),
            slug = COALESCE($2, slug),
            blocks = COALESCE($3, blocks),
            status = COALESCE($4, status),
            seo = COALESCE($5, seo),
            parent_id = CASE WHEN $6 THEN $7 ELSE parent_id END,
            published_at = CASE 
                WHEN $4 = 'published' AND published_at IS NULL THEN NOW()
                WHEN $8::timestamptz IS NOT NULL THEN $8
                ELSE published_at
            END,
            published_by = COALESCE($9, published_by),
            updated_at = NOW()
        WHERE id = $10
        RETURNING id, title, slug, blocks, status, seo, parent_id, published_at, published_by, created_at, updated_at
        "#,
    )
    .bind(payload.title)
    .bind(clean_slug)
    .bind(payload.blocks)
    .bind(payload.status)
    .bind(payload.seo)
    .bind(update_parent)
    .bind(new_parent_id)
    .bind(payload.published_at)
    .bind(payload.published_by)
    .bind(id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error updating page: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec![format!("Failed to update page: {}", e)]),
            }),
        )
    })?;

    match page {
        Some(p) => Ok(Json(ApiResponse {
            data: Some(p),
            errors: None,
            messages: None,
        })),
        None => Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Page not found".to_string()]),
            }),
        )),
    }
}

#[utoipa::path(
    delete,
    path = "/api/v1/pages/{id}",
    params(
        ("id" = Uuid, Path, description = "Page ID")
    ),
    responses(
        (status = 200, body = ApiResponse<Value>),
        (status = 404, description = "Page not found"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Pages",
    security(("bearer_auth" = []))
)]
pub async fn delete_page(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<Value>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = sqlx::query("DELETE FROM pages WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| {
            eprintln!("Database error deleting page: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()> {
                    data: None,
                    errors: None,
                    messages: Some(vec!["Failed to delete page".to_string()]),
                }),
            )
        })?;

    if result.rows_affected() == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Page not found".to_string()]),
            }),
        ));
    }

    Ok(Json(ApiResponse {
        data: Some(serde_json::json!({ "success": true })),
        errors: None,
        messages: Some(vec!["Page deleted successfully".to_string()]),
    }))
}

// ----------------- BLOCK TYPES HANDLERS -----------------

#[utoipa::path(
    get,
    path = "/api/v1/block-types",
    responses(
        (status = 200, body = ApiResponse<Vec<BlockType>>),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Pages"
)]
pub async fn get_block_types(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Vec<BlockType>>>, (StatusCode, Json<ApiResponse<()>>)> {
    let block_types = sqlx::query_as::<_, BlockType>(
        "SELECT id, name, slug, description, icon, schema, category, created_at, updated_at FROM block_types ORDER BY created_at ASC",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Failed to fetch block types".to_string()]),
            }),
        )
    })?;

    Ok(Json(ApiResponse {
        data: Some(block_types),
        errors: None,
        messages: None,
    }))
}

#[utoipa::path(
    post,
    path = "/api/v1/block-types",
    request_body = CreateBlockTypeDTO,
    responses(
        (status = 201, body = ApiResponse<BlockType>),
        (status = 400, description = "Bad Request"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Pages",
    security(("bearer_auth" = []))
)]
pub async fn create_block_type(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateBlockTypeDTO>,
) -> Result<(StatusCode, Json<ApiResponse<BlockType>>), (StatusCode, Json<ApiResponse<()>>)> {
    let icon = payload.icon.unwrap_or_else(|| "📦".to_string());
    let category = payload.category.unwrap_or_else(|| "content".to_string());

    let block_type = sqlx::query_as::<_, BlockType>(
        r#"
        INSERT INTO block_types (name, slug, description, icon, schema, category)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, slug, description, icon, schema, category, created_at, updated_at
        "#,
    )
    .bind(payload.name)
    .bind(payload.slug)
    .bind(payload.description)
    .bind(icon)
    .bind(payload.schema)
    .bind(category)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error creating block type: {}", e);
        (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec![format!("Failed to create block type: {}", e)]),
            }),
        )
    })?;

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse {
            data: Some(block_type),
            errors: None,
            messages: None,
        }),
    ))
}

#[utoipa::path(
    patch,
    path = "/api/v1/block-types/{id}",
    params(
        ("id" = Uuid, Path, description = "Block Type ID")
    ),
    request_body = UpdateBlockTypeDTO,
    responses(
        (status = 200, body = ApiResponse<BlockType>),
        (status = 404, description = "Block type not found"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Pages",
    security(("bearer_auth" = []))
)]
pub async fn update_block_type(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateBlockTypeDTO>,
) -> Result<Json<ApiResponse<BlockType>>, (StatusCode, Json<ApiResponse<()>>)> {
    let block_type = sqlx::query_as::<_, BlockType>(
        r#"
        UPDATE block_types
        SET 
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            icon = COALESCE($3, icon),
            schema = COALESCE($4, schema),
            category = COALESCE($5, category),
            updated_at = NOW()
        WHERE id = $6
        RETURNING id, name, slug, description, icon, schema, category, created_at, updated_at
        "#,
    )
    .bind(payload.name)
    .bind(payload.description)
    .bind(payload.icon)
    .bind(payload.schema)
    .bind(payload.category)
    .bind(id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error updating block type: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec![format!("Failed to update block type: {}", e)]),
            }),
        )
    })?;

    match block_type {
        Some(bt) => Ok(Json(ApiResponse {
            data: Some(bt),
            errors: None,
            messages: None,
        })),
        None => Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Block type not found".to_string()]),
            }),
        )),
    }
}

#[utoipa::path(
    delete,
    path = "/api/v1/block-types/{id}",
    params(
        ("id" = Uuid, Path, description = "Block Type ID")
    ),
    responses(
        (status = 200, body = ApiResponse<Value>),
        (status = 404, description = "Block type not found"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Pages",
    security(("bearer_auth" = []))
)]
pub async fn delete_block_type(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<Value>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = sqlx::query("DELETE FROM block_types WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| {
            eprintln!("Database error deleting block type: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()> {
                    data: None,
                    errors: None,
                    messages: Some(vec!["Failed to delete block type".to_string()]),
                }),
            )
        })?;

    if result.rows_affected() == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Block type not found".to_string()]),
            }),
        ));
    }

    Ok(Json(ApiResponse {
        data: Some(serde_json::json!({ "success": true })),
        errors: None,
        messages: Some(vec!["Block type deleted successfully".to_string()]),
    }))
}

#[utoipa::path(
    post,
    path = "/api/v1/block-types/sync",
    request_body = SyncBlockTypesDTO,
    responses(
        (status = 200, body = ApiResponse<Vec<BlockType>>),
        (status = 400, description = "Bad Request"),
        (status = 500, description = "Internal Server Error")
    ),
    tag = "Pages"
)]
pub async fn sync_block_types(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<SyncBlockTypesDTO>,
) -> Result<Json<ApiResponse<Vec<BlockType>>>, (StatusCode, Json<ApiResponse<()>>)> {
    for item in payload.blocks {
        let icon = item.icon.unwrap_or_else(|| "📦".to_string());
        let category = item.category.unwrap_or_else(|| "content".to_string());

        let _ = sqlx::query(
            r#"
            INSERT INTO block_types (name, slug, description, icon, schema, category)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (slug) DO UPDATE
            SET 
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                icon = EXCLUDED.icon,
                schema = EXCLUDED.schema,
                category = EXCLUDED.category,
                updated_at = NOW()
            "#,
        )
        .bind(item.name)
        .bind(item.slug)
        .bind(item.description)
        .bind(icon)
        .bind(item.schema)
        .bind(category)
        .execute(&state.pool)
        .await
        .map_err(|e| {
            eprintln!("Error syncing block type: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()> {
                    data: None,
                    errors: None,
                    messages: Some(vec![format!("Failed to sync block types: {}", e)]),
                }),
            )
        })?;
    }

    let all_blocks = sqlx::query_as::<_, BlockType>(
        "SELECT id, name, slug, description, icon, schema, category, created_at, updated_at FROM block_types ORDER BY created_at ASC",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error fetching blocks after sync: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                data: None,
                errors: None,
                messages: Some(vec!["Failed to fetch block types".to_string()]),
            }),
        )
    })?;

    Ok(Json(ApiResponse {
        data: Some(all_blocks),
        errors: None,
        messages: Some(vec!["Block types synced successfully".to_string()]),
    }))
}
