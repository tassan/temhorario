# Backend Architecture — agenda-engine API

## Visão Geral

`agenda-engine` é uma API REST multi-tenant de agendamento de serviços. Ela fornece toda a lógica de scheduling (geração de slots, booking, status tracking, gestão de clientes) como um serviço independente que qualquer aplicação pode consumir via HTTP.

**Stack:**
- Runtime: Node.js 20+
- Framework: Hono (lightweight, edge-ready, TypeScript-first)
- Banco: PostgreSQL 16 com Row Level Security (RLS)
- Cache: Redis (rate limiting, cache de disponibilidade)
- Auth: JWT (admin) + API Keys (platform/integração)
- Validação: Zod
- ORM: Drizzle ORM (type-safe, SQL-first)
- Testes: Vitest + Supertest
- Deploy: Railway / Render

---

## Estrutura do Projeto

```
agenda-engine/
├── src/
│   ├── index.ts                    # Entry point — bootstrap Hono app
│   ├── config/
│   │   ├── env.ts                  # Variáveis de ambiente tipadas (Zod)
│   │   └── database.ts             # Pool de conexão PostgreSQL
│   │
│   ├── db/
│   │   ├── schema/                 # Drizzle schema definitions
│   │   │   ├── tenants.ts
│   │   │   ├── services.ts
│   │   │   ├── resources.ts
│   │   │   ├── availability.ts
│   │   │   ├── bookings.ts
│   │   │   ├── clients.ts
│   │   │   └── index.ts            # Re-export all schemas
│   │   ├── migrations/             # SQL migration files
│   │   └── seed.ts                 # Dados de seed para dev/test
│   │
│   ├── middleware/
│   │   ├── tenant.ts               # Resolve tenant por slug ou JWT
│   │   ├── auth.ts                 # JWT validation (admin routes)
│   │   ├── api-key.ts              # API key validation (platform routes)
│   │   ├── rate-limit.ts           # Rate limiting por tenant/IP
│   │   └── error-handler.ts        # Global error handling
│   │
│   ├── modules/
│   │   ├── tenants/
│   │   │   ├── tenants.routes.ts
│   │   │   ├── tenants.service.ts
│   │   │   └── tenants.schema.ts   # Zod schemas de request/response
│   │   │
│   │   ├── services/
│   │   │   ├── services.routes.ts
│   │   │   ├── services.service.ts
│   │   │   └── services.schema.ts
│   │   │
│   │   ├── resources/
│   │   │   ├── resources.routes.ts
│   │   │   ├── resources.service.ts
│   │   │   └── resources.schema.ts
│   │   │
│   │   ├── availability/
│   │   │   ├── availability.routes.ts
│   │   │   ├── availability.service.ts # Lógica de geração de slots
│   │   │   └── availability.schema.ts
│   │   │
│   │   ├── bookings/
│   │   │   ├── bookings.routes.ts
│   │   │   ├── bookings.service.ts    # Criação, validação, status machine
│   │   │   └── bookings.schema.ts
│   │   │
│   │   ├── clients/
│   │   │   ├── clients.routes.ts
│   │   │   ├── clients.service.ts
│   │   │   └── clients.schema.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schema.ts
│   │   │
│   │   └── reports/
│   │       ├── reports.routes.ts
│   │       └── reports.service.ts
│   │
│   ├── webhooks/
│   │   ├── dispatcher.ts           # Dispara eventos para URLs registradas
│   │   ├── events.ts               # Tipos de eventos (booking.created, etc.)
│   │   └── retry.ts                # Retry logic com exponential backoff
│   │
│   └── lib/
│       ├── slots.ts                # Algoritmo de geração de slots
│       ├── status-machine.ts       # Máquina de estados do booking
│       ├── pagination.ts           # Cursor-based pagination helpers
│       ├── errors.ts               # Custom error classes
│       └── utils.ts                # Helpers genéricos
│
├── tests/
│   ├── setup.ts                    # Test database setup/teardown
│   ├── factories/                  # Test data factories
│   │   ├── tenant.factory.ts
│   │   ├── booking.factory.ts
│   │   └── ...
│   ├── unit/
│   │   ├── slots.test.ts
│   │   ├── status-machine.test.ts
│   │   └── ...
│   └── integration/
│       ├── bookings.test.ts
│       ├── availability.test.ts
│       └── ...
│
├── drizzle.config.ts
├── tsconfig.json
├── package.json
├── vitest.config.ts
├── Dockerfile
├── docker-compose.yml              # PostgreSQL + Redis para dev local
└── .env.example
```

---

## Camadas da Aplicação

### 1. Routes (entrada HTTP)
- Definem endpoints, métodos HTTP, e middlewares aplicados
- Validam request body/params/query com Zod schemas
- Delegam para o service correspondente
- Não contêm lógica de negócio

```typescript
// Exemplo: modules/bookings/bookings.routes.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createBookingSchema } from './bookings.schema';
import { BookingsService } from './bookings.service';

const bookings = new Hono();

// Público — booking page consome
bookings.post(
  '/v1/:slug/bookings',
  zValidator('json', createBookingSchema),
  async (c) => {
    const tenantId = c.get('tenantId'); // set pelo tenant middleware
    const body = c.req.valid('json');
    const booking = await BookingsService.create(tenantId, body);
    return c.json(booking, 201);
  }
);
```

### 2. Services (lógica de negócio)
- Contêm toda regra de negócio
- Orquestram queries ao banco, validações, e side-effects (webhooks)
- São testáveis isoladamente
- Sempre recebem `tenantId` como primeiro parâmetro

```typescript
// Exemplo: modules/bookings/bookings.service.ts
export class BookingsService {
  static async create(tenantId: string, input: CreateBookingInput) {
    // 1. Validar que o slot está disponível
    // 2. Validar que o serviço pertence ao tenant
    // 3. Criar ou encontrar cliente
    // 4. Criar booking
    // 5. Disparar webhook booking.created
    // 6. Retornar booking criado
  }
}
```

### 3. DB Schema (Drizzle ORM)
- Define tabelas, relações, e tipos TypeScript
- Toda tabela inclui `tenant_id` (exceto `tenants`)
- Migrations geradas automaticamente pelo Drizzle Kit

### 4. Middleware (cross-cutting concerns)
- **Tenant Resolution:** Todo request resolve o tenant via slug (público) ou JWT (admin)
- **Auth:** JWT para admin, API key para platform
- **Rate Limiting:** Por tenant + por IP em endpoints públicos
- **Error Handler:** Converte erros para respostas HTTP padronizadas

---

## Multi-tenancy

### Estratégia: Shared Database, Shared Schema com RLS

Todos os tenants compartilham o mesmo banco e as mesmas tabelas. Isolamento é garantido por:

1. **Application-level:** Todo service recebe `tenantId` e inclui na query
2. **Database-level:** Row Level Security (RLS) como segunda camada de proteção

```sql
-- Exemplo de RLS policy
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON bookings
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

### Middleware de Tenant

```typescript
// middleware/tenant.ts
// Para rotas públicas: resolve tenant pelo slug na URL
// Para rotas admin: extrai tenantId do JWT
// Para rotas platform: extrai tenantId da API key
// Seta no contexto: c.set('tenantId', tenantId)
// Seta no banco: SET app.current_tenant_id = tenantId (para RLS)
```

---

## Autenticação

### Admin (donos do negócio / dashboard)

- Login via email + senha → retorna JWT access token + refresh token
- Access token: 15min TTL, contém `{ tenantId, userId, role }`
- Refresh token: 7 dias TTL, rotação a cada uso
- Senha: hash com bcrypt (cost 12)

### Platform (API keys para integrações)

- API key gerada por tenant via endpoint protegido
- Formato: `ae_live_xxxxxxxxxxxx` (prefixo identifica ambiente)
- Armazenada como hash no banco (SHA-256)
- Inclusa no header: `Authorization: Bearer ae_live_xxxx`

### Público (página de booking)

- Sem autenticação
- Rate limited por IP (60 req/min)
- Tenant resolvido pelo slug na URL

---

## Schema do Banco

### Tabelas Principais

```
tenants
├── id (UUID, PK)
├── slug (VARCHAR 63, UNIQUE) — usado na URL pública
├── name (VARCHAR 255)
├── config (JSONB) — timezone, idioma, regras de booking
├── branding (JSONB) — logo_url, primary_color, accent_color
├── created_at, updated_at

services
├── id (UUID, PK)
├── tenant_id (FK → tenants)
├── name, duration (minutos), price (centavos)
├── custom_fields (JSONB) — definições de campos extras
├── active (BOOLEAN), sort_order (INTEGER)
├── created_at, updated_at

resources
├── id (UUID, PK)
├── tenant_id (FK → tenants)
├── name, type ('staff' | 'room' | 'equipment')
├── active (BOOLEAN)
├── created_at, updated_at

resource_services (M2M)
├── resource_id (FK → resources)
├── service_id (FK → services)

availability_rules
├── id (UUID, PK)
├── tenant_id (FK → tenants)
├── resource_id (FK → resources, nullable) — NULL = regra global do tenant
├── day_of_week (0-6, nullable) — NULL quando é exceção por data
├── start_time (TIME), end_time (TIME)
├── specific_date (DATE, nullable) — para exceções (feriados, folgas)
├── is_blocked (BOOLEAN) — true = período indisponível
├── created_at

clients
├── id (UUID, PK)
├── tenant_id (FK → tenants)
├── name, phone, email
├── metadata (JSONB) — dados extras definidos pelo consumer
├── created_at, updated_at

bookings
├── id (UUID, PK)
├── tenant_id (FK → tenants)
├── service_id (FK → services)
├── resource_id (FK → resources, nullable)
├── client_id (FK → clients)
├── starts_at (TIMESTAMPTZ), ends_at (TIMESTAMPTZ)
├── status ('scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show')
├── metadata (JSONB) — campos customizados preenchidos no booking
├── created_at, updated_at

users (admin users do tenant)
├── id (UUID, PK)
├── tenant_id (FK → tenants)
├── email, password_hash
├── name, role ('owner' | 'staff')
├── created_at, updated_at

api_keys
├── id (UUID, PK)
├── tenant_id (FK → tenants)
├── key_hash (VARCHAR) — SHA-256 da key
├── prefix (VARCHAR 12) — para identificação (ae_live_xxxx)
├── label (VARCHAR) — nome amigável
├── last_used_at, created_at
├── revoked_at (nullable)
```

### Índices Críticos

```sql
CREATE INDEX idx_bookings_tenant_date ON bookings(tenant_id, starts_at);
CREATE INDEX idx_bookings_resource_date ON bookings(resource_id, starts_at) WHERE resource_id IS NOT NULL;
CREATE INDEX idx_bookings_status ON bookings(tenant_id, status);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_clients_tenant ON clients(tenant_id);
CREATE INDEX idx_clients_phone ON clients(tenant_id, phone);
CREATE INDEX idx_services_tenant ON services(tenant_id) WHERE active = true;
CREATE INDEX idx_availability_tenant ON availability_rules(tenant_id);
CREATE INDEX idx_availability_resource ON availability_rules(resource_id) WHERE resource_id IS NOT NULL;
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_tenants_slug ON tenants(slug);
```

---

## Lógica Core: Geração de Slots

O algoritmo de disponibilidade é o coração da engine. Ele combina:

1. **Regras de disponibilidade** do tenant/resource para o dia solicitado
2. **Bookings existentes** que já ocupam slots
3. **Duração do serviço** solicitado
4. **Regras de buffer** (tempo entre atendimentos, se configurado)

```typescript
// lib/slots.ts — Pseudocódigo do algoritmo
function generateAvailableSlots(params: {
  tenantId: string;
  serviceId: string;
  resourceId?: string;
  date: string; // YYYY-MM-DD
}): AvailabilitySlot[] {
  // 1. Buscar regras de disponibilidade para o dia da semana
  // 2. Aplicar exceções (feriados, folgas) — bloqueios têm prioridade
  // 3. Gerar janelas de tempo abertas
  // 4. Buscar bookings existentes no período
  // 5. Subtrair bookings das janelas (fragmentar slots ocupados)
  // 6. Filtrar slots menores que a duração do serviço
  // 7. Discretizar em intervalos (ex: a cada 30 min)
  // 8. Retornar lista de slots disponíveis
}
```

### Regras de Configuração do Tenant

```typescript
interface TenantConfig {
  timezone: string;                    // ex: 'America/Sao_Paulo'
  locale: string;                      // ex: 'pt-BR'
  slotInterval: number;                // minutos entre slots (padrão: 30)
  bufferBetweenBookings: number;       // minutos de folga entre atendimentos
  minAdvanceBooking: number;           // horas mínimas de antecedência
  maxAdvanceBooking: number;           // dias máximos no futuro
  allowClientCancellation: boolean;
  cancellationDeadlineHours: number;   // até quantas horas antes pode cancelar
}
```

---

## Máquina de Status do Booking

```
scheduled ──→ confirmed ──→ in_progress ──→ completed
    │              │              │
    │              │              └──→ no_show
    │              │
    └──→ cancelled └──→ cancelled
```

### Transições Permitidas

| De | Para | Quem pode | Trigger |
|---|---|---|---|
| scheduled | confirmed | admin | Confirmação manual |
| scheduled | cancelled | admin, client (se permitido) | Cancelamento |
| confirmed | in_progress | admin | Início do atendimento |
| confirmed | cancelled | admin | Cancelamento |
| in_progress | completed | admin | Conclusão do atendimento |
| in_progress | no_show | admin | Cliente não apareceu |

```typescript
// lib/status-machine.ts
const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  scheduled: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'no_show'],
  completed: [],
  cancelled: [],
  no_show: [],
};

function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}
```

---

## Webhooks

### Disparo de Eventos

Toda mutação relevante dispara um webhook para URLs registradas pelo tenant:

```typescript
// webhooks/events.ts
type WebhookEvent =
  | 'booking.created'
  | 'booking.confirmed'
  | 'booking.started'
  | 'booking.completed'
  | 'booking.cancelled';

interface WebhookPayload {
  event: WebhookEvent;
  tenant_id: string;
  timestamp: string;
  data: Record<string, unknown>; // booking completo
}
```

### Retry Policy

- Primeira tentativa: imediata
- Retries: 3 tentativas com exponential backoff (1min, 5min, 30min)
- Timeout: 10 segundos por request
- Assinatura: HMAC-SHA256 no header `X-Webhook-Signature`

---

## Padrão de Resposta da API

### Sucesso

```json
{
  "data": { ... },
  "meta": {
    "cursor": "abc123",
    "hasMore": true
  }
}
```

### Erro

```json
{
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "O horário selecionado não está mais disponível.",
    "details": { "requested_slot": "2025-01-15T10:00:00" }
  }
}
```

### Códigos de Erro Padrão

| Code | HTTP Status | Descrição |
|---|---|---|
| VALIDATION_ERROR | 400 | Request body inválido |
| UNAUTHORIZED | 401 | Token/API key inválido ou ausente |
| FORBIDDEN | 403 | Sem permissão para o recurso |
| NOT_FOUND | 404 | Recurso não encontrado |
| SLOT_UNAVAILABLE | 409 | Slot já foi ocupado (race condition) |
| INVALID_TRANSITION | 422 | Transição de status não permitida |
| RATE_LIMITED | 429 | Muitos requests |
| INTERNAL_ERROR | 500 | Erro interno |

---

## Variáveis de Ambiente

```bash
# Banco
DATABASE_URL=postgresql://user:pass@host:5432/agenda_engine
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key
JWT_ACCESS_TTL=900          # 15 minutos em segundos
JWT_REFRESH_TTL=604800      # 7 dias em segundos

# Webhooks
WEBHOOK_SECRET=hmac-signing-secret
WEBHOOK_TIMEOUT_MS=10000
WEBHOOK_MAX_RETRIES=3

# App
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

---

## Decisões Técnicas e Justificativas

| Decisão | Justificativa |
|---|---|
| Hono em vez de Express | Mais leve, TypeScript-first, performance superior, middleware pattern limpo |
| Drizzle em vez de Prisma | SQL-first, sem overhead de engine, melhor controle de queries, migrations em SQL puro |
| RLS + application-level isolation | Defesa em profundidade — mesmo que um bug no app vaze, RLS bloqueia no banco |
| Cursor pagination em vez de offset | Performance consistente com tabelas grandes, sem problemas de page drift |
| Centavos em vez de float para preço | Evita erros de ponto flutuante em cálculos financeiros |
| JSONB para config/metadata | Flexibilidade para campos customizados sem schema migrations por tenant |
| Zod para validação | Type inference automática, composable, funciona no runtime e compile time |
