pub mod account_repository;
pub mod category_repository;
pub mod transaction_repository;

use sqlx::{postgres::PgPoolOptions, PgPool};
use std::time::Duration;

pub async fn create_pool() -> anyhow::Result<PgPool> {
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(20)
        .acquire_timeout(Duration::from_secs(5))
        .connect(&database_url)
        .await?;

    sqlx::migrate!("./migrations").run(&pool).await?;

    tracing::info!("✅ Database pool established");
    Ok(pool)
}
