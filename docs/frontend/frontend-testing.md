# Frontend Testing — agenda-engine

> **⚠️ INSTRUÇÃO PARA AI AGENTS:**
> Ao implementar qualquer componente ou página, consulte esta lista para identificar quais testes devem ser escritos. Marque como concluído ao implementar.

---

## Setup de Testes

### Stack
- **Unit/Integration:** Vitest + React Testing Library
- **E2E:** Playwright
- **Mocking:** MSW (Mock Service Worker) para interceptar API calls

### Convenções
- Testes unitários: `tests/unit/*.test.tsx`
- Testes de integração: `tests/integration/*.test.tsx`
- Testes E2E: `tests/e2e/*.spec.ts`
- Nomear testes em português
- Cada componente de feature tem teste correspondente
- MSW handlers simulam a API real com respostas controladas

### MSW Setup

```typescript
// tests/mocks/handlers.ts
// Define handlers para todos os endpoints da API:
// - GET /v1/{slug}/info → retorna tenant mock
// - GET /v1/{slug}/services → retorna lista de serviços
// - GET /v1/{slug}/availability → retorna slots
// - POST /v1/{slug}/bookings → simula criação
// - GET /admin/bookings → retorna lista de bookings
// etc.
//
// Cada handler aceita overrides para cenários específicos:
// - Erro 409 (slot ocupado)
// - Erro 401 (não autenticado)
// - Lista vazia
// - Dados com custom fields
```

---

## Testes Unitários — Componentes

### Booking Flow Components

| # | Componente | Teste | Status |
|---|---|---|---|
| C01 | ServicePicker | Deve renderizar lista de serviços | [ ] |
| C02 | ServicePicker | Deve destacar serviço selecionado | [ ] |
| C03 | ServicePicker | Deve chamar callback ao selecionar | [ ] |
| C04 | ServicePicker | Deve mostrar loading skeleton | [ ] |
| C05 | ServicePicker | Deve mostrar empty state quando lista vazia | [ ] |
| C06 | DatePicker | Deve renderizar calendário do mês atual | [ ] |
| C07 | DatePicker | Deve desabilitar datas passadas | [ ] |
| C08 | DatePicker | Deve navegar entre meses | [ ] |
| C09 | DatePicker | Deve destacar data selecionada | [ ] |
| C10 | SlotPicker | Deve renderizar slots disponíveis | [ ] |
| C11 | SlotPicker | Deve mostrar loading enquanto carrega | [ ] |
| C12 | SlotPicker | Deve mostrar mensagem quando nenhum slot disponível | [ ] |
| C13 | SlotPicker | Deve destacar slot selecionado | [ ] |
| C14 | ClientForm | Deve validar nome obrigatório | [ ] |
| C15 | ClientForm | Deve validar telefone obrigatório | [ ] |
| C16 | ClientForm | Deve aplicar máscara de telefone brasileiro | [ ] |
| C17 | ClientForm | Deve renderizar campos customizados dinamicamente | [ ] |
| C18 | ClientForm | Deve validar campos customizados obrigatórios | [ ] |
| C19 | BookingSummary | Deve renderizar resumo com todos os dados | [ ] |
| C20 | BookingSummary | Deve formatar data em pt-BR | [ ] |
| C21 | BookingSummary | Deve formatar preço em R$ | [ ] |
| C22 | BookingConfirmation | Deve mostrar mensagem de sucesso | [ ] |
| C23 | BookingConfirmation | Deve exibir detalhes do booking | [ ] |
| C24 | BookingConfirmation | Deve ter link copiável para status | [ ] |

### Admin Components

| # | Componente | Teste | Status |
|---|---|---|---|
| C30 | StatusBadge | Deve renderizar cor correta para cada status | [ ] |
| C31 | StatusBadge | Deve renderizar label em português | [ ] |
| C32 | BookingCard | Deve mostrar serviço, hora e cliente | [ ] |
| C33 | BookingCard | Deve mostrar badge de status | [ ] |
| C34 | BookingActions | Deve mostrar apenas ações válidas para o status atual | [ ] |
| C35 | BookingActions | Deve mostrar "Confirmar" para status scheduled | [ ] |
| C36 | BookingActions | Deve mostrar "Iniciar" para status confirmed | [ ] |
| C37 | BookingActions | Deve mostrar "Concluir" e "No-show" para in_progress | [ ] |
| C38 | BookingActions | Não deve mostrar ações para completed/cancelled/no_show | [ ] |
| C39 | ScheduleGrid | Deve renderizar timeline com horários corretos | [ ] |
| C40 | ScheduleGrid | Deve posicionar bookings no horário correto | [ ] |
| C41 | DataTable | Deve renderizar colunas e linhas | [ ] |
| C42 | DataTable | Deve suportar sorting por coluna | [ ] |
| C43 | DataTable | Deve renderizar botão "Carregar mais" quando hasMore | [ ] |
| C44 | Sidebar | Deve destacar item ativo baseado na rota | [ ] |
| C45 | Sidebar | Deve renderizar todos os links de navegação | [ ] |
| C46 | StatsCard | Deve formatar número corretamente | [ ] |
| C47 | StatsCard | Deve formatar moeda em R$ | [ ] |

### Shared Components

| # | Componente | Teste | Status |
|---|---|---|---|
| C50 | TenantBranding | Deve setar CSS variables com cores do tenant | [ ] |
| C51 | TenantBranding | Deve renderizar logo do tenant | [ ] |
| C52 | EmptyState | Deve renderizar mensagem e ícone | [ ] |
| C53 | Loading | Deve renderizar skeleton com dimensões corretas | [ ] |
| C54 | ErrorBoundary | Deve capturar erro e mostrar fallback | [ ] |

---

## Testes Unitários — Hooks

| # | Hook | Teste | Status |
|---|---|---|---|
| H01 | useTenant | Deve buscar e cachear dados do tenant | [ ] |
| H02 | useTenant | Deve retornar erro para slug inexistente | [ ] |
| H03 | useServices | Deve buscar lista de serviços | [ ] |
| H04 | useAvailability | Deve buscar slots para data e serviço | [ ] |
| H05 | useAvailability | Deve refetch automaticamente (staleTime 30s) | [ ] |
| H06 | useBookings | Deve criar booking via mutation | [ ] |
| H07 | useBookings | Deve listar bookings com filtros | [ ] |
| H08 | useBookings | Deve atualizar status com optimistic update | [ ] |
| H09 | useAuth | Deve fazer login e armazenar tokens | [ ] |
| H10 | useAuth | Deve fazer refresh quando access token expira | [ ] |
| H11 | useAuth | Deve limpar tokens no logout | [ ] |
| H12 | useClients | Deve buscar clientes com busca | [ ] |

---

## Testes Unitários — Utilitários

| # | Utilitário | Teste | Status |
|---|---|---|---|
| U01 | formatDate | Deve formatar ISO date para "15 de jan. de 2025" | [ ] |
| U02 | formatDate | Deve formatar hora para "10:30" | [ ] |
| U03 | formatCurrency | Deve formatar centavos para "R$ 49,90" | [ ] |
| U04 | formatCurrency | Deve formatar zero como "Grátis" | [ ] |
| U05 | validateSlug | Deve aceitar slug válido (lowercase, hyphens) | [ ] |
| U06 | validateSlug | Deve rejeitar slug com caracteres especiais | [ ] |
| U07 | formatPhone | Deve formatar telefone brasileiro (XX) XXXXX-XXXX | [ ] |

---

## Testes de Integração — Fluxos

### Booking Flow Completo

| # | Teste | Status |
|---|---|---|
| F01 | Deve completar booking flow inteiro: serviço → data → slot → dados → confirmação | [ ] |
| F02 | Deve voltar entre steps mantendo seleções anteriores | [ ] |
| F03 | Deve mostrar erro e voltar ao step 3 quando slot está ocupado (409) | [ ] |
| F04 | Deve aplicar branding do tenant (cores, logo) | [ ] |
| F05 | Deve mostrar campos customizados quando serviço tem custom_fields | [ ] |
| F06 | Deve desabilitar botão "Confirmar" durante submit | [ ] |
| F07 | Deve exibir loading nos slots ao trocar data | [ ] |

### Admin Auth Flow

| # | Teste | Status |
|---|---|---|
| F10 | Deve redirecionar para /login quando não autenticado | [ ] |
| F11 | Deve fazer login e redirecionar para /dashboard | [ ] |
| F12 | Deve mostrar erro com credenciais inválidas | [ ] |
| F13 | Deve fazer refresh automático quando token expira | [ ] |
| F14 | Deve redirecionar para /login quando refresh falha | [ ] |

### Admin Booking Management

| # | Teste | Status |
|---|---|---|
| F20 | Deve listar bookings e filtrar por status | [ ] |
| F21 | Deve confirmar booking (scheduled → confirmed) com optimistic update | [ ] |
| F22 | Deve iniciar atendimento (confirmed → in_progress) | [ ] |
| F23 | Deve concluir atendimento (in_progress → completed) | [ ] |
| F24 | Deve cancelar booking | [ ] |
| F25 | Deve reverter optimistic update quando API falha | [ ] |
| F26 | Deve paginar com "Carregar mais" | [ ] |

### Admin Services CRUD

| # | Teste | Status |
|---|---|---|
| F30 | Deve listar serviços do tenant | [ ] |
| F31 | Deve criar serviço via dialog | [ ] |
| F32 | Deve editar serviço existente | [ ] |
| F33 | Deve desativar serviço (soft delete) | [ ] |

### Admin Availability Config

| # | Teste | Status |
|---|---|---|
| F40 | Deve exibir grade semanal atual | [ ] |
| F41 | Deve configurar horários da semana | [ ] |
| F42 | Deve adicionar exceção de bloqueio | [ ] |
| F43 | Deve adicionar exceção com horário especial | [ ] |

---

## Testes E2E (Playwright)

### Booking Flow E2E

| # | Teste | Status |
|---|---|---|
| E01 | Fluxo completo: abrir link → agendar → receber confirmação | [ ] |
| E02 | Verificar que booking aparece no admin após criação | [ ] |
| E03 | Mobile: fluxo completo em viewport 375px | [ ] |
| E04 | Acessibilidade: completar fluxo usando apenas teclado | [ ] |

### Admin E2E

| # | Teste | Status |
|---|---|---|
| E10 | Login → dashboard → confirmar booking → ver status atualizado | [ ] |
| E11 | Criar serviço → verificar que aparece na booking page | [ ] |
| E12 | Configurar disponibilidade → verificar slots na booking page | [ ] |
| E13 | Ciclo completo: booking criado → confirmado → iniciado → concluído | [ ] |

### Performance E2E

| # | Teste | Status |
|---|---|---|
| E20 | Booking page: LCP < 2.0s em 4G simulado | [ ] |
| E21 | Booking page: CLS < 0.1 durante carregamento | [ ] |

---

## Métricas de Cobertura

| Módulo | Alvo | Atual |
|---|---|---|
| `components/booking/` | 90% | — |
| `components/admin/` | 85% | — |
| `lib/hooks/` | 90% | — |
| `lib/utils/` | 95% | — |
| Geral | 80% | — |
