# 🚗 AutoSystem

## 📌 Descrição
O **AutoSystem** é uma plataforma SaaS robusta desenvolvida para a gestão completa de centros automotivos e oficinas. O sistema resolve o problema de organização administrativa ao centralizar o cadastro de clientes, veículos, controle de estoque de produtos, além de automatizar a criação de orçamentos e ordens de serviço (OS) com geração de PDF profissional.

O projeto conta com uma arquitetura multi-tenant, permitindo que diferentes oficinas (organizações) gerenciem seus próprios dados, além de um sistema de assinaturas integrado para monetização.

## 🚀 Funcionalidades

-   **Gestão de Organizações**: Suporte a multi-empresa com convites para membros.
-   **Controle de Clientes**: Cadastro completo com suporte a CPF e CNPJ.
-   **Gestão de Veículos**: Vínculo de veículos aos clientes com histórico de serviços.
-   **Estoque de Produtos**: Gerenciamento de peças e insumos com SKU e precificação.
-   **Sistema de Orçamentos**: Criação dinâmica de orçamentos com status (Pendente, Aprovado, Rejeitado).
-   **Ordens de Serviço (OS)**: Conversão automática de orçamentos em OS com controle de status (Aberto, Em Progresso, Concluído, Cancelado).
-   **Geração de PDF**: Emissão de documentos profissionais para orçamentos e ordens de serviço.
-   **Assinaturas (SaaS)**: Planos (Basic, Plus, Professional) com limites de recursos e checkout integrado via Stripe.
-   **Dashboard Estatístico**: Visualização rápida de métricas e volumes de atendimento.

## 🛠️ Tecnologias e Stack

-   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
-   **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
-   **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/)
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Autenticação**: [Better-Auth](https://better-auth.com/)
-   **Pagamentos**: [Stripe](https://stripe.com/)
-   **Estilização**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
-   **Formulários**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
-   **Relatórios**: [@react-pdf/renderer](https://react-pdf.org/)
-   **Linter/Formatter**: [Biome](https://biomejs.dev/)

## 📷 Demonstração / Screenshots

## ⚙️ Como rodar o projeto localmente

### Pré-requisitos
-   Node.js 20+
-   PostgreSQL
-   Stripe CLI (opcional para webhooks locais)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/autosystem.git
   cd autosystem
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente (veja a seção abaixo).

4. Execute as migrações do banco de dados:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

### Execução

Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
O projeto estará disponível em `https://autosystem.nulldev.com.br`.

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes chaves (exemplo):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/autosystem"

# Stripe
STRIPE_SECRET_KEY="sk_test_.."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."

# Better-Auth
BETTER_AUTH_SECRET="seu_secret_aqui"
BETTER_AUTH_URL="https://autosystem.nulldev.com.br"
NEXT_PUBLIC_APP_URL="https://autosystem.nulldev.com.br"
```

## 🧪 Testes

Atualmente, o projeto utiliza o **Biome** para garantir a qualidade do código e padronização:
```bash
npm run lint    # Verificar erros
npm run format  # Formatar código
```

## 📦 Estrutura do projeto

```text
src/
├── app/             # Rotas do Next.js e lógica de páginas
│   ├── (auth)/      # Rotas autenticadas (Dashboard, Clientes, etc)
│   ├── (public)/    # Páginas públicas (Landing, Login, Registro)
│   └── api/         # Endpoints de API (Auth, Stripe Webhooks)
├── components/      # Componentes UI reutilizáveis (Shadcn)
├── lib/             # Configurações de bibliotecas (Prisma, Auth, Stripe)
├── types/           # Definições de tipos TypeScript
└── utils/           # Funções utilitárias e lógica de permissões/planos
prisma/              # Esquema do banco de dados e migrações
```

## 📌 Roadmap / Melhorias futuras

- [ ] Implementar notificações via WhatsApp/E-mail para clientes.
- [ ] Módulo de fluxo de caixa e gestão financeira avançada.
- [ ] Aplicativo mobile para mecânicos registrarem fotos dos serviços.
- [ ] Suporte a múltiplos idiomas (i18n).

## 🤝 Contribuição

1. Faça um Fork do projeto.
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`).
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`).
4. Push para a branch (`git push origin feature/nova-feature`).
5. Abra um Pull Request.

## 📄 Licença

Copyright © 2026 AutoSystem. Todos os direitos reservados.
