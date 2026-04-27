use axum::http::HeaderValue;
use guest_platform::core::app::AppConfig;
use guest_platform::core::db::{create_pool, create_redis_pool};
use guest_platform::core::redis::RedisService;
use guest_platform::features::FeatureFlagService;
use guest_platform::i18n::I18nService;
use guest_platform::media::quota::QuotaService;
use guest_platform::media::storage::StorageService;
use guest_platform::{create_router, AppState};
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
    guest_platform::auth::handlers::login,
    guest_platform::auth::handlers::logout,
    guest_platform::auth::handlers::refresh,
    guest_platform::auth::handlers::register,
    guest_platform::auth::handlers::check_register_key,
    guest_platform::auth::handlers::logout_other_devices,
    guest_platform::user::handlers::create,
    guest_platform::user::handlers::get_one,
    guest_platform::user::handlers::delete_one,
    guest_platform::user::handlers::get_me,
    guest_platform::user::handlers::update_me,
    guest_platform::user::handlers::change_password,
    guest_platform::media::handlers::create,
    guest_platform::media::handlers::get_all,
    guest_platform::media::handlers::get_one,
    guest_platform::media::handlers::update,
    guest_platform::media::handlers::delete_one,
    guest_platform::media::handlers::delete_all,
    guest_platform::i18n::handlers::create_or_update,
    guest_platform::i18n::handlers::get_all,
    guest_platform::i18n::handlers::delete_one,
    guest_platform::i18n::handlers::get_by_dict_key,
    guest_platform::i18n::handlers::get_languages,
    guest_platform::i18n::handlers::get_namespaces,
    guest_platform::mfe::handlers::get_manifest,
    guest_platform::mfe::handlers::get_all,
    guest_platform::mfe::handlers::create,
    guest_platform::mfe::handlers::update,
    guest_platform::mfe::handlers::delete_one,
    guest_platform::features::handlers::get_features,
    guest_platform::features::handlers::update_features,
    guest_platform::content::handlers::get_schemas,
    guest_platform::content::handlers::create_schema,
    guest_platform::content::handlers::get_schema,
    guest_platform::content::handlers::update_schema,
    guest_platform::content::handlers::delete_schema,
    guest_platform::content::handlers::get_entries,
    guest_platform::content::handlers::create_entry,
    guest_platform::content::handlers::get_entry,
    guest_platform::content::handlers::update_entry,
    guest_platform::content::handlers::delete_entry,
    guest_platform::content::handlers::get_entry_versions,
    guest_platform::content::handlers::rollback_entry_version,
    guest_platform::about::handlers::get_about,
    guest_platform::about::handlers::update_about,
    guest_platform::guests::handlers::get_guests,
    guest_platform::guests::handlers::update_guests,
    guest_platform::platforms::handlers::get_platforms,
    guest_platform::platforms::handlers::update_platforms,
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
        guest_platform::auth::dto::AuthRequestDTO,
        guest_platform::auth::dto::RegisterRequestDTO,
        guest_platform::auth::dto::AuthResponseDTO,
        guest_platform::auth::dto::AuthRefreshTokenDTO,
        guest_platform::about::dto::AboutResponseDTO,
        guest_platform::content::model::ContentSchema,
        guest_platform::content::model::CreateSchemaDTO,
        guest_platform::content::model::UpdateSchemaDTO,
        guest_platform::content::model::FieldDefinition,
        guest_platform::content::model::FieldType,
        guest_platform::content::model::ContentEntry,
        guest_platform::content::model::ContentEntryVersion,
        guest_platform::content::model::ContentEntryStatus,
        guest_platform::content::model::CreateContentEntryDTO,
        guest_platform::content::model::UpdateContentEntryDTO,
        guest_platform::content::model::EntryFilterQuery,
        guest_platform::media::dto::MediaItemDTO,
        guest_platform::media::dto::UpdateMediaDTO,
        guest_platform::media::dto::MediaType,
        guest_platform::media::dto::MediaFilterQuery,
        guest_platform::i18n::dto::LanguageDTO,
        guest_platform::i18n::dto::TranslationDTO,
        guest_platform::i18n::dto::CreateTranslationDTO,
        guest_platform::features::FeatureFlag,
        guest_platform::features::FeatureFlagsUpdate,
        guest_platform::guests::dto::GuestsResponseDTO,
        guest_platform::guests::dto::UpdateGuestsDTO,
        guest_platform::guests::dto::GuestOpportunityItemDTO,
        guest_platform::guests::dto::InteractionCardDTO,
        guest_platform::guests::dto::SearchPromoDTO,
        guest_platform::guests::dto::AdditionalServiceDTO,
        guest_platform::platforms::dto::PlatformsResponseDTO,
        guest_platform::user::dto::ChangePasswordDTO,
        guest_platform::core::dto::PaginationDTO,
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

    if let Err(e) = guest_platform::auth::init::init_superadmin(shared_state.clone()).await {
        eprintln!("[Init] Superadmin initialization failed: {}", e);
    }

    axum::serve(listener, router.into_make_service())
        .await
        .expect("Error");
}
