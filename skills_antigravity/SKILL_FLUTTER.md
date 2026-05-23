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
