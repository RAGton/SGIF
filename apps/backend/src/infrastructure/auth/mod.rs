use anyhow::Context;
use jsonwebtoken::{decode, jwk::JwkSet, DecodingKey, Validation};
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
    pub async fn from_supabase_url(supabase_url: &str) -> anyhow::Result<Self> {
        let jwks_url = format!("{}/auth/v1/.well-known/jwks.json", supabase_url);
        let jwk_set: JwkSet = reqwest::get(&jwks_url)
            .await
            .context("failed to fetch JWKS")?
            .json()
            .await
            .context("failed to parse JWKS")?;

        let jwk = jwk_set
            .keys
            .into_iter()
            .next()
            .context("JWKS has no keys")?;

        let alg = jwk
            .common
            .key_algorithm
            .map(|ka| {
                serde_json::from_value::<jsonwebtoken::Algorithm>(
                    serde_json::Value::String(ka.to_string()),
                )
                .unwrap_or(jsonwebtoken::Algorithm::ES256)
            })
            .unwrap_or(jsonwebtoken::Algorithm::ES256);

        let decoding_key =
            DecodingKey::from_jwk(&jwk).context("failed to build DecodingKey from JWK")?;

        let mut validation = Validation::new(alg);
        validation.set_audience(&["authenticated"]);

        Ok(Self {
            decoding_key,
            validation,
        })
    }

    pub fn validate(&self, token: &str) -> anyhow::Result<Uuid> {
        let data = decode::<SupabaseClaims>(token, &self.decoding_key, &self.validation)
            .map_err(|e| anyhow::anyhow!("invalid JWT: {}", e))?;

        let user_id = Uuid::parse_str(&data.claims.sub)
            .map_err(|e| anyhow::anyhow!("invalid sub claim: {}", e))?;

        Ok(user_id)
    }
}
