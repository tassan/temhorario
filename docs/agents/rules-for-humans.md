# Rules for Humans — temhorario-engine

> Regras e boas práticas para humanos que trabalham com AI agents (Cursor, Claude Code, etc.) neste projeto.

---

## Filosofia

O agent é um dev junior extremamente rápido, com memória perfeita do que você disse nesta sessão, mas **zero memória de sessões anteriores** (a menos que tenha acesso aos docs). Seu trabalho é dar contexto, revisar output, e tomar decisões.

---

## 1. Antes de Iniciar uma Sessão

### 1.1 Preparar o Contexto

O agent não sabe o que você fez ontem. Antes de pedir qualquer coisa:

- Esteja na branch correta (ou crie uma nova seguindo `docs/git/git-strategy.md`)
- Saiba qual épico e tarefa do backlog você vai trabalhar
- Tenha clareza do que quer: feature, bugfix, refactor, docs, ou chore

### 1.2 Apontar os Docs

Na primeira mensagem da sessão, referenciar os documentos relevantes:

```
"Leia docs/backend/architecture.md e docs/backend/backend-backlog.md. 
Vamos trabalhar no Épico 8: Módulo de Disponibilidade."
```

Isso dá ao agent toda a arquitetura, patterns, e contexto da tarefa de uma vez.

---

## 2. Como Dar Tarefas

### 2.1 Uma Tarefa por Vez

O agent funciona melhor com foco. Não peça 5 coisas de uma vez.

```
❌ "Implementa os endpoints de serviço, recurso e disponibilidade, 
    adiciona testes, atualiza o changelog e o backlog"

✅ "Implementa o endpoint POST /v1/admin/services conforme 
    docs/backend/architecture.md. Inclui validação com Zod, 
    teste de integração, e atualiza o backlog."
```

### 2.2 Ser Específico sobre o Escopo

```
❌ "Adiciona autenticação"

✅ "Implementa o middleware de auth JWT conforme 
    docs/backend/architecture.md seção 'Autenticação'. 
    Deve validar o token, extrair tenantId e userId, 
    e retornar 401 com o formato de erro padrão se inválido."
```

### 2.3 Indicar Restrições

Se há algo que o agent NÃO deve fazer, diga explicitamente:

```
"Implementa o CRUD de serviços. 
NÃO modifique o schema do banco — já está pronto. 
NÃO adicione libs novas."
```

### 2.4 Usar os Templates de Prompt

Consultar `docs/agents/how-to-prompt.md` para templates prontos por tipo de tarefa.

---

## 3. Durante o Trabalho

### 3.1 Revisar Incrementalmente

Não espere o agent terminar tudo para revisar. Peça entregas parciais:

```
"Primeiro, implementa só o service layer do booking. 
Vou revisar antes de prosseguir para as rotas."
```

### 3.2 Verificar Adesão aos Docs

Ao receber código, checar:

- Segue a estrutura de pastas de `architecture.md`?
- Usa as libs corretas (Hono, Drizzle, Zod)?
- Segue os patterns dos módulos já existentes?
- Testes seguem as convenções de `testing.md`?
- Commits seguem Conventional Commits?

### 3.3 Não Aceitar "Funciona" sem Testes

Se o agent diz "pronto" mas não escreveu testes, não aceite:

```
"Falta o teste de integração para race condition (I55 do backend-testing.md). 
Implementa antes de prosseguir."
```

---

## 4. Revisão de Código

### 4.1 O Que Sempre Revisar

- **Schema do banco:** qualquer mudança em schema precisa de atenção especial. Uma migration errada é difícil de reverter
- **Lógica de negócio:** a máquina de status, o algoritmo de slots, e a validação de booking são o coração do produto
- **Segurança:** verificar que inputs são validados, tenant isolation está presente, tokens não são logados
- **Performance:** N+1 queries, queries sem índice, falta de paginação

### 4.2 O Que Pode Confiar (com CI passando)

- Formatação e lint (CI valida)
- Imports e exports (TypeScript valida)
- Tipos (TypeScript strict valida)
- Testes passando (CI valida)

### 4.3 Red Flags

Se o agent fez alguma dessas coisas, pare e revise com cuidado:

- Instalou uma dependência nova
- Criou um diretório que não existe no `architecture.md`
- Mudou o schema do banco
- Ignorou um teste que deveria ter escrito
- Adicionou `// @ts-ignore` ou `as any`
- Removeu ou desabilitou testes existentes

---

## 5. Git e Merge

### 5.1 Responsabilidades do Humano

| Tarefa | Quem faz |
|---|---|
| Criar branch | Humano |
| Escrever código | Agent (com supervisão) |
| Commitar | Agent (seguindo Conventional Commits) |
| Revisar diff | Humano |
| Push | Humano ou Agent (quando confiante) |
| Abrir PR | Humano |
| Aprovar/mergear PR | Humano |
| Apagar branch após merge em `main` (remota + local) | Humano |
| Criar tags e releases | Humano |
| Decidir versão (SemVer) | Humano |

### 5.2 Antes de Mergear

```bash
# Verificar que está tudo certo
npm run lint
npm run typecheck
npm test
npm run build

# Verificar diff completo
git diff main...HEAD

# Verificar que CHANGELOG e backlog foram atualizados
git diff main...HEAD -- CHANGELOG.md docs/
```

### 5.3 Hook `pre-push` e CHANGELOG

Após `npm install`, o Git usa `.githooks/` (`core.hooksPath`). Um **`git push` de branch** que envia alterações a ficheiros **só passa** se `CHANGELOG.md` estiver entre os ficheiros alterados nesse intervalo. Isto evita pushes “só código” sem registo em [keep-changelog.md](../git/keep-changelog.md).

- **Configurar:** `npm install` na raiz (script `prepare`) ou `git config core.hooksPath .githooks`
- **Detalhes e excepções (tags, `SKIP_CHANGELOG_HOOK`):** [git-strategy.md](../git/git-strategy.md#git-hooks-pre-push)

### 5.4 Após merge para `main`

Toda branch integrada em `main` deve ser **removida** (interface do GitHub/GitLab ou `git push origin --delete …`) e a cópia local apagada (`git branch -d …`). Ver [git-strategy.md](../git/git-strategy.md) (regras do modelo de branches e secção «Merge e cleanup»).

---

## 6. Manutenção dos Docs

### 6.1 Docs São Código

Tratar documentação com a mesma seriedade que código. Se a arquitetura muda, os docs precisam mudar junto.

### 6.2 Quando Atualizar

| Evento | Docs para atualizar |
|---|---|
| Feature implementada | Backlog (marcar concluído) + CHANGELOG |
| Bug encontrado | Testing doc (adicionar teste) |
| Decisão de arquitetura | Architecture doc (registrar decisão) |
| Nova lib adicionada | Architecture doc (adicionar na stack) |
| Novo pattern adotado | Rules for agents (adicionar regra) |
| Erro recorrente do agent | Rules for agents (adicionar "não fazer") |

### 6.3 Review dos Docs

A cada 2-4 semanas, revisar:

- Backlog está refletindo a realidade?
- CHANGELOG está sendo mantido?
- Rules for agents precisa de novas regras baseadas em erros recentes?
- Architecture docs ainda correspondem ao código?

---

## 7. Troubleshooting Comum

### Agent está ignorando o pattern existente

Provavelmente não leu os docs. Na próxima mensagem:

```
"Pare. Leia docs/backend/architecture.md, seção 'Camadas da Aplicação'. 
O pattern correto é route → service → schema. 
Refaça seguindo esse pattern."
```

### Agent está inventando libs novas

```
"Não instale libs novas. Este projeto usa [lista das libs]. 
Resolva usando essas. Se realmente não for possível, 
me explique por que antes de instalar qualquer coisa."
```

### Agent está gerando código demais de uma vez

```
"Pare. Vamos ir por partes. 
Primeiro: implementa apenas [parte específica]. 
Vou revisar antes de prosseguir."
```

### Agent esqueceu de atualizar docs

```
"Faltou atualizar o backlog e o CHANGELOG. 
Marque os itens concluídos no backlog 
e adicione a mudança na seção Unreleased do CHANGELOG."
```
