# Git Strategy — temhorario-engine

> Baseado nos princípios de [Trunk Based Development](https://trunkbaseddevelopment.com).

---

## Princípio Central

Existe uma única branch de longa duração: `main` (o trunk). Todo código vai para `main`. Branches de feature são **curtas** (máximo 1-2 dias) e **individuais** (produto de um único dev ou sessão de pair/mob). Nenhuma branch de longa duração é permitida.

---

## Modelo de Branches

```
main (trunk) ─────●────●────●────●────●────●────●────●──→
                  ↑    ↑         ↑              ↑
                  │    │         │              │
feat/booking-api ─┘    │    fix/slot-race ──────┘
(1 dia)                │    (horas)
                       │
          feat/status-machine ─┘
          (1 dia)
```

### Regras

1. **`main` é sempre deployable.** Se `main` está quebrada, tudo para até consertar.
2. **Branches de feature duram no máximo 2 dias.** Se não dá pra completar em 2 dias, quebre a tarefa em partes menores.
3. **Uma branch por dev por vez.** Não acumular branches abertas.
4. **Merge via Pull Request** (mesmo trabalhando solo — o PR é o registro e ponto de CI).
5. **Squash merge** como padrão — mantém o histórico de `main` limpo.
6. **Delete branch após merge** — branches mergeadas são lixo.

---

## Nomenclatura de Branches

```
{tipo}/{descrição-curta}
```

| Tipo | Quando usar | Exemplos |
|---|---|---|
| `feat/` | Nova funcionalidade | `feat/booking-api`, `feat/slot-picker` |
| `fix/` | Correção de bug | `fix/slot-race-condition`, `fix/auth-refresh` |
| `chore/` | Manutenção, config, deps | `chore/setup-vitest`, `chore/update-deps` |
| `docs/` | Apenas documentação | `docs/api-endpoints`, `docs/readme` |
| `refactor/` | Reestruturação sem mudar comportamento | `refactor/extract-slots-lib` |

**Regras do nome:**
- Lowercase sempre
- Separado por hyphens (kebab-case)
- Máximo ~40 caracteres na descrição
- Sem número de issue no nome da branch (vai no commit/PR)

---

## Commits

### Formato: Conventional Commits

```
{tipo}({escopo}): {descrição}

[corpo opcional]

[footer opcional]
```

### Exemplos

```
feat(bookings): add slot availability check before creating booking

fix(availability): handle timezone offset in slot generation

chore(deps): update drizzle-orm to 0.30.0

docs(api): document webhook retry policy

refactor(auth): extract token validation to middleware

test(bookings): add integration tests for race condition scenario
```

### Tipos de Commit

| Tipo | Descrição | Bumpa SemVer? |
|---|---|---|
| `feat` | Nova funcionalidade | MINOR |
| `fix` | Correção de bug | PATCH |
| `chore` | Manutenção (deps, config, CI) | — |
| `docs` | Documentação | — |
| `refactor` | Reestruturação sem mudar comportamento | — |
| `test` | Adição/correção de testes | — |
| `perf` | Melhoria de performance | PATCH |
| `ci` | Mudança em CI/CD | — |

### Breaking Changes

Qualquer commit pode ter breaking change. Indicar com `!` após o tipo ou com footer `BREAKING CHANGE:`:

```
feat(bookings)!: change booking response format to include resource details

BREAKING CHANGE: booking response now includes nested resource object instead of resource_id string.
```

---

## Pull Requests

### Quando abrir

- **Sempre.** Mesmo para mudanças de 1 linha.
- O PR é o registro da mudança, o ponto de CI, e o lugar onde a decisão é documentada.

### Template de PR

```markdown
## O que muda

[Descrição clara do que foi feito e por que]

## Como testar

[Passos para verificar que funciona]

## Checklist

- [ ] Testes passando
- [ ] Lint passando
- [ ] CHANGELOG.md atualizado (se relevante)
- [ ] Documentação atualizada (se relevante)
- [ ] Backlog atualizado
```

### Merge Strategy

- **Squash and merge** como padrão
- Título do squash: segue Conventional Commits
- Corpo do squash: resume o que o PR fez (não lista de commits intermediários)

---

## Fluxo de Trabalho (Dia a Dia)

### 1. Iniciar uma tarefa

```bash
# Garantir que main está atualizada
git checkout main
git pull origin main

# Criar branch a partir de main
git checkout -b feat/nome-da-feature
```

### 2. Trabalhar na feature

```bash
# Commits frequentes e pequenos
git add .
git commit -m "feat(modulo): descrição do progresso"

# Push frequente (backup + CI)
git push origin feat/nome-da-feature
```

### 3. Manter sincronizado com main

```bash
# Se main avançou enquanto você trabalhava:
git fetch origin
git rebase origin/main

# Resolver conflitos se houver, depois:
git push --force-with-lease
```

**Importante:** Usar `rebase` (não merge) para manter histórico linear. Usar `--force-with-lease` (não `--force`) para segurança.

### 4. Abrir PR

- Abrir PR no GitHub quando o trabalho está pronto (ou antes, como Draft, para CI)
- CI roda automaticamente (lint, testes, build)
- Se CI passa → merge
- Se CI falha → corrigir na branch e push

### 5. Merge e cleanup

```bash
# Após merge no GitHub (squash):
git checkout main
git pull origin main

# A branch remota foi deletada automaticamente
# Deletar branch local:
git branch -d feat/nome-da-feature
```

---

## CI (Continuous Integration)

### Checks obrigatórios antes do merge

1. **Lint** — ESLint passa sem erros
2. **Type check** — `tsc --noEmit` passa
3. **Testes unitários** — Vitest passa
4. **Testes de integração** — Vitest + test database passa
5. **Build** — `npm run build` completa sem erros

### Em main (após merge)

1. Todos os checks acima
2. Deploy automático para staging (se configurado)

---

## Releases e Tags

### Sem branch de release

Este projeto usa **release from trunk** — releases saem direto de `main`.

### Fluxo de Release

```bash
# 1. Garantir que main está estável e CI verde
# 2. Atualizar versão no package.json (seguindo SemVer — ver docs/git/semver.md)
# 3. Atualizar CHANGELOG.md (seguindo Keep a Changelog — ver docs/git/keep-changelog.md)
# 4. Commit de release:
git commit -m "chore(release): v0.3.0"
# 5. Tag:
git tag -a v0.3.0 -m "Release v0.3.0"
git push origin main --tags
```

### Fix Forward

Se um bug é descoberto em produção:
- **Não** cria branch de hotfix a partir da tag
- **Corrige na main** com um `fix/` branch normal
- Faz release de uma nova versão PATCH
- Ex: bug em `v0.3.0` → corrige → release `v0.3.1`

---

## O Que Nunca Fazer

| Prática proibida | Por quê |
|---|---|
| Branch de feature com mais de 2 dias | Causa merge hell, diverge da main |
| Merge de main na feature branch | Polui o histórico, prefira rebase |
| Force push em main | Reescreve histórico compartilhado |
| Commit direto em main sem PR | Sem CI, sem registro, sem revisão |
| Branches de release ou develop | Complexidade desnecessária neste estágio |
| Manter branches mergeadas | Lixo visual, confusão sobre o que é ativo |
| Commit com mensagem genérica ("fix", "wip", "update") | Histórico ilegível, CHANGELOG impossível |

---

## Para Trabalho com AI Agents

Quando o Cursor ou Claude Code cria código:

1. O agent trabalha na branch criada pelo humano (não cria branches sozinho)
2. Commits do agent seguem Conventional Commits (o agent já sabe)
3. O humano revisa o diff antes do merge
4. CI é a rede de segurança — o agent pode errar, CI não deixa passar

Ver `docs/agents/rules-for-agents.md` para regras detalhadas.
