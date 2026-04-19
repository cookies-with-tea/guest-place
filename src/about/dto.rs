use serde_derive::{Deserialize, Serialize};
use utoipa::ToSchema;
use crate::core::dto::MediaDTO;


#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct OpportunityItemDTO {
    pub icon: MediaDTO,
    pub title: String,
    pub items: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct OpportunitiesDTO {
    pub title: String,
    pub items: Vec<OpportunityItemDTO>,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct LeadershipItemDTO {
    pub icon: MediaDTO,
    pub text: String,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct LeadershipDTO {
    pub logo: MediaDTO,
    pub title: String,
    pub description: String,
    pub items: Vec<LeadershipItemDTO>,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct WhoWeAreItemDTO {
    pub title: String,
    pub description: String,
    pub image: MediaDTO,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct NewsItemDTO {
    pub icon: MediaDTO,
    pub text: String,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct NewsDTO {
    pub title: String,
    pub items: Vec<NewsItemDTO>,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct AboutResponseDTO {
    pub title: String,
    pub description: String,
    pub opportunities: OpportunitiesDTO,
    pub leadership: LeadershipDTO,
    pub who_we_are: Vec<WhoWeAreItemDTO>,
    pub news: NewsDTO,
}

#[derive(Deserialize, Debug, ToSchema)]
pub struct UpdateOpportunityItemDTO {
    pub icon_uuid: Option<uuid::Uuid>,
    pub title: String,
    pub items: Vec<String>,
}

#[derive(Deserialize, Debug, ToSchema)]
pub struct UpdateLeadershipItemDTO {
    pub icon_uuid: Option<uuid::Uuid>,
    pub text: String,
}

#[derive(Deserialize, Debug, ToSchema)]
pub struct UpdateWhoWeAreItemDTO {
    pub title: String,
    pub description: String,
    pub image_uuid: Option<uuid::Uuid>,
}

#[derive(Deserialize, Debug, ToSchema)]
pub struct UpdateNewsItemDTO {
    pub icon_uuid: Option<uuid::Uuid>,
    pub text: String,
}

#[derive(Deserialize, Debug, ToSchema)]
pub struct UpdateAboutDTO {
    pub title: String,
    pub description: String,
    pub opportunities: Vec<UpdateOpportunityItemDTO>,
    pub leadership_title: String,
    pub leadership_description: String,
    pub leadership_logo_uuid: Option<uuid::Uuid>,
    pub leadership_items: Vec<UpdateLeadershipItemDTO>,
    pub who_we_are: Vec<UpdateWhoWeAreItemDTO>,
    pub news_title: String,
    pub news_items: Vec<UpdateNewsItemDTO>,
}
