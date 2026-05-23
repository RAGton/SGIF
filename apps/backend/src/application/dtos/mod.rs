use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

use crate::domain::entities::{Account, Category, Transaction};

// ── Account DTOs ──────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize, Validate)]
pub struct CreateAccountDto {
    #[validate(length(min = 1, max = 100, message = "name must be 1–100 chars"))]
    pub name: String,
    pub account_type: String,
    pub currency: Option<String>,
    pub initial_balance: Option<i64>,
    pub color: Option<String>,
    pub icon: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateAccountDto {
    #[validate(length(min = 1, max = 100, message = "name must be 1–100 chars"))]
    pub name: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct AccountResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub account_type: String,
    pub currency: String,
    pub initial_balance: i64,
    pub current_balance: i64,
    pub color: String,
    pub icon: String,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl From<Account> for AccountResponse {
    fn from(a: Account) -> Self {
        Self {
            id: a.id,
            user_id: a.user_id,
            name: a.name,
            account_type: a.account_type.to_string(),
            currency: a.currency,
            initial_balance: a.initial_balance,
            current_balance: a.current_balance,
            color: a.color,
            icon: a.icon,
            is_active: a.is_active,
            created_at: a.created_at.to_rfc3339(),
            updated_at: a.updated_at.to_rfc3339(),
        }
    }
}

// ── Category DTOs ─────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize, Validate)]
pub struct CreateCategoryDto {
    #[validate(length(min = 1, max = 100, message = "name must be 1–100 chars"))]
    pub name: String,
    pub category_type: String,
    pub icon: Option<String>,
    pub color: Option<String>,
    pub parent_id: Option<Uuid>,
}

#[derive(Debug, Serialize)]
pub struct CategoryResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub icon: String,
    pub color: String,
    pub category_type: String,
    pub parent_id: Option<Uuid>,
    pub created_at: String,
}

impl From<Category> for CategoryResponse {
    fn from(c: Category) -> Self {
        Self {
            id: c.id,
            user_id: c.user_id,
            name: c.name,
            icon: c.icon,
            color: c.color,
            category_type: c.category_type.to_string(),
            parent_id: c.parent_id,
            created_at: c.created_at.to_rfc3339(),
        }
    }
}

// ── Transaction DTOs ──────────────────────────────────────────────────────────

#[derive(Debug, Deserialize, Validate)]
pub struct CreateTransactionDto {
    pub account_id: Uuid,
    pub category_id: Option<Uuid>,
    pub amount: i64,
    #[validate(length(min = 1, max = 255, message = "description must be 1–255 chars"))]
    pub description: String,
    pub transaction_type: String,
    pub date: Option<NaiveDate>,
    pub notes: Option<String>,
    pub is_recurring: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct ListTransactionsQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct TransactionResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub account_id: Uuid,
    pub category_id: Option<Uuid>,
    pub amount: i64,
    pub description: String,
    pub transaction_type: String,
    pub date: String,
    pub notes: Option<String>,
    pub is_recurring: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl From<Transaction> for TransactionResponse {
    fn from(t: Transaction) -> Self {
        Self {
            id: t.id,
            user_id: t.user_id,
            account_id: t.account_id,
            category_id: t.category_id,
            amount: t.amount,
            description: t.description,
            transaction_type: t.transaction_type.to_string(),
            date: t.date.to_string(),
            notes: t.notes,
            is_recurring: t.is_recurring,
            created_at: t.created_at.to_rfc3339(),
            updated_at: t.updated_at.to_rfc3339(),
        }
    }
}
