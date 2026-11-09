use crate::core::dto::{ApiPaginationDTO, ApiResponse, ApiResponseWithPagination, PaginationDTO};
use crate::core::response::{error_map, into_api_response, into_api_response_with_pagination};
use crate::core::utils::{DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT};
use crate::user::dto::{
    ChangePasswordDTO, CreateUserDTO, PermissionDTO, UpdateUserDTO, User, UserFilterQuery,
    UserResponseDTO, UserRole, UserStatus,
};
use crate::user::utils::{validate_email, validate_phone};
use crate::AppState;
use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHasher,
};
use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    routing::{delete, get, post},
    Json, Router,
};
use crate::auth::dto::Claims;
use crate::auth::handlers::verify_password;
use sqlx::{Postgres, QueryBuilder};
use std::sync::Arc;
use uuid::Uuid;

fn hash_password(password: &str) -> Result<String, argon2::password_hash::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2.hash_password(password.as_bytes(), &salt)?;
    Ok(password_hash.to_string())
}

#[utoipa::path(
    post,
    path = "/api/v1/user",
    request_body = CreateUserDTO,
    responses(
        (status = 201, description = "Пользователь создан"),
        (status = 409, description = "Пользователь существует"),
        (status = 500, description = "Внутренняя ошибка")
    ),
    tag = "User",
    operation_id = "create_user",
)]
pub async fn create(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<CreateUserDTO>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let is_email_valid = validate_email(&payload.email.clone());

    if !is_email_valid {
        let msg = state.i18n.t("user.email_invalid", &locale).await;
        return into_api_response(
            StatusCode::BAD_REQUEST,
            None,
            Some(error_map(&"email".to_string(), &msg.clone())),
            Some(vec![msg]),
        );
    }

    let mut is_phone_valid = true;

    if payload.phone.is_some() {
        is_phone_valid = validate_phone(&payload.phone.clone().unwrap_or_else(|| "".to_string()));
    }

    if !is_phone_valid {
        let msg = state.i18n.t("user.phone_invalid", &locale).await;
        return into_api_response(
            StatusCode::BAD_REQUEST,
            None,
            Some(error_map(&"phone".to_string(), &msg.clone())),
            Some(vec![msg]),
        );
    }

    if let Some(phone) = &payload.phone {
        let existing_user =
            sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM guest_user WHERE phone = $1")
                .bind(phone)
                .fetch_one(&state.pool)
                .await;

        match existing_user {
            Ok(count) if count > 0 => {
                let msg = state.i18n.t("user.phone_exists", &locale).await;
                return into_api_response(
                    StatusCode::CONFLICT,
                    None,
                    Some(error_map(&"phone".to_string(), &msg.clone())),
                    Some(vec![msg]),
                );
            }
            Err(_) => {
                let msg = state.i18n.t("user.check_exists_error", &locale).await;
                return into_api_response(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    None,
                    Some(error_map(&"database".to_string(), &msg.clone())),
                    Some(vec![msg]),
                );
            }
            _ => {}
        }
    }

    let existing_user =
        sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM guest_user WHERE email = $1")
            .bind(&payload.email.clone())
            .fetch_one(&state.pool)
            .await;

    match existing_user {
        Ok(count) if count > 0 => {
            let msg = state.i18n.t("user.email_exists", &locale).await;
            return into_api_response(
                StatusCode::CONFLICT,
                None,
                Some(error_map(&"email".to_string(), &msg.clone())),
                Some(vec![msg]),
            );
        }
        Err(_) => {
            let msg = state.i18n.t("user.check_exists_error", &locale).await;
            return into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map(&"database".to_string(), &msg.clone())),
                Some(vec![msg]),
            );
        }
        _ => {}
    }

    let password_hash = match hash_password(&payload.password) {
        Ok(hash) => hash,
        Err(_) => {
            let msg = state.i18n.t("user.password_hash_error", &locale).await;
            return into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map(&"password".to_string(), &msg.clone())),
                Some(vec![msg]),
            );
        }
    };

    let role = match payload.role {
        Some(role) => role,
        None => UserRole::User,
    };

    let status = match payload.status {
        Some(status) => status,
        None => UserStatus::Active,
    };

    let first_name_str = payload.first_name.unwrap_or_default();
    let last_name_str = payload.last_name.unwrap_or_default();

    let result = sqlx::query_scalar::<_, Uuid>(
        "INSERT INTO guest_user (
            first_name, second_name, last_name, phone, birth_date, password_hash, role, status, email, avatar, avatar_uuid, street, gender, city
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING uuid",
    )
    .bind(&first_name_str)
    .bind(&payload.second_name.unwrap_or_else(|| "".to_string()))
    .bind(&last_name_str)
    .bind(&payload.phone.unwrap_or_else(|| "".to_string()))
    .bind(payload.birth_date)
    .bind(&password_hash)
    .bind(&role)
    .bind(&status)
    .bind(&payload.email)
    .bind(&payload.avatar.unwrap_or_else(|| "".to_string()))
    .bind(&payload.avatar_uuid)
    .bind(&payload.street.unwrap_or_else(|| "".to_string()))
    .bind(&payload.gender.unwrap_or_else(|| "".to_string()))
    .bind(&payload.city.unwrap_or_else(|| "".to_string()))
    .fetch_one(&state.pool)
    .await;

    match result {
        Ok(new_user_uuid) => {
            let full_name = format!("{} {}", first_name_str, last_name_str).trim().to_string();
            state.bus.publish(crate::core::bus::SystemEvent::GuestRegistered {
                id: payload.email.clone(),
                name: if full_name.is_empty() { payload.email.clone() } else { full_name },
                email: payload.email.clone(),
                created_at: chrono::Utc::now().to_rfc3339(),
            });

            crate::audit::log_action(
                &state.pool,
                Some(claims.sub),
                "user.create",
                Some("user"),
                Some(&new_user_uuid.to_string()),
                Some(serde_json::json!({ "email": payload.email, "role": role })),
            )
            .await;

            let msg = state.i18n.t("user.created", &locale).await;
            into_api_response(StatusCode::CREATED, None, None, Some(vec![msg]))
        }
        Err(e) => {
            tracing::error!("{:?}", e);
            let msg = state.i18n.t("general.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map(&"database".to_string(), &msg.clone())),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/user",
    params(
        ("page" = Option<i32>, Query, description = "Page number"),
        ("limit" = Option<i32>, Query, description = "Items per page"),
        ("search" = Option<String>, Query, description = "Search query"),
        ("email" = Option<String>, Query, description = "Filter by email"),
        ("first_name" = Option<String>, Query, description = "Filter by first name"),
        ("last_name" = Option<String>, Query, description = "Filter by last name"),
        ("role" = Option<UserRole>, Query, description = "Filter by role"),
        ("status" = Option<UserStatus>, Query, description = "Filter by status"),
        ("sort_by" = Option<String>, Query, description = "Sort by field"),
        ("sort_order" = Option<String>, Query, description = "Sort order (ASC/DESC)")
    ),
    responses(
        (status = 200, body = ApiResponseWithPagination<UserResponseDTO>),
        (status = 500, body = ApiResponseWithPagination<UserResponseDTO>)
    ),
    tag = "User",
    operation_id = "get_all_users",
)]
pub async fn get_all(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Query(filter): Query<UserFilterQuery>,
) -> Result<
    Json<ApiResponseWithPagination<UserResponseDTO>>,
    (StatusCode, Json<ApiResponseWithPagination<UserResponseDTO>>),
> {
    let page = filter.page.unwrap_or(1).max(1);
    let limit = filter.limit.unwrap_or(DEFAULT_PAGE_LIMIT).clamp(1, MAX_PAGE_LIMIT);
    let offset = (page - 1) * limit;

    // Build WHERE clause
    let mut count_builder: QueryBuilder<Postgres> = QueryBuilder::new("SELECT COUNT(*) FROM guest_user");
    let mut where_clause = false;

    if let Some(search) = &filter.search {
        count_builder.push(" WHERE (email ILIKE ");
        count_builder.push_bind(format!("%{}%", search));
        count_builder.push(" OR first_name ILIKE ");
        count_builder.push_bind(format!("%{}%", search));
        count_builder.push(" OR last_name ILIKE ");
        count_builder.push_bind(format!("%{}%", search));
        count_builder.push(" OR second_name ILIKE ");
        count_builder.push_bind(format!("%{}%", search));
        count_builder.push(" OR phone ILIKE ");
        count_builder.push_bind(format!("%{}%", search));
        count_builder.push(" OR city ILIKE ");
        count_builder.push_bind(format!("%{}%", search));
        count_builder.push(")");
        where_clause = true;
    }

    if let Some(name) = &filter.name {
        if !where_clause { count_builder.push(" WHERE "); where_clause = true; } else { count_builder.push(" AND "); }
        count_builder.push("(first_name ILIKE ");
        count_builder.push_bind(format!("%{}%", name));
        count_builder.push(" OR last_name ILIKE ");
        count_builder.push_bind(format!("%{}%", name));
        count_builder.push(" OR second_name ILIKE ");
        count_builder.push_bind(format!("%{}%", name));
        count_builder.push(")");
    }

    if let Some(email) = &filter.email {
        if !where_clause { count_builder.push(" WHERE "); where_clause = true; } else { count_builder.push(" AND "); }
        count_builder.push("email ILIKE ");
        count_builder.push_bind(format!("%{}%", email));
    }
    if let Some(first_name) = &filter.first_name {
        if !where_clause { count_builder.push(" WHERE "); where_clause = true; } else { count_builder.push(" AND "); }
        count_builder.push("first_name ILIKE ");
        count_builder.push_bind(format!("%{}%", first_name));
    }
    if let Some(second_name) = &filter.second_name {
        if !where_clause { count_builder.push(" WHERE "); where_clause = true; } else { count_builder.push(" AND "); }
        count_builder.push("second_name ILIKE ");
        count_builder.push_bind(format!("%{}%", second_name));
    }
    if let Some(last_name) = &filter.last_name {
        if !where_clause { count_builder.push(" WHERE "); where_clause = true; } else { count_builder.push(" AND "); }
        count_builder.push("last_name ILIKE ");
        count_builder.push_bind(format!("%{}%", last_name));
    }
    if let Some(phone) = &filter.phone {
        if !where_clause { count_builder.push(" WHERE "); where_clause = true; } else { count_builder.push(" AND "); }
        count_builder.push("phone ILIKE ");
        count_builder.push_bind(format!("%{}%", phone));
    }
    if let Some(city) = &filter.city {
        if !where_clause { count_builder.push(" WHERE "); where_clause = true; } else { count_builder.push(" AND "); }
        count_builder.push("city ILIKE ");
        count_builder.push_bind(format!("%{}%", city));
    }
    if let Some(role_str) = &filter.role {
        let roles: Vec<UserRole> = role_str.split(',')
            .filter_map(|s| serde_json::from_str::<UserRole>(&format!("\"{}\"", s)).ok())
            .collect();
        
        if !roles.is_empty() {
            if !where_clause { count_builder.push(" WHERE "); where_clause = true; } else { count_builder.push(" AND "); }
            count_builder.push("role IN (");
            let mut separated = count_builder.separated(", ");
            for role in roles {
                separated.push_bind(role);
            }
            count_builder.push(")");
        }
    }

    if let Some(status_str) = &filter.status {
        let statuses: Vec<UserStatus> = status_str.split(',')
            .filter_map(|s| serde_json::from_str::<UserStatus>(&format!("\"{}\"", s)).ok())
            .collect();

        if !statuses.is_empty() {
            if !where_clause { count_builder.push(" WHERE "); } else { count_builder.push(" AND "); }
            count_builder.push("status IN (");
            let mut separated = count_builder.separated(", ");
            for status in statuses {
                separated.push_bind(status);
            }
            count_builder.push(")");
        }
    }

    // apply_filters(&mut count_builder, &mut where_clause);

    let total_query = count_builder.build_query_scalar::<i64>().fetch_one(&state.pool).await;

    let total = match total_query {
        Ok(count) => count,
        Err(e) => {
            tracing::error!("Count error: {:?}", e);
            let msg = state.i18n.t("general.db_error", &locale).await;
            return into_api_response_with_pagination(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map(&"database".to_string(), &msg.clone())),
                Some(vec![msg]),
            );
        }
    };

    let total_pages = (total as f64 / limit as f64).ceil() as i32;

    let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new("SELECT
          uuid, first_name, second_name, last_name, phone, email, birth_date, avatar, street, gender, city, role, status, created_at, updated_at
          FROM guest_user");
    
    let mut where_clause_query = false;
    if let Some(search) = &filter.search {
        query_builder.push(" WHERE (email ILIKE ");
        query_builder.push_bind(format!("%{}%", search));
        query_builder.push(" OR first_name ILIKE ");
        query_builder.push_bind(format!("%{}%", search));
        query_builder.push(" OR last_name ILIKE ");
        query_builder.push_bind(format!("%{}%", search));
        query_builder.push(" OR second_name ILIKE ");
        query_builder.push_bind(format!("%{}%", search));
        query_builder.push(" OR phone ILIKE ");
        query_builder.push_bind(format!("%{}%", search));
        query_builder.push(" OR city ILIKE ");
        query_builder.push_bind(format!("%{}%", search));
        query_builder.push(")");
        where_clause_query = true;
    }

    if let Some(name) = &filter.name {
        if !where_clause_query { query_builder.push(" WHERE "); where_clause_query = true; } else { query_builder.push(" AND "); }
        query_builder.push("(first_name ILIKE ");
        query_builder.push_bind(format!("%{}%", name));
        query_builder.push(" OR last_name ILIKE ");
        query_builder.push_bind(format!("%{}%", name));
        query_builder.push(" OR second_name ILIKE ");
        query_builder.push_bind(format!("%{}%", name));
        query_builder.push(")");
    }
    if let Some(email) = &filter.email {
        if !where_clause_query { query_builder.push(" WHERE "); where_clause_query = true; } else { query_builder.push(" AND "); }
        query_builder.push("email ILIKE ");
        query_builder.push_bind(format!("%{}%", email));
    }
    if let Some(first_name) = &filter.first_name {
        if !where_clause_query { query_builder.push(" WHERE "); where_clause_query = true; } else { query_builder.push(" AND "); }
        query_builder.push("first_name ILIKE ");
        query_builder.push_bind(format!("%{}%", first_name));
    }
    if let Some(second_name) = &filter.second_name {
        if !where_clause_query { query_builder.push(" WHERE "); where_clause_query = true; } else { query_builder.push(" AND "); }
        query_builder.push("second_name ILIKE ");
        query_builder.push_bind(format!("%{}%", second_name));
    }
    if let Some(last_name) = &filter.last_name {
        if !where_clause_query { query_builder.push(" WHERE "); where_clause_query = true; } else { query_builder.push(" AND "); }
        query_builder.push("last_name ILIKE ");
        query_builder.push_bind(format!("%{}%", last_name));
    }
    if let Some(phone) = &filter.phone {
        if !where_clause_query { query_builder.push(" WHERE "); where_clause_query = true; } else { query_builder.push(" AND "); }
        query_builder.push("phone ILIKE ");
        query_builder.push_bind(format!("%{}%", phone));
    }
    if let Some(city) = &filter.city {
        if !where_clause_query { query_builder.push(" WHERE "); where_clause_query = true; } else { query_builder.push(" AND "); }
        query_builder.push("city ILIKE ");
        query_builder.push_bind(format!("%{}%", city));
    }
    if let Some(role_str) = &filter.role {
        let roles: Vec<UserRole> = role_str.split(',')
            .filter_map(|s| serde_json::from_str::<UserRole>(&format!("\"{}\"", s)).ok())
            .collect();
        
        if !roles.is_empty() {
            if !where_clause_query { query_builder.push(" WHERE "); where_clause_query = true; } else { query_builder.push(" AND "); }
            query_builder.push("role IN (");
            let mut separated = query_builder.separated(", ");
            for role in roles {
                separated.push_bind(role);
            }
            query_builder.push(")");
        }
    }

    if let Some(status_str) = &filter.status {
        let statuses: Vec<UserStatus> = status_str.split(',')
            .filter_map(|s| serde_json::from_str::<UserStatus>(&format!("\"{}\"", s)).ok())
            .collect();

        if !statuses.is_empty() {
            if !where_clause_query { query_builder.push(" WHERE "); } else { query_builder.push(" AND "); }
            query_builder.push("status IN (");
            let mut separated = query_builder.separated(", ");
            for status in statuses {
                separated.push_bind(status);
            }
            query_builder.push(")");
        }
    }

    // Sorting
    let sort_by = filter.sort_by.unwrap_or_else(|| "created_at".to_string());
    let sort_order = filter.sort_order.unwrap_or_else(|| "DESC".to_string());
    
    let allowed_sort_columns = ["email", "first_name", "second_name", "last_name", "phone", "role", "status", "created_at"];
    let final_sort_by = if allowed_sort_columns.contains(&sort_by.as_str()) {
        sort_by
    } else {
        "created_at".to_string()
    };
    
    let final_sort_order = if sort_order.to_uppercase() == "ASC" { "ASC" } else { "DESC" };

    query_builder.push(format!(" ORDER BY {} {}", final_sort_by, final_sort_order));

    // Pagination
    query_builder.push(" LIMIT ");
    query_builder.push_bind(limit as i64);
    query_builder.push(" OFFSET ");
    query_builder.push_bind(offset as i64);

    let users_query = query_builder.build_query_as::<UserResponseDTO>().fetch_all(&state.pool).await;

    match users_query {
        Ok(users) => {
            let pagination = PaginationDTO {
                page,
                total: Some(total as i32),
                total_pages: Some(total_pages),
                limit: Some(limit),
            };

            let api_pagination = ApiPaginationDTO {
                items: users,
                pagination: pagination,
            };

            into_api_response_with_pagination(StatusCode::OK, Some(api_pagination), None, None)
        }
        Err(_) => {
          let msg = state.i18n.t("general.db_error", &locale).await;
          return into_api_response_with_pagination(
              StatusCode::INTERNAL_SERVER_ERROR,
              Some(ApiPaginationDTO {
                  items: vec![],
                  pagination: PaginationDTO {
                      page,
                      total: Some(0),
                      total_pages: Some(0),
                      limit: Some(limit),
                  },
              }),
              Some(error_map("database", &msg)),
              Some(vec![msg]),
          );
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/user/{uuid}",
    params(("uuid" = Uuid, Path, description = "User UUID")),
    responses(
        (status = 200, body = ApiResponse<UserResponseDTO>),
        (status = 404, body = ApiResponse<UserResponseDTO>),
        (status = 500, body = ApiResponse<UserResponseDTO>)
    ),
    tag = "User",
    operation_id = "get_user_by_uuid",
)]
async fn get_one(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Path(uuid): Path<Uuid>,
) -> Result<Json<ApiResponse<UserResponseDTO>>, (StatusCode, Json<ApiResponse<UserResponseDTO>>)> {
    let result = sqlx::query_as::<_, User>("SELECT * FROM guest_user WHERE uuid = $1")
        .bind(uuid)
        .fetch_optional(&state.pool)
        .await;

    match result {
        Ok(Some(user)) => {
          let user_response = UserResponseDTO {
              uuid: user.uuid,
              first_name: user.first_name,
              second_name: user.second_name,
              last_name: user.last_name,
              phone: user.phone,
              email: user.email,
              avatar: user.avatar,
              role: user.role,
              birth_date: user.birth_date,
              created_at: user.created_at,
              updated_at: user.updated_at,
              street: user.street,
              city: user.city,
              status: user.status,
              gender: user.gender,
          };

          into_api_response(StatusCode::OK, Some(user_response), None, None)
        }
        Ok(None) => {
            let msg = state.i18n.t("user.not_found", &locale).await;
            into_api_response(
                StatusCode::NOT_FOUND,
                None,
                Some(error_map(&"user".to_string(), &msg.clone())),
                Some(vec![msg]),
            )
        }
        Err(_) => {
            let msg = state.i18n.t("general.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map(&"database".to_string(), &msg.clone())),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    delete,
    path = "/api/v1/user/{uuid}",
    params(("uuid" = Uuid, Path, description = "User UUID")),
    responses(
        (status = 200, description = "Пользователь удален"),
        (status = 404, description = "Не найден"),
        (status = 500, description = "Ошибка базы данных")
    ),
    tag = "User",
    operation_id = "delete_user_by_uuid",
)]
async fn delete_one(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Extension(claims): Extension<Claims>,
    Path(uuid): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let existing_email = sqlx::query_scalar::<_, String>("SELECT email FROM guest_user WHERE uuid = $1")
        .bind(uuid)
        .fetch_optional(&state.pool)
        .await;

    match existing_email {
        Ok(Some(email)) => {
            let result = sqlx::query("DELETE FROM guest_user WHERE uuid = $1")
                .bind(uuid)
                .execute(&state.pool)
                .await;
            match result {
                Ok(_) => {
                    crate::audit::log_action(
                        &state.pool,
                        Some(claims.sub),
                        "user.delete",
                        Some("user"),
                        Some(&uuid.to_string()),
                        Some(serde_json::json!({ "email": email })),
                    )
                    .await;

                    let msg = state.i18n.t("user.deleted", &locale).await;
                    into_api_response(StatusCode::OK, None, None, Some(vec![msg]))
                }
                Err(_) => {
                    let msg = state.i18n.t("general.db_error", &locale).await;
                    into_api_response(
                        StatusCode::INTERNAL_SERVER_ERROR,
                        None,
                        Some(error_map(&"database".to_string(), &msg.clone())),
                        Some(vec![msg]),
                    )
                }
            }
        }
        Ok(None) => {
            let msg = state.i18n.t("user.not_found", &locale).await;
            into_api_response(
                StatusCode::NOT_FOUND,
                None,
                Some(error_map(&"user".to_string(), &msg.clone())),
                Some(vec![msg]),
            )
        }
        Err(_) => {
            let msg = state.i18n.t("general.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map(&"database".to_string(), &msg.clone())),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    patch,
    path = "/api/v1/user/{uuid}",
    params(("uuid" = Uuid, Path, description = "User UUID")),
    request_body = UpdateUserDTO,
    responses(
        (status = 200, body = ApiResponse<UserResponseDTO>),
        (status = 404, body = ApiResponse<UserResponseDTO>),
        (status = 500, body = ApiResponse<UserResponseDTO>)
    ),
    tag = "User",
    operation_id = "update_user_by_uuid",
)]
async fn update(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Extension(claims): Extension<Claims>,
    Path(uuid): Path<Uuid>,
    Json(payload): Json<UpdateUserDTO>,
) -> Result<Json<ApiResponse<UserResponseDTO>>, (StatusCode, Json<ApiResponse<UserResponseDTO>>)> {
    let existing_user = sqlx::query_as::<_, User>("SELECT * FROM guest_user WHERE uuid = $1")
        .bind(uuid)
        .fetch_optional(&state.pool)
        .await;

    match existing_user {
        Ok(Some(previous_user)) => {
            let mut update_query = "UPDATE guest_user SET ".to_string();
            let mut query_param_index = 1;

            if payload.email.is_some() {
                update_query.push_str(&format!("email = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if payload.phone.is_some() {
                update_query.push_str(&format!("phone = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if payload.first_name.is_some() {
                update_query.push_str(&format!("first_name = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if payload.second_name.is_some() {
                update_query.push_str(&format!("second_name = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if payload.last_name.is_some() {
                update_query.push_str(&format!("last_name = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if payload.birth_date.is_some() {
                update_query.push_str(&format!("birth_date = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if payload.role.is_some() {
                update_query.push_str(&format!("role = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if payload.status.is_some() {
                update_query.push_str(&format!("status = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if payload.avatar.is_some() {
                update_query.push_str(&format!("avatar = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if payload.avatar_uuid.is_some() {
                update_query.push_str(&format!("avatar_uuid = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if payload.street.is_some() {
                update_query.push_str(&format!("street = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if payload.gender.is_some() {
                update_query.push_str(&format!("gender = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if payload.city.is_some() {
                update_query.push_str(&format!("city = ${}, ", query_param_index));
                query_param_index += 1;
            }

            if query_param_index == 1 {
                let msg = state.i18n.t("user.no_fields_to_update", &locale).await;
                return into_api_response(
                    StatusCode::BAD_REQUEST,
                    None,
                    Some(error_map(&"update".to_string(), &msg.clone())),
                    Some(vec![msg]),
                );
            }

            update_query.push_str(&format!("updated_at = NOW() WHERE uuid = ${}", query_param_index));

            let mut query = sqlx::query(&update_query);

            let mut _bind_param_index = 1;
            if let Some(email) = &payload.email {
                query = query.bind(email.clone());
                _bind_param_index += 1;
            }

            if let Some(phone) = &payload.phone {
                query = query.bind(phone.clone());
                _bind_param_index += 1;
            }

            if let Some(first_name) = &payload.first_name {
                query = query.bind(first_name.clone());
                _bind_param_index += 1;
            }

            if let Some(second_name) = &payload.second_name {
                query = query.bind(second_name.clone());
                _bind_param_index += 1;
            }

            if let Some(last_name) = &payload.last_name {
                query = query.bind(last_name.clone());
                _bind_param_index += 1;
            }

            if let Some(birth_date) = &payload.birth_date {
                query = query.bind(*birth_date);
                _bind_param_index += 1;
            }

            if let Some(role) = &payload.role {
                query = query.bind(role);
                _bind_param_index += 1;
            }

            if let Some(status) = &payload.status {
                query = query.bind(status);
                _bind_param_index += 1;
            }

            if let Some(avatar) = &payload.avatar {
                query = query.bind(avatar.clone());
                _bind_param_index += 1;
            }

            if let Some(avatar_uuid) = &payload.avatar_uuid {
                query = query.bind(avatar_uuid);
                _bind_param_index += 1;
            }

            if let Some(street) = &payload.street {
                query = query.bind(street.clone());
                _bind_param_index += 1;
            }

            if let Some(gender) = &payload.gender {
                query = query.bind(gender.clone());
                _bind_param_index += 1;
            }

            if let Some(city) = &payload.city {
                query = query.bind(city.clone());
                _bind_param_index += 1;
            }

            query = query.bind(uuid);

            let result = query.execute(&state.pool).await;

            match result {
                Ok(_) => {
                    let updated_user = sqlx::query_as::<_, User>("SELECT * FROM guest_user WHERE uuid = $1")
                        .bind(uuid)
                        .fetch_one(&state.pool)
                        .await;

                    match updated_user {
                        Ok(user) => {
                            let mut audit_payload = serde_json::json!({ "email": user.email });

                            if let Some(new_role) = &payload.role {
                                audit_payload["role"] =
                                    serde_json::json!({ "from": previous_user.role, "to": new_role });
                            }

                            if let Some(new_status) = &payload.status {
                                audit_payload["status"] =
                                    serde_json::json!({ "from": previous_user.status, "to": new_status });
                            }

                            crate::audit::log_action(
                                &state.pool,
                                Some(claims.sub),
                                "user.update",
                                Some("user"),
                                Some(&uuid.to_string()),
                                Some(audit_payload),
                            )
                            .await;

                            let user_response = UserResponseDTO {
                                uuid: user.uuid,
                                first_name: user.first_name,
                                second_name: user.second_name,
                                last_name: user.last_name,
                                phone: user.phone,
                                email: user.email,
                                avatar: user.avatar,
                                role: user.role,
                                birth_date: user.birth_date,
                                created_at: user.created_at,
                                updated_at: user.updated_at,
                                street: user.street,
                                city: user.city,
                                status: user.status,
                                gender: user.gender,
                            };

                            let msg_key = if payload.role.is_some() && payload.status.is_none() && payload.first_name.is_none() {
                                "user.role_updated"
                            } else if payload.status.is_some() && payload.role.is_none() && payload.first_name.is_none() {
                                "user.status_updated"
                            } else {
                                "user.updated"
                            };

                            let msg = state.i18n.t(msg_key, &locale).await;
                            into_api_response(StatusCode::OK, Some(user_response), None, Some(vec![msg]))
                        }
                        Err(_) => {
                            let msg = state.i18n.t("general.db_error", &locale).await;
                            into_api_response(
                                StatusCode::INTERNAL_SERVER_ERROR,
                                None,
                                Some(error_map(&"database".to_string(), &msg.clone())),
                                Some(vec![msg]),
                            )
                        }
                    }
                }
                Err(_) => {
                    let msg = state.i18n.t("general.db_error", &locale).await;
                    into_api_response(
                        StatusCode::INTERNAL_SERVER_ERROR,
                        None,
                        Some(error_map(&"database".to_string(), &msg.clone())),
                        Some(vec![msg]),
                    )
                }
            }
        }
        Ok(None) => {
            let msg = state.i18n.t("user.not_found", &locale).await;
            into_api_response(
                StatusCode::NOT_FOUND,
                None,
                Some(error_map(&"user".to_string(), &msg.clone())),
                Some(vec![msg]),
            )
        }
        Err(_) => {
            let msg = state.i18n.t("general.db_error", &locale).await;
            into_api_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                None,
                Some(error_map(&"database".to_string(), &msg.clone())),
                Some(vec![msg]),
            )
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/user/roles",
    responses(
        (status = 200, description = "Список ролей", body = ApiResponse<Vec<String>>)
    ),
    tag = "User",
    operation_id = "list_roles",
)]
pub async fn list_roles() -> Result<Json<ApiResponse<Vec<String>>>, (StatusCode, Json<ApiResponse<Vec<String>>>)> {
    let roles = vec![
        "superadmin".to_string(),
        "admin".to_string(),
        "editor".to_string(),
        "user".to_string(),
    ];
    into_api_response(StatusCode::OK, Some(roles), None, None)
}

#[utoipa::path(
    get,
    path = "/api/v1/user/permissions",
    responses(
        (status = 200, description = "Список всех разрешений", body = ApiResponse<Vec<PermissionDTO>>)
    ),
    tag = "User",
    operation_id = "list_permissions",
)]
pub async fn list_permissions(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Vec<PermissionDTO>>>, (StatusCode, Json<ApiResponse<Vec<PermissionDTO>>>)> {
    let permissions = sqlx::query_as::<_, PermissionDTO>("SELECT id, name, description FROM permissions ORDER BY id")
        .fetch_all(&state.pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Database error".into()]) }))
        })?;

    into_api_response(StatusCode::OK, Some(permissions), None, None)
}

#[utoipa::path(
    get,
    path = "/api/v1/user/roles/{role}/permissions",
    responses(
        (status = 200, description = "Права роли", body = ApiResponse<Vec<String>>)
    ),
    tag = "User",
    operation_id = "get_role_permissions",
)]
pub async fn get_role_permissions(
    State(state): State<Arc<AppState>>,
    Path(role): Path<String>,
) -> Result<Json<ApiResponse<Vec<String>>>, (StatusCode, Json<ApiResponse<Vec<String>>>)> {
    let permissions = sqlx::query("SELECT permission_id FROM roles_permissions WHERE role = $1::user_role")
        .bind(&role)
        .fetch_all(&state.pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Database error".into()]) }))
        })?;

    let ids = permissions.iter().map(|r| sqlx::Row::get::<String, _>(r, 0)).collect();
    into_api_response(StatusCode::OK, Some(ids), None, None)
}

#[utoipa::path(
    post,
    path = "/api/v1/user/roles/{role}/permissions",
    request_body = Vec<String>,
    responses(
        (status = 200, description = "Права обновлены")
    ),
    tag = "User",
    operation_id = "update_role_permissions",
)]
pub async fn update_role_permissions(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(role): Path<String>,
    Json(permissions): Json<Vec<String>>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let mut tx = state.pool.begin().await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Database error".into()]) })))?;

    let previous_permissions: Vec<String> = sqlx::query_scalar(
        "SELECT permission_id FROM roles_permissions WHERE role = $1::user_role",
    )
    .bind(&role)
    .fetch_all(&mut *tx)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Database error".into()]) })))?;

    sqlx::query("DELETE FROM roles_permissions WHERE role = $1::user_role")
        .bind(&role)
        .execute(&mut *tx)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Database error".into()]) })))?;

    sqlx::query(
        "INSERT INTO roles_permissions (role, permission_id)
         SELECT $1::user_role, * FROM unnest($2::text[])",
    )
    .bind(&role)
    .bind(&permissions)
    .execute(&mut *tx)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Database error".into()]) })))?;

    tx.commit().await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Database error".into()]) })))?;

    crate::audit::log_action(
        &state.pool,
        Some(claims.sub),
        "role.permissions_update",
        Some("role"),
        Some(&role),
        Some(serde_json::json!({ "from": previous_permissions, "to": permissions })),
    )
    .await;

    into_api_response(StatusCode::OK, None, None, None)
}

#[utoipa::path(
    get,
    path = "/api/v1/user/me",
    responses(
        (status = 200, body = ApiResponse<UserResponseDTO>),
        (status = 401, description = "Unauthorized"),
        (status = 404, body = ApiResponse<UserResponseDTO>),
        (status = 500, body = ApiResponse<UserResponseDTO>)
    ),
    tag = "User",
    operation_id = "get_me",
    security(("bearer_auth" = []))
)]
async fn get_me(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<ApiResponse<UserResponseDTO>>, (StatusCode, Json<ApiResponse<UserResponseDTO>>)> {
    get_one(State(state), Extension(locale), Path(claims.sub)).await
}

#[utoipa::path(
    patch,
    path = "/api/v1/user/me",
    request_body = UpdateUserDTO,
    responses(
        (status = 200, body = ApiResponse<UserResponseDTO>),
        (status = 401, description = "Unauthorized"),
        (status = 404, body = ApiResponse<UserResponseDTO>),
        (status = 500, body = ApiResponse<UserResponseDTO>)
    ),
    tag = "User",
    operation_id = "update_me",
    security(("bearer_auth" = []))
)]
async fn update_me(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Extension(claims): Extension<Claims>,
    Json(mut payload): Json<UpdateUserDTO>,
) -> Result<Json<ApiResponse<UserResponseDTO>>, (StatusCode, Json<ApiResponse<UserResponseDTO>>)> {
    // Самостоятельное редактирование профиля не должно уметь менять role/status —
    // это admin-only привилегии. `/me` сидит только за auth_middleware (без
    // user:write), а update() ниже применяет payload как есть — без этой зачистки
    // любой залогиненный пользователь мог бы повысить себе роль до superadmin
    // одним PATCH-запросом на собственный профиль.
    payload.role = None;
    payload.status = None;

    update(State(state), Extension(locale), Extension(claims.clone()), Path(claims.sub), Json(payload)).await
}

#[utoipa::path(
    post,
    path = "/api/v1/user/me/password",
    request_body = ChangePasswordDTO,
    responses(
        (status = 200, description = "Пароль изменен"),
        (status = 400, description = "Неверный старый пароль"),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Ошибка")
    ),
    tag = "User",
    operation_id = "change_password",
    security(("bearer_auth" = []))
)]
async fn change_password(
    State(state): State<Arc<AppState>>,
    Extension(locale): Extension<String>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<ChangePasswordDTO>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let user = match sqlx::query_as::<_, User>("SELECT * FROM guest_user WHERE uuid = $1")
        .bind(claims.sub)
        .fetch_optional(&state.pool)
        .await
    {
        Ok(Some(user)) => user,
        Ok(None) => {
            return Err((StatusCode::UNAUTHORIZED, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["User not found".to_string()]) })));
        }
        Err(_) => {
            let msg = state.i18n.t("general.db_error", &locale).await;
            return Err((StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec![msg]) })));
        }
    };

    if !verify_password(&payload.old_password, &user.password_hash) {
        let msg = state.i18n.t("auth.invalid_credentials", &locale).await;
        return into_api_response(
            StatusCode::BAD_REQUEST,
            None,
            Some(error_map("password", &msg)),
            Some(vec![msg]),
        );
    }

    let new_password_hash = hash_password(&payload.new_password).map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Hash error".to_string()]) }))
    })?;

    sqlx::query("UPDATE guest_user SET password_hash = $1, updated_at = NOW() WHERE uuid = $2")
        .bind(new_password_hash)
        .bind(claims.sub)
        .execute(&state.pool)
        .await
        .map_err(|_| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse { data: None, errors: None, messages: Some(vec!["Update error".into()]) }))
        })?;

    let msg = state.i18n.t("user.password_changed", &locale).await;
    into_api_response(StatusCode::OK, None, None, Some(vec![msg]))
}

/// Публичный роутер не выдаёт никаких данных пользователей и не создаёт их —
/// регистрация идёт через `/api/v1/auth/register`. Ранее CRUD пользователей
/// (`get_all`/`create`/`get_one`/`delete_one`/`update`) был смонтирован здесь
/// без какой-либо авторизации (любой неавторизованный мог листать всех
/// пользователей и создать аккаунт с `role: "superadmin"`) — перенесён в
/// `protected_router` (см. IMPROVEMENTS.md, п.1).
pub fn public_router() -> Router<Arc<AppState>> {
    Router::new()
}

/// Мутирующие операции над пользователями требуют permission `user:write`;
/// изменение прав роли — отдельный, более чувствительный permission
/// `access:write` (см. IMPROVEMENTS.md, п.1).
pub fn protected_router(state: Arc<AppState>) -> Router<Arc<AppState>> {
    let write_router = Router::new()
        .route("/", post(create))
        .route("/{id}", delete(delete_one).patch(update))
        .route_layer(axum::middleware::from_fn_with_state(
            state.clone(),
            crate::auth::middlewares::require_user_write,
        ));

    let access_write_router = Router::new()
        .route("/roles/{role}/permissions", post(update_role_permissions))
        .route_layer(axum::middleware::from_fn_with_state(
            state,
            crate::auth::middlewares::require_access_write,
        ));

    let read_router = Router::new()
        .route("/me", get(get_me).patch(update_me))
        .route("/me/password", post(change_password))
        .route("/roles", get(list_roles))
        .route("/permissions", get(list_permissions))
        .route("/roles/{role}/permissions", get(get_role_permissions))
        .route("/", get(get_all))
        .route("/{id}", get(get_one));

    write_router.merge(access_write_router).merge(read_router)
}
