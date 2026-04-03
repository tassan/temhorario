# Design Principles — temhorario-engine Frontend

> **⚠️ INSTRUÇÃO PARA AI AGENTS:**
> Consulte este documento antes de criar qualquer componente visual, página, ou tomar decisões de UI/UX. Estes princípios são obrigatórios, não sugestões.

---

## Filosofia

O temhorario-engine serve dois públicos com necessidades opostas:

- **Cliente final** (booking page): quer agendar rápido, sem atrito, no celular
- **Dono do negócio** (admin dashboard): quer controle, visibilidade, produtividade

O design deve ser **invisível para o cliente** e **poderoso para o admin**.

---

## 1. Mobile-first, Sempre

O cliente final agenda pelo celular — muitas vezes num link do WhatsApp, em conexão 4G instável. Isso define tudo.

**Regras:**
- Todo componente começa sendo desenhado para 375px de largura
- Touch targets: mínimo 44x44px (diretriz Apple HIG)
- Nenhum hover state como único meio de interação
- Fontes legíveis sem zoom: mínimo 16px para body text
- Inputs não devem causar zoom no iOS (font-size ≥ 16px)
- Testes visuais em viewport mobile são obrigatórios

**Exceção:** O admin dashboard é desktop-first na estrutura (sidebar + content), mas responsivo. Em mobile, a sidebar vira drawer.

---

## 2. Booking = Zero Fricção

O booking flow é o produto. Cada step a mais, cada campo a mais, cada segundo de loading a mais = agendamentos perdidos.

**Regras:**
- Máximo 5 steps no booking flow (serviço → data → horário → dados → confirmação)
- Campos obrigatórios: apenas nome e telefone. Tudo mais é opcional ou custom field
- Cada step cabe inteiro na viewport sem scroll (quando possível)
- Progress indicator visível em todos os steps
- Botão "Voltar" sempre visível e funcional
- Loading state nunca bloqueia a tela inteira — usar skeletons inline
- Erro de slot ocupado (409): mensagem amigável + volta automática pro step de horário
- Nenhum cadastro/login exigido do cliente para agendar

---

## 3. Feedback Imediato

O usuário nunca deve ficar em dúvida se algo funcionou.

**Regras:**
- Toda ação tem feedback visual em menos de 100ms
- Botões desabilitam durante submit (loading spinner inline)
- Optimistic updates no admin: a UI muda antes da API responder
- Se a API falha, reverter com toast de erro (não modal)
- Estados de loading: skeleton, não spinner (evitar layout shift)
- Transições entre steps: suave, ~200ms, sem flash de conteúdo

---

## 4. Hierarquia Visual Clara

Cada tela tem uma ação principal. O resto é secundário.

**Regras:**
- Uma action primária por tela (botão com cor de destaque, tamanho maior)
- Actions secundárias: outline ou ghost buttons, nunca competem visualmente
- Actions destrutivas (cancelar, deletar): vermelhas, sempre com confirmação
- Informação mais importante: maior, mais contraste, posição superior
- Informação de suporte: menor, cor mais neutra, posição inferior
- Whitespace é feature, não desperdício — usar generosamente

---

## 5. Branding Flexível

Cada tenant tem sua identidade visual. O design precisa funcionar com qualquer combinação de cores.

**Regras:**
- Usar CSS custom properties para cores do tenant:
  - `--color-primary`: cor principal do botão/CTA
  - `--color-accent`: cor de destaque/link
  - `--color-primary-foreground`: cor de texto sobre primary
- Base neutra: backgrounds em branco/cinza claro, texto em cinza escuro
- Testar com: azul, vermelho, verde, roxo, preto (cores comuns de negócios)
- Testar contraste WCAG AA com as variáveis de cor (mínimo 4.5:1 para texto)
- Logo do tenant: exibir com `object-fit: contain`, max-height definido
- Nunca distorcer logo — preservar aspect ratio

---

## 6. Consistência > Criatividade

Preferir padrões conhecidos a soluções criativas. O usuário não quer ser surpreendido.

**Regras:**
- Componentes base: shadcn/ui sem customização visual pesada
- Ícones: uma única biblioteca (Lucide Icons)
- Padrões de interação conhecidos:
  - Lista → clique → detalhe (não tooltip ou hover)
  - Formulário → submit → feedback
  - Confirmação destrutiva → dialog com botão explícito
- Terminologia consistente: sempre "Agendamento" (não "Reserva", "Marcação", "Booking" misturados)
- Status sempre com mesma cor: scheduled=azul, confirmed=verde, in_progress=amarelo, completed=cinza, cancelled=vermelho, no_show=laranja

---

## 7. Acessibilidade como Requisito

Não é nice-to-have. É obrigatório.

**Regras:**
- Todos os elementos interativos: focus ring visível
- Todos os ícones decorativos: `aria-hidden="true"`
- Todos os ícones funcionais: `aria-label` descritivo
- Formulários: labels associados a inputs (não placeholder como label)
- Erros de validação: associados ao campo via `aria-describedby`
- Contraste mínimo WCAG AA (4.5:1 para texto, 3:1 para elementos grandes)
- Ordem de tab lógica e previsível
- Anúncios de estado: `aria-live` para loading, success, error
- Navegação por teclado funcional em todo o booking flow

---

## 8. Densidade de Informação (Admin)

O admin precisa ver muita informação de uma vez. Usar espaço de forma inteligente.

**Regras:**
- Tabelas: linhas compactas, sem padding excessivo
- Cards de métrica: número grande + label pequeno + indicador de tendência
- Agenda visual: bookings como blocos coloridos, informação mínima visível, detalhe no clique
- Sidebar: ícone + label, colapsável para ícone-only em telas menores
- Filtros: inline (não em modal), aplicação instantânea, sem botão "Aplicar"
- Paginação: cursor-based "Carregar mais" (não page numbers)

---

## 9. Tipografia

### Font Stack

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Escala

| Uso | Tamanho | Peso | Line Height |
|---|---|---|---|
| H1 (título de página) | 24px / 1.5rem | 700 | 1.2 |
| H2 (seção) | 20px / 1.25rem | 600 | 1.3 |
| H3 (subsection) | 16px / 1rem | 600 | 1.4 |
| Body | 14px / 0.875rem | 400 | 1.5 |
| Body (booking page) | 16px / 1rem | 400 | 1.5 |
| Small / Caption | 12px / 0.75rem | 400 | 1.4 |
| Mono (IDs, códigos) | 13px / 0.8125rem | 400 | 1.4 |

**Regra:** Booking page usa 16px como base (evitar zoom no iOS). Admin usa 14px (mais densidade).

---

## 10. Cores

### Paleta Base (Neutros)

```css
--color-bg:          #FFFFFF;
--color-bg-subtle:   #F9FAFB;
--color-bg-muted:    #F3F4F6;
--color-border:      #E5E7EB;
--color-text:        #111827;
--color-text-muted:  #6B7280;
--color-text-subtle: #9CA3AF;
```

### Status Colors (Fixas — não mudam com branding)

```css
--color-scheduled:   #3B82F6; /* blue-500 */
--color-confirmed:   #22C55E; /* green-500 */
--color-in-progress: #EAB308; /* yellow-500 */
--color-completed:   #6B7280; /* gray-500 */
--color-cancelled:   #EF4444; /* red-500 */
--color-no-show:     #F97316; /* orange-500 */
```

### Semânticas

```css
--color-success:     #22C55E;
--color-warning:     #EAB308;
--color-error:       #EF4444;
--color-info:        #3B82F6;
```

---

## 11. Espaçamento

Usar escala de 4px (Tailwind padrão):

| Token | Valor | Uso comum |
|---|---|---|
| `space-1` | 4px | Gap entre ícone e label |
| `space-2` | 8px | Padding interno de badge |
| `space-3` | 12px | Padding de input |
| `space-4` | 16px | Gap entre cards, padding de card |
| `space-6` | 24px | Margin entre seções |
| `space-8` | 32px | Padding de página |
| `space-12` | 48px | Separação entre blocos grandes |

---

## 12. Bordas e Sombras

```css
--radius-sm: 6px;     /* badges, tags */
--radius-md: 8px;     /* inputs, cards */
--radius-lg: 12px;    /* dialogs, modais */
--radius-full: 9999px; /* avatars, pills */

--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
```

**Regra:** Usar sombra com moderação. Cards com borda sutil (`--color-border`) por padrão. Sombra apenas para elementos elevados (dialogs, dropdowns, popovers).

---

## 13. Animações e Transições

```css
--duration-fast: 150ms;   /* hover, focus */
--duration-normal: 200ms; /* expand, collapse */
--duration-slow: 300ms;   /* modal enter, step transition */

--easing-default: cubic-bezier(0.4, 0, 0.2, 1);
--easing-in: cubic-bezier(0.4, 0, 1, 1);
--easing-out: cubic-bezier(0, 0, 0.2, 1);
```

**Regras:**
- Respeitar `prefers-reduced-motion`: desativar animações não essenciais
- Nunca animar layout properties (width, height) — usar transform e opacity
- Loading skeletons: pulse animation suave
- Step transitions: slide horizontal (200ms)
- Toasts: slide in from top-right (200ms), auto-dismiss em 4s

---

## 14. Patterns de Componente

### Cards

```
┌──────────────────────────────┐
│  [Ícone] Título              │  ← header: flex, align center
│                              │
│  Conteúdo principal          │  ← body: padding uniforme
│                              │
│  [Action secundária] [CTA]   │  ← footer: flex, justify end
└──────────────────────────────┘
```

### Dialogs (Modais)

```
┌──────────────────────────────┐
│  Título                   X  │  ← header com close button
│──────────────────────────────│
│                              │
│  Conteúdo / Formulário       │  ← body: scrollable se necessário
│                              │
│──────────────────────────────│
│         [Cancelar] [Salvar]  │  ← footer: actions à direita
└──────────────────────────────┘
```

### Empty States

```
        ┌─────────┐
        │  Ícone  │      ← ilustração ou ícone em cor muted
        └─────────┘
    "Nenhum agendamento"  ← título descritivo
  "Quando clientes agendarem,
   eles aparecerão aqui."    ← subtítulo com contexto
       [Action sugerida]     ← CTA opcional
```

---

## 15. Checklist de Qualidade (Antes de Mergear)

Para cada componente ou página nova:

- [ ] Funciona em 375px (mobile)
- [ ] Touch targets ≥ 44px
- [ ] Loading state implementado (skeleton, não spinner)
- [ ] Empty state implementado
- [ ] Error state implementado
- [ ] Focus ring visível em todos os interativos
- [ ] Aria labels nos elementos que precisam
- [ ] Contraste WCAG AA verificado
- [ ] Animações respeitam prefers-reduced-motion
- [ ] Tipografia segue a escala definida
- [ ] Espaçamento segue a escala de 4px
- [ ] Cores de status são as fixas (não branding)
- [ ] Branding aplicado via CSS variables (booking page)
