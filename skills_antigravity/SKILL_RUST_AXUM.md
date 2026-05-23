# Diretrizes Rust / Axum / Tokio

## Concorrência Assíncrona
- Use `async/await` com **Tokio** como runtime padrão.
- Prefira `tokio::spawn` para tarefas CPU-bound isoladas; use `spawn_blocking` para I/O síncrono.
- Evite `unwrap()` em produção — propague erros com `anyhow::Result` ou `thiserror`.

## Axum
- Organize rotas em `api/routes/<domínio>.rs` e registre no router principal.
- Use `axum::extract::State` para injetar dependências (pool, configurações).
- Middlewares ficam em `api/middleware/` e são compostos via `tower::ServiceBuilder`.

## Clean Architecture no Rust
- **domain/**: structs, traits de repositório, regras de negócio — zero deps externas.
- **application/**: use-cases que orquestram domain + infra via traits.
- **infrastructure/**: implementações concretas (SQLx, Supabase SDK, clients HTTP).
- **api/**: handlers Axum que chamam application; converte DTOs ↔ domain models.

## Boas Práticas
- Ative `#![deny(clippy::all)]` no main.rs.
- Use `tracing` para logs estruturados, nunca `println!`.
- Configure `[profile.release]` com `lto = true` e `codegen-units = 1`.
