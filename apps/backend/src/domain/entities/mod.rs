use chrono::{DateTime, NaiveDate, Utc};
use uuid::Uuid;

#[derive(Debug, thiserror::Error)]
pub enum DomainError {
    #[error("invalid account type: {0}")]
    InvalidAccountType(String),
    #[error("invalid category type: {0}")]
    InvalidCategoryType(String),
    #[error("invalid transaction type: {0}")]
    InvalidTransactionType(String),
}

// ── AccountType ───────────────────────────────────────────────────────────────

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AccountType {
    Wallet,
    Bank,
    CreditCard,
    Investment,
}

impl std::str::FromStr for AccountType {
    type Err = DomainError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "wallet" => Ok(Self::Wallet),
            "bank" => Ok(Self::Bank),
            "credit_card" => Ok(Self::CreditCard),
            "investment" => Ok(Self::Investment),
            other => Err(DomainError::InvalidAccountType(other.to_string())),
        }
    }
}

impl std::fmt::Display for AccountType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Self::Wallet => "wallet",
            Self::Bank => "bank",
            Self::CreditCard => "credit_card",
            Self::Investment => "investment",
        };
        write!(f, "{}", s)
    }
}

// ── CategoryType ──────────────────────────────────────────────────────────────

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CategoryType {
    Income,
    Expense,
}

impl std::str::FromStr for CategoryType {
    type Err = DomainError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "income" => Ok(Self::Income),
            "expense" => Ok(Self::Expense),
            other => Err(DomainError::InvalidCategoryType(other.to_string())),
        }
    }
}

impl std::fmt::Display for CategoryType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Self::Income => "income",
            Self::Expense => "expense",
        };
        write!(f, "{}", s)
    }
}

// ── TransactionType ───────────────────────────────────────────────────────────

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TransactionType {
    Income,
    Expense,
    Transfer,
}

impl std::str::FromStr for TransactionType {
    type Err = DomainError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "income" => Ok(Self::Income),
            "expense" => Ok(Self::Expense),
            "transfer" => Ok(Self::Transfer),
            other => Err(DomainError::InvalidTransactionType(other.to_string())),
        }
    }
}

impl std::fmt::Display for TransactionType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Self::Income => "income",
            Self::Expense => "expense",
            Self::Transfer => "transfer",
        };
        write!(f, "{}", s)
    }
}

// ── Entities ──────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct Account {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub account_type: AccountType,
    pub currency: String,
    pub initial_balance: i64,
    pub current_balance: i64,
    pub color: String,
    pub icon: String,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct Category {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub icon: String,
    pub color: String,
    pub category_type: CategoryType,
    pub parent_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct Transaction {
    pub id: Uuid,
    pub user_id: Uuid,
    pub account_id: Uuid,
    pub category_id: Option<Uuid>,
    pub amount: i64,
    pub description: String,
    pub transaction_type: TransactionType,
    pub date: NaiveDate,
    pub notes: Option<String>,
    pub is_recurring: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
