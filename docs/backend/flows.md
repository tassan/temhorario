# Backend Flows — temhorario-engine API

Todos os fluxos principais da API documentados com diagramas Mermaid. Use como referência para implementação e testes.

---

## 1. Booking Público (Cliente agenda pelo site)

Este é o fluxo mais importante da engine — é o que o usuário final experimenta.

```mermaid
sequenceDiagram
    participant C as Cliente (Browser)
    participant API as temhorario-engine API
    participant DB as PostgreSQL
    participant WH as Webhook Dispatcher

    C->>API: GET /v1/{slug}/info
    API->>DB: SELECT tenant WHERE slug = {slug}
    DB-->>API: tenant data (nome, branding)
    API-->>C: 200 { name, logo, colors }

    C->>API: GET /v1/{slug}/services
    API->>DB: SELECT services WHERE tenant_id AND active = true
    DB-->>API: lista de serviços
    API-->>C: 200 [{ id, name, duration, price }]

    Note over C: Cliente seleciona serviço

    C->>API: GET /v1/{slug}/availability?service_id=X&date=2025-01-15
    API->>DB: SELECT availability_rules WHERE tenant_id AND day/date
    API->>DB: SELECT bookings WHERE tenant_id AND date range
    Note over API: Algoritmo de slots:<br/>1. Gera janelas do dia<br/>2. Subtrai bookings existentes<br/>3. Filtra por duração do serviço<br/>4. Discretiza em intervalos
    API-->>C: 200 [{ starts_at, ends_at, available: true }]

    Note over C: Cliente seleciona horário e preenche dados

    C->>API: POST /v1/{slug}/bookings { service_id, starts_at, client: { name, phone } }
    API->>DB: BEGIN TRANSACTION
    API->>DB: SELECT FOR UPDATE — verifica slot ainda disponível
    alt Slot ocupado (race condition)
        API-->>C: 409 SLOT_UNAVAILABLE
    else Slot livre
        API->>DB: INSERT/UPSERT client
        API->>DB: INSERT booking (status: scheduled)
        API->>DB: COMMIT
        API->>WH: dispatch(booking.created, booking_data)
        API-->>C: 201 { booking_id, status, starts_at }
    end

    Note over C: Cliente recebe confirmação com booking_id
    C->>API: GET /v1/{slug}/bookings/{id}
    API-->>C: 200 { status, service, starts_at, ... }
```

---

## 2. Ciclo de Vida do Booking (Admin)

```mermaid
stateDiagram-v2
    [*] --> scheduled: POST /bookings (cliente agenda)

    scheduled --> confirmed: PATCH status=confirmed
    scheduled --> cancelled: PATCH status=cancelled

    confirmed --> in_progress: PATCH status=in_progress
    confirmed --> cancelled: PATCH status=cancelled

    in_progress --> completed: PATCH status=completed
    in_progress --> no_show: PATCH status=no_show

    completed --> [*]
    cancelled --> [*]
    no_show --> [*]

    note right of scheduled: Webhook - booking.created
    note right of confirmed: Webhook - booking.confirmed
    note right of in_progress: Webhook - booking.started
    note right of completed: Webhook - booking.completed
    note right of cancelled: Webhook - booking.cancelled
```

---

## 3. Atualização de Status (Admin Dashboard)

```mermaid
sequenceDiagram
    participant A as Admin (Dashboard)
    participant API as temhorario-engine API
    participant DB as PostgreSQL
    participant WH as Webhook Dispatcher

    A->>API: PATCH /v1/admin/bookings/{id} { status: "confirmed" }
    Note over API: Auth middleware: valida JWT, extrai tenantId

    API->>DB: SELECT booking WHERE id AND tenant_id
    alt Booking não encontrado
        API-->>A: 404 NOT_FOUND
    else Booking encontrado
        Note over API: Status machine: valida transição<br/>scheduled → confirmed ✓
        alt Transição inválida
            API-->>A: 422 INVALID_TRANSITION
        else Transição válida
            API->>DB: UPDATE booking SET status = 'confirmed'
            API->>WH: dispatch(booking.confirmed, booking_data)
            API-->>A: 200 { booking atualizado }
        end
    end
```

---

## 4. Autenticação Admin

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as temhorario-engine API
    participant DB as PostgreSQL

    Note over A,API: Login
    A->>API: POST /v1/auth/login { email, password }
    API->>DB: SELECT user WHERE email
    alt Usuário não encontrado
        API-->>A: 401 UNAUTHORIZED
    else Usuário encontrado
        Note over API: bcrypt.compare(password, hash)
        alt Senha incorreta
            API-->>A: 401 UNAUTHORIZED
        else Senha correta
            Note over API: Gera JWT access (15min) + refresh (7d)
            API-->>A: 200 { access_token, refresh_token, expires_in }
        end
    end

    Note over A,API: Refresh Token
    A->>API: POST /v1/auth/refresh { refresh_token }
    Note over API: Valida refresh token, verifica expiração
    alt Token inválido ou expirado
        API-->>A: 401 UNAUTHORIZED
    else Token válido
        Note over API: Gera novo par de tokens<br/>Invalida refresh token anterior (rotação)
        API-->>A: 200 { access_token, refresh_token, expires_in }
    end
```

---

## 5. Gestão de Disponibilidade

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as temhorario-engine API
    participant DB as PostgreSQL

    Note over A,API: Configurar horário semanal padrão
    A->>API: PUT /v1/admin/availability
    Note right of A: body: { rules: [<br/>  { day: 1, start: "08:00", end: "18:00" },<br/>  { day: 2, start: "08:00", end: "18:00" },<br/>  ...<br/>]}
    API->>DB: DELETE existing rules WHERE tenant_id AND specific_date IS NULL
    API->>DB: INSERT new weekly rules
    API-->>A: 200 { rules atualizadas }

    Note over A,API: Adicionar exceção (feriado/folga)
    A->>API: POST /v1/admin/availability/exceptions
    Note right of A: body: {<br/>  date: "2025-12-25",<br/>  is_blocked: true,<br/>  reason: "Natal"<br/>}
    API->>DB: INSERT availability_rule com specific_date e is_blocked=true
    API-->>A: 201 { exceção criada }

    Note over A,API: Horário especial (funciona diferente num dia)
    A->>API: POST /v1/admin/availability/exceptions
    Note right of A: body: {<br/>  date: "2025-01-20",<br/>  is_blocked: false,<br/>  start_time: "10:00",<br/>  end_time: "14:00"<br/>}
    API->>DB: INSERT availability_rule com horário especial
    API-->>A: 201 { exceção criada }
```

---

## 6. Algoritmo de Geração de Slots

```mermaid
flowchart TD
    A[Request: GET /availability?service_id=X&date=D] --> B[Buscar regras do dia da semana]
    B --> C[Buscar exceções para a data específica]
    C --> D{Existe exceção<br/>is_blocked=true?}
    D -->|Sim| E[Retorna slots: vazio — dia bloqueado]
    D -->|Não| F{Existe exceção<br/>com horário especial?}
    F -->|Sim| G[Usar horário da exceção]
    F -->|Não| H[Usar horário semanal padrão]
    G --> I[Gerar janelas de tempo abertas]
    H --> I
    I --> J[Buscar bookings existentes no período]
    J --> K[Subtrair bookings das janelas]
    K --> L[Aplicar buffer entre atendimentos]
    L --> M[Filtrar slots menores que duração do serviço]
    M --> N[Discretizar em intervalos configurados]
    N --> O[Filtrar slots no passado — minAdvanceBooking]
    O --> P[Filtrar slots além do limite — maxAdvanceBooking]
    P --> Q[Retornar lista de slots disponíveis]
```

---

## 7. CRUD de Serviços

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as temhorario-engine API
    participant DB as PostgreSQL

    Note over A,API: Listar serviços
    A->>API: GET /v1/admin/services
    API->>DB: SELECT services WHERE tenant_id ORDER BY sort_order
    API-->>A: 200 [{ id, name, duration, price, active, custom_fields }]

    Note over A,API: Criar serviço
    A->>API: POST /v1/admin/services { name, duration, price, custom_fields }
    API->>DB: INSERT service
    API-->>A: 201 { serviço criado }

    Note over A,API: Atualizar serviço
    A->>API: PUT /v1/admin/services/{id} { name, duration, price }
    API->>DB: UPDATE service WHERE id AND tenant_id
    API-->>A: 200 { serviço atualizado }

    Note over A,API: Desativar serviço (soft delete)
    A->>API: DELETE /v1/admin/services/{id}
    API->>DB: UPDATE service SET active = false WHERE id AND tenant_id
    Note over API: Não deleta — bookings existentes referenciam o serviço
    API-->>A: 200 { serviço desativado }
```

---

## 8. Webhook Dispatch

```mermaid
sequenceDiagram
    participant S as Service Layer
    participant WH as Webhook Dispatcher
    participant Q as Job Queue (Redis)
    participant T as Target URL (consumer)

    S->>WH: dispatch('booking.created', booking_data)
    WH->>WH: Buscar webhook URLs registradas para o tenant
    WH->>WH: Gerar HMAC-SHA256 signature
    WH->>Q: Enqueue job { url, payload, signature, attempt: 1 }

    Q->>T: POST webhook_url { event, data, timestamp }
    Note right of T: Headers:<br/>X-Webhook-Signature: sha256=...<br/>Content-Type: application/json

    alt 2xx response
        T-->>Q: 200 OK
        Note over Q: Job concluído
    else Falha (timeout, 5xx, network error)
        T-->>Q: Error
        Note over Q: Retry com backoff<br/>Tentativa 2: +1min<br/>Tentativa 3: +5min<br/>Tentativa 4: +30min
        Q->>T: Retry POST
    end
```

---

## 9. Onboarding de Tenant (Platform)

```mermaid
sequenceDiagram
    participant P as Platform Admin / Self-service
    participant API as temhorario-engine API
    participant DB as PostgreSQL

    P->>API: POST /v1/platform/tenants { slug, name, config, branding }
    API->>DB: Check slug uniqueness
    alt Slug já existe
        API-->>P: 409 CONFLICT
    else Slug disponível
        API->>DB: INSERT tenant
        API->>DB: INSERT default availability rules (seg-sex 08-18h)
        API->>DB: INSERT admin user (owner)
        API-->>P: 201 { tenant_id, slug, admin_credentials }
    end

    Note over P: Gerar API key para integração
    P->>API: POST /v1/platform/tenants/{id}/api-keys { label: "Production" }
    API->>DB: Gerar key, armazenar hash
    API-->>P: 201 { api_key: "ae_live_xxxx" }
    Note over P: ⚠️ Key exibida apenas uma vez
```

---

## 10. Relatórios

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as temhorario-engine API
    participant DB as PostgreSQL

    A->>API: GET /v1/admin/reports/summary?period=month&date=2025-01
    API->>DB: Aggregate queries:
    Note over DB: - COUNT bookings por status<br/>- SUM receita (completed)<br/>- AVG duração real<br/>- Taxa de cancelamento<br/>- Taxa de no-show<br/>- Top serviços por volume<br/>- Top clientes por frequência
    DB-->>API: Dados agregados
    API-->>A: 200 { total_bookings, revenue, cancellation_rate, ... }
```

---

## 11. Request Pipeline Completo

```mermaid
flowchart LR
    REQ[HTTP Request] --> RL[Rate Limiter]
    RL --> TR[Tenant Resolver]
    TR --> AU[Auth Middleware]
    AU --> ZV[Zod Validation]
    ZV --> RT[Route Handler]
    RT --> SV[Service Layer]
    SV --> DB[(PostgreSQL)]
    SV --> RD[(Redis Cache)]
    SV --> WH[Webhook Dispatch]
    RT --> RS[Response Formatter]
    RS --> RES[HTTP Response]

    RL -.->|429| ERR[Error Handler]
    TR -.->|404| ERR
    AU -.->|401/403| ERR
    ZV -.->|400| ERR
    SV -.->|409/422| ERR
    ERR --> RES
```
