# Semantic Versioning — temhorario-engine

> Baseado nos princípios de [Semantic Versioning 2.0.0](https://semver.org).

---

## Princípio Central

O número de versão comunica o **tipo de mudança** feita no software. Dado um formato `MAJOR.MINOR.PATCH`:

- **MAJOR** → mudanças incompatíveis na API (breaking changes)
- **MINOR** → funcionalidade nova, compatível com versões anteriores
- **PATCH** → correções de bugs, compatíveis com versões anteriores

---

## SemVer Durante Desenvolvimento (0.y.z)

Este projeto usa versionamento semântico **desde o primeiro commit**. Enquanto a API pública não estiver estabilizada, a versão permanece em `0.y.z`.

### Regras para versão 0.y.z

Na versão `0.y.z`, a API é considerada instável. Qualquer coisa pode mudar. Porém, mantemos disciplina:

| Tipo de mudança | Bump | Exemplo |
|---|---|---|
| Breaking change na API | MINOR (0.**Y**.0) | Mudar formato de resposta de um endpoint |
| Feature nova | MINOR (0.**Y**.0) | Adicionar novo endpoint ou módulo |
| Bug fix | PATCH (0.y.**Z**) | Corrigir cálculo de slots |
| Melhoria de performance | PATCH (0.y.**Z**) | Otimizar query de disponibilidade |
| Refactor sem impacto externo | Nenhum bump | Reorganizar código interno |

**Por que bumpar MINOR em breaking changes e não MAJOR?** Porque MAJOR 0 → 1 representa a estabilização da API pública. Enquanto não chegamos lá, breaking changes incrementam MINOR.

### Progressão Esperada

```
0.1.0  → Setup inicial, schema, auth
0.1.1  → Fix no login
0.2.0  → Módulo de bookings
0.2.1  → Fix race condition
0.3.0  → Módulo de disponibilidade público
0.4.0  → Webhooks
0.5.0  → Relatórios
...
0.9.0  → Feature-complete para MVP
0.9.1  → Bug fixes pré-estabilização
1.0.0  → API pública estável (primeiro consumer em produção)
```

---

## Quando Chegar ao 1.0.0

A versão `1.0.0` é lançada quando:

1. A API pública está documentada e considerada estável
2. Pelo menos um consumer está usando a API em produção
3. Breaking changes passam a exigir MAJOR bump (custo alto, decisão deliberada)

A partir de `1.0.0`:

| Tipo de mudança | Bump | Exemplo |
|---|---|---|
| Breaking change | MAJOR (**X**.0.0) | Remover endpoint, mudar formato de response |
| Feature nova retrocompatível | MINOR (x.**Y**.0) | Novo endpoint, novo campo opcional |
| Bug fix | PATCH (x.y.**Z**) | Corrigir cálculo, fix de validação |
| Deprecation | MINOR (x.**Y**.0) | Marcar endpoint como deprecated |
| Remoção de feature deprecated | MAJOR (**X**.0.0) | Efetivar a remoção |

---

## Onde Vive a Versão

### Locais que devem ser atualizados juntos

```
package.json         → "version": "0.3.0"
CHANGELOG.md         → ## [0.3.0] - 2025-07-15
Git tag              → v0.3.0
```

Esses três devem estar sempre em sincronia. O commit de release atualiza `package.json` e `CHANGELOG.md`, e a tag é criada a seguir.

---

## Fluxo de Release

### 1. Decidir a versão

Olhar a seção `[Unreleased]` do CHANGELOG:

- Tem `Added`? → Pelo menos MINOR
- Tem só `Fixed`? → PATCH
- Tem breaking change? → MINOR (em 0.y.z) ou MAJOR (em x.y.z, x ≥ 1)

### 2. Atualizar arquivos

```bash
# Atualizar package.json
npm version minor --no-git-tag-version
# ou: npm version patch --no-git-tag-version

# Atualizar CHANGELOG.md
# - Mover [Unreleased] → [0.3.0] - 2025-07-15
# - Criar nova seção [Unreleased] vazia
# - Atualizar links de comparação no final
```

### 3. Commit e tag

```bash
git add package.json CHANGELOG.md
git commit -m "chore(release): v0.3.0"
git tag -a v0.3.0 -m "Release v0.3.0"
git push origin main --tags
```

---

## Pre-release Versions

Para versões de teste ou preview, usar labels:

```
0.3.0-alpha.1    → primeira versão alpha da 0.3.0
0.3.0-beta.1     → primeira versão beta
0.3.0-rc.1       → release candidate
0.3.0            → versão estável
```

### Quando usar

- **alpha:** funcionalidade incompleta, API pode mudar a qualquer momento
- **beta:** funcionalidade completa, API pode ter ajustes
- **rc:** pronta para release, buscando bugs finais

### Regras

- Pre-release tem precedência menor que a versão normal: `0.3.0-alpha.1 < 0.3.0`
- Incrementar o número: `alpha.1 → alpha.2 → alpha.3`
- Não publicar pre-release como "latest" no npm

---

## Exemplos Práticos

### Cenário 1: Adicionar módulo de bookings

```
Antes:  0.1.0
Depois: 0.2.0

Motivo: feature nova (MINOR)
Commit: feat(bookings): add booking creation and status management
```

### Cenário 2: Corrigir race condition na criação de booking

```
Antes:  0.2.0
Depois: 0.2.1

Motivo: bug fix (PATCH)
Commit: fix(bookings): prevent double booking with SELECT FOR UPDATE
```

### Cenário 3: Mudar formato de resposta do booking (breaking)

```
Antes:  0.2.1
Depois: 0.3.0

Motivo: breaking change em 0.y.z → MINOR
Commit: feat(bookings)!: include nested resource object in booking response
```

### Cenário 4: Mesmo cenário, mas já em 1.x.x

```
Antes:  1.2.1
Depois: 2.0.0

Motivo: breaking change em x.y.z (x ≥ 1) → MAJOR
Commit: feat(bookings)!: include nested resource object in booking response
```

---

## Mapping: Conventional Commits → SemVer

| Commit Type | SemVer Bump (0.y.z) | SemVer Bump (≥1.0.0) |
|---|---|---|
| `feat` | MINOR | MINOR |
| `feat!` (breaking) | MINOR | MAJOR |
| `fix` | PATCH | PATCH |
| `fix!` (breaking) | MINOR | MAJOR |
| `perf` | PATCH | PATCH |
| `chore`, `docs`, `test`, `refactor`, `ci` | Nenhum | Nenhum |
| Qualquer tipo com `BREAKING CHANGE:` footer | MINOR | MAJOR |

---

## Instruções para AI Agents

1. **Não** atualizar a versão automaticamente. A decisão de versão é humana.
2. Ao implementar mudanças, indicar no PR qual tipo de bump será necessário.
3. Se uma mudança é breaking, marcar explicitamente no commit com `!` e no CHANGELOG com **BREAKING**.
4. Ao fazer release (quando solicitado pelo humano):
   - Atualizar `package.json` com `npm version {patch|minor|major} --no-git-tag-version`
   - Atualizar `CHANGELOG.md` conforme `docs/git/keep-changelog.md`
   - Commit: `chore(release): vX.Y.Z`
   - Não criar tag — o humano faz o push com tags.
