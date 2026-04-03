# Documentação — TemHorario Engine

Índice da pasta `docs/`. O [README na raiz do repositório](../README.md) resume o projeto e aponta para aqui.

---

## Backend

| Ficheiro | Descrição |
|----------|-----------|
| [backend/architecture.md](backend/architecture.md) | Arquitetura da API, stack, multi-tenancy, schema, camadas, webhooks, erros, env |
| [backend/flows.md](backend/flows.md) | Fluxos principais (booking público, admin, plataforma) com diagramas |
| [backend/backend-backlog.md](backend/backend-backlog.md) | Backlog e progresso de implementação |
| [backend/backend-testing.md](backend/backend-testing.md) | Matriz e convenções de testes do backend |

---

## Frontend

Documentação para aplicações que consomem a API (dashboard, página pública de agendamento, etc.).

| Ficheiro | Descrição |
|----------|-----------|
| [frontend/architecture.md](frontend/architecture.md) | Stack Next.js, estrutura de pastas, React Query, auth, theming |
| [frontend/flows.md](frontend/flows.md) | Fluxos UI/UX e encadeamento com endpoints `/v1/...` |
| [frontend/design-principles.md](frontend/design-principles.md) | Princípios de UX e produto |
| [frontend/frontend-backlog.md](frontend/frontend-backlog.md) | Backlog do frontend |
| [frontend/frontend-testing.md](frontend/frontend-testing.md) | Matriz e convenções de testes do frontend |

---

## Git e releases

| Ficheiro | Descrição |
|----------|-----------|
| [git/git-strategy.md](git/git-strategy.md) | Branches, PRs, fluxo de trabalho |
| [git/semver.md](git/semver.md) | Versionamento semântico |
| [git/keep-changelog.md](git/keep-changelog.md) | Formato e manutenção do changelog |

---

## Agentes (IA / Cursor)

| Ficheiro | Descrição |
|----------|-----------|
| [agents/rules-for-agents.md](agents/rules-for-agents.md) | Regras para assistentes neste repositório |
| [agents/rules-for-humans.md](agents/rules-for-humans.md) | Recomendações para quem edita o repo |
| [agents/how-to-prompt.md](agents/how-to-prompt.md) | Como estruturar pedidos a agentes |

---

## Por onde começar

1. **Arquitetura e domínio:** [backend/architecture.md](backend/architecture.md) e [backend/flows.md](backend/flows.md)  
2. **O que falta fazer:** [backend/backend-backlog.md](backend/backend-backlog.md)  
3. **Contribuir com código:** [git/git-strategy.md](git/git-strategy.md) e [agents/rules-for-agents.md](agents/rules-for-agents.md)
