use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::domain::entities::{Category, CategoryType};
use crate::domain::repositories::CategoryRepository;

struct CategoryRow {
    id: Uuid,
    user_id: Uuid,
    name: String,
    icon: Option<String>,
    color: Option<String>,
    category_type: String,
    parent_id: Option<Uuid>,
    created_at: DateTime<Utc>,
}

impl TryFrom<CategoryRow> for Category {
    type Error = anyhow::Error;

    fn try_from(row: CategoryRow) -> anyhow::Result<Self> {
        Ok(Category {
            id: row.id,
            user_id: row.user_id,
            name: row.name,
            icon: row.icon.unwrap_or_else(|| "tag".to_string()),
            color: row.color.unwrap_or_else(|| "#6C63FF".to_string()),
            category_type: row.category_type.parse::<CategoryType>()?,
            parent_id: row.parent_id,
            created_at: row.created_at,
        })
    }
}

pub struct PgCategoryRepository {
    pool: PgPool,
}

impl PgCategoryRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl CategoryRepository for PgCategoryRepository {
    async fn create(&self, category: &Category) -> anyhow::Result<Category> {
        let row = sqlx::query_as!(
            CategoryRow,
            r#"
            INSERT INTO public.categories
                (id, user_id, name, icon, color, category_type, parent_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, user_id, name, icon, color, category_type, parent_id, created_at
            "#,
            category.id,
            category.user_id,
            category.name,
            category.icon,
            category.color,
            category.category_type.to_string(),
            category.parent_id,
        )
        .fetch_one(&self.pool)
        .await?;

        Category::try_from(row)
    }

    async fn list_by_user(&self, user_id: Uuid) -> anyhow::Result<Vec<Category>> {
        let rows = sqlx::query_as!(
            CategoryRow,
            r#"
            SELECT id, user_id, name, icon, color, category_type, parent_id, created_at
            FROM public.categories
            WHERE user_id = $1
            ORDER BY name ASC
            "#,
            user_id,
        )
        .fetch_all(&self.pool)
        .await?;

        rows.into_iter().map(Category::try_from).collect()
    }

    async fn delete(&self, user_id: Uuid, id: Uuid) -> anyhow::Result<bool> {
        let result = sqlx::query!(
            "DELETE FROM public.categories WHERE user_id = $1 AND id = $2",
            user_id,
            id,
        )
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }
}
