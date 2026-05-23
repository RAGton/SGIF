use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
struct SupabaseClaims {
    sub: String,
    #[allow(dead_code)]
    role: String,
    #[allow(dead_code)]
    exp: usize,
}

pub struct JwtValidator {
    decoding_key: DecodingKey,
    validation: Validation,
}

impl JwtValidator {
    pub fn new(secret: &str) -> Self {
        let mut validation = Validation::new(Algorithm::HS256);
        validation.set_audience(&["authenticated"]);
        Self {
            decoding_key: DecodingKey::from_secret(secret.as_bytes()),
            validation,
        }
    }

    pub fn validate(&self, token: &str) -> anyhow::Result<Uuid> {
        let data = decode::<SupabaseClaims>(token, &self.decoding_key, &self.validation)
            .map_err(|e| anyhow::anyhow!("invalid JWT: {}", e))?;

        let user_id = Uuid::parse_str(&data.claims.sub)
            .map_err(|e| anyhow::anyhow!("invalid sub claim: {}", e))?;

        Ok(user_id)
    }
}
