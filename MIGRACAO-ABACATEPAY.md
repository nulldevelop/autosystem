# Migração Stripe → AbacatePay: passo a passo

O código já está migrado. Falta configurar a conta, o banco e o `.env`.

## 1. Criar a conta e a chave de API

1. Acesse https://www.abacatepay.com e crie/entre na conta.
2. Em **Integração → Criar Chave**, marque estas permissões (não dá para editar depois; se faltar uma, crie outra chave):
   - `PRODUCT:CREATE` e `PRODUCT:READ` (script que cria os produtos)
   - `CUSTOMER:CREATE` (cadastrar o cliente)
   - `SUBSCRIPTION:CREATE` (criar o checkout de assinatura)
   - `SUBSCRIPTION:READ` (o webhook consulta o status real)
   - `SUBSCRIPTION:DELETE` (cancelar a assinatura antiga na troca de plano)
   - Sem a permissão, a API responde `Insufficient permissions`. Tabela completa: https://docs.abacatepay.com/pages/authentication
3. Comece no **Modo Sandbox/Dev** para testar sem cobrança real. Veja https://docs.abacatepay.com/pages/devmode

## 2. Criar os 6 produtos (assinaturas)

A API da AbacatePay tem **um preço e um ciclo por produto**, então são 6 produtos (3 planos x mensal/anual).
Os produtos "com mensal e anual juntos" do painel **não** servem: a API não permite escolher o período neles.
Você pode apagar/arquivar os 3 produtos criados antes.

Com `ABACATEPAY_API_KEY` já no `.env` (passo 3), rode:

```bash
node --env-file=.env scripts/create-abacatepay-products.mjs
```

O script cria os 6 produtos (ou reaproveita se já existirem) e imprime as linhas `ABACATEPAY_*_PRODUCT_ID` para colar no `.env`.
Preços: Basic 79,99 / 799,90, Plus 119,99 / 1.199,90, Professional 179,99 / 1.799,90 (mensal / anual).
Não use `trialDays`: o trial de 14 dias é do próprio sistema.

## 3. Configurar o `.env`

Remova as variáveis `STRIPE_*` e `NEXT_PUBLIC_STRIPE_*` e adicione:

```env
ABACATEPAY_API_KEY="abc_..."
ABACATEPAY_WEBHOOK_SECRET="um_segredo_longo_e_aleatorio"

ABACATEPAY_BASIC_MONTHLY_PRODUCT_ID="prod_..."
ABACATEPAY_BASIC_YEARLY_PRODUCT_ID="prod_..."
ABACATEPAY_PLUS_MONTHLY_PRODUCT_ID="prod_..."
ABACATEPAY_PLUS_YEARLY_PRODUCT_ID="prod_..."
ABACATEPAY_PRO_MONTHLY_PRODUCT_ID="prod_..."
ABACATEPAY_PRO_YEARLY_PRODUCT_ID="prod_..."

# já existente, usada nas URLs de retorno do checkout
NEXT_PUBLIC_APP_URL="https://autosystem.nulldev.com.br"
```

Gere o segredo do webhook com, por exemplo: `openssl rand -hex 32`.

## 4. Atualizar o banco

```bash
npx prisma db push
npx prisma generate
```

Atenção:
- As colunas `stripe_*` da tabela `Subscription` são trocadas por `abacatepay_*`. Os dados do Stripe nessas colunas são perdidos.
- Quem já está com `status = 'active'` continua com acesso, mas a data de vencimento (`current_period_end`) fica vazia. Se quiser preservar, copie antes:
  ```sql
  SELECT user_id, stripe_current_period_end FROM "Subscription" WHERE status = 'active';
  ```
  e depois preencha `current_period_end` com esses valores.
- Faça backup do banco antes.

## 5. Cadastrar o webhook

1. No painel da AbacatePay, vá em **Webhooks** (ou `POST /webhooks/create`).
2. Preencha:
   - **endpoint:** `https://SEU_DOMINIO/api/webhooks/abacatepay?webhookSecret=<mesmo valor de ABACATEPAY_WEBHOOK_SECRET>`
   - **secret:** o mesmo valor
   - **events:** `subscription.completed`, `subscription.renewed`, `subscription.cancelled`
3. O endpoint precisa ser HTTPS público. Em desenvolvimento use um túnel (ngrok, cloudflared) apontando para `localhost:3000`.

## 6. Testar no sandbox

1. `npm run dev` (com túnel e webhook apontando para ele).
2. Crie uma conta, entre em **Dashboard → Planos** e clique em **Ativar** em um plano.
3. Conclua o pagamento no checkout da AbacatePay (sandbox).
4. Confira:
   - O webhook chegou (log do servidor) e a linha em `Subscription` ficou com `status = 'active'`, `plan` correto e `abacatepay_subscription_id` preenchido.
   - Se o payload do webhook tiver formato diferente do esperado, o log mostra `Webhook sem identificador de assinatura` ou `Assinatura local não encontrada`. Me envie o corpo do evento para ajustar.
5. Teste a **troca de plano**: assine outro plano. A assinatura anterior deve ser cancelada na AbacatePay.
6. Teste o **cancelamento**: cancele no painel e confira `status = 'canceled'` e perda de acesso.

## 7. Testar a indicação

1. Na conta A, abra **Planos** e copie o link de indicação (`/auth?mode=signup&ref=CODIGO`).
2. Abra o link em aba anônima e crie a conta B.
3. Na conta B, assine um plano (sandbox).
4. Na conta A, confira em **Planos** que "Já pagaram" subiu para 1 e "Meses ganhos" para 2. No banco, `Subscription.bonus_until` da conta A deve estar ~2 meses à frente.
5. Reenvie o mesmo webhook: o bônus **não** deve ser concedido de novo.

## 8. Ir para produção

1. Troque a chave de API e os IDs de produto pelos de produção (os do sandbox não valem).
2. Recadastre o webhook com o domínio de produção.
3. Faça `npm run build` e deploy.
4. Cancele as assinaturas antigas no Stripe quando os clientes tiverem migrado.

## Pontos de atenção

- O corpo exato dos eventos de assinatura não está documentado publicamente; o código busca IDs `subs_`/`cust_` no payload e confirma o status na API. Valide no sandbox (passo 6).
- A assinatura HMAC (`X-Webhook-Signature`) não é verificada; a proteção é o `webhookSecret` na URL.
- O fim do período é calculado localmente (+1 ou +12 meses), pois a API não devolve a próxima data de cobrança.
- Indicador que já paga: os 2 meses ficam em `bonus_until` e valem como acesso se ele cancelar; a AbacatePay não abate a próxima fatura.
- Indicador sem plano pago usa o plano Plus durante os meses de brinde.
