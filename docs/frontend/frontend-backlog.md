# Frontend Backlog — agenda-engine

> **⚠️ INSTRUÇÃO PARA AI AGENTS (Cursor / Claude Code):**
> Este arquivo é a fonte de verdade do progresso do frontend. Ao completar qualquer tarefa:
> 1. Mova o item de "A Fazer" para "Concluído" com a data
> 2. Adicione notas relevantes sobre decisões tomadas
> 3. Se surgirem novos itens durante o trabalho, adicione em "A Fazer"
> 4. Se encontrar bugs ou débitos técnicos, adicione em "Débito Técnico"

---

## Status Geral

| Métrica | Valor |
|---|---|
| Sprint atual | Setup inicial |
| Última atualização | _Pendente primeiro commit_ |
| Itens concluídos | 0 |
| Itens em andamento | 0 |
| Itens a fazer | Total abaixo |

---

## Épico 1: Fundação do Projeto

### A Fazer

- [ ] Inicializar projeto Next.js 14+ com App Router e TypeScript strict
- [ ] Configurar Tailwind CSS 4
- [ ] Instalar e configurar shadcn/ui (base components)
- [ ] Configurar React Query (TanStack Query) provider
- [ ] Criar API client base (`lib/api/client.ts`) com interceptors de auth
- [ ] Criar API client público (`lib/api/public.ts`)
- [ ] Criar API client admin (`lib/api/admin.ts`)
- [ ] Definir tipos TypeScript da API (`lib/api/types.ts`)
- [ ] Configurar variáveis de ambiente (`NEXT_PUBLIC_API_URL`)
- [ ] Configurar ESLint + Prettier
- [ ] Configurar Vitest + React Testing Library
- [ ] Configurar Playwright para E2E
- [ ] Criar layout raiz (`app/layout.tsx`) com providers

### Concluído

_(vazio)_

---

## Épico 2: Booking Page — Infraestrutura

### A Fazer

- [ ] Criar rota `app/(public)/[slug]/page.tsx` — landing do tenant
- [ ] Criar rota `app/(public)/[slug]/agendar/page.tsx` — booking flow
- [ ] Criar rota `app/(public)/[slug]/booking/[id]/page.tsx` — confirmação
- [ ] Implementar `tenant-branding.tsx` — aplica cores/logo do tenant via CSS vars
- [ ] Implementar hook `use-tenant.ts` — GET /v1/{slug}/info
- [ ] SSR: carregar tenant info no server (metadata, branding)
- [ ] Configurar CSS variables para theming dinâmico no Tailwind
- [ ] Layout mobile-first para booking page

### Concluído

_(vazio)_

---

## Épico 3: Booking Flow — Steps

### A Fazer

- [ ] Implementar step machine (gerenciar estado do fluxo: step atual, seleções)
- [ ] Implementar `service-picker.tsx` — Step 1: seleção de serviço
  - [ ] Cards com nome, duração, preço
  - [ ] Destaque no card selecionado
  - [ ] Hook `use-services.ts` — GET /v1/{slug}/services
- [ ] Implementar `date-picker.tsx` — Step 2: seleção de data
  - [ ] Calendário mensal
  - [ ] Desabilitar datas passadas e sem disponibilidade
  - [ ] Navegação entre meses
- [ ] Implementar `slot-picker.tsx` — Step 3: seleção de horário
  - [ ] Grade de horários disponíveis
  - [ ] Hook `use-availability.ts` — GET /v1/{slug}/availability
  - [ ] Loading state enquanto carrega slots
  - [ ] Mensagem de "nenhum horário disponível" quando vazio
- [ ] Implementar `client-form.tsx` — Step 4: dados do cliente
  - [ ] Campos: nome, telefone (obrigatórios)
  - [ ] Campos customizados do serviço (dinâmicos)
  - [ ] Validação com React Hook Form + Zod
  - [ ] Máscara de telefone brasileiro
- [ ] Implementar `booking-summary.tsx` — Step 5: revisão
  - [ ] Resumo: serviço + data + hora + dados do cliente
  - [ ] Botão "Confirmar Agendamento"
  - [ ] Botão "Voltar" para editar
- [ ] Implementar `booking-confirmation.tsx` — Tela de sucesso
  - [ ] Ícone de sucesso + mensagem
  - [ ] Detalhes do agendamento
  - [ ] Link compartilhável para status
- [ ] Implementar tratamento de erro 409 (slot ocupado) — volta pro step 3
- [ ] Navegação entre steps (próximo, voltar)
- [ ] Progress indicator (step 1 de 5)
- [ ] Animações de transição entre steps

### Concluído

_(vazio)_

---

## Épico 4: Status do Booking (Público)

### A Fazer

- [ ] Implementar página de status `/[slug]/booking/[id]`
- [ ] GET /v1/{slug}/bookings/{id} — buscar dados
- [ ] Exibir status com ícone e cor correspondente
- [ ] Exibir detalhes: serviço, data, hora
- [ ] Design responsivo e branded (cores do tenant)

### Concluído

_(vazio)_

---

## Épico 5: Admin — Auth e Layout

### A Fazer

- [ ] Implementar `/login` page — formulário email + senha
- [ ] Implementar hook `use-auth.ts` — login, logout, refresh, user state
- [ ] Implementar Auth Context/Provider — armazena tokens, user info
- [ ] Implementar auth guard no layout admin — redirect se não autenticado
- [ ] Implementar interceptor de refresh token no API client
- [ ] Implementar `sidebar.tsx` — navegação principal
  - [ ] Links: Dashboard, Agenda, Bookings, Clientes, Serviços, Recursos, Disponibilidade, Relatórios, Configurações
  - [ ] Ícones por seção
  - [ ] Indicador de rota ativa
  - [ ] Drawer em mobile
- [ ] Implementar `header.tsx` — nome do tenant, avatar do user, logout
- [ ] Layout admin: sidebar + header + content area

### Concluído

_(vazio)_

---

## Épico 6: Admin — Dashboard

### A Fazer

- [ ] Implementar `/dashboard` page — visão geral do dia
- [ ] Cards de métricas: total bookings, receita, próximo atendimento, taxa de ocupação
- [ ] Timeline do dia: bookings ordenados por horário
- [ ] Booking card na timeline com status badge
- [ ] Quick actions: confirmar, iniciar, concluir direto da timeline
- [ ] Optimistic updates nas ações
- [ ] Auto-refresh a cada 15s

### Concluído

_(vazio)_

---

## Épico 7: Admin — Agenda Visual

### A Fazer

- [ ] Implementar `/agenda` page
- [ ] Toggle: vista dia / vista semana
- [ ] Vista dia: timeline vertical com colunas por resource
- [ ] Vista semana: 7 colunas com bookings empilhados
- [ ] `schedule-grid.tsx` — grid responsivo de horários
- [ ] `booking-card.tsx` — card posicionado por horário com cor por status
- [ ] `status-badge.tsx` — badge colorido (scheduled=azul, confirmed=verde, etc.)
- [ ] Clique no booking → slide-over com detalhes
- [ ] `booking-actions.tsx` — botões de ação contextual por status
- [ ] Navegação entre dias/semanas (anterior, próximo, hoje)
- [ ] Indicador de "agora" na timeline

### Concluído

_(vazio)_

---

## Épico 8: Admin — Bookings

### A Fazer

- [ ] Implementar `/bookings` page — lista com filtros
- [ ] `data-table.tsx` — tabela genérica com sorting e paginação
- [ ] Filtros: range de data, status (multi-select), serviço, busca por cliente
- [ ] Cursor-based pagination ("Carregar mais")
- [ ] Clique na linha → detalhe do booking
- [ ] Detalhe: dados do serviço, cliente, metadata, histórico de status
- [ ] Ações: mudar status, cancelar
- [ ] Optimistic updates

### Concluído

_(vazio)_

---

## Épico 9: Admin — Clientes

### A Fazer

- [ ] Implementar `/clients` page — lista com busca
- [ ] Hook `use-clients.ts` — GET /admin/clients com busca e paginação
- [ ] Busca por nome ou telefone
- [ ] Card de cliente: nome, telefone, total de visitas, última visita
- [ ] Detalhe do cliente: `/clients/[id]`
- [ ] Timeline de bookings do cliente (histórico)

### Concluído

_(vazio)_

---

## Épico 10: Admin — Serviços

### A Fazer

- [ ] Implementar `/services` page
- [ ] Lista de serviços com cards
- [ ] Dialog: criar serviço (nome, duração, preço)
- [ ] Dialog: editar serviço
- [ ] Suporte a custom fields (adicionar/remover campos extras)
- [ ] Toggle de ativo/inativo (soft delete)
- [ ] Drag-and-drop para reordenar (sort_order)
- [ ] Hook `use-services.ts` para admin — CRUD completo

### Concluído

_(vazio)_

---

## Épico 11: Admin — Recursos

### A Fazer

- [ ] Implementar `/resources` page
- [ ] Lista de recursos com cards
- [ ] Dialog: criar recurso (nome, tipo)
- [ ] Dialog: editar recurso
- [ ] Associação resource ↔ services (checkboxes)
- [ ] Toggle ativo/inativo

### Concluído

_(vazio)_

---

## Épico 12: Admin — Disponibilidade

### A Fazer

- [ ] Implementar `/availability` page
- [ ] Grid visual: 7 dias x faixas horárias
- [ ] Modal: configurar horário semanal
  - [ ] Toggle por dia (ativo/inativo)
  - [ ] Horário de início e fim por dia
  - [ ] Suporte a múltiplas janelas por dia (ex: manhã + tarde)
- [ ] Modal: adicionar exceção
  - [ ] Date picker para selecionar data
  - [ ] Opção: dia bloqueado ou horário especial
- [ ] Lista de exceções ativas com opção de remover
- [ ] Preview: como a disponibilidade fica pra o cliente

### Concluído

_(vazio)_

---

## Épico 13: Admin — Relatórios

### A Fazer

- [ ] Implementar `/reports` page
- [ ] Seletor de período (dia, semana, mês, custom range)
- [ ] Cards de métricas: bookings, receita, cancelamentos, no-shows
- [ ] Gráfico: bookings por dia (bar chart)
- [ ] Gráfico: distribuição por status (pie/donut)
- [ ] Top serviços por volume
- [ ] Top clientes por frequência

### Concluído

_(vazio)_

---

## Épico 14: Admin — Configurações

### A Fazer

- [ ] Implementar `/settings` page
- [ ] Seção: Dados do negócio (nome, slug)
- [ ] Seção: Branding (logo, cor primária, cor de destaque)
  - [ ] Color picker
  - [ ] Upload de logo
  - [ ] Preview em tempo real
- [ ] Seção: Regras de booking (intervalo de slots, buffer, antecedência)
- [ ] Seção: Webhooks (futuramente — registrar URLs)
- [ ] Seção: API keys (futuramente — gerar e revogar)

### Concluído

_(vazio)_

---

## Épico 15: Acessibilidade e Polish

### A Fazer

- [ ] Todos os componentes com aria labels corretos
- [ ] Navegação por teclado no booking flow
- [ ] Focus management nas transições de step
- [ ] Contraste mínimo WCAG AA em todas as cores
- [ ] Loading skeletons em todas as telas
- [ ] Empty states com ilustração e CTA
- [ ] Toast notifications para ações (sucesso, erro)
- [ ] Error boundaries por seção

### Concluído

_(vazio)_

---

## Débito Técnico

| Item | Prioridade | Contexto |
|---|---|---|
| _(vazio)_ | | |

---

## Decisões de Design/Arquitetura (Log)

| # | Data | Decisão | Contexto |
|---|---|---|---|
| 1 | — | shadcn/ui como base | Acessível, customizável, sem vendor lock |
| 2 | — | Booking como steps em single page | Mantém estado sem server roundtrips |
| 3 | — | React Query para server state | Cache, optimistic updates, refetch automático |
| 4 | — | Theming via CSS variables | Branding dinâmico por tenant sem rebuild |
