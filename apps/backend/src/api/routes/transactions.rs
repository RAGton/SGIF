use axum::{middleware, routing::get, Router};

use crate::api::{handlers::transactions, middleware::auth::require_auth, state::AppState};

pub fn router(state: AppState) -> Router<AppState> {
    Router::new()
        .route(
            "/transactions",
            get(transactions::list).post(transactions::create),
        )
        .route(
            "/transactions/:id",
            get(transactions::get).delete(transactions::delete),
        )
        .route_layer(middleware::from_fn_with_state(state, require_auth))
}
