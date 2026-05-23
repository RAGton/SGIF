"""
SGIF Skills Generator
Gera arquivos de diretrizes por tecnologia e empacota num ZIP.
"""
import os
import zipfile
import shutil
import sys

def criar_skills_e_zip():
    pasta_temp = "stack_skills_temp"
    nome_zip   = "skills_antigravity.zip"

    if not os.path.exists(pasta_temp):
        os.makedirs(pasta_temp)

    arquivos = {
        "SKILL_RUST_AXUM.md": """\
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
""",
        "SKILL_SUPABASE.md": """\
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
""",
        "SKILL_REACT.md": """\
# Diretrizes React (Vite + TypeScript)

## Arquitetura de Componentes
- Componentes em `src/components/` divididos em `ui/` (genéricos), `shared/` (reutilizáveis) e `features/` (específicos de domínio).
- Prefira componentes funcionais + hooks — sem class components.
- Mantenha componentes de UI "burros" (apenas apresentação); lógica vai nos hooks.

## Gerenciamento de Estado
- **Server state**: `@tanstack/react-query` para cache, refetch, loading/error.
- **Client state**: `zustand` para estado global leve; `useState`/`useReducer` para estado local.

## Chamadas de API
- Centralize todo acesso ao Supabase em `src/services/supabase.ts`.
- Chame o backend Rust via `src/services/api.ts` (axios com interceptors de auth).
- Encapsule em hooks customizados (`useAuth`, `useProfile`, etc.) em `src/hooks/`.

## Tipagem
- Use TypeScript estrito (`"strict": true` no tsconfig).
- Gere tipos do Supabase com `supabase gen types typescript`.

## Performance
- Use `React.lazy` + `Suspense` para code-splitting por rota.
- Memorize cálculos pesados com `useMemo`; callbacks estáveis com `useCallback`.
""",
        "SKILL_FLUTTER.md": """\
# Diretrizes Flutter (Riverpod + GoRouter)

## Estrutura de Features
```
lib/
  core/          # constantes, erros, network, router
  data/          # models (Freezed), repositórios, data sources
  domain/        # entidades, contratos de repositório, use-cases
  presentation/  # pages, widgets, controllers (Notifiers)
```

## Gerenciamento de Estado — Riverpod
- Prefira `@riverpod` (geração de código) sobre providers manuais.
- `AsyncNotifier` para estado assíncrono; `Notifier` para estado síncrono.
- Mantenha providers pequenos e focados — composição > monolito.

## Supabase no Flutter
- Inicialize com `Supabase.initialize()` em `main()` antes de `runApp()`.
- Use `supabase.auth.onAuthStateChange` stream para reatividade de sessão.
- Armazene tokens sensíveis com `flutter_secure_storage`.

## Navegação
- Use **GoRouter** com rotas declarativas e guards de autenticação via `redirect`.

## Boas Práticas
- Modele dados imutáveis com **Freezed** + `json_serializable`.
- Ative `flutter analyze` e `flutter_lints` no CI.
- Escreva widget tests para cada feature crítica.
""",
        "PROMPT_ESTRUTURA.md": """\
# Prompt de Arquitetura — SGIF Monorepo

Atue como um Arquiteto de Software Sênior.

Preciso que você crie a estrutura de pastas ideal (padrão Monorepo) para um projeto
full-stack avançado com as seguintes tecnologias:

- Backend: Rust utilizando Axum e Tokio
- Banco de Dados/Auth: Supabase
- Frontend Web: React (Vite)
- Mobile: Flutter

Siga os princípios de Clean Architecture e Domain-Driven Design.
Descreva detalhadamente:

1. A árvore de diretórios completa
2. A responsabilidade de cada pasta principal
3. Onde ficam os arquivos de configuração essenciais
   (Cargo.toml, package.json, pubspec.yaml, migrações Supabase)
4. Como as camadas se comunicam entre si
5. Estratégia de CI/CD para o monorepo

Stack: Rust/Axum/Tokio · Supabase · React/Vite · Flutter
Arquitetura: Clean Architecture + DDD
Padrão de Repo: Monorepo com workspaces
""",
    }

    for nome_arquivo, conteudo in arquivos.items():
        caminho = os.path.join(pasta_temp, nome_arquivo)
        with open(caminho, "w", encoding="utf-8") as f:
            f.write(conteudo)

    print(f"✅ Arquivos criados com sucesso na pasta '{pasta_temp}'.")

    with zipfile.ZipFile(nome_zip, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(pasta_temp):
            for file in files:
                caminho_arquivo = os.path.join(root, file)
                zipf.write(caminho_arquivo, arcname=file)

    print(f"📦 Arquivo '{nome_zip}' gerado com sucesso!")

    shutil.rmtree(pasta_temp)
    print("🧹 Limpeza concluída.")

if __name__ == "__main__":
    criar_skills_e_zip()
    print()
    print("🚀 Preparando para a decolagem... Antigravity ativado!")
    print("   Todos os sistemas nominais. Stack SGIF pronta para órbita.")
