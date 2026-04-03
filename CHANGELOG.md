# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste ficheiro.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Ver também [docs/git/keep-changelog.md](docs/git/keep-changelog.md) para convenções internas.

## [Unreleased]

### Added

- `npm run db:ensure` (`scripts/ensure-postgres-docker.ts`) + `docker/postgres/init/01-ensure-role.sql` montado em `docker-entrypoint-initdb.d`: garante role `postgres` (password do compose) e base `temhorario_engine`; `db:migrate:docker` / `db:seed:docker` executam `db:ensure` antes.
- `npm run db:migrate:docker` e `.env.docker` para migrar contra o Postgres do `docker-compose` quando `DATABASE_URL` / `.env.local` apontam para outro servidor; mensagem de ajuda em `28P01` em `scripts/migrate.ts`.
- **Testes / migrate:** `tests/setup.ts` ignora `DATABASE_URL` herdada do shell; fora de CI usa por omissão `127.0.0.1:5433/temhorario_test` (CI: `5432`). `MIGRATE_DATABASE_URL` em `load-env-files.ts` permite migrar sem ser sobrescrito por `.env.local`.

### Changed

- Documentação Git: regra explícita de que **toda branch mergeada para `main` deve ser eliminada** (remota e local); checklist de PR e guias para agentes/humanos actualizados.

- **Épico 3 — middleware stack:** `request-id`; `createErrorHandler` (JSON de erro, `ZodError`, logging); resolução de tenant por slug (`/v1/:slug/*`); JWT HS256 para `/v1/admin/*` (`jose`); API key com hash SHA-256 para `/v1/platform/*`; rate limit por IP (público) e por tenant (admin) com janela de 60s, Redis opcional ou memória; rotas exemplo `GET /v1/:slug|admin|platform/ping`. Variáveis `RATE_LIMIT_PUBLIC_PER_MINUTE`, `RATE_LIMIT_ADMIN_PER_MINUTE`. CI com PostgreSQL 16 e `npm run db:migrate` antes dos testes.

- **Épico 2 — schema PostgreSQL:** tabelas `tenants`, `users`, `services`, `resources`, `resource_services`, `availability_rules`, `clients`, `bookings`, `api_keys`; enums; índices conforme `docs/backend/architecture.md`; relações Drizzle; RLS (`0001_row_level_security.sql`). Migrations em `src/db/migrations/`, `npm run db:migrate`, `npm run db:generate` (via `tsx`). Seed `npm run db:seed` (tenant `demo`). Factories em `tests/factories/` e `bcrypt` como devDependency para hash no seed.

### Fixed

- Vitest `tests/setup.ts`: URL por omissão fora de CI usa porta **5433** (docker-compose local), não **5432**. `db:ensure` cria também `temhorario_test`. `db:migrate:docker` / `db:migrate:test:docker` usam **`cross-env`** para fixar `MIGRATE_DATABASE_URL` (o `node --env-file` **não** substitui variáveis já definidas no shell — causava 28P01). Ficheiro `.env.test.docker` continua como referência.

- `docker-compose.yml`: mapeamento de portas do Postgres corrigido para `5433:5432` (antes `5433:5433`, o que quebrava ligações ao contentor). `.env.docker` voltou a ser mínimo com `MIGRATE_DATABASE_URL` + `sslmode=disable`; mensagem em `migrate` para "Connection terminated unexpectedly".

- Carregamento de variáveis: `.env.local` é lido (após `.env`) para `npm run dev`, alinhado a cópias a partir de `.env.example`.
- ESLint: ignorar `scripts/**` para evitar regras com type information em `setup-hooks.mjs`.

### Added

- Hook Git **pre-push** (`.githooks/pre-push`) que bloqueia push de branches quando há alterações a ficheiros sem `CHANGELOG.md` no intervalo; script `prepare` + `scripts/setup-hooks.mjs` define `core.hooksPath`. Documentado em `docs/git/git-strategy.md`, `docs/git/keep-changelog.md`, `docs/agents/rules-for-agents.md` e `docs/agents/rules-for-humans.md`.

- Fundação do backend: Node.js 20+, TypeScript strict, Hono (`GET /health`), validação de ambiente com Zod, cliente Drizzle + `pg`, Vitest (integração + unitário), ESLint e Prettier, `docker-compose` (PostgreSQL 16 e Redis 7), `Dockerfile` multi-stage, workflow GitHub Actions (lint, typecheck, Prettier, testes), estrutura de pastas conforme `docs/backend/architecture.md`.

- Documentação em `docs/`: arquitetura da API, fluxos, backlogs, matrizes de testes, convenções de Git, guias para agentes e documentação de frontend.
- `README.md` na raiz do repositório e índice em `docs/README.md`.
- Este ficheiro `CHANGELOG.md`.

### Changed

- Referências ao nome do projeto nas documentações: `agenda-engine` → `temhorario-engine` (incluindo exemplo de base de dados `temhorario_engine`).

- Documentação do frontend (`docs/frontend/architecture.md`, `docs/frontend/flows.md`): nomenclatura TemHorario Engine, relação com o repositório actual (só API), URLs e variáveis de ambiente de exemplo; endpoints admin e públicos alinhados ao prefixo `/v1/` e a `docs/backend/flows.md`. Índice em `docs/README.md` e tabela no `README.md` actualizados.

<!-- Após o primeiro tag de versão, adicionar rodapé com links [Unreleased] e [X.Y.Z] para comparação e releases no GitHub, conforme docs/git/keep-changelog.md. -->
