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
        response::{into_api_response, error_map},
    }
};
use std::collections::HashMap;

use super::dto::{
    AdditionalServiceDTO, GuestOpportunityItemDTO, GuestsResponseDTO, 
    InteractionCardDTO, SearchPromoDTO, UpdateGuestsDTO
};

#[utoipa::path(
    get,
    path = "/api/v1/guests",
    responses(
        (status = 200, body = ApiResponse<GuestsResponseDTO>),
        (status = 500, body = ApiResponse<GuestsResponseDTO>)
    ),
    tag = "Guests",
    operation_id = "get_guests",
)]
pub async fn get_guests(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<GuestsResponseDTO>>, (StatusCode, Json<ApiResponse<GuestsResponseDTO>>)> {
    let guests_row = sqlx::query_as::<_, (i32, String, Option<uuid::Uuid>, Option<uuid::Uuid>, Option<uuid::Uuid>, Option<uuid::Uuid>, Option<uuid::Uuid>)>(
        "SELECT id, title, hero_guide_uuid, opportunities_guide_uuid, interaction_cards_guide_uuid, search_promo_guide_uuid, additional_services_guide_uuid FROM guests LIMIT 1"
    )
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {:?}", e);
        into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, Some(error_map("database", "Failed to fetch guests page")), None)
            .expect_err("Success status passed to into_api_response")
    })?;

    match guests_row {
        Some(row) => {
            let guests_id = row.0;
            
            let opportunities = fetch_opportunities(&state, guests_id).await?;
            let interaction_cards = fetch_interaction_cards(&state, guests_id).await?;
            let search_promo = fetch_search_promo(&state, guests_id).await?;
            let additional_services = fetch_additional_services(&state, guests_id).await?;

            let hero_guide = get_media_by_uuid(&state, row.2).await.unwrap_or(None);
            let opportunities_guide = get_media_by_uuid(&state, row.3).await.unwrap_or(None);
            let interaction_cards_guide = get_media_by_uuid(&state, row.4).await.unwrap_or(None);
            let search_promo_guide = get_media_by_uuid(&state, row.5).await.unwrap_or(None);
            let additional_services_guide = get_media_by_uuid(&state, row.6).await.unwrap_or(None);

            Ok(Json(ApiResponse {
                data: Some(GuestsResponseDTO {
                    title: row.1,
                    hero_guide,
                    opportunities_guide,
                    interaction_cards_guide,
                    search_promo_guide,
                    additional_services_guide,
                    hero_guide_uuid: row.2,
                    opportunities_guide_uuid: row.3,
                    interaction_cards_guide_uuid: row.4,
                    search_promo_guide_uuid: row.5,
                    additional_services_guide_uuid: row.6,
                    opportunities,
                    interaction_cards,
                    search_promo,
                    additional_services,
                }),
                errors: None,
                messages: None,
            }))
        }
        None => {
            Err(into_api_response(StatusCode::NOT_FOUND, None, Some(error_map("not_found", "Guests page not found")), None)
                .expect_err("Success status passed to into_api_response"))
        }
    }
}

async fn fetch_opportunities(
    state: &Arc<AppState>,
    guests_id: i32,
) -> Result<Vec<GuestOpportunityItemDTO>, (StatusCode, Json<ApiResponse<GuestsResponseDTO>>)> {
    let opportunities = sqlx::query_as::<_, (i32, String, Option<uuid::Uuid>)>(
        "SELECT id, title, icon_uuid FROM guests_opportunities WHERE guests_id = $1 ORDER BY id"
    )
    .bind(guests_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {:?}", e);
        into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, Some(error_map("database", "Failed to fetch opportunities")), None)
            .expect_err("Success status passed to into_api_response")
    })?;

    let mut result = Vec::new();
    for opp in opportunities {
        let items = sqlx::query_scalar::<_, String>(
            "SELECT item_text FROM guests_opportunity_items WHERE opportunity_id = $1 ORDER BY id"
        )
        .bind(opp.0)
        .fetch_all(&state.pool)
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, Some(error_map("database", "Failed to fetch opportunity items")), None)
                .expect_err("Success status passed to into_api_response")
        })?;

        let icon = get_media_by_uuid(state, opp.2).await.unwrap_or(None);

        result.push(GuestOpportunityItemDTO {
            title: opp.1,
            items,
            icon,
            icon_uuid: opp.2,
        });
    }
    Ok(result)
}

async fn fetch_interaction_cards(
    state: &Arc<AppState>,
    guests_id: i32,
) -> Result<Vec<InteractionCardDTO>, (StatusCode, Json<ApiResponse<GuestsResponseDTO>>)> {
    let cards = sqlx::query_as::<_, (Option<uuid::Uuid>, String, String, String, String)>(
        "SELECT icon_uuid, title, text, button_text, link FROM guests_interaction_cards WHERE guests_id = $1 ORDER BY id"
    )
    .bind(guests_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {:?}", e);
        into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, Some(error_map("database", "Failed to fetch interaction cards")), None)
            .expect_err("Success status passed to into_api_response")
    })?;

    let mut result = Vec::new();
    for card in cards {
        let icon = get_media_by_uuid(state, card.0).await.unwrap_or(None);
        result.push(InteractionCardDTO {
            icon,
            icon_uuid: card.0,
            title: card.1,
            text: card.2,
            button_text: card.3,
            link: card.4,
        });
    }
    Ok(result)
}

async fn fetch_search_promo(
    state: &Arc<AppState>,
    guests_id: i32,
) -> Result<SearchPromoDTO, (StatusCode, Json<ApiResponse<GuestsResponseDTO>>)> {
    let promo = sqlx::query_as::<_, (String, String)>(
        "SELECT title, description FROM guests_search_promo WHERE guests_id = $1 LIMIT 1"
    )
    .bind(guests_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {:?}", e);
        into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, Some(error_map("database", "Failed to fetch search promo")), None)
            .expect_err("Success status passed to into_api_response")
    })?;

    match promo {
        Some(p) => Ok(SearchPromoDTO {
            title: p.0,
            description: p.1,
        }),
        None => Ok(SearchPromoDTO {
            title: "".to_string(),
            description: "".to_string(),
        }),
    }
}

async fn fetch_additional_services(
    state: &Arc<AppState>,
    guests_id: i32,
) -> Result<Vec<AdditionalServiceDTO>, (StatusCode, Json<ApiResponse<GuestsResponseDTO>>)> {
    let services = sqlx::query_as::<_, (Option<uuid::Uuid>, String)>(
        "SELECT icon_uuid, text FROM guests_additional_services WHERE guests_id = $1 ORDER BY id"
    )
    .bind(guests_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {:?}", e);
        into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, Some(error_map("database", "Failed to fetch additional services")), None)
            .expect_err("Success status passed to into_api_response")
    })?;

    let mut result = Vec::new();
    for svc in services {
        let icon = get_media_by_uuid(state, svc.0).await.unwrap_or(None);
        result.push(AdditionalServiceDTO {
            icon,
            icon_uuid: svc.0,
            text: svc.1,
        });
    }
    Ok(result)
}

#[utoipa::path(
    put,
    path = "/api/v1/guests",
    request_body = UpdateGuestsDTO,
    responses(
        (status = 200, description = "Guests page updated"),
        (status = 500, description = "Database error")
    ),
    tag = "Guests",
    operation_id = "update_guests",
)]
pub async fn update_guests(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<UpdateGuestsDTO>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let mut tx = state.pool.begin().await.map_err(|e| {
        eprintln!("Transaction error: {:?}", e);
        into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, Some(error_map("database", "Failed to start transaction")), None)
            .expect_err("Success status passed to into_api_response")
    })?;

    // Update main title and guides
    sqlx::query("UPDATE guests SET title = $1, hero_guide_uuid = $2, opportunities_guide_uuid = $3, interaction_cards_guide_uuid = $4, search_promo_guide_uuid = $5, additional_services_guide_uuid = $6, updated_at = NOW()")
        .bind(&payload.title)
        .bind(payload.hero_guide_uuid)
        .bind(payload.opportunities_guide_uuid)
        .bind(payload.interaction_cards_guide_uuid)
        .bind(payload.search_promo_guide_uuid)
        .bind(payload.additional_services_guide_uuid)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            into_api_response(StatusCode::INTERNAL_SERVER_ERROR, None, Some(error_map("database", "Failed to update guests title and guides")), None)
                .expect_err("Success status passed to into_api_response")
        })?;

    // This is a simplified version, usually we'd want to handle guests_id correctly
    let guests_id: i32 = 1;

    // Clear and refill collections (simplistic approach like in 'about' module)
    sqlx::query("DELETE FROM guests_opportunities WHERE guests_id = $1").bind(guests_id).execute(&mut *tx).await.ok();
    sqlx::query("DELETE FROM guests_interaction_cards WHERE guests_id = $1").bind(guests_id).execute(&mut *tx).await.ok();
    // search_promo is 1:1, update or insert
    sqlx::query("DELETE FROM guests_search_promo WHERE guests_id = $1").bind(guests_id).execute(&mut *tx).await.ok();
    sqlx::query("DELETE FROM guests_additional_services WHERE guests_id = $1").bind(guests_id).execute(&mut *tx).await.ok();

    for opp in payload.opportunities {
        let opp_id: i32 = sqlx::query_scalar("INSERT INTO guests_opportunities (guests_id, title, icon_uuid) VALUES ($1, $2, $3) RETURNING id")
            .bind(guests_id)
            .bind(&opp.title)
            .bind(opp.icon_uuid)
            .fetch_one(&mut *tx)
            .await
            .map_err(|_| into_api_response::<()>(StatusCode::INTERNAL_SERVER_ERROR, None, Some(error_map("database", "Failed to insert opportunity")), None).expect_err("Error"))?;

        for item in opp.items {
            sqlx::query("INSERT INTO guests_opportunity_items (opportunity_id, item_text) VALUES ($1, $2)")
                .bind(opp_id)
                .bind(item)
                .execute(&mut *tx)
                .await
                .map_err(|_| into_api_response::<()>(StatusCode::INTERNAL_SERVER_ERROR, None, Some(error_map("database", "Failed to insert opportunity item")), None).expect_err("Error"))?;
        }
    }

    for card in payload.interaction_cards {
        sqlx::query("INSERT INTO guests_interaction_cards (guests_id, icon_uuid, title, text, button_text, link) VALUES ($1, $2, $3, $4, $5, $6)")
            .bind(guests_id)
            .bind(card.icon_uuid)
            .bind(card.title)
            .bind(card.text)
            .bind(card.button_text)
            .bind(card.link)
            .execute(&mut *tx)
            .await
            .map_err(|_| into_api_response::<()>(StatusCode::INTERNAL_SERVER_ERROR, None, Some(error_map("database", "Failed to insert interaction card")), None).expect_err("Error"))?;
    }

    sqlx::query("INSERT INTO guests_search_promo (guests_id, title, description) VALUES ($1, $2, $3)")
        .bind(guests_id)
        .bind(payload.search_promo.title)
        .bind(payload.search_promo.description)
        .execute(&mut *tx)
        .await
        .map_err(|_| into_api_response::<()>(StatusCode::INTERNAL_SERVER_ERROR, None, Some(error_map("database", "Failed to insert search promo")), None).expect_err("Error"))?;

    for svc in payload.additional_services {
        sqlx::query("INSERT INTO guests_additional_services (guests_id, icon_uuid, text) VALUES ($1, $2, $3)")
            .bind(guests_id)
            .bind(svc.icon_uuid)
            .bind(svc.text)
            .execute(&mut *tx)
            .await
            .map_err(|_| into_api_response::<()>(StatusCode::INTERNAL_SERVER_ERROR, None, Some(error_map("database", "Failed to insert additional service")), None).expect_err("Error"))?;
    }

    tx.commit().await.map_err(|e| {
        eprintln!("Commit error: {:?}", e);
        into_api_response::<()>(StatusCode::INTERNAL_SERVER_ERROR, None, Some(error_map("database", "Failed to commit transaction")), None)
            .expect_err("Success status passed to into_api_response")
    })?;

    Ok(Json(ApiResponse {
        data: None,
        errors: None,
        messages: Some(vec!["Guests page updated successfully".to_string()]),
    }))
}
