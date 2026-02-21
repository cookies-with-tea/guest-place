use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use std::sync::Arc;

use crate::{
    AppState, about::dto::OpportunitiesDTO, core::{
        dto::ApiResponse,
        handlers::get_media_by_uuid,
    }
};

use super::dto::{
    AboutResponseDTO, OpportunityItemDTO, LeadershipDTO,
    LeadershipItemDTO, WhoWeAreItemDTO, NewsDTO, NewsItemDTO
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

    let about_row = sqlx::query_as::<_, (String, String)>(
        "SELECT title, description FROM about LIMIT 1"
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

            AboutResponseDTO {
                title: row.0,
                description: row.1,
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
    let opportunities = sqlx::query_as::<_, (i32, Option<uuid::Uuid>, String)>(
        "SELECT id, icon_uuid, title FROM about_opportunities ORDER BY id"
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

pub fn router() -> axum::Router<Arc<AppState>> {
    axum::Router::new()
        .route("/", axum::routing::get(get_about))
}
