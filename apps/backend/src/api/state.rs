use sqlx::PgPool;
use std::sync::Arc;

use crate::infrastructure::auth::JwtValidator;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub jwt_validator: Arc<JwtValidator>,
}
