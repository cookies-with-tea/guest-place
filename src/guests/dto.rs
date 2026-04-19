use serde_derive::{Deserialize, Serialize};
use utoipa::ToSchema;
use crate::core::dto::MediaDTO;

#[derive(Serialize, Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct GuestOpportunityItemDTO {
    pub title: String,
    pub items: Vec<String>,
    pub icon: Option<MediaDTO>,
    pub icon_uuid: Option<uuid::Uuid>,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct GuestOpportunityDTO {
    pub title: String,
    pub items: Vec<GuestOpportunityItemDTO>,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct InteractionCardDTO {
    pub icon: Option<MediaDTO>,
    pub icon_uuid: Option<uuid::Uuid>,
    pub title: String,
    pub text: String,
    pub button_text: String,
    pub link: String,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct SearchPromoDTO {
    pub title: String,
    pub description: String,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct AdditionalServiceDTO {
    pub icon: Option<MediaDTO>,
    pub icon_uuid: Option<uuid::Uuid>,
    pub text: String,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct GuestsResponseDTO {
    pub title: String,
    pub hero_guide: Option<MediaDTO>,
    pub opportunities_guide: Option<MediaDTO>,
    pub interaction_cards_guide: Option<MediaDTO>,
    pub search_promo_guide: Option<MediaDTO>,
    pub additional_services_guide: Option<MediaDTO>,
    pub hero_guide_uuid: Option<uuid::Uuid>,
    pub opportunities_guide_uuid: Option<uuid::Uuid>,
    pub interaction_cards_guide_uuid: Option<uuid::Uuid>,
    pub search_promo_guide_uuid: Option<uuid::Uuid>,
    pub additional_services_guide_uuid: Option<uuid::Uuid>,
    pub opportunities: Vec<GuestOpportunityItemDTO>,
    pub interaction_cards: Vec<InteractionCardDTO>,
    pub search_promo: SearchPromoDTO,
    pub additional_services: Vec<AdditionalServiceDTO>,
}

#[derive(Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateGuestsDTO {
    pub title: String,
    pub hero_guide_uuid: Option<uuid::Uuid>,
    pub opportunities_guide_uuid: Option<uuid::Uuid>,
    pub interaction_cards_guide_uuid: Option<uuid::Uuid>,
    pub search_promo_guide_uuid: Option<uuid::Uuid>,
    pub additional_services_guide_uuid: Option<uuid::Uuid>,
    pub opportunities: Vec<GuestOpportunityItemDTO>,
    pub interaction_cards: Vec<InteractionCardDTO>,
    pub search_promo: SearchPromoDTO,
    pub additional_services: Vec<AdditionalServiceDTO>,
}
