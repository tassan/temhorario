# Backend Testing — temhorario-engine API

> **⚠️ INSTRUÇÃO PARA AI AGENTS:**
> Ao implementar qualquer funcionalidade, consulte esta lista para identificar quais testes devem ser escritos. Ao adicionar testes, marque o item como concluído com a data.

---

## Setup de Testes

### Stack
- **Runner:** Vitest
- **HTTP:** Supertest (requests de integração contra o Hono app)
- **Banco:** PostgreSQL de teste (database separada, criada/destruída por suite)
- **Factories:** Funções helper que criam entidades válidas com valores padrão

### Convenções
- Testes unitários: `tests/unit/*.test.ts`
- Testes de integração: `tests/integration/*.test.ts`
- Factories: `tests/factories/*.factory.ts`
- Cada test suite de integração usa transação com rollback (ou truncate após cada teste)
- Nomear testes em português: `it('deve criar booking quando slot está disponível')`

### Setup File (`tests/setup.ts`)

**Estado:** ficheiro presente com carregamento opcional de `.env.test` e defaults mínimos (`DATABASE_URL`, `JWT_SECRET`, etc.) para Vitest. O schema e migrations estão em `src/db/` (Épico 2); `npm run db:migrate` aplica o DDL. Testes de integração contra PostgreSQL (criar DB de teste, `migrate`, cleanup) podem seguir quando os endpoints usarem o pool.

```typescript
// Responsabilidades (alvo):
// 1. Criar database de teste se não existe
// 2. Rodar migrations
// 3. Exportar app instance configurada para test
// 4. Exportar helpers de cleanup (truncate all tables)
// 5. Exportar db connection para uso nos factories
```

### Factory Pattern
```typescript
// tests/factories/tenant.factory.ts
// Cada factory retorna um objeto válido com valores padrão
// Aceita overrides parciais
// Insere no banco e retorna a entidade com ID

// createTenant(overrides?) → Tenant
// createService(tenantId, overrides?) → Service
// createResource(tenantId, overrides?) → Resource
// createClient(tenantId, overrides?) → Client
// createBooking(tenantId, overrides?) → Booking
// createUser(tenantId, overrides?) → User
// createAvailabilityRule(tenantId, overrides?) → AvailabilityRule
```

---

## Testes Unitários

### `lib/slots.ts` — Geração de Slots

| # | Teste | Status |
|---|---|---|
| U01 | Deve gerar slots corretos para um dia com horário 08:00-18:00, serviço de 60min, intervalo de 30min | [ ] |
| U02 | Deve retornar vazio quando o dia está bloqueado (exceção is_blocked=true) | [ ] |
| U03 | Deve usar horário da exceção quando existe exceção com horário especial | [ ] |
| U04 | Deve subtrair bookings existentes dos slots disponíveis | [ ] |
| U05 | Deve aplicar buffer entre atendimentos quando configurado | [ ] |
| U06 | Deve filtrar slots que são menores que a duração do serviço | [ ] |
| U07 | Deve filtrar slots no passado (respeitar minAdvanceBooking) | [ ] |
| U08 | Deve filtrar slots além do limite futuro (maxAdvanceBooking) | [ ] |
| U09 | Deve lidar com múltiplas janelas no mesmo dia (ex: 08-12, 14-18) | [ ] |
| U10 | Deve lidar com timezone corretamente (converter UTC ↔ local) | [ ] |
| U11 | Deve gerar slots por resource quando resource_id é fornecido | [ ] |
| U12 | Deve combinar disponibilidade de múltiplos resources | [ ] |
| U13 | Deve retornar vazio para dia sem regra de disponibilidade (ex: domingo) | [ ] |

### `lib/status-machine.ts` — Máquina de Status

| # | Teste | Status |
|---|---|---|
| U20 | Deve permitir transição scheduled → confirmed | [ ] |
| U21 | Deve permitir transição scheduled → cancelled | [ ] |
| U22 | Deve permitir transição confirmed → in_progress | [ ] |
| U23 | Deve permitir transição confirmed → cancelled | [ ] |
| U24 | Deve permitir transição in_progress → completed | [ ] |
| U25 | Deve permitir transição in_progress → no_show | [ ] |
| U26 | Deve rejeitar transição scheduled → completed (pula etapa) | [ ] |
| U27 | Deve rejeitar transição completed → cancelled (estado final) | [ ] |
| U28 | Deve rejeitar transição cancelled → scheduled (estado final) | [ ] |
| U29 | Deve rejeitar transição no_show → in_progress (estado final) | [ ] |
| U30 | Deve listar transições válidas para cada status | [ ] |

### `lib/pagination.ts` — Cursor Pagination

| # | Teste | Status |
|---|---|---|
| U40 | Deve gerar cursor a partir de timestamp + id | [ ] |
| U41 | Deve decodificar cursor corretamente | [ ] |
| U42 | Deve retornar hasMore=true quando existem mais registros | [ ] |
| U43 | Deve retornar hasMore=false na última página | [ ] |

### Validações Zod (schemas)

| # | Teste | Status |
|---|---|---|
| U50 | Deve validar createBooking com dados corretos | [ ] |
| U51 | Deve rejeitar createBooking sem service_id | [ ] |
| U52 | Deve rejeitar createBooking com starts_at no passado | [ ] |
| U53 | Deve validar slug do tenant (lowercase, alphanum, hyphens) | [ ] |
| U54 | Deve rejeitar slug com caracteres inválidos | [ ] |
| U55 | Deve validar email e telefone no schema de cliente | [ ] |

---

## Testes de Integração

### Autenticação (`auth.test.ts`)

| # | Teste | Status |
|---|---|---|
| I01 | POST /auth/login — deve retornar tokens com credenciais válidas | [ ] |
| I02 | POST /auth/login — deve retornar 401 com email inexistente | [ ] |
| I03 | POST /auth/login — deve retornar 401 com senha incorreta | [ ] |
| I04 | POST /auth/refresh — deve retornar novos tokens com refresh válido | [ ] |
| I05 | POST /auth/refresh — deve retornar 401 com refresh expirado | [ ] |
| I06 | POST /auth/refresh — deve invalidar refresh token anterior (rotação) | [ ] |
| I07 | Rotas admin devem retornar 401 sem token | [ ] |
| I08 | Rotas admin devem retornar 401 com token expirado | [ ] |

### Tenants (`tenants.test.ts`)

| # | Teste | Status |
|---|---|---|
| I10 | POST /platform/tenants — deve criar tenant com slug válido | [ ] |
| I11 | POST /platform/tenants — deve retornar 409 com slug duplicado | [ ] |
| I12 | POST /platform/tenants — deve criar availability rules padrão | [ ] |
| I13 | POST /platform/tenants — deve criar admin user (owner) | [ ] |
| I14 | GET /platform/tenants/{id} — deve retornar dados do tenant | [ ] |
| I15 | PUT /platform/tenants/{id} — deve atualizar config e branding | [ ] |
| I16 | POST /platform/tenants/{id}/api-keys — deve gerar API key funcional | [ ] |
| I17 | GET /v1/{slug}/info — deve retornar dados públicos do tenant | [ ] |
| I18 | GET /v1/{slug-inexistente}/info — deve retornar 404 | [ ] |

### Serviços (`services.test.ts`)

| # | Teste | Status |
|---|---|---|
| I20 | GET /admin/services — deve listar serviços do tenant autenticado | [ ] |
| I21 | GET /admin/services — não deve listar serviços de outro tenant | [ ] |
| I22 | POST /admin/services — deve criar serviço com campos válidos | [ ] |
| I23 | POST /admin/services — deve criar serviço com custom_fields | [ ] |
| I24 | PUT /admin/services/{id} — deve atualizar serviço existente | [ ] |
| I25 | PUT /admin/services/{id} — deve retornar 404 para serviço de outro tenant | [ ] |
| I26 | DELETE /admin/services/{id} — deve desativar (soft delete) | [ ] |
| I27 | GET /v1/{slug}/services — deve listar apenas serviços ativos | [ ] |

### Recursos (`resources.test.ts`)

| # | Teste | Status |
|---|---|---|
| I30 | GET /admin/resources — deve listar recursos do tenant | [ ] |
| I31 | POST /admin/resources — deve criar recurso | [ ] |
| I32 | PUT /admin/resources/{id} — deve atualizar recurso | [ ] |
| I33 | Deve associar resource a services (M2M) | [ ] |
| I34 | Não deve acessar recurso de outro tenant | [ ] |

### Disponibilidade (`availability.test.ts`)

| # | Teste | Status |
|---|---|---|
| I40 | PUT /admin/availability — deve configurar grade semanal | [ ] |
| I41 | PUT /admin/availability — deve substituir regras anteriores | [ ] |
| I42 | POST /admin/availability/exceptions — deve criar exceção de bloqueio | [ ] |
| I43 | POST /admin/availability/exceptions — deve criar exceção com horário especial | [ ] |
| I44 | GET /v1/{slug}/availability — deve retornar slots para dia aberto | [ ] |
| I45 | GET /v1/{slug}/availability — deve retornar vazio para dia bloqueado | [ ] |
| I46 | GET /v1/{slug}/availability — deve excluir slots ocupados por bookings | [ ] |
| I47 | GET /v1/{slug}/availability — deve aplicar buffer entre bookings | [ ] |
| I48 | GET /v1/{slug}/availability — deve respeitar horário especial da exceção | [ ] |
| I49 | GET /v1/{slug}/availability — deve filtrar por resource_id quando fornecido | [ ] |

### Bookings (`bookings.test.ts`)

| # | Teste | Status |
|---|---|---|
| I50 | POST /v1/{slug}/bookings — deve criar booking com slot disponível | [ ] |
| I51 | POST /v1/{slug}/bookings — deve retornar 409 quando slot já ocupado | [ ] |
| I52 | POST /v1/{slug}/bookings — deve criar cliente novo se não existe | [ ] |
| I53 | POST /v1/{slug}/bookings — deve reusar cliente existente (por telefone) | [ ] |
| I54 | POST /v1/{slug}/bookings — deve preencher metadata com custom fields | [ ] |
| I55 | POST /v1/{slug}/bookings — race condition: dois requests simultâneos para mesmo slot | [ ] |
| I56 | GET /v1/{slug}/bookings/{id} — deve retornar status do booking | [ ] |
| I57 | GET /v1/{slug}/bookings/{id} — deve retornar 404 para booking de outro tenant | [ ] |
| I58 | GET /admin/bookings — deve listar bookings com filtro de data | [ ] |
| I59 | GET /admin/bookings — deve listar bookings com filtro de status | [ ] |
| I60 | GET /admin/bookings — deve paginar com cursor | [ ] |
| I61 | PATCH /admin/bookings/{id} — deve transicionar scheduled → confirmed | [ ] |
| I62 | PATCH /admin/bookings/{id} — deve retornar 422 para transição inválida | [ ] |
| I63 | PATCH /admin/bookings/{id} — deve disparar webhook na transição | [ ] |
| I64 | DELETE /admin/bookings/{id} — deve cancelar booking | [ ] |
| I65 | DELETE /admin/bookings/{id} — deve liberar slot na agenda | [ ] |

### Clientes (`clients.test.ts`)

| # | Teste | Status |
|---|---|---|
| I70 | GET /admin/clients — deve listar clientes do tenant com paginação | [ ] |
| I71 | GET /admin/clients — deve buscar por nome ou telefone | [ ] |
| I72 | GET /admin/clients/{id} — deve retornar detalhes do cliente | [ ] |
| I73 | GET /admin/clients/{id}/history — deve retornar bookings do cliente | [ ] |
| I74 | Não deve acessar cliente de outro tenant | [ ] |

### Webhooks (`webhooks.test.ts`)

| # | Teste | Status |
|---|---|---|
| I80 | Deve disparar webhook ao criar booking | [ ] |
| I81 | Deve disparar webhook ao transicionar status | [ ] |
| I82 | Deve incluir HMAC-SHA256 signature correta no header | [ ] |
| I83 | Deve fazer retry em caso de falha (timeout/5xx) | [ ] |
| I84 | Deve parar após max retries | [ ] |

### Relatórios (`reports.test.ts`)

| # | Teste | Status |
|---|---|---|
| I90 | GET /admin/reports/summary — deve retornar métricas corretas para período | [ ] |
| I91 | Deve calcular receita apenas de bookings completed | [ ] |
| I92 | Deve calcular taxa de cancelamento corretamente | [ ] |
| I93 | Deve filtrar por período (dia, semana, mês) | [ ] |
| I94 | Não deve incluir dados de outro tenant | [ ] |

### Multi-tenancy (`isolation.test.ts`)

| # | Teste | Status |
|---|---|---|
| I95 | Tenant A não deve ver bookings de Tenant B via admin | [ ] |
| I96 | Tenant A não deve ver clientes de Tenant B | [ ] |
| I97 | Tenant A não deve ver serviços de Tenant B | [ ] |
| I98 | Booking público no slug A não deve criar dados no Tenant B | [ ] |
| I99 | RLS deve bloquear acesso direto ao banco sem tenant_id setado | [ ] |

### Rate Limiting (`rate-limit.test.ts`)

| # | Teste | Status |
|---|---|---|
| I100 | Deve retornar 429 após exceder limite em endpoint público | [ ] |
| I101 | Deve retornar headers X-RateLimit-* corretos | [ ] |
| I102 | Deve aplicar rate limit por tenant em rotas admin | [ ] |

_(Implementação em `src/middleware/rate-limit.ts`; testes I100–I102 ainda cobertos manualmente / CI — cenários 429 podem ser adicionados com `RATE_LIMIT_*` baixo em teste dedicado.)_

### Middleware (Épico 3)

| # | Teste | Status |
|---|---|---|
| M01 | JWT: assinar e verificar access token (`tests/unit/jwt.test.ts`) | [x] `2026-04-03` |
| M02 | Admin: 401 sem token; 200 com JWT em `/v1/admin/ping` | [x] `2026-04-03` |
| M03 | Público: resolver tenant por slug em `/v1/:slug/ping` (requer DB) | [x] `2026-04-03` |
| M04 | Tenant inexistente: 404 `NOT_FOUND` | [x] `2026-04-03` |
| M05 | Platform: 401; 200 com API key válida (requer DB) | [x] `2026-04-03` |

---

## Métricas de Cobertura

| Módulo | Alvo | Atual |
|---|---|---|
| `lib/slots.ts` | 95% | — |
| `lib/status-machine.ts` | 100% | — |
| `modules/bookings/` | 90% | — |
| `modules/availability/` | 90% | — |
| `middleware/` | 80% | — |
| Geral | 85% | — |
