use axum::{
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::Response,
};
use uuid::Uuid;

use crate::api::state::AppState;

#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub id: Uuid,
}

pub async fn require_auth(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let token = req
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let user_id = state.jwt_validator.validate(token).map_err(|e| {
        tracing::warn!("JWT validation failed: {}", e);
        StatusCode::UNAUTHORIZED
    })?;

    req.extensions_mut().insert(AuthenticatedUser { id: user_id });
    Ok(next.run(req).await)
}
