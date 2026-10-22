<div align="center">

# 🚗 AutoSystem

**Sistema SaaS completo de gestão para oficinas mecânicas**
Orçamentos, ordens de serviço, estoque, financeiro e CRM — tudo em um só lugar.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![AbacatePay](https://img.shields.io/badge/AbacatePay-Payments-4CAF50)](https://abacatepay.com)

[Funcionalidades](#-funcionalidades) • [Planos](#-planos) • [Stack](#-stack) • [Como rodar](#-como-rodar-localmente)

</div>

---

## 📸 Demonstração

> Prints gerados com **dados 100% fictícios** — nenhum dado real de clientes.

### 🏠 Landing & Acesso

| Landing Page | Login / Cadastro |
|:-:|:-:|
| ![Landing](public/screenshots/01-landing.jpg) | ![Login](public/screenshots/02-login.jpg) |

### 📊 Dashboard & Orçamentos

| Dashboard | Orçamentos |
|:-:|:-:|
| ![Dashboard](public/screenshots/04-dashboard.jpg) | ![Orçamentos](public/screenshots/05-orcamentos.jpg) |

### 🔧 Ordens de Serviço

| Lista de OS | Detalhe do Orçamento |
|:-:|:-:|
| ![Ordens de Serviço](public/screenshots/06-ordens-servico.jpg) | ![Detalhe do Orçamento](public/screenshots/14-orcamento-detalhe.jpg) |

### 👥 Clientes & Veículos

| Clientes | Veículos |
|:-:|:-:|
| ![Clientes](public/screenshots/07-clientes.jpg) | ![Veículos](public/screenshots/08-veiculos.jpg) |

### 📦 Estoque & Financeiro

| Estoque | Financeiro |
|:-:|:-:|
| ![Estoque](public/screenshots/09-estoque.jpg) | ![Financeiro](public/screenshots/10-financeiro.jpg) |

### 📈 Relatórios & Planos

| Relatórios | Planos |
|:-:|:-:|
| ![Relatórios](public/screenshots/11-relatorios.jpg) | ![Planos](public/screenshots/12-planos.jpg) |

---

## 💡 Sobre o projeto

O **AutoSystem** resolve o caos administrativo das oficinas centralizando clientes, veículos, estoque e serviços — automatizando a criação de orçamentos e ordens de serviço (OS) com **geração de PDF profissional** e **assinatura digital** pelo cliente, via link público e sem login.

Com arquitetura **multi-tenant**, cada oficina (organização) tem seus dados 100% isolados, e o sistema de **assinaturas via AbacatePay** permite monetizar a plataforma.

---

## ✨ Funcionalidades

### 🏢 Gestão
- **Multi-tenant** — várias empresas com dados isolados e convite de membros
- **Clientes** — cadastro completo (CPF/CNPJ) com histórico de serviços (CRM)
- **Veículos** — vinculados aos clientes com detalhes e histórico

### 🔧 Serviços
- **Orçamentos** — criação dinâmica com itens, fotos e status (Pendente / Aprovado / Rejeitado)
- **Ordens de Serviço** — geradas automaticamente de orçamentos aprovados (Aberto / Em Progresso / Concluído / Cancelado)
- **Assinatura digital** — cliente assina orçamento e OS por link público, sem precisar de conta
- **PDF profissional** — emissão de documentos para orçamentos, OS e recibos

### 📦 Operação
- **Estoque** — produtos com SKU, precificação, alertas de baixo estoque e relatório de inventário em PDF
- **Financeiro** — transações, fluxo de caixa e recibo em PDF
- **Relatórios** — métricas estratégicas por período com exportação em PDF
- **Notificações** — sistema de alertas interno

### 💳 Monetização (SaaS)
- **Planos via AbacatePay** — checkout, webhooks e atualização automática de assinaturas
- **Trial de 14 dias** em todos os planos
- **Limites de recursos** por plano

### 📱 Extras
- **PWA** — instalável como app no celular
- **Modo offline** com sincronização posterior
- **Dashboard estatístico** com métricas de atendimento

---

## 💰 Planos

| | Basic | Plus | Professional |
|:-:|:-:|:-:|:-:|
| **Preço** | R$ 79,99/mês | R$ 119,99/mês | R$ 179,99/mês |
| **Trial** | 14 dias | 14 dias | 14 dias |

> Os limites de recursos de cada plano ficam em `src/utils` (lógica de permissões/planos).

---

## 🛠️ Stack

| Camada | Tecnologias |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4, Shadcn UI, Framer Motion |
| **Backend** | Prisma ORM, PostgreSQL, Better Auth (auth + multi-tenant) |
| **Pagamentos** | AbacatePay (checkout, webhooks, assinaturas) |
| **Documentos** | @react-pdf/renderer |
| **Qualidade** | Biome (lint + format) |

---

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js 20+
- PostgreSQL
- Conta AbacatePay e chave de API

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/autosystem.git
cd autosystem

# 2. Instale as dependências
npm install

# 3. Configure o arquivo .env (veja abaixo)

# 4. Gere o Prisma Client e rode as migrações
npx prisma generate
npx prisma migrate dev

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `https://autosystem.nulldev.com.br`.

### Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/autosystem"

# AbacatePay
ABACATEPAY_API_KEY="abc_..."
# Segredo definido ao criar o webhook; chega em ?webhookSecret=... em cada entrega
ABACATEPAY_WEBHOOK_SECRET="um_segredo_forte"
# IDs dos produtos (criados no painel com cycle MONTHLY / ANNUALLY)
ABACATEPAY_BASIC_MONTHLY_PRODUCT_ID="prod_..."
ABACATEPAY_BASIC_YEARLY_PRODUCT_ID="prod_..."
ABACATEPAY_PLUS_MONTHLY_PRODUCT_ID="prod_..."
ABACATEPAY_PLUS_YEARLY_PRODUCT_ID="prod_..."
ABACATEPAY_PRO_MONTHLY_PRODUCT_ID="prod_..."
ABACATEPAY_PRO_YEARLY_PRODUCT_ID="prod_..."

# Resend (e-mails: confirmação de conta, redefinir senha, agradecimento)
RESEND_API_KEY="re_..."
EMAIL_FROM="AutoSystem <nao-responda@seudominio.com.br>"

# Better Auth
BETTER_AUTH_SECRET="seu_secret_aqui"
BETTER_AUTH_URL="https://autosystem.nulldev.com.br"
NEXT_PUBLIC_APP_URL="https://autosystem.nulldev.com.br"
```

### Webhook da AbacatePay

Cadastre `https://SEU_DOMINIO/api/webhooks/abacatepay?webhookSecret=<ABACATEPAY_WEBHOOK_SECRET>`
com os eventos `subscription.completed`, `subscription.renewed` e `subscription.cancelled`.
Em desenvolvimento, exponha o localhost via túnel HTTPS (a AbacatePay exige URL pública).

---

## 🧪 Qualidade de código

```bash
npm run lint     # Verificar erros
npm run format   # Formatar código
```

---

## 📁 Estrutura

```text
src/
├── app/
│   ├── (auth)/      # Rotas autenticadas (Dashboard, Clientes, OS...)
│   ├── (public)/    # Páginas públicas (Landing, Login, Registro)
│   └── api/         # Endpoints (Auth, AbacatePay Webhooks)
├── components/      # Componentes UI reutilizáveis (Shadcn)
├── lib/             # Configurações (Prisma, Auth, AbacatePay)
├── types/           # Definições TypeScript
└── utils/           # Utilitários e lógica de permissões/planos
prisma/              # Schema do banco e migrações
```

---

## 🗺️ Roadmap

- [ ] Notificações via WhatsApp / E-mail para clientes
- [ ] Gestão financeira avançada
- [ ] App mobile para mecânicos (fotos dos serviços)
- [ ] Suporte a múltiplos idiomas (i18n)

---

## 🤝 Contribuindo

1. Faça um **fork** do projeto
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commite: `git commit -m "Add: minha feature"`
4. Push: `git push origin feature/minha-feature`
5. Abra um **Pull Request**

---

## 📄 Licença

© 2026 AutoSystem — Todos os direitos reservados.

---

<div align="center">
Feito com ❤️ para oficinas que merecem organize-se melhor
</div>
