use axum::{http::Method, Router};
use tower_http::{compression::CompressionLayer, cors::CorsLayer, trace::TraceLayer};

pub fn apply_middleware<S: Clone + Send + Sync + 'static>(router: Router<S>) -> Router<S> {
    let allowed_origin = std::env::var("ALLOWED_ORIGIN")
        .unwrap_or_else(|_| "http://localhost:5173".to_string());

    let origin = allowed_origin
        .parse::<axum::http::HeaderValue>()
        .expect("ALLOWED_ORIGIN must be a valid HTTP header value");

    let cors = CorsLayer::new()
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers(tower_http::cors::Any)
        .allow_origin(origin);

    router
        .layer(CompressionLayer::new())
        .layer(cors)
        .layer(TraceLayer::new_for_http())
}
