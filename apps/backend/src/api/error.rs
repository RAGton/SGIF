use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

pub struct AppError(anyhow::Error);

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        tracing::error!("internal error: {:?}", self.0);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "internal server error" })),
        )
            .into_response()
    }
}

impl<E: Into<anyhow::Error>> From<E> for AppError {
    fn from(e: E) -> Self {
        AppError(e.into())
    }
}

pub type ApiResult<T> = Result<T, AppError>;
