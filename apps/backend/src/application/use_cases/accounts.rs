use uuid::Uuid;

use crate::application::dtos::{AccountResponse, CreateAccountDto, UpdateAccountDto};
use crate::domain::entities::{Account, AccountType};
use crate::domain::repositories::AccountRepository;

pub async fn create<R: AccountRepository>(
    repo: &R,
    user_id: Uuid,
    dto: CreateAccountDto,
) -> anyhow::Result<AccountResponse> {
    let account_type = dto
        .account_type
        .parse::<AccountType>()
        .map_err(|e| anyhow::anyhow!("{}", e))?;

    let initial = dto.initial_balance.unwrap_or(0);

    let account = Account {
        id: Uuid::new_v4(),
        user_id,
        name: dto.name,
        account_type,
        currency: dto.currency.unwrap_or_else(|| "BRL".to_string()),
        initial_balance: initial,
        current_balance: initial,
        color: dto.color.unwrap_or_else(|| "#6C63FF".to_string()),
        icon: dto.icon.unwrap_or_else(|| "wallet".to_string()),
        is_active: true,
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };

    let saved = repo.create(&account).await?;
    Ok(AccountResponse::from(saved))
}

pub async fn list<R: AccountRepository>(
    repo: &R,
    user_id: Uuid,
) -> anyhow::Result<Vec<AccountResponse>> {
    let accounts = repo.list_by_user(user_id).await?;
    Ok(accounts.into_iter().map(AccountResponse::from).collect())
}

pub async fn get<R: AccountRepository>(
    repo: &R,
    user_id: Uuid,
    id: Uuid,
) -> anyhow::Result<Option<AccountResponse>> {
    let account = repo.find_by_id(user_id, id).await?;
    Ok(account.map(AccountResponse::from))
}

pub async fn update<R: AccountRepository>(
    repo: &R,
    user_id: Uuid,
    id: Uuid,
    dto: UpdateAccountDto,
) -> anyhow::Result<Option<AccountResponse>> {
    let existing = repo.find_by_id(user_id, id).await?;
    let Some(mut account) = existing else {
        return Ok(None);
    };

    if let Some(name) = dto.name {
        account.name = name;
    }
    if let Some(color) = dto.color {
        account.color = color;
    }
    if let Some(icon) = dto.icon {
        account.icon = icon;
    }
    if let Some(is_active) = dto.is_active {
        account.is_active = is_active;
    }

    let saved = repo.update(user_id, &account).await?;
    Ok(Some(AccountResponse::from(saved)))
}

pub async fn delete<R: AccountRepository>(
    repo: &R,
    user_id: Uuid,
    id: Uuid,
) -> anyhow::Result<bool> {
    repo.delete(user_id, id).await
}
