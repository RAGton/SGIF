use uuid::Uuid;

use crate::application::dtos::{CategoryResponse, CreateCategoryDto};
use crate::domain::entities::{Category, CategoryType};
use crate::domain::repositories::CategoryRepository;

pub async fn create<R: CategoryRepository>(
    repo: &R,
    user_id: Uuid,
    dto: CreateCategoryDto,
) -> anyhow::Result<CategoryResponse> {
    let category_type = dto
        .category_type
        .parse::<CategoryType>()
        .map_err(|e| anyhow::anyhow!("{}", e))?;

    let category = Category {
        id: Uuid::new_v4(),
        user_id,
        name: dto.name,
        icon: dto.icon.unwrap_or_else(|| "tag".to_string()),
        color: dto.color.unwrap_or_else(|| "#6C63FF".to_string()),
        category_type,
        parent_id: dto.parent_id,
        created_at: chrono::Utc::now(),
    };

    let saved = repo.create(&category).await?;
    Ok(CategoryResponse::from(saved))
}

pub async fn list<R: CategoryRepository>(
    repo: &R,
    user_id: Uuid,
) -> anyhow::Result<Vec<CategoryResponse>> {
    let categories = repo.list_by_user(user_id).await?;
    Ok(categories.into_iter().map(CategoryResponse::from).collect())
}

pub async fn delete<R: CategoryRepository>(
    repo: &R,
    user_id: Uuid,
    id: Uuid,
) -> anyhow::Result<bool> {
    repo.delete(user_id, id).await
}
