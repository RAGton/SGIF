use async_trait::async_trait;
use uuid::Uuid;

use crate::domain::entities::{Account, Category, Transaction};

#[async_trait]
pub trait AccountRepository: Send + Sync {
    async fn create(&self, account: &Account) -> anyhow::Result<Account>;
    async fn find_by_id(&self, user_id: Uuid, id: Uuid) -> anyhow::Result<Option<Account>>;
    async fn list_by_user(&self, user_id: Uuid) -> anyhow::Result<Vec<Account>>;
    async fn update(&self, user_id: Uuid, account: &Account) -> anyhow::Result<Account>;
    async fn delete(&self, user_id: Uuid, id: Uuid) -> anyhow::Result<bool>;
}

#[async_trait]
pub trait CategoryRepository: Send + Sync {
    async fn create(&self, category: &Category) -> anyhow::Result<Category>;
    async fn find_by_id(&self, user_id: Uuid, id: Uuid) -> anyhow::Result<Option<Category>>;
    async fn list_by_user(&self, user_id: Uuid) -> anyhow::Result<Vec<Category>>;
    async fn delete(&self, user_id: Uuid, id: Uuid) -> anyhow::Result<bool>;
}

#[async_trait]
pub trait TransactionRepository: Send + Sync {
    async fn create(&self, tx: &Transaction) -> anyhow::Result<Transaction>;
    async fn find_by_id(&self, user_id: Uuid, id: Uuid) -> anyhow::Result<Option<Transaction>>;
    async fn list_by_user(
        &self,
        user_id: Uuid,
        limit: i64,
        offset: i64,
    ) -> anyhow::Result<Vec<Transaction>>;
    async fn delete(&self, user_id: Uuid, id: Uuid) -> anyhow::Result<bool>;
}
