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
    dtos::{CategoryResponse, CreateCategoryDto},
    use_cases::categories,
};
use crate::infrastructure::db::category_repository::PgCategoryRepository;

pub async fn list(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> ApiResult<(StatusCode, Json<Vec<CategoryResponse>>)> {
    let repo = PgCategoryRepository::new(state.db);
    let result = categories::list(&repo, user.id).await?;
    Ok((StatusCode::OK, Json(result)))
}

pub async fn create(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Json(body): Json<CreateCategoryDto>,
) -> ApiResult<(StatusCode, Json<CategoryResponse>)> {
    body.validate()
        .map_err(|e| anyhow::anyhow!("{}", e))?;
    let repo = PgCategoryRepository::new(state.db);
    let result = categories::create(&repo, user.id, body).await?;
    Ok((StatusCode::CREATED, Json(result)))
}

pub async fn delete(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
) -> ApiResult<StatusCode> {
    let repo = PgCategoryRepository::new(state.db);
    let deleted = categories::delete(&repo, user.id, id).await?;
    if deleted {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(anyhow::anyhow!("category not found").into())
    }
}
