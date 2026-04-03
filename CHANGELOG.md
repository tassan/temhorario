# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste ficheiro.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Ver também [docs/git/keep-changelog.md](docs/git/keep-changelog.md) para convenções internas.

## [Unreleased]

### Fixed

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
