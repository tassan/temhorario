# How to Prompt — temhorario-engine

> Templates e orientações para escrever prompts eficientes ao trabalhar com AI agents neste projeto.

---

## Anatomia de um Bom Prompt

Todo prompt para este projeto segue a mesma estrutura:

```
1. CONTEXTO    → Quais docs ler + estado atual
2. TAREFA      → O que fazer (específico e escopo claro)
3. RESTRIÇÕES  → O que NÃO fazer
4. ENTREGÁVEIS → O que é esperado como output
```

---

## Feature Prompt

Usar quando implementar funcionalidade nova (endpoint, módulo, componente, página).

### Template

```
## Contexto
Leia os seguintes documentos:
- docs/backend/architecture.md (ou frontend)
- docs/backend/flows.md (fluxo relevante)
- docs/backend/backend-backlog.md (épico e tarefa específica)
- docs/backend/backend-testing.md (testes mapeados)

Estamos trabalhando no Épico [N]: [Nome do Épico].

## Tarefa
Implementar [descrição clara da funcionalidade].

Especificamente:
- [Detalhe 1: endpoint, componente, ou lógica]
- [Detalhe 2]
- [Detalhe 3]

Seguir o pattern dos módulos já existentes em src/modules/.

## Restrições
- NÃO instalar dependências novas
- NÃO modificar o schema do banco (já está pronto)
- NÃO modificar módulos que não fazem parte desta tarefa
- Seguir os tipos e interfaces definidos em architecture.md

## Entregáveis
1. Código da funcionalidade
2. Testes (consultar backend-testing.md para os testes mapeados)
3. Atualizar backend-backlog.md (marcar itens concluídos)
4. Atualizar CHANGELOG.md seção [Unreleased] se aplicável
```

### Exemplo Real: Implementar CRUD de Serviços

```
## Contexto
Leia:
- docs/backend/architecture.md
- docs/backend/backend-backlog.md → Épico 6: Módulo de Serviços
- docs/backend/backend-testing.md → Testes I20 a I27

O schema Drizzle das tabelas já está criado em src/db/schema/services.ts.
O middleware de auth e tenant já estão funcionando.

## Tarefa
Implementar o módulo de serviços completo:
- src/modules/services/services.schema.ts → Zod schemas de request/response
- src/modules/services/services.service.ts → Lógica de negócio (CRUD)
- src/modules/services/services.routes.ts → Endpoints (público + admin)

Endpoints:
- GET /v1/admin/services → listar serviços do tenant (requer auth)
- POST /v1/admin/services → criar serviço (requer auth)
- PUT /v1/admin/services/:id → atualizar (requer auth)
- DELETE /v1/admin/services/:id → soft delete, active=false (requer auth)
- GET /v1/:slug/services → listar serviços ativos (público)

Seguir o pattern exato do módulo de tenants que já existe.

## Restrições
- NÃO modificar src/db/schema/ — usar o schema existente
- NÃO instalar libs novas
- Soft delete: DELETE seta active=false, não remove do banco

## Entregáveis
1. Três arquivos: schema, service, routes
2. Registrar as rotas no app principal (src/index.ts)
3. Testes de integração (I20 a I27)
4. Atualizar backend-backlog.md → Épico 6
5. Adicionar em CHANGELOG.md [Unreleased] → Added
```

---

## Bugfix Prompt

Usar quando corrigir um bug identificado.

### Template

```
## Contexto
Leia:
- docs/backend/architecture.md (ou frontend)
- [doc de testing relevante]

Branch atual: fix/[nome-descritivo]

## Bug
Descrição: [O que está acontecendo de errado]
Esperado: [O que deveria acontecer]
Como reproduzir: [Passos ou cenário]
Onde provavelmente está: [Arquivo ou módulo suspeito, se souber]

## Tarefa
1. Primeiro: escrever um teste que reproduz o bug (o teste deve FALHAR antes do fix)
2. Depois: corrigir o bug
3. Verificar que o teste agora passa

## Restrições
- Corrigir APENAS o bug. Não refatorar código adjacente
- Não introduzir mudanças de comportamento além do fix
- Se o fix requer mudança no schema, PARE e me avise antes

## Entregáveis
1. Teste que reproduz o bug
2. Fix mínimo
3. Verificação de que todos os testes passam
4. Atualizar CHANGELOG.md [Unreleased] → Fixed
5. Marcar teste como concluído no testing doc (se existir mapeado)
```

### Exemplo Real: Race Condition na Criação de Booking

```
## Contexto
Leia docs/backend/architecture.md, seção "Lógica Core: Geração de Slots".
Leia docs/backend/backend-testing.md, teste I55.

Branch: fix/booking-race-condition

## Bug
Descrição: Dois requests simultâneos para o mesmo slot conseguem criar 
dois bookings. O segundo deveria receber 409 SLOT_UNAVAILABLE.

Esperado: Apenas o primeiro request cria o booking. O segundo recebe 409.

Como reproduzir: Disparar dois POST /v1/{slug}/bookings com os mesmos 
dados (mesmo slot) ao mesmo tempo.

Onde provavelmente está: src/modules/bookings/bookings.service.ts — 
falta SELECT FOR UPDATE na verificação de disponibilidade.

## Tarefa
1. Escrever teste I55 que dispara dois requests simultâneos ao mesmo slot
2. Corrigir com SELECT FOR UPDATE dentro de uma transaction
3. Garantir que o primeiro request retorna 201 e o segundo retorna 409

## Restrições
- Fix APENAS na verificação de slot. Não mudar o fluxo geral de booking
- Não adicionar locks globais — o lock deve ser no nível do slot/resource

## Entregáveis
1. Teste I55 implementado
2. Fix no service layer
3. Todos os testes passando
4. CHANGELOG [Unreleased] → Fixed: race condition na criação de booking
```

---

## Documentation Prompt

Usar quando atualizar ou criar documentação.

### Template

```
## Contexto
Leia:
- [Docs relevantes existentes]
- [Código fonte que precisa ser documentado]

## Tarefa
[Descrever o que precisa ser documentado]

Formato: seguir o estilo dos documentos existentes em docs/.

## Restrições
- Manter português como idioma principal dos docs
- Código e nomes técnicos em inglês
- Não inventar funcionalidades que não existem — documentar o que está implementado
- Manter consistência com a terminologia existente

## Entregáveis
1. Documento criado ou atualizado
2. Se atualização, indicar o que mudou
```

### Exemplo Real: Documentar Novo Endpoint

```
## Contexto
Leia docs/backend/flows.md para ver o formato dos fluxos existentes.
O módulo de webhooks foi implementado em src/modules/webhooks/.

## Tarefa
Adicionar um novo diagrama Mermaid em docs/backend/flows.md 
documentando o fluxo de registro e disparo de webhooks.

Incluir:
- Fluxo de registro de webhook URL por tenant
- Fluxo de disparo quando um booking muda de status
- Fluxo de retry quando o target falha

Seguir o mesmo formato dos diagramas existentes (sequenceDiagram).

## Restrições
- Não modificar diagramas existentes
- Adicionar no final do arquivo, antes de qualquer seção de referência
- Basear nos endpoints reais implementados (verificar routes.ts)

## Entregáveis
1. flows.md atualizado com os novos diagramas
```

---

## Chore Prompt

Usar para tarefas de manutenção: atualizar deps, configurar CI, setup de ferramentas, refactor.

### Template

```
## Contexto
Leia:
- [Doc relevante]
- [Estado atual da configuração]

## Tarefa
[Descrever a tarefa de manutenção]

## Restrições
- [Restrições específicas]
- Se atualizar dependências: rodar testes após cada atualização
- Se configurar CI: não modificar código da aplicação

## Entregáveis
1. [O que deve existir quando terminar]
2. Todos os testes passando
```

### Exemplo Real: Setup do Projeto

```
## Contexto
Leia docs/backend/architecture.md completo.
Leia docs/backend/backend-backlog.md → Épico 1: Fundação do Projeto.

Este é o setup inicial — o repo está vazio.

## Tarefa
Inicializar o projeto backend conforme architecture.md:

1. npm init com TypeScript strict
2. Instalar dependências: hono, drizzle-orm, postgres, zod, bcryptjs, jsonwebtoken
3. Instalar devDependencies: vitest, supertest, typescript, @types/*, drizzle-kit, eslint, prettier
4. Configurar tsconfig.json (strict, paths, module resolution)
5. Criar docker-compose.yml (PostgreSQL 16 + Redis 7)
6. Criar .env.example conforme architecture.md
7. Configurar Vitest (vitest.config.ts)
8. Criar estrutura de pastas conforme architecture.md (vazias, com index.ts de re-export)
9. Criar entry point src/index.ts com Hono básico (health check em GET /)
10. Configurar scripts no package.json: dev, build, test, lint, typecheck

## Restrições
- Usar EXATAMENTE as versões mais recentes estáveis das libs
- Não adicionar libs além das listadas
- Não escrever lógica de negócio — apenas setup
- docker-compose: usar volumes nomeados, não bind mounts para dados

## Entregáveis
1. Projeto funcional: `npm run dev` sobe o servidor
2. `npm test` roda (mesmo sem testes, Vitest deve funcionar)
3. `npm run lint` roda sem erros
4. `docker compose up` sobe PostgreSQL e Redis
5. Atualizar backend-backlog.md → Épico 1 (marcar tudo concluído)
```

---

## Refactor Prompt

Usar para reestruturar código sem mudar comportamento externo.

### Template

```
## Contexto
Leia:
- [Docs de arquitetura]
- [Código atual que será refatorado]

## Tarefa
Refatorar [o que] para [objetivo].

Motivação: [Por que estamos refatorando]

## Restrições
- NENHUMA mudança de comportamento externo
- Todos os testes existentes DEVEM continuar passando sem modificação
- Se um teste precisa mudar, isso indica mudança de comportamento — pare e avise

## Entregáveis
1. Código refatorado
2. Todos os testes passando (sem modificação nos testes)
3. Se houver melhoria possível nos testes, sugerir (não implementar sem aprovação)
```

---

## Test Prompt

Usar quando o foco é escrever testes, não funcionalidades.

### Template

```
## Contexto
Leia:
- docs/backend/backend-testing.md (ou frontend)
- [Código que será testado]

## Tarefa
Implementar os seguintes testes:
- [ID e descrição do teste 1]
- [ID e descrição do teste 2]
- [...]

Consultar backend-testing.md para os cenários detalhados.

## Restrições
- NÃO modificar o código de produção. Apenas escrever testes.
- Se descobrir um bug durante os testes, reportar (não corrigir)
- Testes devem ser independentes (não depender de ordem)
- Nomear em português: it('deve ...')

## Entregáveis
1. Arquivos de teste implementados
2. Todos os testes passando
3. Marcar como concluído no testing doc
4. Se descobriu bugs, listar no final do report
```

---

## Dicas Gerais

### Menos é Mais

Prompts curtos e claros funcionam melhor que prompts longos e ambíguos:

```
❌ "Implementa o módulo de bookings inteiro com tudo que está na spec, 
    incluindo todos os endpoints, validações, testes, atualização de docs, 
    e qualquer outra coisa que achar necessário"

✅ "Implementa POST /v1/{slug}/bookings conforme architecture.md. 
    Inclui validação de slot e teste I50."
```

### Referenciar, Não Repetir

Os docs existem para não precisar repetir contexto. Referencie:

```
❌ "O booking tem esses status: scheduled, confirmed, in_progress, 
    completed, cancelled, no_show. As transições permitidas são..."

✅ "Seguir a máquina de status definida em docs/backend/architecture.md, 
    seção 'Máquina de Status do Booking'."
```

### Iterar, Não Corrigir

Se o output não ficou bom, não tente "consertar" com instruções acumulativas. Reformule:

```
❌ "Na verdade, muda isso... e também aquilo... e espera, 
    o que eu quis dizer era..."

✅ "Descarta o que fizemos. Vamos recomeçar. 
    [Novo prompt claro e completo]"
```

### Proteger o Que Funciona

Sempre que pedir mudanças em código existente:

```
"Antes de qualquer mudança, roda os testes e confirma que estão passando. 
Após a mudança, roda novamente. Se algo quebrou, reverte."
```
