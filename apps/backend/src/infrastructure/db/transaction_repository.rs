use async_trait::async_trait;
use chrono::{DateTime, NaiveDate, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::domain::entities::{Transaction, TransactionType};
use crate::domain::repositories::TransactionRepository;

struct TransactionRow {
    id: Uuid,
    user_id: Uuid,
    account_id: Uuid,
    category_id: Option<Uuid>,
    amount: i64,
    description: String,
    transaction_type: String,
    date: NaiveDate,
    notes: Option<String>,
    is_recurring: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl TryFrom<TransactionRow> for Transaction {
    type Error = anyhow::Error;

    fn try_from(row: TransactionRow) -> anyhow::Result<Self> {
        Ok(Transaction {
            id: row.id,
            user_id: row.user_id,
            account_id: row.account_id,
            category_id: row.category_id,
            amount: row.amount,
            description: row.description,
            transaction_type: row.transaction_type.parse::<TransactionType>()?,
            date: row.date,
            notes: row.notes,
            is_recurring: row.is_recurring,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }
}

pub struct PgTransactionRepository {
    pool: PgPool,
}

impl PgTransactionRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl TransactionRepository for PgTransactionRepository {
    async fn create(&self, tx: &Transaction) -> anyhow::Result<Transaction> {
        let row = sqlx::query_as!(
            TransactionRow,
            r#"
            INSERT INTO public.transactions
                (id, user_id, account_id, category_id, amount, description,
                 transaction_type, date, notes, is_recurring)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, user_id, account_id, category_id, amount, description,
                      transaction_type, date, notes, is_recurring, created_at, updated_at
            "#,
            tx.id,
            tx.user_id,
            tx.account_id,
            tx.category_id,
            tx.amount,
            tx.description,
            tx.transaction_type.to_string(),
            tx.date,
            tx.notes,
            tx.is_recurring,
        )
        .fetch_one(&self.pool)
        .await?;

        Transaction::try_from(row)
    }

    async fn find_by_id(&self, user_id: Uuid, id: Uuid) -> anyhow::Result<Option<Transaction>> {
        let row = sqlx::query_as!(
            TransactionRow,
            r#"
            SELECT id, user_id, account_id, category_id, amount, description,
                   transaction_type, date, notes, is_recurring, created_at, updated_at
            FROM public.transactions
            WHERE user_id = $1 AND id = $2
            "#,
            user_id,
            id,
        )
        .fetch_optional(&self.pool)
        .await?;

        row.map(Transaction::try_from).transpose()
    }

    async fn list_by_user(
        &self,
        user_id: Uuid,
        limit: i64,
        offset: i64,
    ) -> anyhow::Result<Vec<Transaction>> {
        let rows = sqlx::query_as!(
            TransactionRow,
            r#"
            SELECT id, user_id, account_id, category_id, amount, description,
                   transaction_type, date, notes, is_recurring, created_at, updated_at
            FROM public.transactions
            WHERE user_id = $1
            ORDER BY date DESC, created_at DESC
            LIMIT $2 OFFSET $3
            "#,
            user_id,
            limit,
            offset,
        )
        .fetch_all(&self.pool)
        .await?;

        rows.into_iter().map(Transaction::try_from).collect()
    }

    async fn delete(&self, user_id: Uuid, id: Uuid) -> anyhow::Result<bool> {
        let result = sqlx::query!(
            "DELETE FROM public.transactions WHERE user_id = $1 AND id = $2",
            user_id,
            id,
        )
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }
}
