# AGENTS.md — Diretrizes de Refatoração de UI/UX & Design System (AutoSystem)

> **Documento Oficial de Engenharia e Design System**  
> Este documento é a fonte única da verdade (Single Source of Truth) para todos os agentes de IA e desenvolvedores que trabalham na evolução visual, responsividade e experiência de usuário (UI/UX) do AutoSystem. Todas as alterações devem seguir estritamente as regras aqui definidas, sem desvios, suposições ou introdução de estilos arbitrários.

---

## 1. Visão Geral & Diagnóstico dos Problemas Críticos

### 1.1 Diagnóstico do Estado Anterior ("Design Feito por Cego")
O projeto apresentava vícios graves de interface e experiência que destruíam a usabilidade:
1. **Poluição Tipográfica Extrema:** Uso indiscriminado de `font-black italic uppercase tracking-tighter` em praticamente todos os títulos, botões, cards, tabelas e badges. Isso criava uma poluição visual agressiva (estilo gamer/agressivo dos anos 2000), ilegível em telas de trabalho diário.
2. **Micro-textos Ilegíveis:** Dezenas de textos essenciais com tamanhos como `text-[8px]` e `text-[9px]`, com `tracking-[0.3em]`, tornando dados operacionais invisíveis em smartphones e tablets de oficina.
3. **Componentes Shadcn Envenenados:** Componentes base em `src/components/ui/` foram adulterados com estilos fixos (ex: `Card` com `w-[95%] mx-auto sm:w-full`, `CardTitle` com fontes forçadas), quebrando herança, grids responsivos e layouts aninhados.
4. **Cores e Contraste Inadequados:** Fundo opaco misturado com `bg-card` semi-transparente (`oklch(0.16 0.01 0 / 0.4)`), gerando cards acinzentados, sem contraste WCAG e com sangramento de texto. Brilhos fluorescentes exagerados (`glow-primary`) poluindo o foco do usuário.
5. **Armadilhas de Responsividade:** Classes destrutivas como `lg:h-[calc(100svh-100px)] lg:overflow-hidden` cortavam o scroll em notebooks, monitores pequenos e quando o zoom do navegador estava ativo. Modais com tamanhos fixos estourando em mobile.
6. **Mobile Dock Problemático:** O dock inferior flutuante cobria botões de ação e rodapés de formulários, sem cálculo unificado de `safe-area-inset-bottom`.

### 1.2 Objetivo da Nova UI/UX
- **Visual:** Estética SaaS moderna, limpa, refinada e sóbria (padrão Linear / Vercel / Supabase), com foco na eficiência do mecânico e gestor de oficina.
- **Mobile First Real:** Qualquer tela deve ser 100% utilizável em smartphones de 360px de largura com uma mão, fluindo naturalmente para tablets (768px) e desktops (1280px+).
- **Componentes Shadcn/UI Puros:** Todos os blocos em `src/components/ui/` retornam à especificação padrão oficial do Shadcn, sem hacks embutidos.

---

## 2. Sistema de Design & Tokens (Tailwind v4 / CSS Variables)

### 2.1 Paleta de Cores (Dark Mode Nativo Refinado)
A paleta central opera em tons neutros balanceados (Zinc/Slate profundo) com acentos funcionais de alta visibilidade:

| Token | Propósito | Valor Sugerido (OKLCH / Hex) |
|---|---|---|
| `--background` | Fundo principal da aplicação | `oklch(0.14 0.005 260)` (#09090b / zinc-950) |
| `--foreground` | Texto principal (alta legibilidade) | `oklch(0.98 0 0)` (#fafafa / zinc-50) |
| `--card` | Fundo de cards e contêineres | `oklch(0.18 0.006 260)` (#121215 / zinc-900 sólido) |
| `--card-foreground` | Texto dentro de cards | `oklch(0.98 0 0)` (#fafafa) |
| `--popover` | Modais, dropdowns e menus suspensos | `oklch(0.18 0.006 260)` (#121215) |
| `--popover-foreground`| Texto em menus e popovers | `oklch(0.98 0 0)` (#fafafa) |
| `--primary` | Acento principal (Ações, CTA, Ativo) | `oklch(0.68 0.19 148)` (#10b981 / emerald-500 moderno) |
| `--primary-foreground`| Texto sobre cor primária | `oklch(0.12 0 0)` (#052e16 / preto legível) |
| `--secondary` | Ações secundárias e destaques neutros | `oklch(0.24 0.008 260)` (#27272a / zinc-800) |
| `--secondary-foreground`| Texto sobre elemento secundário | `oklch(0.95 0 0)` (#f4f4f5) |
| `--muted` | Fundos discretos, chips e divisórias | `oklch(0.22 0.006 260)` (#18181b / zinc-900) |
| `--muted-foreground` | Legendas, metadados e textos secundários | `oklch(0.65 0 0)` (#a1a1aa / zinc-400 — **mínimo 12px**) |
| `--border` | Bordas nítidas e elegantes | `oklch(0.28 0.006 260)` (#27272a / borda sutil mas visível) |
| `--input` | Bordas de inputs e selects | `oklch(0.28 0.006 260)` (#27272a) |
| `--ring` | Anel de foco acessível | `oklch(0.68 0.19 148)` (Primary ring com offset) |
| `--destructive` | Alertas, remoção e erros | `oklch(0.62 0.22 25)` (#ef4444 / red-500) |

### 2.2 Regras Estritas de Tipografia
1. **FIM do `font-black italic uppercase tracking-tighter` generalizado:**
   - Títulos de páginas: `text-2xl sm:text-3xl font-bold tracking-tight text-foreground`.
   - Subtítulos: `text-sm text-muted-foreground` (nada de 8px!).
   - Títulos de Cards/Seções: `text-base font-semibold text-foreground`.
   - Dados/Métricas numéricas: `text-2xl sm:text-3xl font-bold tracking-tight`.
   - Badges e Tags: `text-xs font-medium` (mínimo 11px, legível sem esforço).
2. **Tamanho Mínimo de Fonte:**
   - Nenhum texto na aplicação pode ter menos que `12px` (`text-xs`). Classes como `text-[8px]`, `text-[9px]` e `text-[10px]` estão **banidas**.
3. **Inputs em Mobile:**
   - Todos os inputs de formulário devem manter `text-base md:text-sm` para impedir que o Safari/iOS execute zoom automático desagradável ao focar em campos.

### 2.3 Espaçamentos, Superfícies e Bordas
- **Radius Padrão:** `rounded-lg` (0.5rem) ou `rounded-xl` (0.75rem). Evitar formatos inconsistentes.
- **Sombras e Glows:** Substituir sombras fluorescentes pesadas (`glow-primary`) por bordas sutis (`border-border`) e leves estados hover com elevação (`hover:border-primary/40 transition-colors`).
- **Cards e Containers:** Fundo com `bg-card` sólido ou com backdrop-blur discreto, nunca 40% transparente sem fundo de apoio.

---

## 3. Padrão de Componentes Shadcn/UI (Mobile First)

### 3.1 Lista e Status dos Componentes (`src/components/ui/`)
Todos os componentes devem espelhar a implementação limpa da biblioteca Shadcn/UI (estilo New York / Radix):

1. **Card (`card.tsx`):**
   - Removido qualquer `w-[95%] mx-auto`. Deve ter `w-full` por padrão.
   - `CardTitle` limpo com `leading-none font-semibold text-foreground`.
2. **Button (`button.tsx`):**
   - Altura mínima para toque no mobile: `h-10 sm:h-9 px-4 py-2` (touch targets de 44px recomendados para mobile).
   - Variantes oficiais: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`.
3. **Dialog & Sheet (`dialog.tsx`, `sheet.tsx`):**
   - No mobile (`<640px`): Modais devem ocupar largura total com margens limpas (`w-full max-w-lg p-4 sm:p-6`), e conteúdos longos devem ter scroll interno limpo (`max-h-[85vh] overflow-y-auto`).
   - Formulários complexos no mobile podem usar `Sheet` deslizante inferior ou lateral para melhor ergonomia.
4. **Table (`table.tsx`):**
   - O contêiner de tabela deve ter `w-full overflow-x-auto` sem quebrar o layout da página.
   - Em telas pequenas, fornecer visualização alternativa em formato de Cards móveis quando a tabela tiver muitas colunas (> 4 colunas).
5. **Select, Dropdown & Combobox (`select.tsx`, `dropdown-menu.tsx`, `combobox`):**
   - Suporte tátil completo, padding adequado para dedos (`py-2.5 px-3` no mobile), scroll suave sem travamentos.
6. **Input & Textarea (`input.tsx`, `textarea.tsx`):**
   - Bordas consistentes com `border-input`, transição suave de foco com `focus-visible:ring-1 focus-visible:ring-ring`.

---

## 4. Diretrizes de Responsividade & Shell da Aplicação

### 4.1 Shell e Layout Principal (`(auth)/layout.tsx`)
1. **Cabeçalho (Header):**
   - Fixo ou sticky com altura uniforme (`h-14 sm:h-16`).
   - Botão de alternar sidebar (`SidebarTrigger`) visível e de fácil toque.
   - Nome e organização truncados elegantemente em telas estreitas.
2. **Área de Conteúdo (`main`):**
   - Padding responsivo: `p-4 sm:p-6 md:p-8`.
   - **Remover qualquer overflow oculto forçado na página:** O scroll principal da janela ou da página deve ser natural e sem saltos.
   - Espaçamento inferior: garantir espaço suficiente para o `MobileDock` no mobile (`pb-24 lg:pb-8`) somado com `env(safe-area-inset-bottom)`.
3. **Mobile Dock (`mobile-dock.tsx`):**
   - Deve ser discreto, posicionado acima da barra do sistema operacional com `pb-[max(0.5rem,env(safe-area-inset-bottom))]`.
   - Não deve sobrepor botões flutuantes ou modais abertos.
   - Z-Index ordenado: Modais (`z-50`), Overlays (`z-40`), Mobile Dock (`z-30`).

---

## 5. Roteiro de Refinamento por Módulo (Checklist de Execução)

### 📌 Módulo 1: Fundações & Tokens Globais
- [x] Resetar `Card` para especificação limpa Shadcn.
- [ ] Atualizar `src/styles/globals.css` com paleta Dark Mode sólida e sem contrastes quebrados.
- [ ] Padronizar classes utilitárias e remover sombras neon exageradas.
- [ ] Auditar e limpar todos os 25 componentes em `src/components/ui/`.

### 📌 Módulo 2: Layout & Navegação Shell
- [ ] Refatorar `src/app/(auth)/layout.tsx` (cabeçalho, logo e espaçamento).
- [ ] Refatorar `src/app/(auth)/dashboard/_components/app-sidebar.tsx` (menus, badges legíveis).
- [ ] Refatorar `src/app/(auth)/dashboard/_components/mobile-dock.tsx` (ergonomia mobile, safe-area).
- [ ] Refatorar `src/app/(auth)/dashboard/_components/header-user-menu.tsx`.

### 📌 Módulo 3: Dashboard Principal (`/dashboard`)
- [ ] Refatorar `src/app/(auth)/dashboard/page.tsx` e `dashboard-stats.tsx`.
- [ ] Cards de métricas com tipografia sóbria, ícones limpos e contraste AA.
- [ ] Lista de orçamentos pendentes com visual de cartões legíveis em mobile e tabela fluida em desktop.
- [ ] Ações rápidas com ergonomia de toque.

### 📌 Módulo 4: Clientes (`/dashboard/customer`)
- [ ] Remover `lg:h-[calc(100svh-100px)] lg:overflow-hidden` de `customer-list.tsx`.
- [ ] Refatorar `customer-stats.tsx` e barra de busca/filtros responsiva.
- [ ] Cartões de cliente mobile limpos, com botão de WhatsApp e ações diretas.
- [ ] Modais de criação e edição (`create-customer-form.tsx`, `edit-customer-form.tsx`) fluidos no mobile.

### 📌 Módulo 5: Veículos (`/dashboard/vehicle`)
- [ ] Refatorar `vehicle-list.tsx` e `vehicle-stats.tsx`.
- [ ] Placa e modelo em destaque legível (padrão Mercosul limpo, sem textos de 8px).
- [ ] Modais de cadastro e edição de veículos otimizados para digitação em celular.

### 📌 Módulo 6: Estoque & Produtos (`/dashboard/product`)
- [ ] Refatorar `product-list.tsx` e `product-stats.tsx`.
- [ ] Badges de estoque (Esgotado, Baixo Estoque, Normal) com cores semânticas limpas.
- [ ] Modal de ajuste rápido de estoque (`adjust-stock-modal.tsx`) com botões grandes de incremento (+ / -).

### 📌 Módulo 7: Orçamentos & Ordens de Serviço (`/dashboard/budget`, `/dashboard/service`)
- [ ] Refatorar `budget-list.tsx` e `service-order-list.tsx`.
- [ ] Simplificar o wizard de criação (`create-budget-form.tsx`): etapas limpas, navegação mobile suave, campos de fotos e checklist fáceis de marcar com o polegar.
- [ ] Telas de detalhes (`/dashboard/budget/[id]`, `/dashboard/service/[id]`) com impressão e compartilhamento limpos.

### 📌 Módulo 8: Financeiro, Relatórios & Configurações
- [ ] Refatorar `/dashboard/financeiro` (resumo de receitas/despesas, filtros de data).
- [ ] Refatorar `/dashboard/relatorios` (seleção de filtros e exportação de PDF).
- [ ] Refatorar `/dashboard/config` (dados da oficina, upload de logo com dropzone moderno).
- [ ] Refatorar `/dashboard/plans` (tabela de planos clara, responsiva e com destaque do plano atual).

### 📌 Módulo 9: Páginas Públicas & Assinatura Digital
- [ ] `/auth` (Login e Cadastro com transição suave, inputs sem zoom automático no iOS).
- [ ] `/` (Landing page limpa, sem animações pesadas que travam dispositivos móveis).
- [ ] `/budget/sign/[id]` e `/service/sign/[id]` (Página de assinatura do cliente no celular: canvas de assinatura 100% responsivo e com suporte a toque).

---

## 6. Regras de Código para Agentes e Desenvolvedores

1. **Nunca use classes arbitrárias de micro-texto:**
   - ❌ `text-[8px]`, `text-[9px]`, `text-[10px]`
   - ✅ `text-xs` (12px), `text-sm` (14px), `text-base` (16px)
2. **Nunca use `font-black italic uppercase tracking-tighter` como estilo padrão:**
   - ❌ `font-black italic uppercase tracking-tighter`
   - ✅ `font-bold tracking-tight`, `font-semibold text-foreground`, etc.
3. **Nunca bloqueie o scroll com alturas artificiais:**
   - ❌ `h-[calc(100svh-100px)] overflow-hidden`
   - ✅ `min-h-full flex flex-col` com scroll natural da página
4. **Sempre teste a responsividade com mentalidade mobile first:**
   - Pense primeiro na experiência em uma tela de 375px (iPhone padrão) antes de projetar para telas de 1920px.
5. **Mantenha todos os componentes em `src/components/ui/` agnósticos ao conteúdo do negócio:**
   - Nenhuma menção a "veículo", "cliente", "oficina" ou classes fixas de largura dentro dos arquivos de UI base.
