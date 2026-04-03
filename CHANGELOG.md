# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste ficheiro.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Ver também [docs/git/keep-changelog.md](docs/git/keep-changelog.md) para convenções internas.

## [Unreleased]

### Added

- Fundação do backend: Node.js 20+, TypeScript strict, Hono (`GET /health`), validação de ambiente com Zod, cliente Drizzle + `pg`, Vitest (integração + unitário), ESLint e Prettier, `docker-compose` (PostgreSQL 16 e Redis 7), `Dockerfile` multi-stage, workflow GitHub Actions (lint, typecheck, Prettier, testes), estrutura de pastas conforme `docs/backend/architecture.md`.

- Documentação em `docs/`: arquitetura da API, fluxos, backlogs, matrizes de testes, convenções de Git, guias para agentes e documentação de frontend.
- `README.md` na raiz do repositório e índice em `docs/README.md`.
- Este ficheiro `CHANGELOG.md`.

### Changed

- Referências ao nome do projeto nas documentações: `agenda-engine` → `temhorario-engine` (incluindo exemplo de base de dados `temhorario_engine`).

<!-- Após o primeiro tag de versão, adicionar rodapé com links [Unreleased] e [X.Y.Z] para comparação e releases no GitHub, conforme docs/git/keep-changelog.md. -->
