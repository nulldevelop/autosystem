# AutoSystem

> SaaS de gestão para oficinas mecânicas: orçamentos, ordens de serviço, estoque, financeiro e CRM.

| | |
|---|---|
| **Tipo** | SaaS próprio · multi-tenant, com assinatura paga |
| **Status** | Em produção |
| **Meu papel** | Idealização, design e desenvolvimento completos |

## Sobre o projeto

O AutoSystem substitui planilhas e cadernos em oficinas mecânicas. O orçamento vira ordem de serviço, o cliente aprova por um link público (sem login) com assinatura digital, e o estoque e o financeiro acompanham cada serviço.

## Funcionalidades

- Clientes e veículos
- Orçamentos com fotos e itens, convertidos em ordens de serviço
- Aprovação pelo cliente via link público com assinatura digital
- Estoque de produtos com movimentações
- Financeiro: transações e acompanhamento de receitas
- Planos mensais e anuais (Basic, Plus e Pro) com cobrança por assinatura via AbacatePay
- Integração com WhatsApp (mensagens e contas)
- Geração de PDF dos documentos
- Multi-organização com membros e convites, painel administrativo com auditoria
- Notificações e e-mails transacionais

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Prisma · PostgreSQL · Better Auth · React PDF · Resend · AbacatePay · WhatsApp Cloud API · Framer Motion · Vitest · Biome

## Como rodar

Pré-requisitos: Node.js 20+, npm e PostgreSQL.

```bash
npm install
cp .env.example .env   # preencha as variáveis
npx prisma migrate dev
npm run dev
```

Testes: `npm test`.

## Variáveis de ambiente

`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `ABACATEPAY_API_KEY` (e os ids de produto dos planos), `ABACATEPAY_WEBHOOK_SECRET` e as credenciais da WhatsApp Cloud API.

## Autor

**Pedro Andrade** — Desenvolvedor Full Stack · [null.dev](https://nulldev.com.br) · [LinkedIn](https://linkedin.com/in/pedrodevfull) · [GitHub](https://github.com/nulldevelop)