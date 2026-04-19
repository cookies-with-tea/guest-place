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
    AboutResponseDTO, NewsDTO, NewsItemDTO, UpdateAboutDTO, WhoWeAreItemDTO,
    LeadershipDTO, LeadershipItemDTO, OpportunitiesDTO, OpportunityItemDTO,
};

#[utoipa::path(
    get,
    path = "/api/v1/about",
    responses(
        (status = 200, body = ApiResponse<AboutResponseDTO>),
        (status = 404, body = ApiResponse<AboutResponseDTO>),
        (status = 500, body = ApiResponse<AboutResponseDTO>)
    ),
    tag = "About",
    operation_id = "get_about",
)]
pub async fn get_about(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<AboutResponseDTO>>, (StatusCode, Json<ApiResponse<()>>)> {

    let about_row = sqlx::query_as::<_, (
        String, 
        String, 
        Option<uuid::Uuid>, 
        Option<uuid::Uuid>, 
        Option<uuid::Uuid>, 
        Option<uuid::Uuid>, 
        Option<uuid::Uuid>
    )>(
        "SELECT title, description, hero_guide_uuid, opportunities_guide_uuid, leadership_guide_uuid, who_we_are_guide_uuid, news_guide_uuid FROM about LIMIT 1"
    )
    .fetch_optional(&state.pool)
    .await;

    let about_data = match about_row {
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

            let leadership = fetch_leadership(&state).await.map_err(|e| {
                eprintln!("Error fetching leadership: {:?}", e);
                e
            })?;

            let who_we_are = fetch_who_we_are(&state).await.map_err(|e| {
                eprintln!("Error fetching who we are: {:?}", e);
                e
            })?;

            let news = fetch_news(&state).await.map_err(|e| {
                eprintln!("Error fetching news: {:?}", e);
                e
            })?;

            let hero_guide = get_media_by_uuid(&state, row.2).await.unwrap_or(None);
            let opportunities_guide = get_media_by_uuid(&state, row.3).await.unwrap_or(None);
            let leadership_guide = get_media_by_uuid(&state, row.4).await.unwrap_or(None);
            let who_we_are_guide = get_media_by_uuid(&state, row.5).await.unwrap_or(None);
            let news_guide = get_media_by_uuid(&state, row.6).await.unwrap_or(None);

            AboutResponseDTO {
                title: row.0,
                description: row.1,
                hero_guide,
                opportunities_guide,
                leadership_guide,
                who_we_are_guide,
                news_guide,
                hero_guide_uuid: row.2,
                opportunities_guide_uuid: row.3,
                leadership_guide_uuid: row.4,
                who_we_are_guide_uuid: row.5,
                news_guide_uuid: row.6,
                opportunities,
                leadership,
                who_we_are,
                news,
            }
        },
        Ok(None) => {
            return Ok(Json(ApiResponse {
                data: None,
                errors: Some(std::collections::HashMap::from([(
                    "not_found".to_string(),
                    vec!["About information not found".to_string()]
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
                    vec!["Failed to fetch about information".to_string()]
                )])),
                messages: None,
            }));
        }
    };

    Ok(Json(ApiResponse {
        data: Some(about_data),
        errors: None,
        messages: None,
    }))
}

async fn fetch_opportunities(
    state: &Arc<AppState>,
) -> Result<Vec<OpportunityItemDTO>, (StatusCode, Json<ApiResponse<()>>)> {
    let opportunities = sqlx::query_as::<_, (i32, Option<uuid::Uuid>, String, String, String)>(
        "SELECT id, icon_uuid, title, link, button_text FROM about_opportunities ORDER BY id"
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
            "SELECT item_text FROM about_opportunity_items WHERE opportunity_id = $1 ORDER BY id"
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

async fn fetch_leadership(
    state: &Arc<AppState>,
) -> Result<LeadershipDTO, (StatusCode, Json<ApiResponse<()>>)> {
    let leadership = sqlx::query_as::<_, (Option<uuid::Uuid>, String, String)>(
        "SELECT logo_uuid, title, description FROM about_leadership LIMIT 1"
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
                    vec!["Failed to fetch leadership".to_string()]
                )])),
                messages: None,
            })
        )
    })?;

    let leadership_data = match leadership {
        Some(lead) => {
            // Fetch leadership items
            let items = sqlx::query_as::<_, (Option<uuid::Uuid>, String)>(
                "SELECT icon_uuid, text FROM about_leadership_items ORDER BY id"
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
                            vec!["Failed to fetch leadership items".to_string()]
                        )])),
                        messages: None,
                    })
                )
            })?;

            let mut leadership_items = Vec::new();

            for item in items {
                // Get icon media if available
                let icon = get_media_by_uuid(&state, item.0).await.map_err(|e| {
                    eprintln!("Database error: {:?}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(ApiResponse {
                            data: None,
                            errors: Some(std::collections::HashMap::from([(
                                "database".to_string(),
                                vec!["Failed to fetch leadership item icon".to_string()]
                            )])),
                            messages: None,
                        })
                    )
                })?;

                leadership_items.push(LeadershipItemDTO {
                    icon: icon.unwrap_or(crate::core::dto::MediaDTO {
                        url: "".to_string(),
                        alt: None,
                        title: None,
                    }),
                    text: item.1,
                });
            }

            // Get logo media if available
            let logo = get_media_by_uuid(&state, lead.0).await.map_err(|e| {
                eprintln!("Database error: {:?}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse {
                        data: None,
                        errors: Some(std::collections::HashMap::from([(
                            "database".to_string(),
                            vec!["Failed to fetch leadership logo".to_string()]
                        )])),
                        messages: None,
                    })
                )
            })?;

            LeadershipDTO {
                logo: logo.unwrap_or(crate::core::dto::MediaDTO {
                    url: "".to_string(),
                    alt: None,
                    title: None,
                }),
                title: lead.1,
                description: lead.2,
                items: leadership_items,
            }
        },
        None => LeadershipDTO {
            logo: crate::core::dto::MediaDTO {
                url: "".to_string(),
                alt: None,
                title: None,
            },
            title: "".to_string(),
            description: "".to_string(),
            items: Vec::new(),
        },
    };

    Ok(leadership_data)
}

async fn fetch_who_we_are(
    state: &Arc<AppState>,
) -> Result<Vec<WhoWeAreItemDTO>, (StatusCode, Json<ApiResponse<()>>)> {
    let items = sqlx::query_as::<_, (String, String, Option<uuid::Uuid>)>(
        "SELECT title, description, image_uuid FROM about_who_we_are ORDER BY id"
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
                    vec!["Failed to fetch who we are items".to_string()]
                )])),
                messages: None,
            })
        )
    })?;

    let mut result = Vec::new();

    for item in items {
        // Get image media if available
        let image = get_media_by_uuid(&state, item.2).await.map_err(|e| {
            eprintln!("Database error: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse {
                    data: None,
                    errors: Some(std::collections::HashMap::from([(
                        "database".to_string(),
                        vec!["Failed to fetch who we are image".to_string()]
                    )])),
                    messages: None,
                })
            )
        })?;

        result.push(WhoWeAreItemDTO {
            title: item.0,
            description: item.1,
            image: image.unwrap_or(crate::core::dto::MediaDTO {
                url: "".to_string(),
                alt: None,
                title: None,
            }),
        });
    }

    Ok(result)
}

async fn fetch_news(
    state: &Arc<AppState>,
) -> Result<NewsDTO, (StatusCode, Json<ApiResponse<()>>)> {
    let news = sqlx::query_as::<_, (String,)>(
        "SELECT title FROM about_news LIMIT 1"
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
                    vec!["Failed to fetch news".to_string()]
                )])),
                messages: None,
            })
        )
    })?;

    let news_data = match news {
        Some(news_row) => {
            // Fetch news items
            let items = sqlx::query_as::<_, (Option<uuid::Uuid>, String)>(
                "SELECT icon_uuid, text FROM about_news_items ORDER BY id"
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
                            vec!["Failed to fetch news items".to_string()]
                        )])),
                        messages: None,
                    })
                )
            })?;

            let mut news_items = Vec::new();

            for item in items {
                // Get icon media if available
                let icon = get_media_by_uuid(&state, item.0).await.map_err(|e| {
                    eprintln!("Database error: {:?}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(ApiResponse {
                            data: None,
                            errors: Some(std::collections::HashMap::from([(
                                "database".to_string(),
                                vec!["Failed to fetch news item icon".to_string()]
                            )])),
                            messages: None,
                        })
                    )
                })?;

                news_items.push(NewsItemDTO {
                    icon: icon.unwrap_or(crate::core::dto::MediaDTO {
                        url: "".to_string(),
                        alt: None,
                        title: None,
                    }),
                    text: item.1,
                });
            }

            NewsDTO {
                title: news_row.0,
                items: news_items,
            }
        },
        None => NewsDTO {
            title: "".to_string(),
            items: Vec::new(),
        },
    };

    Ok(news_data)
}

#[utoipa::path(
    put,
    path = "/api/v1/about",
    request_body = UpdateAboutDTO,
    responses(
        (status = 200, description = "About page updated"),
        (status = 500, description = "Database error")
    ),
    tag = "About"
)]
pub async fn update_about(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<UpdateAboutDTO>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let mut tx = state.pool.begin().await.map_err(|e| {
        eprintln!("Error starting transaction: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Server error".to_string()]) }))
    })?;

    // 1. Upsert main about table
    let about_id = sqlx::query_scalar::<_, i32>(
        "INSERT INTO about (id, title, description, hero_guide_uuid, opportunities_guide_uuid, leadership_guide_uuid, who_we_are_guide_uuid, news_guide_uuid, updated_at) 
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (id) DO UPDATE SET 
            title = EXCLUDED.title, 
            description = EXCLUDED.description, 
            hero_guide_uuid = EXCLUDED.hero_guide_uuid,
            opportunities_guide_uuid = EXCLUDED.opportunities_guide_uuid,
            leadership_guide_uuid = EXCLUDED.leadership_guide_uuid,
            who_we_are_guide_uuid = EXCLUDED.who_we_are_guide_uuid,
            news_guide_uuid = EXCLUDED.news_guide_uuid,
            updated_at = NOW() 
         RETURNING id"
    )
    .bind(&payload.title)
    .bind(&payload.description)
    .bind(payload.hero_guide_uuid)
    .bind(payload.opportunities_guide_uuid)
    .bind(payload.leadership_guide_uuid)
    .bind(payload.who_we_are_guide_uuid)
    .bind(payload.news_guide_uuid)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| {
        eprintln!("Error updating about: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to update about title".to_string()]) }))
    })?;

    // 2. Update Opportunities
    sqlx::query("DELETE FROM about_opportunities WHERE about_id = $1")
        .bind(about_id)
        .execute(&mut *tx)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to clear opportunities".to_string()]) })))?;

    for opp in payload.opportunities {
        let opp_id = sqlx::query_scalar::<_, i32>(
            "INSERT INTO about_opportunities (title, about_id, icon_uuid, link, button_text) VALUES ($1, $2, $3, $4, $5) RETURNING id"
        )
        .bind(&opp.title)
        .bind(about_id)
        .bind(opp.icon_uuid)
        .bind(&opp.link)
        .bind(&opp.button_text)
        .fetch_one(&mut *tx)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to insert opportunity".to_string()]) })))?;

        for item_text in opp.items {
            sqlx::query("INSERT INTO about_opportunity_items (opportunity_id, item_text) VALUES ($1, $2)")
                .bind(opp_id)
                .bind(item_text)
                .execute(&mut *tx)
                .await
                .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to insert opportunity item".to_string()]) })))?;
        }
    }

    // 3. Update Leadership
    sqlx::query("DELETE FROM about_leadership WHERE about_id = $1")
        .bind(about_id)
        .execute(&mut *tx)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to clear leadership".to_string()]) })))?;

    let lead_id = sqlx::query_scalar::<_, i32>(
        "INSERT INTO about_leadership (about_id, logo_uuid, title, description) VALUES ($1, $2, $3, $4) RETURNING id"
    )
    .bind(about_id)
    .bind(payload.leadership_logo_uuid)
    .bind(&payload.leadership_title)
    .bind(&payload.leadership_description)
    .fetch_one(&mut *tx)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to insert leadership".to_string()]) })))?;

    for item in payload.leadership_items {
        sqlx::query("INSERT INTO about_leadership_items (leadership_id, icon_uuid, text) VALUES ($1, $2, $3)")
            .bind(lead_id)
            .bind(item.icon_uuid)
            .bind(item.text)
            .execute(&mut *tx)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to insert leadership item".to_string()]) })))?;
    }

    // 4. Update Who We Are
    sqlx::query("DELETE FROM about_who_we_are WHERE about_id = $1")
        .bind(about_id)
        .execute(&mut *tx)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to clear who we are".to_string()]) })))?;

    for item in payload.who_we_are {
        sqlx::query("INSERT INTO about_who_we_are (about_id, title, description, image_uuid) VALUES ($1, $2, $3, $4)")
            .bind(about_id)
            .bind(item.title)
            .bind(item.description)
            .bind(item.image_uuid)
            .execute(&mut *tx)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to insert who we are item".to_string()]) })))?;
    }

    // 5. Update News
    sqlx::query("DELETE FROM about_news WHERE about_id = $1")
        .bind(about_id)
        .execute(&mut *tx)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to clear news".to_string()]) })))?;

    let news_id = sqlx::query_scalar::<_, i32>(
        "INSERT INTO about_news (about_id, title) VALUES ($1, $2) RETURNING id"
    )
    .bind(about_id)
    .bind(payload.news_title)
    .fetch_one(&mut *tx)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to insert news".to_string()]) })))?;

    for item in payload.news_items {
        sqlx::query("INSERT INTO about_news_items (news_id, icon_uuid, text) VALUES ($1, $2, $3)")
            .bind(news_id)
            .bind(item.icon_uuid)
            .bind(item.text)
            .execute(&mut *tx)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to insert news item".to_string()]) })))?;
    }

    tx.commit().await.map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Failed to commit transaction".to_string()]) })))?;

    into_api_response(StatusCode::OK, None, None, Some(vec!["About page updated successfully".to_string()]))
}

pub fn router() -> axum::Router<Arc<AppState>> {
    axum::Router::new()
        .route("/", axum::routing::get(get_about).put(update_about))
}
