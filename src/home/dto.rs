use serde_derive::{Deserialize, Serialize};
use utoipa::ToSchema;
use crate::core::dto::MediaDTO;
use crate::venues::model::Venue;

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct HomeCategoryDTO {
    pub id: Option<i32>,
    pub title: String,
    pub slug: String,
    pub link: String,
    pub icon_uuid: Option<uuid::Uuid>,
    pub icon: Option<MediaDTO>,
    pub sort_order: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct HomeInteractionItemDTO {
    pub id: Option<i32>,
    pub step_number: i32,
    pub title: String,
    pub text: String,
    pub button_text: String,
    pub link: String,
    pub is_accent: bool,
    pub sort_order: i32,
}

#[derive(Serialize, Deserialize, Debug, ToSchema)]
pub struct HomeResponseDTO {
    pub title: String,
    pub subtitle: String,
    pub hero_map_button_text: String,
    pub hero_list_button_text: String,
    pub hero_guide_uuid: Option<uuid::Uuid>,
    pub hero_guide: Option<MediaDTO>,

    pub categories_title: String,
    pub categories: Vec<HomeCategoryDTO>,

    pub latest_section_title: String,
    pub latest_section_button_text: String,
    pub latest_section_button_link: String,
    pub latest_venues: Vec<Venue>,

    pub popular_section_title: String,
    pub popular_section_button_text: String,
    pub popular_section_button_link: String,
    pub popular_venues: Vec<Venue>,

    pub interactions_title: String,
    pub interactions: Vec<HomeInteractionItemDTO>,

    pub banner_title: String,
    pub banner_text: String,
    pub banner_guide_uuid: Option<uuid::Uuid>,
    pub banner_guide: Option<MediaDTO>,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct UpdateHomeCategoryDTO {
    pub id: Option<i32>,
    pub title: String,
    pub slug: String,
    pub link: String,
    pub icon_uuid: Option<uuid::Uuid>,
    pub sort_order: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct UpdateHomeInteractionDTO {
    pub id: Option<i32>,
    pub step_number: i32,
    pub title: String,
    pub text: String,
    pub button_text: String,
    pub link: String,
    pub is_accent: Option<bool>,
    pub sort_order: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct UpdateHomeDTO {
    pub title: Option<String>,
    pub subtitle: Option<String>,
    pub hero_map_button_text: Option<String>,
    pub hero_list_button_text: Option<String>,
    pub hero_guide_uuid: Option<uuid::Uuid>,

    pub categories_title: Option<String>,
    pub categories: Option<Vec<UpdateHomeCategoryDTO>>,

    pub latest_section_title: Option<String>,
    pub latest_section_button_text: Option<String>,
    pub latest_section_button_link: Option<String>,

    pub popular_section_title: Option<String>,
    pub popular_section_button_text: Option<String>,
    pub popular_section_button_link: Option<String>,

    pub interactions_title: Option<String>,
    pub interactions: Option<Vec<UpdateHomeInteractionDTO>>,

    pub banner_title: Option<String>,
    pub banner_text: Option<String>,
    pub banner_guide_uuid: Option<uuid::Uuid>,
}
