use axum::{middleware, routing::{delete, get}, Router};

use crate::api::{handlers::categories, middleware::auth::require_auth, state::AppState};

pub fn router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/categories", get(categories::list).post(categories::create))
        .route("/categories/:id", delete(categories::delete))
        .route_layer(middleware::from_fn_with_state(state, require_auth))
}
