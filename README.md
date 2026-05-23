# SGIF — Monorepo Full-Stack

> **S**upabase · **G**reenfield · **I**ntegrated · **F**ull-Stack

Stack: **Rust/Axum/Tokio** · **Supabase** · **React (Vite)** · **Flutter**

## Quick Start

```bash
# Backend
cd apps/backend && cargo run

# Frontend Web
cd apps/web && npm install && npm run dev

# Mobile
cd apps/mobile && flutter pub get && flutter run

# Supabase Local
cd supabase && npx supabase start
```

## Architecture

Este monorepo segue os princípios de **Clean Architecture** e **Domain-Driven Design**,
com separação rígida entre camadas de domínio, aplicação e infraestrutura.

Veja [`docs/architecture.md`](docs/architecture.md) para o guia completo.
