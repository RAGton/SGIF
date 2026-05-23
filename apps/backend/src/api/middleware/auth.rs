use axum::http::StatusCode;
use axum::{extract::Request, middleware::Next, response::Response};

/// Validates the JWT from the Authorization header.
/// Works alongside Supabase's own JWT; verifies signature locally.
///
/// TODO: Replace the stub token check with real jsonwebtoken validation.
pub async fn require_auth(req: Request, next: Next) -> Result<Response, StatusCode> {
    let token = req
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "));

    match token {
        Some(_t) => {
            // TODO: decode & validate JWT claims, inject UserId into extensions
            Ok(next.run(req).await)
        }
        None => Err(StatusCode::UNAUTHORIZED),
    }
}
