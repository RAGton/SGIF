use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::domain::entities::{Account, AccountType};
use crate::domain::repositories::AccountRepository;

struct AccountRow {
    id: Uuid,
    user_id: Uuid,
    name: String,
    account_type: String,
    currency: String,
    initial_balance: i64,
    current_balance: i64,
    color: Option<String>,
    icon: Option<String>,
    is_active: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl TryFrom<AccountRow> for Account {
    type Error = anyhow::Error;

    fn try_from(row: AccountRow) -> anyhow::Result<Self> {
        Ok(Account {
            id: row.id,
            user_id: row.user_id,
            name: row.name,
            account_type: row.account_type.parse::<AccountType>()?,
            currency: row.currency,
            initial_balance: row.initial_balance,
            current_balance: row.current_balance,
            color: row.color.unwrap_or_else(|| "#6C63FF".to_string()),
            icon: row.icon.unwrap_or_else(|| "wallet".to_string()),
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }
}

pub struct PgAccountRepository {
    pool: PgPool,
}

impl PgAccountRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl AccountRepository for PgAccountRepository {
    async fn create(&self, account: &Account) -> anyhow::Result<Account> {
        let row = sqlx::query_as!(
            AccountRow,
            r#"
            INSERT INTO public.accounts
                (id, user_id, name, account_type, currency, initial_balance, current_balance, color, icon, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, user_id, name, account_type, currency, initial_balance, current_balance,
                      color, icon, is_active, created_at, updated_at
            "#,
            account.id,
            account.user_id,
            account.name,
            account.account_type.to_string(),
            account.currency,
            account.initial_balance,
            account.current_balance,
            account.color,
            account.icon,
            account.is_active,
        )
        .fetch_one(&self.pool)
        .await?;

        Account::try_from(row)
    }

    async fn find_by_id(&self, user_id: Uuid, id: Uuid) -> anyhow::Result<Option<Account>> {
        let row = sqlx::query_as!(
            AccountRow,
            r#"
            SELECT id, user_id, name, account_type, currency, initial_balance, current_balance,
                   color, icon, is_active, created_at, updated_at
            FROM public.accounts
            WHERE user_id = $1 AND id = $2
            "#,
            user_id,
            id,
        )
        .fetch_optional(&self.pool)
        .await?;

        row.map(Account::try_from).transpose()
    }

    async fn list_by_user(&self, user_id: Uuid) -> anyhow::Result<Vec<Account>> {
        let rows = sqlx::query_as!(
            AccountRow,
            r#"
            SELECT id, user_id, name, account_type, currency, initial_balance, current_balance,
                   color, icon, is_active, created_at, updated_at
            FROM public.accounts
            WHERE user_id = $1
            ORDER BY created_at ASC
            "#,
            user_id,
        )
        .fetch_all(&self.pool)
        .await?;

        rows.into_iter().map(Account::try_from).collect()
    }

    async fn update(&self, user_id: Uuid, account: &Account) -> anyhow::Result<Account> {
        let row = sqlx::query_as!(
            AccountRow,
            r#"
            UPDATE public.accounts
            SET name       = $3,
                color      = $4,
                icon       = $5,
                is_active  = $6,
                updated_at = NOW()
            WHERE user_id = $1 AND id = $2
            RETURNING id, user_id, name, account_type, currency, initial_balance, current_balance,
                      color, icon, is_active, created_at, updated_at
            "#,
            user_id,
            account.id,
            account.name,
            account.color,
            account.icon,
            account.is_active,
        )
        .fetch_one(&self.pool)
        .await?;

        Account::try_from(row)
    }

    async fn delete(&self, user_id: Uuid, id: Uuid) -> anyhow::Result<bool> {
        let result = sqlx::query!(
            "DELETE FROM public.accounts WHERE user_id = $1 AND id = $2",
            user_id,
            id,
        )
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }
}
