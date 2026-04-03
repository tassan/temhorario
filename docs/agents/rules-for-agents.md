# Rules for Agents — temhorario-engine

> Regras obrigatórias para qualquer AI agent (Cursor, Claude Code, Copilot, etc.) trabalhando neste projeto.

---

## Regra Zero

**Antes de escrever qualquer código, leia a documentação relevante.** Os docs existem para que você não reinvente decisões já tomadas.

### Docs obrigatórios por tipo de tarefa

| Tarefa | Ler antes |
|---|---|
| Qualquer coisa de backend | `docs/backend/architecture.md` |
| Qualquer coisa de frontend | `docs/frontend/architecture.md` + `docs/frontend/design-principles.md` |
| Criar/modificar fluxo | `docs/backend/flows.md` ou `docs/frontend/flows.md` |
| Escrever testes | `docs/backend/backend-testing.md` ou `docs/frontend/frontend-testing.md` |
| Commits e branches | `docs/git/git-strategy.md` |
| Atualizar changelog | `docs/git/keep-changelog.md` |
| Versão e releases | `docs/git/semver.md` |

---

## 1. Código

### 1.1 Estilo e Consistência

- TypeScript strict mode — sem `any` exceto quando absolutamente necessário (e com comentário explicando)
- Seguir os patterns já existentes no codebase. Olhar código próximo antes de criar algo novo
- Nomear variáveis e funções em inglês. Comentários podem ser em português
- Preferir funções pequenas e puras a classes grandes
- Um arquivo = uma responsabilidade. Se o arquivo passa de 200 linhas, provavelmente precisa ser dividido

### 1.2 Não Inventar

- Usar as libs definidas na arquitetura (Hono, Drizzle, Zod, React Query, shadcn/ui). Não introduzir libs novas sem aprovação explícita do humano
- Seguir a estrutura de pastas definida em `architecture.md`. Não criar diretórios novos por conta própria
- Seguir os patterns existentes de route → service → schema. Não criar abstrações novas

### 1.3 Segurança

- Nunca hardcodar secrets, tokens, ou senhas. Usar variáveis de ambiente
- Nunca logar dados sensíveis (tokens, senhas, dados pessoais de clientes)
- Todo input de usuário é validado com Zod antes de chegar no service
- Todo acesso a dados inclui `tenantId` — nunca fazer query sem isolamento de tenant

---

## 2. Testes

### 2.1 Regras

- Toda feature nova precisa de testes. Sem exceção
- Bug fix precisa de teste que reproduz o bug antes de corrigir
- Consultar `backend-testing.md` ou `frontend-testing.md` para ver se o teste já está mapeado
- Nomear testes em português com `it('deve ...')`
- Testes devem ser independentes — não depender da ordem de execução

### 2.2 O Que Testar

- Happy path (funciona como esperado)
- Validação de input (rejeitar dados inválidos)
- Casos de borda (lista vazia, valor zero, string vazia)
- Isolamento de tenant (não vazar dados entre tenants)
- Transições de status (apenas transições válidas)

### 2.3 O Que Não Testar

- Implementação interna (não testar métodos privados)
- Libs de terceiros (não testar se o Drizzle faz INSERT corretamente)
- Snapshot tests de HTML/JSX (frágeis, pouco valor)

---

## 3. Git

### 3.1 Commits

- Formato Conventional Commits: `tipo(escopo): descrição`
- Um commit por mudança lógica. Não misturar feature + refactor + test no mesmo commit
- Mensagem no imperativo: "add booking validation", não "added" ou "adding"
- Se o commit é parte de uma tarefa maior, o escopo identifica o módulo: `feat(bookings)`, `fix(availability)`

### 3.2 Branches

- Não criar branches — trabalhar na branch que o humano criou ou indicou
- Se o humano não especificou branch, perguntar antes de commitar
- Após merge para `main`, a branch de feature deve ser **eliminada** (remota e local) — ver `docs/git/git-strategy.md`. Não deixar branches mergeadas abertas; lembrar o humano se o merge foi feito e a branch ainda existir

### 3.3 Push e CHANGELOG (hook `pre-push`)

- O repositório define `core.hooksPath=.githooks`. O hook **pre-push** bloqueia `git push` de branches quando o intervalo a enviar altera ficheiros mas **não inclui `CHANGELOG.md`**
- Antes de um push, o conjunto de commits a enviar deve incluir alterações a `CHANGELOG.md` sempre que há outras alterações — ver `docs/git/git-strategy.md` (secção Git hooks)
- Não recomendar `SKIP_CHANGELOG_HOOK=1` salvo o humano pedir explicitamente (ex.: emergência)

### 3.4 O Que Nunca Fazer

- Nunca fazer `git push` para `main` diretamente
- Nunca fazer `git force push` sem aprovação explícita
- Nunca alterar histórico de commits que já foram pusheados
- Nunca deletar branches que **não** foram mergeadas (sem confirmação explícita do humano)

---

## 4. Documentação

### 4.1 Atualizar Backlogs

Ao completar uma tarefa:

1. Abrir `docs/backend/backend-backlog.md` ou `docs/frontend/frontend-backlog.md`
2. Encontrar o item correspondente
3. Marcar como concluído: `- [x] ~~Descrição~~ — 2025-XX-XX`
4. Adicionar notas se houve decisão relevante
5. Se surgiram novos itens, adicionar na seção correta

### 4.2 Atualizar CHANGELOG

Se a mudança é notável (ver critérios em `docs/git/keep-changelog.md`):

1. Abrir `CHANGELOG.md`
2. Adicionar na seção `[Unreleased]`, na categoria correta
3. Seguir o formato dos exemplos existentes

Além disso, o **pre-push** exige que `CHANGELOG.md` conste entre os ficheiros alterados em qualquer push de branch que modifique outros ficheiros (ver `docs/git/keep-changelog.md` e `docs/git/git-strategy.md`).

### 4.3 Atualizar Testes

Ao implementar feature ou fix:

1. Consultar `backend-testing.md` ou `frontend-testing.md`
2. Encontrar o teste correspondente
3. Implementar o teste
4. Marcar como concluído na doc

---

## 5. Comunicação

### 5.1 Quando Parar e Perguntar

- A tarefa é ambígua e pode ser interpretada de mais de uma forma
- A implementação exige introduzir uma lib ou dependência nova
- A implementação exige mudar a estrutura de pastas
- A implementação exige mudar o schema do banco
- O código existente parece ter um bug que não faz parte da tarefa atual
- Os testes existentes estão falhando antes de qualquer mudança

### 5.2 Quando Prosseguir sem Perguntar

- A tarefa está clara e alinhada com a documentação
- A implementação segue os patterns existentes
- Os testes passam
- A mudança está dentro do escopo solicitado

### 5.3 Ao Concluir Tarefa

Sempre reportar:

1. O que foi feito (resumo de 2-3 frases)
2. Arquivos criados ou modificados
3. Testes adicionados
4. Se o CHANGELOG e backlog foram atualizados
5. Se há algo que precisa de revisão especial ou decisão humana

---

## 6. Qualidade

### 6.1 Checklist Antes de Entregar

- [ ] Código compila sem erros (`tsc --noEmit`)
- [ ] Lint passa (`npm run lint`)
- [ ] Testes passam (`npm test`)
- [ ] Nenhum `console.log` de debug deixado no código
- [ ] Nenhum `TODO` adicionado sem contexto (se for TODO, incluir descrição do que falta)
- [ ] Nenhum `any` adicionado sem comentário explicando
- [ ] Backlog atualizado
- [ ] CHANGELOG atualizado (notável + obrigatório quando o push altera outros ficheiros — hook `pre-push`)
- [ ] Nomes de variáveis e funções são claros e descritivos

### 6.2 Preferências de Código

```typescript
// ✅ Prefer
const isAvailable = slots.some(s => s.available);
if (!isAvailable) throw new SlotUnavailableError();

// ❌ Avoid
const available = slots.filter(s => s.available === true);
if (available.length === 0) {
  throw new Error('Slot unavailable');
}
```

```typescript
// ✅ Prefer — early return
function getBooking(id: string, tenantId: string) {
  const booking = await db.query(...)
  if (!booking) throw new NotFoundError('Booking');
  if (booking.tenantId !== tenantId) throw new ForbiddenError();
  return booking;
}

// ❌ Avoid — nested ifs
function getBooking(id: string, tenantId: string) {
  const booking = await db.query(...)
  if (booking) {
    if (booking.tenantId === tenantId) {
      return booking;
    } else {
      throw new ForbiddenError();
    }
  } else {
    throw new NotFoundError('Booking');
  }
}
```

```typescript
// ✅ Prefer — explicit types no boundary
export function createBooking(tenantId: string, input: CreateBookingInput): Promise<Booking> {

// ❌ Avoid — inferred return type em funções públicas
export function createBooking(tenantId: string, input: CreateBookingInput) {
```
