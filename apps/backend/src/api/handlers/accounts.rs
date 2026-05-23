use axum::{
    extract::{Path, State},
    http::StatusCode,
    Extension, Json,
};
use uuid::Uuid;
use validator::Validate;

use crate::api::{
    error::ApiResult,
    middleware::auth::AuthenticatedUser,
    state::AppState,
};
use crate::application::{
    dtos::{CreateAccountDto, UpdateAccountDto},
    use_cases::accounts,
};
use crate::infrastructure::db::account_repository::PgAccountRepository;

pub async fn list(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> ApiResult<(StatusCode, Json<Vec<crate::application::dtos::AccountResponse>>)> {
    let repo = PgAccountRepository::new(state.db);
    let result = accounts::list(&repo, user.id).await?;
    Ok((StatusCode::OK, Json(result)))
}

pub async fn create(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Json(body): Json<CreateAccountDto>,
) -> ApiResult<(StatusCode, Json<crate::application::dtos::AccountResponse>)> {
    body.validate()
        .map_err(|e| anyhow::anyhow!("{}", e))?;
    let repo = PgAccountRepository::new(state.db);
    let result = accounts::create(&repo, user.id, body).await?;
    Ok((StatusCode::CREATED, Json(result)))
}

pub async fn get(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
) -> ApiResult<(StatusCode, Json<crate::application::dtos::AccountResponse>)> {
    let repo = PgAccountRepository::new(state.db);
    match accounts::get(&repo, user.id, id).await? {
        Some(account) => Ok((StatusCode::OK, Json(account))),
        None => Err(anyhow::anyhow!("account not found").into()),
    }
}

pub async fn update(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateAccountDto>,
) -> ApiResult<(StatusCode, Json<crate::application::dtos::AccountResponse>)> {
    body.validate()
        .map_err(|e| anyhow::anyhow!("{}", e))?;
    let repo = PgAccountRepository::new(state.db);
    match accounts::update(&repo, user.id, id, body).await? {
        Some(account) => Ok((StatusCode::OK, Json(account))),
        None => Err(anyhow::anyhow!("account not found").into()),
    }
}

pub async fn delete(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
) -> ApiResult<StatusCode> {
    let repo = PgAccountRepository::new(state.db);
    let deleted = accounts::delete(&repo, user.id, id).await?;
    if deleted {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(anyhow::anyhow!("account not found").into())
    }
}
