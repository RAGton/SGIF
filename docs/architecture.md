# Arquitetura SGIF — Guia Completo

## Visão Geral

O SGIF é um monorepo full-stack organizado em três camadas de execução:

| App | Tecnologia | Porta |
|-----|-----------|-------|
| Backend API | Rust · Axum · Tokio | 3000 |
| Frontend Web | React · Vite · TypeScript | 5173 |
| Mobile | Flutter · Riverpod | — |
| Banco/Auth | Supabase (Postgres + GoTrue) | 54321 (local) |

---

## Árvore de Diretórios

```
sgif/                              ← Raiz do Monorepo
├── Cargo.toml                     ← Workspace Rust (members = ["apps/backend"])
├── .gitignore
├── README.md
│
├── apps/
│   ├── backend/                   ← API Rust
│   │   ├── Cargo.toml
│   │   ├── .env.example
│   │   ├── migrations/            ← SQLx migrations (run at startup)
│   │   │   └── 001_initial_schema.sql
│   │   ├── tests/                 ← Integration tests
│   │   └── src/
│   │       ├── main.rs            ← Entry point: monta router + inicia servidor
│   │       ├── domain/            ← [CAMADA 1] Regras de negócio puras
│   │       │   ├── entities/      ← Structs de domínio (User, Profile, etc.)
│   │       │   ├── repositories/  ← Traits (contratos) de repositório
│   │       │   └── services/      ← Serviços de domínio (sem deps externas)
│   │       ├── application/       ← [CAMADA 2] Casos de uso
│   │       │   ├── use_cases/     ← Orquestram domain + infra via traits
│   │       │   └── dtos/          ← Data Transfer Objects (request/response)
│   │       ├── infrastructure/    ← [CAMADA 3] Implementações concretas
│   │       │   ├── db/            ← SQLx pool factory, repositórios concretos
│   │       │   ├── auth/          ← Validação JWT Supabase
│   │       │   └── http/          ← Clientes HTTP externos, middlewares Tower
│   │       └── api/               ← [CAMADA 4] Fronteira HTTP (Axum)
│   │           ├── handlers/      ← Funções async que processam requests
│   │           ├── middleware/    ← auth, rate-limit, logging
│   │           └── routes/        ← Router declarations por domínio
│   │
│   ├── web/                       ← Frontend React
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── .env.example
│   │   └── src/
│   │       ├── assets/            ← Imagens, fontes estáticas
│   │       ├── components/
│   │       │   ├── ui/            ← Primitivos: Button, Input, Modal
│   │       │   ├── shared/        ← Composições reutilizáveis
│   │       │   └── features/      ← Componentes acoplados a um domínio
│   │       ├── hooks/             ← Custom hooks (useAuth, useProfile)
│   │       ├── pages/             ← Componentes de página (por rota)
│   │       ├── services/
│   │       │   ├── supabase.ts    ← Client singleton Supabase
│   │       │   └── api.ts         ← Axios client para o backend Rust
│   │       ├── store/             ← Zustand stores (estado global)
│   │       ├── types/             ← Tipos TypeScript / tipos gerados do Supabase
│   │       └── utils/             ← Funções utilitárias puras
│   │
│   └── mobile/                    ← App Flutter
│       ├── pubspec.yaml
│       ├── assets/
│       │   ├── images/
│       │   └── fonts/
│       ├── test/
│       └── lib/
│           ├── main.dart          ← Entry point: Supabase.initialize + runApp
│           ├── core/
│           │   ├── constants/     ← Strings, enums, configurações globais
│           │   ├── errors/        ← Tipos de falha customizados
│           │   ├── network/       ← Dio client, interceptors, connectivity
│           │   └── router/        ← GoRouter + guards de autenticação
│           ├── data/
│           │   ├── models/        ← Freezed + json_serializable (DTOs)
│           │   ├── repositories/  ← Implementações concretas
│           │   └── sources/       ← Remote (Supabase/Rust API) + Local (cache)
│           ├── domain/
│           │   ├── entities/      ← Objetos de domínio imutáveis
│           │   ├── repositories/  ← Abstract classes (contratos)
│           │   └── use_cases/     ← Lógica de negócio orquestrada
│           └── presentation/
│               ├── pages/         ← Widgets de tela completa
│               ├── widgets/       ← Widgets reutilizáveis por feature
│               ├── controllers/   ← AsyncNotifiers / Notifiers (Riverpod)
│               └── providers/     ← Providers de DI e estado global
│
├── supabase/                      ← Configuração Supabase local + produção
│   ├── config.toml                ← `supabase start` usa este arquivo
│   ├── migrations/                ← SQL versionado — aplicado via `supabase db push`
│   │   └── 001_initial_schema.sql
│   ├── functions/                 ← Edge Functions (Deno/TypeScript)
│   └── seeds/                     ← Dados de seed para desenvolvimento local
│
├── packages/
│   ├── shared-types/              ← Tipos compartilhados (opcional, futuro)
│   └── ui-tokens/                 ← Design tokens compartilhados Web/Mobile
│
├── tools/
│   └── scripts/
│       └── gerar_skills.py        ← Gerador de skills + ZIP Antigravity
│
└── .github/
    └── workflows/
        └── ci.yml                 ← CI: Rust check/test + React build + Flutter analyze
```

---

## Responsabilidade das Camadas (Backend)

```
┌────────────────────────────────────────────────────────┐
│                     API (Axum)                          │
│  handlers · middleware · routes                         │
│  ↓ chama                                               │
├────────────────────────────────────────────────────────┤
│                  Application                            │
│  use_cases · dtos                                       │
│  ↓ depende de traits do domain                         │
├────────────────────────────────────────────────────────┤
│                   Domain                                │
│  entities · repository traits · services               │
│  ← ZERO dependências externas                          │
├────────────────────────────────────────────────────────┤
│                Infrastructure                           │
│  db (SQLx) · auth (JWT) · http clients                 │
│  ← Implementa os traits do domain                      │
└────────────────────────────────────────────────────────┘
```

---

## Fluxo de Autenticação

```
Flutter/React → Supabase Auth (GoTrue)
                    ↓ JWT emitido
Flutter/React → Rust API (Authorization: Bearer <JWT>)
                    ↓ middleware/auth.rs valida JWT localmente
                      usando SUPABASE_JWT_SECRET
                    ↓ UserId injetado via axum::Extension
                Handler → Use Case → Repository (SQLx + RLS)
```

---

## Arquivos de Configuração Essenciais

| Arquivo | Onde | Propósito |
|---------|------|-----------|
| `Cargo.toml` (raiz) | `/` | Workspace Rust, deps compartilhadas |
| `Cargo.toml` (app) | `apps/backend/` | Manifesto do binário backend |
| `package.json` | `apps/web/` | Deps Node, scripts npm |
| `vite.config.ts` | `apps/web/` | Build, alias, proxy API |
| `pubspec.yaml` | `apps/mobile/` | Deps Flutter, assets |
| `config.toml` | `supabase/` | Config do Supabase CLI local |
| `ci.yml` | `.github/workflows/` | Pipeline CI completo |
| `.env.example` | `apps/backend/`, `apps/web/` | Variáveis de ambiente (não commitadas) |

---

## Comandos de Início Rápido

```bash
# 1. Supabase local
cd supabase && npx supabase start

# 2. Backend Rust
cd apps/backend
cp .env.example .env  # preencha DATABASE_URL e JWT_SECRET
cargo run

# 3. Frontend Web
cd apps/web
cp .env.example .env  # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm install && npm run dev

# 4. Mobile
cd apps/mobile
flutter pub get && flutter run
```

---

## Decisões de Design (ADRs)

- **ADR-001**: Monorepo com Cargo workspace evita duplicação de deps Rust.
- **ADR-002**: SQLx com migrations em arquivo (vs ORM) garante controle total do schema.
- **ADR-003**: Supabase RLS como segunda linha de defesa — backend Rust valida antes.
- **ADR-004**: Riverpod gerado por `@riverpod` (code-gen) em vez de providers manuais.
- **ADR-005**: `@tanstack/react-query` para server state evita Redux desnecessário.
