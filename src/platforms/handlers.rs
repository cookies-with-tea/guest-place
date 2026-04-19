use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use std::sync::Arc;

use crate::{
    AppState, core::{
        dto::ApiResponse,
        handlers::get_media_by_uuid,
        response::into_api_response,
    }
};

use super::dto::{
    PlatformsResponseDTO, UpdatePlatformsDTO, 
    OpportunitiesDTO, OpportunityItemDTO,
    ToolsAndServicesDTO, ToolItemDTO,
};

#[utoipa::path(
    get,
    path = "/api/v1/platforms",
    responses(
        (status = 200, body = ApiResponse<PlatformsResponseDTO>),
        (status = 404, body = ApiResponse<PlatformsResponseDTO>),
        (status = 500, body = ApiResponse<PlatformsResponseDTO>)
    ),
    tag = "Platforms",
    operation_id = "get_platforms",
)]
pub async fn get_platforms(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<PlatformsResponseDTO>>, (StatusCode, Json<ApiResponse<()>>)> {

    let platforms_row = sqlx::query_as::<_, (
        String, 
        String, 
        Option<uuid::Uuid>, 
        Option<uuid::Uuid>, 
        Option<uuid::Uuid>
    )>(
        "SELECT title, description, hero_guide_uuid, opportunities_guide_uuid, tools_guide_uuid FROM platforms LIMIT 1"
    )
    .fetch_optional(&state.pool)
    .await;

    let platforms_data = match platforms_row {
        Ok(Some(row)) => {
            // 1. Fetch raw items
            let opp_items = fetch_opportunities(&state).await.map_err(|e| {
                eprintln!("Error fetching opportunities: {:?}", e);
                e
            })?;

            let opportunities = OpportunitiesDTO {
                title: "Opportunities".to_string(),
                items: opp_items,
            };

            let tools_and_services = fetch_tools_and_services(&state).await.map_err(|e| {
                eprintln!("Error fetching tools and services: {:?}", e);
                e
            })?;

            let hero_guide = get_media_by_uuid(&state, row.2).await.unwrap_or(None);
            let opportunities_guide = get_media_by_uuid(&state, row.3).await.unwrap_or(None);
            let tools_guide = get_media_by_uuid(&state, row.4).await.unwrap_or(None);

            PlatformsResponseDTO {
                title: row.0,
                description: row.1,
                hero_guide,
                opportunities_guide,
                tools_guide,
                hero_guide_uuid: row.2,
                opportunities_guide_uuid: row.3,
                tools_guide_uuid: row.4,
                opportunities,
                tools_and_services,
            }
        },
        Ok(None) => {
            return Ok(Json(ApiResponse {
                data: None,
                errors: Some(std::collections::HashMap::from([(
                    "not_found".to_string(),
                    vec!["Platforms information not found".to_string()]
                )])),
                messages: None,
            }));
        },
        Err(e) => {
            eprintln!("Database error: {:?}", e);
            return Ok(Json(ApiResponse {
                data: None,
                errors: Some(std::collections::HashMap::from([(
                    "database".to_string(),
                    vec!["Failed to fetch platforms information".to_string()]
                )])),
                messages: None,
            }));
        }
    };

    Ok(Json(ApiResponse {
        data: Some(platforms_data),
        errors: None,
        messages: None,
    }))
}

async fn fetch_opportunities(
    state: &Arc<AppState>,
) -> Result<Vec<OpportunityItemDTO>, (StatusCode, Json<ApiResponse<()>>)> {
    let opportunities = sqlx::query_as::<_, (i32, Option<uuid::Uuid>, String, String, String)>(
        "SELECT id, icon_uuid, title, link, button_text FROM platforms_opportunities ORDER BY id"
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error fetching opportunities list: {:?}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse {
                data: None,
                errors: Some(std::collections::HashMap::from([(
                    "database".to_string(),
                    vec!["Failed to fetch opportunities".to_string()]
                )])),
                messages: None,
            })
        )
    })?;

    let mut result = Vec::new();

    for opp in opportunities {
        let items = sqlx::query_scalar::<_, String>(
            "SELECT item_text FROM platforms_opportunity_items WHERE opportunity_id = $1 ORDER BY id"
        )
        .bind(opp.0)
        .fetch_all(&state.pool)
        .await
        .map_err(|e| {
            eprintln!("Database error fetching opportunity items: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse {
                    data: None,
                    errors: Some(std::collections::HashMap::from([(
                        "database".to_string(),
                        vec!["Failed to fetch opportunity items".to_string()]
                    )])),
                    messages: None,
                })
            )
        })?;

        let icon = get_media_by_uuid(&state, opp.1).await.map_err(|e| {
            eprintln!("Database error fetching opportunity icon: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse {
                    data: None,
                    errors: Some(std::collections::HashMap::from([(
                        "database".to_string(),
                        vec!["Failed to fetch opportunity icon".to_string()]
                    )])),
                    messages: None,
                })
            )
        })?;

        result.push(OpportunityItemDTO {
            icon: icon.unwrap_or(crate::core::dto::MediaDTO {
                url: "".to_string(),
                alt: None,
                title: None,
            }),
            title: opp.2,
            items,
            link: opp.3,
            button_text: opp.4,
        });
    }

    Ok(result)
}

async fn fetch_tools_and_services(
    state: &Arc<AppState>,
) -> Result<ToolsAndServicesDTO, (StatusCode, Json<ApiResponse<()>>)> {
    let tools = sqlx::query_as::<_, (Option<uuid::Uuid>, String)>(
        "SELECT logo_uuid, title FROM platforms_tools LIMIT 1"
    )
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {:?}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse {
                data: None,
                errors: Some(std::collections::HashMap::from([(
                    "database".to_string(),
                    vec!["Failed to fetch tools and services".to_string()]
                )])),
                messages: None,
            })
        )
    })?;

    let tools_data = match tools {
        Some(tools_row) => {
            let items = sqlx::query_as::<_, (String, String)>(
                "SELECT title, text FROM platforms_tools_items ORDER BY id"
            )
            .fetch_all(&state.pool)
            .await
            .map_err(|e| {
                eprintln!("Database error: {:?}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse {
                        data: None,
                        errors: Some(std::collections::HashMap::from([(
                            "database".to_string(),
                            vec!["Failed to fetch tool items".to_string()]
                        )])),
                        messages: None,
                    })
                )
            })?;

            let mut tool_items = Vec::new();

            for item in items {
                tool_items.push(ToolItemDTO {
                    title: item.0,
                    text: item.1,
                });
            }

            let logo = get_media_by_uuid(&state, tools_row.0).await.map_err(|e| {
                eprintln!("Database error: {:?}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse {
                        data: None,
                        errors: Some(std::collections::HashMap::from([(
                            "database".to_string(),
                            vec!["Failed to fetch tools logo".to_string()]
                        )])),
                        messages: None,
                    })
                )
            })?;

            ToolsAndServicesDTO {
                logo: logo.unwrap_or(crate::core::dto::MediaDTO {
                    url: "".to_string(),
                    alt: None,
                    title: None,
                }),
                title: tools_row.1,
                items: tool_items,
            }
        },
        None => ToolsAndServicesDTO {
            logo: crate::core::dto::MediaDTO {
                url: "".to_string(),
                alt: None,
                title: None,
            },
            title: "".to_string(),
            items: Vec::new(),
        },
    };

    Ok(tools_data)
}

#[utoipa::path(
    put,
    path = "/api/v1/platforms",
    request_body = UpdatePlatformsDTO,
    responses(
        (status = 200, description = "Platforms page updated"),
        (status = 500, description = "Database error")
    ),
    tag = "Platforms"
)]
pub async fn update_platforms(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<UpdatePlatformsDTO>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let mut tx = state.pool.begin().await.map_err(|e| {
        eprintln!("Error starting transaction: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Server error".to_string()]) }))
    })?;

    // 1. Upsert main platforms table
    let platforms_id = sqlx::query_scalar::<_, i32>(
        "INSERT INTO platforms (id, title, description, hero_guide_uuid, opportunities_guide_uuid, tools_guide_uuid, updated_at) 
         VALUES (1, $1, $2, $3, $4, $5, NOW())
         ON CONFLICT (id) DO UPDATE SET 
            title = EXCLUDED.title, 
            description = EXCLUDED.description, 
            hero_guide_uuid = EXCLUDED.hero_guide_uuid,
            opportunities_guide_uuid = EXCLUDED.opportunities_guide_uuid,
            tools_guide_uuid = EXCLUDED.tools_guide_uuid,
            updated_at = NOW() 
         RETURNING id"
    )
    .bind(&payload.title)
    .bind(&payload.description)
    .bind(payload.hero_guide_uuid)
    .bind(payload.opportunities_guide_uuid)
    .bind(payload.tools_guide_uuid)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| {
        eprintln!("Error updating platforms: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to update platforms title".to_string()]) }))
    })?;

    // 2. Update Opportunities
    sqlx::query("DELETE FROM platforms_opportunities WHERE platforms_id = $1")
        .bind(platforms_id)
        .execute(&mut *tx)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to clear opportunities".to_string()]) })))?;

    for opp in payload.opportunities {
        let opp_id = sqlx::query_scalar::<_, i32>(
            "INSERT INTO platforms_opportunities (title, platforms_id, icon_uuid, link, button_text) VALUES ($1, $2, $3, $4, $5) RETURNING id"
        )
        .bind(&opp.title)
        .bind(platforms_id)
        .bind(opp.icon_uuid)
        .bind(&opp.link)
        .bind(&opp.button_text)
        .fetch_one(&mut *tx)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to insert opportunity".to_string()]) })))?;

        for item_text in opp.items {
            sqlx::query("INSERT INTO platforms_opportunity_items (opportunity_id, item_text) VALUES ($1, $2)")
                .bind(opp_id)
                .bind(item_text)
                .execute(&mut *tx)
                .await
                .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to insert opportunity item".to_string()]) })))?;
        }
    }

    // 3. Update Tools and Services
    sqlx::query("DELETE FROM platforms_tools WHERE platforms_id = $1")
        .bind(platforms_id)
        .execute(&mut *tx)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to clear tools".to_string()]) })))?;

    let tools_id = sqlx::query_scalar::<_, i32>(
        "INSERT INTO platforms_tools (platforms_id, logo_uuid, title) VALUES ($1, $2, $3) RETURNING id"
    )
    .bind(platforms_id)
    .bind(payload.tools_logo_uuid)
    .bind(&payload.tools_title)
    .fetch_one(&mut *tx)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to insert tools".to_string()]) })))?;

    for item in payload.tools_items {
        sqlx::query("INSERT INTO platforms_tools_items (tools_id, title, text) VALUES ($1, $2, $3)")
            .bind(tools_id)
            .bind(item.title)
            .bind(item.text)
            .execute(&mut *tx)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to insert tool item".to_string()]) })))?;
    }

    tx.commit().await.map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to commit transaction".to_string()]) })))?;

    into_api_response(StatusCode::OK, None, None, Some(vec!["Platforms page updated successfully".to_string()]))
}

pub fn router() -> axum::Router<Arc<AppState>> {
    axum::Router::new()
        .route("/", axum::routing::get(get_platforms).put(update_platforms))
}
