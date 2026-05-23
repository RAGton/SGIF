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
