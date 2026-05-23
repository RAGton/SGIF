use axum::{middleware, routing::get, Router};

use crate::api::{handlers::accounts, middleware::auth::require_auth, state::AppState};

pub fn router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/accounts", get(accounts::list).post(accounts::create))
        .route(
            "/accounts/:id",
            get(accounts::get)
                .put(accounts::update)
                .delete(accounts::delete),
        )
        .route_layer(middleware::from_fn_with_state(state, require_auth))
}
