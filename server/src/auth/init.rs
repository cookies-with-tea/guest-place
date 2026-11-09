use crate::user::dto::{UserRole, UserStatus};
use crate::AppState;
use argon2::{password_hash::SaltString, Argon2, PasswordHasher};
use rand_core::OsRng;
use std::sync::Arc;

/// Сидит break-glass аккаунт из `SUPERADMIN_EMAIL`/`SUPERADMIN_PASSWORD`. Раньше
/// присваивал `UserRole::Admin` в обеих ветках (create и update), несмотря на имя
/// функции/лог/env-переменные — т.е. этот аккаунт никогда не был настоящим superadmin
/// и не мог использовать ни одну из superadmin-only фич (access:write/system:write/
/// features:write/audit:read).
pub async fn init_superadmin(state: Arc<AppState>) -> anyhow::Result<()> {
    let email = match std::env::var("SUPERADMIN_EMAIL") {
        Ok(e) => e,
        Err(_) => return Ok(()),
    };
    let password = match std::env::var("SUPERADMIN_PASSWORD") {
        Ok(p) => p,
        Err(_) => return Ok(()),
    };

    // Check if user exists
    let exists = sqlx::query("SELECT uuid FROM guest_user WHERE email = $1")
        .bind(&email)
        .fetch_optional(&state.pool)
        .await?;

    if exists.is_some() {
        // Update password hash if needed
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| anyhow::anyhow!("Failed to hash password: {}", e))?
            .to_string();

        sqlx::query("UPDATE guest_user SET password_hash = $1, role = $2 WHERE email = $3")
            .bind(password_hash)
            .bind(UserRole::Superadmin)
            .bind(&email)
            .execute(&state.pool)
            .await?;
        
        tracing::info!("[Init] Superadmin updated: {}", email);
        return Ok(());
    }

    // Create user
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| anyhow::anyhow!("Failed to hash password: {}", e))?
        .to_string();

    sqlx::query(
        "INSERT INTO guest_user (uuid, first_name, last_name, email, password_hash, role, status) \
         VALUES ($1, $2, $3, $4, $5, $6, $7)"
    )
    .bind(uuid::Uuid::new_v4())
    .bind("Admin")
    .bind("System")
    .bind(&email)
    .bind(password_hash)
    .bind(UserRole::Superadmin)
    .bind(UserStatus::Active)
    .execute(&state.pool)
    .await?;

    tracing::info!("[Init] Superadmin created: {}", email);
    Ok(())
}
