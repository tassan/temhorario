# Backend Backlog — temhorario-engine API

> **⚠️ INSTRUÇÃO PARA AI AGENTS (Cursor / Claude Code):**
> Este arquivo é a fonte de verdade do progresso do backend. Ao completar qualquer tarefa:
> 1. Mova o item de "A Fazer" para "Concluído" com a data
> 2. Adicione notas relevantes sobre decisões tomadas
> 3. Se surgirem novos itens durante o trabalho, adicione em "A Fazer"
> 4. Se encontrar bugs ou débitos técnicos, adicione em "Débito Técnico"
>
> **Formato de atualização:**
> - [x] ~~Tarefa concluída~~ — `2025-XX-XX` — _Notas se houver_
> - [ ] Tarefa pendente

---

## Status Geral

| Métrica | Valor |
|---|---|
| Sprint atual | Schema / API |
| Última atualização | `2026-04-03` |
| Itens concluídos | 9 (Épico 1) + 13 (Épico 2) + 5 (Épico 3) + 6 (Épico 4) |
| Itens em andamento | 0 |
| Itens a fazer | Total abaixo |

---

## Épico 1: Fundação do Projeto

### A Fazer

_(nenhum — Épico 1 concluído)_

### Concluído

- [x] ~~Inicializar projeto Node.js com TypeScript strict mode~~ — `2026-04-03`
- [x] ~~Configurar Hono como framework HTTP~~ — `2026-04-03` — _Bootstrap em `src/app.ts` + `src/index.ts`; health em `GET /health`_
- [x] ~~Configurar Drizzle ORM com PostgreSQL driver~~ — `2026-04-03` — _`drizzle.config.ts`, `getDb`/`getPool` em `src/config/database.ts`; schema em `src/db/schema/` (Épico 2)_
- [x] ~~Criar `docker-compose.yml` com PostgreSQL 16 + Redis 7~~ — `2026-04-03`
- [x] ~~Configurar variáveis de ambiente com Zod validation (`src/config/env.ts`)~~ — `2026-04-03`
- [x] ~~Configurar Vitest + setup de test database~~ — `2026-04-03` — _`tests/setup.ts` com defaults para testes; migrations quando existirem_
- [x] ~~Configurar ESLint + Prettier~~ — `2026-04-03`
- [x] ~~Criar `Dockerfile` para produção~~ — `2026-04-03`
- [x] ~~Configurar CI básico (lint + test)~~ — `2026-04-03` — _Inclui `typecheck` e `format:check`_

---

## Épico 2: Schema do Banco e Migrations

### A Fazer

_(nenhum — Épico 2 concluído)_

### Concluído

- [x] ~~Criar schema Drizzle: tabela `tenants`~~ — `2026-04-03`
- [x] ~~Criar schema Drizzle: tabela `users` (admin do tenant)~~ — `2026-04-03`
- [x] ~~Criar schema Drizzle: tabela `services`~~ — `2026-04-03`
- [x] ~~Criar schema Drizzle: tabela `resources` + `resource_services` (M2M)~~ — `2026-04-03`
- [x] ~~Criar schema Drizzle: tabela `availability_rules`~~ — `2026-04-03`
- [x] ~~Criar schema Drizzle: tabela `clients`~~ — `2026-04-03`
- [x] ~~Criar schema Drizzle: tabela `bookings`~~ — `2026-04-03`
- [x] ~~Criar schema Drizzle: tabela `api_keys`~~ — `2026-04-03`
- [x] ~~Gerar migration inicial com `drizzle-kit generate`~~ — `2026-04-03` — _`npm run db:generate` via `tsx` (imports `.ts`); ficheiros em `src/db/migrations/`_
- [x] ~~Configurar Row Level Security (RLS) policies~~ — `2026-04-03` — _Migration `0001_row_level_security.sql`; `set_config('app.current_tenant_id', ...)` documentado no SQL_
- [x] ~~Criar índices de performance conforme `architecture.md`~~ — `2026-04-03`
- [x] ~~Criar seed data para ambiente de desenvolvimento~~ — `2026-04-03` — _`npm run db:seed`; tenant `demo`, owner `owner@demo.local` / senha `password`_
- [x] ~~Criar test factories (`tests/factories/`)~~ — `2026-04-03` — _tenant, client, booking + teste unitário_

---

## Épico 3: Middleware Stack

### A Fazer

_(nenhum — Épico 3 concluído)_

### Concluído

- [x] ~~Implementar `error-handler.ts` — formato de erro padrão, logging~~ — `2026-04-03` — _`createErrorHandler(env)`; `AppError` / `ZodError` / fallback 500; logger JSON por `LOG_LEVEL`; mensagem de erro interna só fora de `production`_
- [x] ~~Implementar `tenant.ts` — resolve tenant por slug (público) ou JWT (admin)~~ — `2026-04-03` — _`createTenantFromSlugMiddleware` para `/v1/:slug/*`; admin usa JWT (`tenantId` nos claims), não slug_
- [x] ~~Implementar `auth.ts` — validação JWT, extração de claims~~ — `2026-04-03` — _HS256 via `jose`; claims `tenantId`, `sub`, `role`; rotas em `/v1/admin/*`_
- [x] ~~Implementar `api-key.ts` — validação de API key via hash~~ — `2026-04-03` — _Bearer `ae_live_...`; SHA-256; lookup em `api_keys`; `/v1/platform/*`_
- [x] ~~Implementar `rate-limit.ts` — rate limiting por IP (público) e por tenant (admin)~~ — `2026-04-03` — _janela 60s; Redis opcional (`REDIS_URL`); fallback em memória; headers `X-RateLimit-*` e `Retry-After`_

---

## Épico 4: Módulo de Autenticação

### A Fazer

_(nenhum — Épico 4 concluído)_

### Concluído

- [x] ~~Implementar `POST /v1/auth/login` — email + senha → JWT~~ — `2026-04-03` — _`src/modules/auth/`; resposta `{ accessToken, refreshToken, expiresIn, tokenType }`_
- [x] ~~Implementar `POST /v1/auth/refresh` — refresh token rotation~~ — `2026-04-03` — _JWT refresh com `jti`; tabela `refresh_tokens`; rotação em transacção (revoga o `jti` usado)_
- [x] ~~Implementar hash de senha com bcrypt (cost 12)~~ — `2026-04-03` — _`src/lib/password.ts` (`hashPassword` / `verifyPassword`)_
- [x] ~~Implementar geração e validação de JWT (access + refresh)~~ — `2026-04-03` — _`src/lib/jwt.ts`: access com `typ: 'access'`; refresh com `typ: 'refresh'` + `jti` (impede troca de access por refresh)_
- [x] ~~Testes de integração: login, refresh, token expirado, credenciais inválidas~~ — `2026-04-03` — _`tests/integration/auth.test.ts`, `middleware-auth.test.ts`; unitário refresh expirado em `tests/unit/jwt.test.ts`_

---

## Épico 5: Módulo de Tenants (Platform)

### A Fazer

- [ ] Implementar `POST /v1/platform/tenants` — criar tenant com owner
- [ ] Implementar `GET /v1/platform/tenants/{id}` — detalhes do tenant
- [ ] Implementar `PUT /v1/platform/tenants/{id}` — atualizar config/branding
- [ ] Implementar `POST /v1/platform/tenants/{id}/api-keys` — gerar API key
- [ ] Validação de slug (lowercase, alphanum + hyphens, único)
- [ ] Criação automática de availability rules padrão no onboarding
- [ ] Testes de integração: criação, slug duplicado, API key

### Concluído

_(vazio)_

---

## Épico 6: Módulo de Serviços

### A Fazer

- [ ] Implementar `GET /v1/admin/services` — listar serviços do tenant
- [ ] Implementar `POST /v1/admin/services` — criar serviço
- [ ] Implementar `PUT /v1/admin/services/{id}` — atualizar serviço
- [ ] Implementar `DELETE /v1/admin/services/{id}` — soft delete (active=false)
- [ ] Implementar `GET /v1/{slug}/services` — endpoint público (só ativos)
- [ ] Suporte a custom_fields (definição JSONB)
- [ ] Testes de integração: CRUD completo, isolamento entre tenants

### Concluído

_(vazio)_

---

## Épico 7: Módulo de Recursos

### A Fazer

- [ ] Implementar `GET /v1/admin/resources` — listar recursos do tenant
- [ ] Implementar `POST /v1/admin/resources` — criar recurso
- [ ] Implementar `PUT /v1/admin/resources/{id}` — atualizar recurso
- [ ] Implementar associação resource ↔ services (M2M)
- [ ] Testes de integração: CRUD, associação com serviços

### Concluído

_(vazio)_

---

## Épico 8: Módulo de Disponibilidade

### A Fazer

- [ ] Implementar `PUT /v1/admin/availability` — configurar grade semanal
- [ ] Implementar `POST /v1/admin/availability/exceptions` — feriados/folgas
- [ ] Implementar `GET /v1/admin/availability` — visualizar regras atuais
- [ ] Implementar `GET /v1/{slug}/availability` — endpoint público de slots
- [ ] Implementar algoritmo de geração de slots (`lib/slots.ts`)
  - [ ] Geração de janelas a partir de regras semanais
  - [ ] Aplicação de exceções (bloqueios e horários especiais)
  - [ ] Subtração de bookings existentes
  - [ ] Buffer entre atendimentos
  - [ ] Discretização em intervalos configuráveis
  - [ ] Filtros de antecedência mínima e máxima
- [ ] Cache de slots em Redis (invalidar ao criar/cancelar booking)
- [ ] Testes unitários: algoritmo de slots com cenários variados
- [ ] Testes de integração: disponibilidade pública, exceções

### Concluído

_(vazio)_

---

## Épico 9: Módulo de Clientes

### A Fazer

- [ ] Implementar `GET /v1/admin/clients` — listar com busca e paginação
- [ ] Implementar `GET /v1/admin/clients/{id}` — detalhes do cliente
- [ ] Implementar `GET /v1/admin/clients/{id}/history` — histórico de bookings
- [ ] Implementar upsert de cliente no fluxo de booking (por telefone)
- [ ] Testes de integração: listagem, busca, histórico

### Concluído

_(vazio)_

---

## Épico 10: Módulo de Bookings (Core)

### A Fazer

- [ ] Implementar `POST /v1/{slug}/bookings` — criar booking público
  - [ ] Validar slot disponível com SELECT FOR UPDATE (race condition)
  - [ ] Upsert de cliente
  - [ ] Criação do booking com status 'scheduled'
  - [ ] Preenchimento de metadata (custom fields)
- [ ] Implementar `GET /v1/{slug}/bookings/{id}` — status público
- [ ] Implementar `GET /v1/admin/bookings` — listagem com filtros (data, status, resource)
- [ ] Implementar `GET /v1/admin/bookings/{id}` — detalhes admin
- [ ] Implementar `PATCH /v1/admin/bookings/{id}` — atualizar status
  - [ ] Validar transição via status machine
  - [ ] Registrar timestamp da transição
- [ ] Implementar `DELETE /v1/admin/bookings/{id}` — cancelar
- [ ] Implementar máquina de status (`lib/status-machine.ts`)
- [ ] Cursor-based pagination na listagem
- [ ] Testes unitários: status machine (todas as transições)
- [ ] Testes de integração: criação, race condition, ciclo completo

### Concluído

_(vazio)_

---

## Épico 11: Webhooks

### A Fazer

- [ ] Implementar dispatcher de webhooks
- [ ] Implementar registro de webhook URLs por tenant
- [ ] Implementar assinatura HMAC-SHA256
- [ ] Implementar retry com exponential backoff (via Redis queue ou similar)
- [ ] Logging de entregas (sucesso/falha)
- [ ] Testes: disparo, assinatura, retry

### Concluído

_(vazio)_

---

## Épico 12: Relatórios

### A Fazer

- [ ] Implementar `GET /v1/admin/reports/summary` — métricas agregadas
  - [ ] Total de bookings por status
  - [ ] Receita total (bookings completed)
  - [ ] Taxa de cancelamento
  - [ ] Taxa de no-show
  - [ ] Top serviços por volume
  - [ ] Top clientes por frequência
- [ ] Filtros por período (day, week, month, custom range)
- [ ] Testes de integração

### Concluído

_(vazio)_

---

## Épico 13: Documentação da API

### A Fazer

- [ ] Configurar OpenAPI/Swagger auto-gerado a partir dos Zod schemas
- [ ] Documentar todos os endpoints com exemplos de request/response
- [ ] Página de docs interativa (Swagger UI ou Scalar)
- [ ] Guia de autenticação (JWT + API keys)
- [ ] Guia de webhooks (setup, assinatura, retry)

### Concluído

_(vazio)_

---

## Débito Técnico

_(Adicionar itens aqui conforme surgirem durante o desenvolvimento)_

| Item | Prioridade | Contexto |
|---|---|---|
| `SET app.current_tenant_id` por request com connection pool | Média | RLS em `0001_row_level_security.sql` exige `set_config` na sessão; middleware define `tenantId` no contexto Hono — integração fina com pool/`SET LOCAL` quando serviços forem executar queries com RLS ativo por conexão. |

---

## Decisões de Arquitetura (ADR Log)

_(Registrar decisões importantes tomadas durante o desenvolvimento)_

| # | Data | Decisão | Contexto |
|---|---|---|---|
| 1 | — | Hono como framework | Leve, TypeScript-first, edge-ready |
| 2 | — | Drizzle como ORM | SQL-first, type-safe, sem runtime engine |
| 3 | — | Shared schema + RLS | Multi-tenancy com isolamento duplo |
| 4 | — | Cursor pagination | Performance consistente em tabelas grandes |
