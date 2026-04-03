# Frontend Flows — agenda-engine UI/UX

Todos os fluxos de interação do usuário documentados com diagramas Mermaid.

---

## 1. Booking Flow (Cliente Final)

O fluxo principal do produto — a experiência que o cliente final vive ao agendar um serviço.

```mermaid
flowchart TD
    A[Cliente abre link<br/>slug.agenda-engine.com/agendar] --> B[Carrega info do tenant<br/>GET /v1/slug/info]
    B --> C[Aplica branding<br/>logo, cores, nome]
    C --> D[Carrega serviços<br/>GET /v1/slug/services]
    D --> E[Step 1: Escolher Serviço]

    E --> F[Step 2: Escolher Data]
    F --> G[Carrega slots<br/>GET /v1/slug/availability]
    G --> H[Step 3: Escolher Horário]

    H --> I[Step 4: Preencher Dados]
    I --> |Nome, Telefone, campos custom| J[Step 5: Revisar e Confirmar]
    J --> K[POST /v1/slug/bookings]

    K --> L{Sucesso?}
    L -->|201| M[Tela de Confirmação<br/>Booking ID + detalhes]
    L -->|409 Slot ocupado| N[Mensagem de erro<br/>Slot não disponível]
    N --> H

    style E fill:#e0f2fe
    style F fill:#e0f2fe
    style H fill:#e0f2fe
    style I fill:#e0f2fe
    style J fill:#e0f2fe
    style M fill:#d1fae5
    style N fill:#fee2e2
```

### Step Machine (estados do booking flow)

```mermaid
stateDiagram-v2
    [*] --> SelectService
    SelectService --> SelectDate: Serviço selecionado
    SelectDate --> SelectSlot: Data selecionada + slots carregados
    SelectSlot --> FillDetails: Horário selecionado
    FillDetails --> Review: Dados preenchidos + validados
    Review --> Submitting: Clica Confirmar
    Submitting --> Success: 201 Created
    Submitting --> SelectSlot: 409 Slot ocupado

    SelectDate --> SelectService: Voltar
    SelectSlot --> SelectDate: Voltar / Trocar data
    FillDetails --> SelectSlot: Voltar
    Review --> FillDetails: Editar dados
```

---

## 2. Booking Page — Componentes por Step

```mermaid
flowchart LR
    subgraph Step 1: Serviço
        S1[ServicePicker]
        S1A[Lista de cards]
        S1B[Nome + duração + preço]
        S1 --> S1A --> S1B
    end

    subgraph Step 2: Data
        S2[DatePicker]
        S2A[Calendário mensal]
        S2B[Dias com disponibilidade destacados]
        S2 --> S2A --> S2B
    end

    subgraph Step 3: Horário
        S3[SlotPicker]
        S3A[Grade de horários]
        S3B[Slots livres clicáveis]
        S3 --> S3A --> S3B
    end

    subgraph Step 4: Dados
        S4[ClientForm]
        S4A[Nome, telefone]
        S4B[Campos customizados]
        S4 --> S4A --> S4B
    end

    subgraph Step 5: Revisão
        S5[BookingSummary]
        S5A[Serviço + data + hora + cliente]
        S5B[Botão Confirmar]
        S5 --> S5A --> S5B
    end
```

---

## 3. Admin — Login Flow

```mermaid
sequenceDiagram
    participant U as Admin (Browser)
    participant App as Next.js App
    participant API as agenda-engine API

    U->>App: Acessa /dashboard
    App->>App: Auth guard: verifica token
    alt Token ausente ou expirado
        App-->>U: Redireciona para /login
        U->>App: Preenche email + senha
        App->>API: POST /v1/auth/login { email, password }
        alt Credenciais válidas
            API-->>App: 200 { access_token, refresh_token }
            App->>App: Armazena tokens
            App-->>U: Redireciona para /dashboard
        else Credenciais inválidas
            API-->>App: 401
            App-->>U: Mensagem de erro Email ou senha incorretos
        end
    else Token válido
        App-->>U: Renderiza dashboard
    end
```

---

## 4. Admin — Dashboard (Visão do Dia)

```mermaid
flowchart TD
    A[Admin abre /dashboard] --> B[Carrega dados em paralelo]

    B --> C[GET /admin/bookings?date=hoje]
    B --> D[GET /admin/reports/summary?period=day]

    C --> E[Agenda Visual do Dia]
    D --> F[Cards de Métricas]

    E --> G[Timeline vertical]
    G --> G1[Bookings como cards na timeline]
    G --> G2[Código de cor por status]
    G --> G3[Clique abre detalhe]

    F --> F1[Total de agendamentos]
    F --> F2[Receita do dia]
    F --> F3[Próximo atendimento]
    F --> F4[Taxa de ocupação]

    G3 --> H[Booking Detail Sheet]
    H --> H1[Info completa]
    H --> H2[Ações: Confirmar / Iniciar / Concluir]
    H2 --> I[PATCH /admin/bookings/id]
    I --> J[Optimistic update na UI]
```

---

## 5. Admin — Agenda Visual (Semana)

```mermaid
flowchart TD
    A[Admin abre /agenda] --> B[Seletor: Dia / Semana]

    B -->|Dia| C[Vista Dia]
    C --> C1[Timeline vertical 08h-20h]
    C --> C2[Colunas por resource]
    C --> C3[Bookings posicionados por horário]

    B -->|Semana| D[Vista Semana]
    D --> D1[7 colunas: Seg-Dom]
    D --> D2[Bookings empilhados por dia]
    D --> D3[Indicador de ocupação por dia]

    C3 --> E[Clique no booking]
    D2 --> E
    E --> F[Slide-over com detalhes + ações]

    F --> G{Ação do admin}
    G -->|Confirmar| H[Status → confirmed]
    G -->|Iniciar| I[Status → in_progress]
    G -->|Concluir| J[Status → completed]
    G -->|Cancelar| K[Status → cancelled]
    G -->|No-show| L[Status → no_show]
```

---

## 6. Admin — Gestão de Serviços

```mermaid
flowchart TD
    A[Admin abre /services] --> B[Lista de serviços]
    B --> C[Card por serviço:<br/>nome, duração, preço, status]

    C --> D{Ação}
    D -->|Novo| E[Dialog: Criar Serviço]
    D -->|Editar| F[Dialog: Editar Serviço]
    D -->|Desativar| G[Confirmação → soft delete]

    E --> H[Form: nome, duração, preço]
    H --> I[Opcional: custom fields]
    I --> J[POST /admin/services]
    J --> K[Atualiza lista]

    F --> L[Form preenchido com dados atuais]
    L --> M[PUT /admin/services/id]
    M --> K

    G --> N[DELETE /admin/services/id]
    N --> K
```

---

## 7. Admin — Configuração de Disponibilidade

```mermaid
flowchart TD
    A[Admin abre /availability] --> B[Vista atual da semana]
    B --> C[Grid 7 dias x 24h]
    C --> D[Blocos coloridos = horário ativo]

    D --> E{Ação}
    E -->|Editar horário semanal| F[Modal: Configurar Semana]
    F --> F1[Para cada dia: toggle ativo + horário início/fim]
    F --> F2[Suporte a múltiplas janelas por dia]
    F --> F3[PUT /admin/availability]

    E -->|Adicionar exceção| G[Modal: Exceção]
    G --> G1[Selecionar data]
    G --> G2{Tipo}
    G2 -->|Bloqueio| G3[Dia inteiro indisponível]
    G2 -->|Horário especial| G4[Horário diferente do padrão]
    G --> G5[POST /admin/availability/exceptions]

    F3 --> H[Atualiza grid visual]
    G5 --> H

    H --> I[Exceções mostradas como badges no calendário]
```

---

## 8. Admin — Lista de Bookings

```mermaid
flowchart TD
    A[Admin abre /bookings] --> B[GET /admin/bookings com filtros]

    B --> C[Tabela de bookings]
    C --> C1[Colunas: Data, Hora, Serviço, Cliente, Status, Ações]

    C --> D[Filtros]
    D --> D1[Data: range picker]
    D --> D2[Status: multi-select]
    D --> D3[Serviço: dropdown]
    D --> D4[Busca: nome/telefone do cliente]

    C --> E[Paginação cursor-based]
    E --> E1[Botão Carregar mais]

    C1 --> F[Clique na linha]
    F --> G[Detalhe do booking]
    G --> G1[Dados do serviço]
    G --> G2[Dados do cliente]
    G --> G3[Metadata / campos custom]
    G --> G4[Histórico de status]
    G --> G5[Ações disponíveis]
```

---

## 9. Admin — Clientes

```mermaid
flowchart TD
    A[Admin abre /clients] --> B[GET /admin/clients]

    B --> C[Lista de clientes]
    C --> C1[Busca por nome ou telefone]
    C --> C2[Card: nome, telefone, total de visitas, última visita]

    C2 --> D[Clique no cliente]
    D --> E[Detalhe do cliente]
    E --> E1[Dados cadastrais]
    E --> E2[GET /admin/clients/id/history]
    E2 --> E3[Timeline de bookings passados]
    E3 --> E4[Cada item: serviço, data, status]
```

---

## 10. Consulta de Status (Cliente Final)

```mermaid
flowchart TD
    A[Cliente recebe link ou booking ID] --> B[Abre /slug/booking/id]
    B --> C[GET /v1/slug/bookings/id]

    C --> D{Status atual}
    D -->|scheduled| E[Ícone relógio<br/>Seu agendamento foi recebido]
    D -->|confirmed| F[Ícone check<br/>Agendamento confirmado]
    D -->|in_progress| G[Ícone play<br/>Atendimento em andamento]
    D -->|completed| H[Ícone check-circle<br/>Atendimento concluído]
    D -->|cancelled| I[Ícone x<br/>Agendamento cancelado]
    D -->|no_show| J[Ícone alert<br/>Você não compareceu]

    E --> K[Detalhes: serviço, data, hora, local]
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K
```

---

## 11. Navigation Map (Admin)

```mermaid
flowchart LR
    subgraph Sidebar
        S1[Dashboard]
        S2[Agenda]
        S3[Bookings]
        S4[Clientes]
        S5[Serviços]
        S6[Recursos]
        S7[Disponibilidade]
        S8[Relatórios]
        S9[Configurações]
    end

    S1 --> |/dashboard| P1[Visão geral do dia]
    S2 --> |/agenda| P2[Agenda visual dia/semana]
    S3 --> |/bookings| P3[Lista filtrada de bookings]
    S4 --> |/clients| P4[Lista de clientes + busca]
    S5 --> |/services| P5[CRUD de serviços]
    S6 --> |/resources| P6[CRUD de recursos]
    S7 --> |/availability| P7[Config de disponibilidade]
    S8 --> |/reports| P8[Métricas e gráficos]
    S9 --> |/settings| P9[Branding, regras, webhooks]
```

---

## 12. Estado Global e Data Flow

```mermaid
flowchart TD
    subgraph Fontes de Dados
        API[agenda-engine API]
    end

    subgraph Cache Layer
        RQ[React Query Cache]
    end

    subgraph Estado Local
        AUTH[Auth Context<br/>tokens, user info]
        TENANT[Tenant Context<br/>branding, config]
        BOOKING[Booking Flow State<br/>step, selections]
    end

    subgraph UI Components
        PAGES[Page Components]
        COMPS[Feature Components]
        UI[UI Components]
    end

    API -->|fetch| RQ
    RQ -->|data| PAGES
    RQ -->|data| COMPS
    AUTH -->|user| PAGES
    TENANT -->|branding| COMPS
    TENANT -->|branding| UI
    BOOKING -->|selections| COMPS
    PAGES --> UI
    COMPS --> UI
```
