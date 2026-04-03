# TemHorario Engine

API REST **multi-tenant** para agendamento de serviços: geração de slots, reservas, clientes, disponibilidade, webhooks e integrações. O pacote `temhorario-engine` é pensado como serviço HTTP reutilizável por qualquer aplicação (site de booking, app, integrações).

## Estado do repositório

A especificação e o backlog vivem em **`docs/`**. A implementação (Node, Hono, Drizzle, etc.) segue o plano descrito na arquitetura; o progresso está rastreado no backlog do backend.

### Desenvolvimento local

1. Node.js **20+** e npm.
2. `cp .env.example .env` ou `.env.local` e ajustar segredos (mínimo: `DATABASE_URL`, `JWT_SECRET` com ≥32 caracteres). Se existirem os dois, **`.env.local` sobrescreve** `.env`.
3. `docker compose up -d` para PostgreSQL e Redis (opcional até cache/rate limit).
4. `npm install` (configura **git hooks** em `core.hooksPath=.githooks`; pushes de branch exigem `CHANGELOG.md` no conjunto de alterações — ver [docs/git/git-strategy.md](docs/git/git-strategy.md#git-hooks-pre-push)).
5. `npm run db:migrate` para aplicar migrations (schema + RLS). `npm run db:seed` opcional — tenant demo `demo` (owner `owner@demo.local`, senha `password`).
6. `npm run dev` — API em `http://localhost:3000` (variável `PORT`).
7. Qualidade: `npm run lint`, `npm run typecheck`, `npm test`, `npm run format:check`.

## Stack alvo (backend)

| Área | Tecnologia |
|------|------------|
| Runtime | Node.js 20+ |
| HTTP | Hono |
| Base de dados | PostgreSQL 16 (Row Level Security) |
| Cache / rate limit | Redis |
| Auth | JWT (admin) + API keys (integração) |
| Validação | Zod |
| ORM | Drizzle |
| Testes | Vitest (+ Supertest em integração) |

Deploy previsto: **Railway** ou **Render** (ver `docs/backend/architecture.md`).

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [docs/backend/architecture.md](docs/backend/architecture.md) | Arquitetura, multi-tenancy, schema, camadas, variáveis de ambiente |
| [docs/backend/flows.md](docs/backend/flows.md) | Fluxos principais (booking público, admin, diagramas) |
| [docs/backend/backend-backlog.md](docs/backend/backend-backlog.md) | Backlog e estado de implementação do backend |
| [docs/backend/backend-testing.md](docs/backend/backend-testing.md) | Matriz de testes do backend |
| [docs/frontend/architecture.md](docs/frontend/architecture.md) | Arquitetura do app Next.js (booking + admin) |
| [docs/frontend/flows.md](docs/frontend/flows.md) | Fluxos de UI e chamadas à API |
| [docs/frontend/design-principles.md](docs/frontend/design-principles.md) | Princípios do frontend consumidor |
| [docs/frontend/frontend-backlog.md](docs/frontend/frontend-backlog.md) | Backlog do frontend |
| [docs/agents/rules-for-agents.md](docs/agents/rules-for-agents.md) | Convenções para agentes (Cursor / IA) neste repo |
| [docs/git/git-strategy.md](docs/git/git-strategy.md) | Estratégia de branches e releases |

## Licença

Propriedade da **Flavio Tassan It Consulting LTDA**. Ver [LICENSE](LICENSE).
