use axum::http::HeaderValue;
use guest_place::core::app::AppConfig;
use guest_place::core::db::{create_pool, create_redis_pool};
use guest_place::core::redis::RedisService;
use guest_place::features::FeatureFlagService;
use guest_place::i18n::I18nService;
use guest_place::media::quota::QuotaService;
use guest_place::media::storage::StorageService;
use guest_place::{create_router, AppState};
use std::env;
use std::sync::Arc;
use std::time::Duration;
use tower_http::cors::{AllowHeaders, AllowMethods, AllowOrigin, CorsLayer};
use utoipa::{
    openapi::security::{ApiKey, ApiKeyValue, SecurityScheme},
    Modify, OpenApi,
};

#[derive(OpenApi)]
#[openapi(
  security(("bearer_auth" = [])),
  paths(
    guest_place::auth::handlers::login,
    guest_place::auth::handlers::logout,
    guest_place::auth::handlers::refresh,
    guest_place::auth::handlers::register,
    guest_place::auth::handlers::check_register_key,
    guest_place::auth::handlers::logout_other_devices,
    guest_place::user::handlers::create,
    guest_place::user::handlers::get_one,
    guest_place::user::handlers::delete_one,
    guest_place::user::handlers::get_me,
    guest_place::user::handlers::update_me,
    guest_place::user::handlers::change_password,
    guest_place::media::handlers::create,
    guest_place::media::handlers::get_all,
    guest_place::media::handlers::get_one,
    guest_place::media::handlers::update,
    guest_place::media::handlers::delete_one,
    guest_place::media::handlers::delete_all,
    guest_place::i18n::handlers::create_or_update,
    guest_place::i18n::handlers::get_all,
    guest_place::i18n::handlers::delete_one,
    guest_place::i18n::handlers::get_by_dict_key,
    guest_place::i18n::handlers::get_languages,
    guest_place::i18n::handlers::get_namespaces,
    guest_place::mfe::handlers::get_manifest,
    guest_place::mfe::handlers::get_all,
    guest_place::mfe::handlers::create,
    guest_place::mfe::handlers::update,
    guest_place::mfe::handlers::delete_one,
    guest_place::features::handlers::get_features,
    guest_place::features::handlers::update_features,
    guest_place::content::handlers::get_schemas,
    guest_place::content::handlers::create_schema,
    guest_place::content::handlers::get_schema,
    guest_place::content::handlers::update_schema,
    guest_place::content::handlers::delete_schema,
    guest_place::content::handlers::get_entries,
    guest_place::content::handlers::create_entry,
    guest_place::content::handlers::get_entry,
    guest_place::content::handlers::update_entry,
    guest_place::content::handlers::delete_entry,
    guest_place::content::handlers::get_entry_versions,
    guest_place::content::handlers::rollback_entry_version,
    guest_place::about::handlers::get_about,
    guest_place::about::handlers::update_about,
    guest_place::guests::handlers::get_guests,
    guest_place::guests::handlers::update_guests,
    guest_place::platforms::handlers::get_platforms,
    guest_place::platforms::handlers::update_platforms,
  ),
  modifiers(&SecurityAddon),
  tags(
        (name = "Auth", description = "Auth"),
        (name = "About", description = "About platform information"),
        (name = "Media", description = "Media"),
        (name = "User", description = "User"),
        (name = "I18n", description = "Translations management"),
        (name = "MFE", description = "Microfrontends management"),
        (name = "Features", description = "Feature Flags management"),
        (name = "Content", description = "Dynamic Content Management"),
        (name = "Platforms", description = "Platforms information"),
  ),
  components(
    schemas(
        guest_place::auth::dto::AuthRequestDTO,
        guest_place::auth::dto::RegisterRequestDTO,
        guest_place::auth::dto::AuthResponseDTO,
        guest_place::auth::dto::AuthRefreshTokenDTO,
        guest_place::about::dto::AboutResponseDTO,
        guest_place::content::model::ContentSchema,
        guest_place::content::model::CreateSchemaDTO,
        guest_place::content::model::UpdateSchemaDTO,
        guest_place::content::model::FieldDefinition,
        guest_place::content::model::FieldType,
        guest_place::content::model::ContentEntry,
        guest_place::content::model::ContentEntryVersion,
        guest_place::content::model::ContentEntryStatus,
        guest_place::content::model::CreateContentEntryDTO,
        guest_place::content::model::UpdateContentEntryDTO,
        guest_place::content::model::EntryFilterQuery,
        guest_place::media::dto::MediaItemDTO,
        guest_place::media::dto::UpdateMediaDTO,
        guest_place::media::dto::MediaType,
        guest_place::media::dto::MediaFilterQuery,
        guest_place::i18n::dto::LanguageDTO,
        guest_place::i18n::dto::TranslationDTO,
        guest_place::i18n::dto::CreateTranslationDTO,
        guest_place::features::FeatureFlag,
        guest_place::features::FeatureFlagsUpdate,
        guest_place::guests::dto::GuestsResponseDTO,
        guest_place::guests::dto::UpdateGuestsDTO,
        guest_place::guests::dto::GuestOpportunityItemDTO,
        guest_place::guests::dto::InteractionCardDTO,
        guest_place::guests::dto::SearchPromoDTO,
        guest_place::guests::dto::AdditionalServiceDTO,
        guest_place::platforms::dto::PlatformsResponseDTO,
        guest_place::user::dto::ChangePasswordDTO,
        guest_place::core::dto::PaginationDTO,
    )
  )
)]
struct ApiDoc;

struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "api_key",
                SecurityScheme::ApiKey(ApiKey::Header(ApiKeyValue::new("gp_apikey"))),
            );
            components.add_security_scheme(
                "bearer_auth",
                SecurityScheme::Http(
                    utoipa::openapi::security::HttpBuilder::new()
                        .scheme(utoipa::openapi::security::HttpAuthScheme::Bearer)
                        .build(),
                ),
            );
        }
    }
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().init();
    dotenv::dotenv().ok();

    let config = AppConfig::new();
    let pool = create_pool(&config).await;
    let app_host = config.app_host.clone();
    let app_port = config.app_port.clone();

    let smtp_host = std::env::var("SMTP_HOST").expect("SMTP_HOST must be set");
    let smtp_port: u16 = std::env::var("SMTP_PORT")
        .unwrap_or("587".to_string())
        .parse()
        .expect("Invalid SMTP_PORT");
    let smtp_username = std::env::var("SMTP_USERNAME").expect("SMTP_USERNAME must be set");
    let smtp_password = std::env::var("SMTP_PASSWORD").expect("SMTP_PASSWORD must be set");
    let smtp_from = std::env::var("SMTP_FROM").expect("SMTP_FROM must be set");

    let i18n = I18nService::new(pool.clone());
    let media_storage = Arc::new(StorageService::new("uploads"));

    let redis_pool = create_redis_pool(&config);
    let redis = Arc::new(RedisService::new(redis_pool));
    let features = Arc::new(FeatureFlagService::new(redis.clone()));
    let media_quota = Arc::new(QuotaService::new(pool.clone(), config.media_quota_limit));

    let shared_state = Arc::new(AppState {
        pool: pool.clone(),
        config: config.clone(),
        i18n,
        media_storage: media_storage.clone(),
        redis,
        features,
        media_quota,
        frontend_url: env::var("FRONTEND_URL").expect("FRONTEND_URL must be set"),
        smtp_host,
        smtp_port,
        smtp_username,
        smtp_password,
        smtp_from,
    });

    let cors = {
        let allowed_origins: Vec<String> = std::env::var("CORS_ALLOWED_ORIGINS")
            .unwrap_or_default()
            .split(',')
            .map(str::trim)
            .filter(|s| !s.is_empty())
            .map(|s| s.to_lowercase())
            .collect();

        CorsLayer::new()
            .allow_origin(AllowOrigin::predicate(move |origin: &HeaderValue, _| {
                if let Ok(origin_str) = origin.to_str() {
                    allowed_origins
                        .iter()
                        .any(|o| o == &origin_str.to_lowercase())
                } else {
                    false
                }
            }))
            .allow_methods(AllowMethods::list(vec![
                axum::http::Method::GET,
                axum::http::Method::POST,
                axum::http::Method::PUT,
                axum::http::Method::DELETE,
                axum::http::Method::OPTIONS,
            ]))
            .allow_headers(AllowHeaders::list(vec![
                axum::http::header::CONTENT_TYPE,
                axum::http::header::AUTHORIZATION,
                axum::http::header::ACCEPT_LANGUAGE,
            ]))
            .allow_credentials(true)
            .max_age(Duration::from_secs(3600))
    };

    let router = create_router(shared_state.clone(), ApiDoc::openapi(), cors);

    sqlx::migrate!()
        .run(&pool.clone())
        .await
        .expect("Failed to run migrations");

    let listener = tokio::net::TcpListener::bind(format!("{}:{}", { app_host }, { app_port }))
        .await
        .unwrap();

    println!("Server is running at http://{}:{}/", app_host, app_port);
    println!(
        "Swagger is running at http://{}:{}/docs",
        app_host, app_port
    );

    if let Err(e) = guest_place::auth::init::init_superadmin(shared_state.clone()).await {
        eprintln!("[Init] Superadmin initialization failed: {}", e);
    }

    axum::serve(listener, router.into_make_service())
        .await
        .expect("Error");
}
