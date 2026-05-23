#![deny(clippy::all)]

use axum::Router;
use dotenvy::dotenv;
use std::{net::SocketAddr, sync::Arc};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod api;
mod application;
mod domain;
mod infrastructure;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "sgif_backend=debug,tower_http=info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let db = infrastructure::db::create_pool().await?;

    let jwt_secret = std::env::var("JWT_SECRET")
        .map_err(|_| anyhow::anyhow!("JWT_SECRET must be set"))?;
    let jwt_validator = Arc::new(infrastructure::auth::JwtValidator::new(&jwt_secret));

    let state = api::state::AppState { db, jwt_validator };

    let app = Router::<api::state::AppState>::new()
        .merge(api::routes::health::router())
        .merge(api::routes::accounts::router(state.clone()))
        .merge(api::routes::categories::router(state.clone()))
        .merge(api::routes::transactions::router(state.clone()))
        .with_state(state);

    let app = infrastructure::http::apply_middleware(app);

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3000);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
