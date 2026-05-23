# Diretrizes Supabase

## Row Level Security (RLS)
- Habilite RLS em **todas** as tabelas públicas — padrão deny-by-default.
- Crie policies explícitas para SELECT, INSERT, UPDATE, DELETE separadamente.
- Use `auth.uid()` para restringir acesso ao dono do recurso.

## Migrations
- Todas as migrações ficam em `supabase/migrations/` com prefixo numérico (`001_`, `002_`...).
- Fluxo local: `supabase db reset` → `supabase db push` (staging) → produção.
- **Nunca** edite uma migration já aplicada; crie sempre uma nova.

## Edge Functions
- Código fica em `supabase/functions/<nome>/index.ts`.
- Use para lógica que precisa de segredo server-side (webhooks, integrações).

## Integração no Backend Rust
- O Rust se conecta ao Postgres do Supabase via `DATABASE_URL` (pool mode pgBouncer).
- JWT gerado pelo Supabase Auth é validado localmente com `jsonwebtoken` usando `SUPABASE_JWT_SECRET`.
- Nunca exponha a `service_role` key fora do servidor.

## Integração no Frontend/Mobile
- Use a `anon key` apenas para operações cobertas por RLS.
- Inicialize o cliente uma única vez e exporte como singleton.
- Refresh token é gerenciado automaticamente pelo SDK.
