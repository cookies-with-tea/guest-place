use serde::Serialize;
use utoipa::ToSchema;

#[derive(Serialize, ToSchema)]
pub struct SearchResult {
    pub category: String,
    pub title: String,
    pub description: String,
    pub url: String,
    pub id: String,
}

#[derive(Serialize, ToSchema)]
pub struct GlobalSearchResponse {
    pub results: Vec<SearchResult>,
}
