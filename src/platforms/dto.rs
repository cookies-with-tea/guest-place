use serde_derive::{Deserialize, Serialize};
use utoipa::ToSchema;
use crate::core::dto::MediaDTO;

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct OpportunityItemDTO {
    pub icon: MediaDTO,
    pub title: String,
    pub items: Vec<String>,
    pub link: String,
    pub button_text: String,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct OpportunitiesDTO {
    pub title: String,
    pub items: Vec<OpportunityItemDTO>,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct ToolItemDTO {
    pub title: String,
    pub text: String,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct ToolsAndServicesDTO {
    pub title: String,
    pub logo: MediaDTO,
    pub items: Vec<ToolItemDTO>,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct PlatformsResponseDTO {
    pub title: String,
    pub description: String,
    pub hero_guide: Option<MediaDTO>,
    pub opportunities_guide: Option<MediaDTO>,
    pub tools_guide: Option<MediaDTO>,
    pub hero_guide_uuid: Option<uuid::Uuid>,
    pub opportunities_guide_uuid: Option<uuid::Uuid>,
    pub tools_guide_uuid: Option<uuid::Uuid>,
    pub opportunities: OpportunitiesDTO,
    pub tools_and_services: ToolsAndServicesDTO,
}

#[derive(Deserialize, Debug, ToSchema)]
pub struct UpdateOpportunityItemDTO {
    pub icon_uuid: Option<uuid::Uuid>,
    pub title: String,
    pub items: Vec<String>,
    pub link: String,
    pub button_text: String,
}

#[derive(Deserialize, Debug, ToSchema)]
pub struct UpdateToolItemDTO {
    pub title: String,
    pub text: String,
}

#[derive(Deserialize, Debug, ToSchema)]
pub struct UpdatePlatformsDTO {
    pub title: String,
    pub description: String,
    pub hero_guide_uuid: Option<uuid::Uuid>,
    pub opportunities_guide_uuid: Option<uuid::Uuid>,
    pub tools_guide_uuid: Option<uuid::Uuid>,
    pub opportunities: Vec<UpdateOpportunityItemDTO>,
    pub tools_title: String,
    pub tools_logo_uuid: Option<uuid::Uuid>,
    pub tools_items: Vec<UpdateToolItemDTO>,
}
