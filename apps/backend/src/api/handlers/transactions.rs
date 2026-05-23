use axum::{
    extract::{Path, Query, State},
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
    dtos::{CreateTransactionDto, ListTransactionsQuery, TransactionResponse},
    use_cases::transactions,
};
use crate::infrastructure::db::transaction_repository::PgTransactionRepository;

pub async fn list(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Query(query): Query<ListTransactionsQuery>,
) -> ApiResult<(StatusCode, Json<Vec<TransactionResponse>>)> {
    let limit = query.limit.unwrap_or(50).min(200);
    let offset = query.offset.unwrap_or(0);
    let repo = PgTransactionRepository::new(state.db);
    let result = transactions::list(&repo, user.id, limit, offset).await?;
    Ok((StatusCode::OK, Json(result)))
}

pub async fn create(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Json(body): Json<CreateTransactionDto>,
) -> ApiResult<(StatusCode, Json<TransactionResponse>)> {
    body.validate()
        .map_err(|e| anyhow::anyhow!("{}", e))?;
    let repo = PgTransactionRepository::new(state.db);
    let result = transactions::create(&repo, user.id, body).await?;
    Ok((StatusCode::CREATED, Json(result)))
}

pub async fn get(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
) -> ApiResult<(StatusCode, Json<TransactionResponse>)> {
    let repo = PgTransactionRepository::new(state.db);
    match transactions::get(&repo, user.id, id).await? {
        Some(tx) => Ok((StatusCode::OK, Json(tx))),
        None => Err(anyhow::anyhow!("transaction not found").into()),
    }
}

pub async fn delete(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
) -> ApiResult<StatusCode> {
    let repo = PgTransactionRepository::new(state.db);
    let deleted = transactions::delete(&repo, user.id, id).await?;
    if deleted {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(anyhow::anyhow!("transaction not found").into())
    }
}
