use chrono::Local;
use uuid::Uuid;

use crate::application::dtos::{CreateTransactionDto, TransactionResponse};
use crate::domain::entities::{Transaction, TransactionType};
use crate::domain::repositories::TransactionRepository;

pub async fn create(
    repo: &dyn TransactionRepository,
    user_id: Uuid,
    dto: CreateTransactionDto,
) -> anyhow::Result<TransactionResponse> {
    let transaction_type = dto
        .transaction_type
        .parse::<TransactionType>()
        .map_err(|e| anyhow::anyhow!("{}", e))?;

    let transaction = Transaction {
        id: Uuid::new_v4(),
        user_id,
        account_id: dto.account_id,
        category_id: dto.category_id,
        amount: dto.amount,
        description: dto.description,
        transaction_type,
        date: dto.date.unwrap_or_else(|| Local::now().date_naive()),
        notes: dto.notes,
        is_recurring: dto.is_recurring.unwrap_or(false),
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };

    let saved = repo.create(&transaction).await?;
    Ok(TransactionResponse::from(saved))
}

pub async fn list(
    repo: &dyn TransactionRepository,
    user_id: Uuid,
    limit: i64,
    offset: i64,
) -> anyhow::Result<Vec<TransactionResponse>> {
    let txs = repo.list_by_user(user_id, limit, offset).await?;
    Ok(txs.into_iter().map(TransactionResponse::from).collect())
}

pub async fn get(
    repo: &dyn TransactionRepository,
    user_id: Uuid,
    id: Uuid,
) -> anyhow::Result<Option<TransactionResponse>> {
    let tx = repo.find_by_id(user_id, id).await?;
    Ok(tx.map(TransactionResponse::from))
}

pub async fn delete(
    repo: &dyn TransactionRepository,
    user_id: Uuid,
    id: Uuid,
) -> anyhow::Result<bool> {
    repo.delete(user_id, id).await
}
