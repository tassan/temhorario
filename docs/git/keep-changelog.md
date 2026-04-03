# Keep a Changelog — temhorario-engine

> Baseado nos princípios de [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).

---

## Princípio Central

O CHANGELOG é para **humanos**, não para máquinas. Ele comunica o que mudou de uma versão para outra de forma clara e útil. Não é um dump de git log.

---

## Arquivo

- Nome: `CHANGELOG.md` na raiz do repositório
- Formato: Markdown
- Ordem: versão mais recente primeiro (cronológica reversa)
- Datas: formato ISO 8601 (`YYYY-MM-DD`)

---

## Enforcement (git hook)

Qualquer `git push` de **branch** que envie alterações a ficheiros deve incluir **`CHANGELOG.md`** nesse conjunto de alterações. O hook está em `.githooks/pre-push`; `core.hooksPath` é configurado ao correr `npm install` (script `prepare`). Pormenores, excepções e `SKIP_CHANGELOG_HOOK`: [git-strategy.md](git-strategy.md#git-hooks-pre-push).

O hook garante que o ficheiro é **alterado** no push quando há outras mudanças; o texto continua a seguir os critérios humanos deste documento.

---

## Estrutura

```markdown
# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Endpoint público de disponibilidade com suporte a filtro por resource

### Fixed
- Correção de timezone na geração de slots para tenants em fusos diferentes de UTC

## [0.2.0] - 2025-07-15

### Added
- Módulo de bookings com criação pública e gestão admin
- Máquina de status do booking (scheduled → confirmed → in_progress → completed)
- Proteção contra race condition com SELECT FOR UPDATE na criação de booking
- Endpoint de relatórios com métricas agregadas por período

### Changed
- Resposta de erro padronizada com campo `code` para identificação programática

### Fixed
- Slots duplicados quando resource tem múltiplas regras para o mesmo dia

## [0.1.0] - 2025-07-01

### Added
- Setup inicial do projeto (Hono + Drizzle + PostgreSQL)
- Schema do banco com multi-tenancy e RLS
- Módulo de autenticação (JWT + refresh token rotation)
- CRUD de tenants via endpoints platform
- CRUD de serviços com suporte a custom fields
- CRUD de recursos com associação M2M a serviços
- Configuração de disponibilidade (grade semanal + exceções)
- Algoritmo de geração de slots disponíveis

[unreleased]: https://github.com/user/temhorario-engine/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/user/temhorario-engine/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/user/temhorario-engine/releases/tag/v0.1.0
```

---

## Categorias de Mudança

Usar exatamente estas categorias, nesta ordem, quando presentes:

| Categoria | Quando usar | Exemplo |
|---|---|---|
| **Added** | Funcionalidade nova | Novo endpoint, novo módulo, nova feature |
| **Changed** | Mudança em funcionalidade existente | Formato de resposta alterado, comportamento diferente |
| **Deprecated** | Feature que será removida em versão futura | Endpoint antigo que será descontinuado |
| **Removed** | Feature removida | Endpoint deletado, campo removido |
| **Fixed** | Correção de bug | Race condition resolvida, cálculo corrigido |
| **Security** | Vulnerabilidade corrigida | Token leak corrigido, XSS eliminado |

### Regras

- Só incluir categorias que têm itens. Não criar seção `Removed` vazia.
- Dentro de cada categoria, listar mudanças da mais impactante para a menos.
- Cada item começa com verbo no passado ou descrição da mudança.
- Cada item é uma frase completa, terminada com ponto (quando aplicável).

---

## Seção Unreleased

A seção `[Unreleased]` fica sempre no topo e acumula mudanças que ainda não foram lançadas em uma versão. Isso serve dois propósitos:

1. **Para o time:** saber o que vai na próxima release
2. **Na hora da release:** mover os itens para a nova seção versionada

### Fluxo

```
Dia a dia:       Mudou algo notável? → Adiciona em [Unreleased]
Hora da release: Move [Unreleased] → [X.Y.Z] - YYYY-MM-DD
                 Cria nova seção [Unreleased] vazia
```

---

## O Que Incluir

### Incluir (mudanças notáveis)

- Novos endpoints ou funcionalidades
- Mudanças de comportamento que afetam consumers da API
- Correções de bugs que afetavam o uso
- Breaking changes (sempre com destaque)
- Mudanças de segurança
- Deprecations

### Não incluir (ruído)

- Refatorações internas sem impacto externo
- Adição de testes
- Correção de typos na documentação
- Atualização de dependências (a menos que mude comportamento)
- Mudanças de formatação ou lint

**Regra de ouro:** Se um consumer da API ou um admin que usa o dashboard perceberia a diferença, inclui. Se não, não.

---

## Links de Comparação

No final do CHANGELOG, manter links que apontam para o diff entre versões no GitHub:

```markdown
[unreleased]: https://github.com/user/temhorario-engine/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/user/temhorario-engine/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/user/temhorario-engine/releases/tag/v0.1.0
```

- `[unreleased]` sempre compara a última tag com `HEAD`
- Cada versão compara com a versão anterior
- A primeira versão aponta para a release/tag

---

## Escrita de Itens

### Bons exemplos

```markdown
### Added
- Endpoint público de disponibilidade (`GET /v1/{slug}/availability`) com filtro por resource e data
- Proteção contra race condition na criação de booking usando SELECT FOR UPDATE

### Changed
- Resposta de erro agora inclui campo `code` para identificação programática (ex: `SLOT_UNAVAILABLE`)

### Fixed
- Slots duplicados quando um resource tinha múltiplas regras de disponibilidade para o mesmo dia
- Timezone incorreto na geração de slots para tenants fora de UTC-3

### Security
- Tokens de refresh agora são invalidados após uso (refresh token rotation)
```

### Maus exemplos

```markdown
### Added
- Coisas novas
- Endpoint

### Fixed
- Bug
- Corrigido problema
- Fix do fix anterior
```

---

## Breaking Changes

Quando uma mudança quebra compatibilidade com consumers existentes, destacar:

```markdown
### Changed
- **BREAKING:** Formato de resposta do booking agora inclui objeto `resource` aninhado em vez de `resource_id` como string. Consumers que dependem de `resource_id` no nível raiz devem atualizar.
```

Ou, quando a seção inteira é breaking:

```markdown
### Removed
- **BREAKING:** Endpoint `GET /v1/admin/schedule` removido. Usar `GET /v1/admin/bookings` com filtros.
```

---

## Quando Atualizar o CHANGELOG

| Momento | Ação |
|---|---|
| Ao implementar feature/fix | Adicionar item em `[Unreleased]` no PR |
| Ao mergear PR com mudança notável | Garantir que `[Unreleased]` foi atualizado |
| Ao fazer release | Mover `[Unreleased]` → `[X.Y.Z] - data` |
| Ao fazer hotfix | Adicionar direto na nova versão de patch |

---

## Instruções para AI Agents

Ao completar uma tarefa que resulta em mudança notável:

1. Abrir `CHANGELOG.md`
2. Adicionar item na seção `[Unreleased]`, na categoria correta
3. Seguir o formato: verbo no passado + descrição clara + contexto técnico se necessário
4. Não remover ou alterar itens existentes de versões já lançadas
5. Não criar versão nova — apenas atualizar `[Unreleased]`
