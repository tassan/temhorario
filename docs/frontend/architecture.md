# Frontend Architecture — agenda-engine

## Visão Geral

O frontend da agenda-engine é composto por duas aplicações distintas que consomem a mesma API:

1. **Booking Page** — Página pública onde clientes finais agendam serviços
2. **Admin Dashboard** — Painel para o dono do negócio gerenciar agenda, clientes e relatórios

Ambas vivem no mesmo repositório Next.js e compartilham componentes, mas têm perfis de uso completamente diferentes.

**Stack:**
- Framework: Next.js 14+ (App Router)
- Linguagem: TypeScript strict mode
- Styling: Tailwind CSS 4
- Componentes: shadcn/ui como base
- State: React Query (TanStack Query) para server state
- Forms: React Hook Form + Zod
- Testes: Vitest + React Testing Library + Playwright (E2E)
- Deploy: Vercel

---

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/
│   │   ├── (public)/                    # Grupo: rotas públicas (booking)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx             # Landing: info do tenant + CTA
│   │   │       ├── agendar/
│   │   │       │   └── page.tsx         # Booking flow completo
│   │   │       └── booking/
│   │   │           └── [id]/
│   │   │               └── page.tsx     # Confirmação / status do booking
│   │   │
│   │   ├── (admin)/                     # Grupo: rotas admin (dashboard)
│   │   │   ├── layout.tsx               # Sidebar + auth guard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx             # Visão geral do dia
│   │   │   ├── agenda/
│   │   │   │   └── page.tsx             # Agenda visual (dia/semana)
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx             # Lista de bookings
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # Detalhe do booking
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx             # Lista de clientes
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # Detalhe + histórico
│   │   │   ├── services/
│   │   │   │   └── page.tsx             # CRUD de serviços
│   │   │   ├── resources/
│   │   │   │   └── page.tsx             # CRUD de recursos
│   │   │   ├── availability/
│   │   │   │   └── page.tsx             # Config de disponibilidade
│   │   │   ├── reports/
│   │   │   │   └── page.tsx             # Relatórios e métricas
│   │   │   └── settings/
│   │   │       └── page.tsx             # Config do tenant (branding, regras)
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx                 # Tela de login admin
│   │   ├── layout.tsx                   # Root layout
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   │
│   │   ├── booking/                     # Componentes do booking flow
│   │   │   ├── service-picker.tsx       # Seleção de serviço
│   │   │   ├── date-picker.tsx          # Seleção de data
│   │   │   ├── slot-picker.tsx          # Seleção de horário
│   │   │   ├── client-form.tsx          # Formulário de dados do cliente
│   │   │   ├── booking-summary.tsx      # Resumo antes de confirmar
│   │   │   └── booking-confirmation.tsx # Tela de sucesso
│   │   │
│   │   ├── admin/                       # Componentes do dashboard
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── schedule-grid.tsx        # Grade visual da agenda
│   │   │   ├── booking-card.tsx         # Card de booking na agenda
│   │   │   ├── status-badge.tsx         # Badge com cor por status
│   │   │   ├── booking-actions.tsx      # Botões de ação (confirmar, iniciar, etc.)
│   │   │   ├── stats-card.tsx           # Card de métrica no dashboard
│   │   │   └── data-table.tsx           # Tabela genérica com paginação
│   │   │
│   │   └── shared/                      # Componentes compartilhados
│   │       ├── loading.tsx
│   │       ├── error-boundary.tsx
│   │       ├── empty-state.tsx
│   │       └── tenant-branding.tsx      # Aplica cores/logo do tenant
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts               # Fetch wrapper com auth headers
│   │   │   ├── public.ts               # Client para endpoints públicos
│   │   │   ├── admin.ts                # Client para endpoints admin
│   │   │   └── types.ts                # Tipos compartilhados da API
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-tenant.ts           # Dados públicos do tenant
│   │   │   ├── use-services.ts         # Lista de serviços
│   │   │   ├── use-availability.ts     # Slots disponíveis
│   │   │   ├── use-bookings.ts         # CRUD de bookings
│   │   │   ├── use-clients.ts          # CRUD de clientes
│   │   │   └── use-auth.ts             # Login, logout, refresh
│   │   │
│   │   ├── utils/
│   │   │   ├── date.ts                 # Formatação de datas (date-fns)
│   │   │   ├── currency.ts             # Formatação de moeda (centavos → R$)
│   │   │   └── slug.ts                 # Validação de slug
│   │   │
│   │   └── constants.ts                # Status labels, cores, config
│   │
│   └── styles/
│       └── themes/                      # CSS variables por tenant
│
├── public/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│       ├── booking-flow.spec.ts
│       └── admin-flow.spec.ts
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Duas Experiências, Um Codebase

### Booking Page (Público)

**Perfil:** Mobile-first, performance crítica, zero fricção.

- URL: `{slug}.agenda-engine.com/agendar` (ou subdomínio do consumer)
- SSR na primeira carga (SEO + performance)
- Client-side interações após hidratação
- Tema dinâmico baseado no branding do tenant
- Zero autenticação — o slug identifica o tenant
- Otimizada para 3G/4G em dispositivos de baixo custo

**Fluxo do usuário:**
```
Abre link → Vê serviços → Escolhe serviço → Escolhe data → Escolhe horário → Preenche dados → Confirma → Recebe confirmação
```

### Admin Dashboard (Autenticado)

**Perfil:** Desktop-first (responsivo), produtividade, informação densa.

- URL: `agenda-engine.com/dashboard` (ou rota do consumer)
- SPA com client-side routing dentro do layout admin
- Auth guard: redireciona para login se não autenticado
- Auto-refresh de dados da agenda (polling ou futuro WebSocket)
- Ações rápidas: confirmar, iniciar, concluir booking com 1 clique

---

## Data Fetching

### React Query (TanStack Query)

Toda comunicação com a API passa por hooks que encapsulam React Query:

```typescript
// lib/hooks/use-availability.ts
export function useAvailability(slug: string, serviceId: string, date: string) {
  return useQuery({
    queryKey: ['availability', slug, serviceId, date],
    queryFn: () => publicApi.getAvailability(slug, serviceId, date),
    staleTime: 30_000,       // 30s — slots mudam com frequência
    refetchOnFocus: true,    // Refetch ao voltar pra aba
  });
}
```

### Cache Strategy

| Dado | staleTime | Refetch |
|---|---|---|
| Tenant info | 5 min | onMount |
| Serviços | 5 min | onMount |
| Slots de disponibilidade | 30s | onFocus, onInterval(30s) |
| Bookings (admin list) | 15s | onFocus, onInterval(15s) |
| Clientes | 2 min | onFocus |
| Relatórios | 5 min | onMount |

### Optimistic Updates

Para ações no admin (mudar status de booking), usar optimistic updates:

```typescript
// Ao clicar "Confirmar" no booking:
// 1. Atualiza UI imediatamente (status → confirmed)
// 2. Faz PATCH /admin/bookings/{id} em background
// 3. Se falhar, reverte para estado anterior + mostra toast de erro
```

---

## Autenticação no Frontend

### Flow

```
1. Usuário acessa /dashboard
2. Auth guard verifica token no cookie/localStorage
3. Se não tem token → redireciona para /login
4. Após login → armazena access_token + refresh_token
5. Interceptor no API client:
   a. Inclui Authorization header em todo request
   b. Se recebe 401 → tenta refresh
   c. Se refresh falha → redireciona para /login
```

### Token Storage

- `access_token`: em memória (React state/context) — mais seguro
- `refresh_token`: httpOnly cookie (se possível) ou localStorage
- Nunca expor tokens em URLs ou logs

---

## Theming Dinâmico

O booking page aplica as cores do tenant dinamicamente:

```typescript
// components/shared/tenant-branding.tsx
// Recebe branding do tenant (primary_color, accent_color, logo_url)
// Seta CSS custom properties no :root
// Todos componentes usam as variáveis

// CSS:
// --color-primary: {tenant.branding.primary_color}
// --color-accent: {tenant.branding.accent_color}
```

Tailwind config extende com as variáveis:
```javascript
// tailwind.config.ts
colors: {
  brand: {
    primary: 'var(--color-primary)',
    accent: 'var(--color-accent)',
  }
}
```

---

## Responsividade

### Breakpoints

| Nome | Largura | Uso principal |
|---|---|---|
| `sm` | 640px | Booking page — layout base |
| `md` | 768px | Booking page — 2 colunas |
| `lg` | 1024px | Admin — sidebar visível |
| `xl` | 1280px | Admin — layout expandido |

### Booking Page
- Mobile-first: tudo empilhado verticalmente
- Tablet+: service picker e calendar side by side
- Touch targets: mínimo 44x44px

### Admin Dashboard
- Mobile: sidebar como drawer, tabela scrollável
- Desktop: sidebar fixa, grid layout, tabela completa

---

## Performance

### Booking Page (metas)

| Métrica | Alvo |
|---|---|
| LCP | < 2.0s |
| FID | < 100ms |
| CLS | < 0.1 |
| TTI | < 3.0s em 4G |

### Estratégias

- SSR para a primeira carga (tenant info + serviços)
- Lazy load dos componentes de step 2+ do booking flow
- Prefetch de slots ao selecionar serviço (antes de escolher data)
- Imagens do tenant otimizadas via next/image
- Font subsetting (apenas caracteres usados)
- Bundle splitting por rota

---

## Internacionalização (futuro)

Preparar desde o início:
- Todos os textos via constantes (não hardcoded)
- Formatação de data e moeda via locale do tenant
- Estrutura pronta para `next-intl` quando necessário
- Tenant config define `locale` e `timezone`

---

## Variáveis de Ambiente (Frontend)

```bash
# API
NEXT_PUBLIC_API_URL=https://api.agenda-engine.com
NEXT_PUBLIC_APP_URL=https://agenda-engine.com

# Auth
NEXT_PUBLIC_JWT_COOKIE_NAME=ae_session

# Analytics (futuro)
NEXT_PUBLIC_ANALYTICS_ID=
```

---

## Decisões Técnicas

| Decisão | Justificativa |
|---|---|
| Next.js App Router | SSR para booking page (SEO, performance), RSC para admin |
| shadcn/ui | Componentes acessíveis, customizáveis, sem vendor lock-in |
| React Query | Cache automático, optimistic updates, refetch strategies |
| React Hook Form + Zod | Performance (uncontrolled), validação type-safe compartilhada com backend |
| Tailwind CSS | Utility-first, theming via CSS variables, purge automático |
| Booking como steps (não como pages) | Mantém estado sem persistir no server, UX mais fluida |
