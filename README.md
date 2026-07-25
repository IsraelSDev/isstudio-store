# ISStudio Store

Marketplace de soluções digitais — sistemas, APIs, templates, plugins, licenças, SaaS, IA, white label, hospedagem e assinaturas.

## Stack

- **Next.js 16** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS v4**
- Carrinho com persistência em `localStorage`
- **Asaas real** (Pix QR + cartão/boleto — mesmo cliente do Capivara)
- **Mercado Pago Checkout Pro** (Preference API → redirect)
- PayPal ainda simulado

## Como rodar

```bash
npm install
cp .env.example .env.local
# Preencha Asaas e/ou Mercado Pago
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Mercado Pago (Checkout Pro)

1. Acesse [developers.mercadopago.com.br/panel/app](https://www.mercadopago.com.br/developers/panel/app)
2. Crie/selecione a aplicação → **Credenciais de produção** (conta aprovada)
3. Copie o **Access Token** para o `.env.local`:

```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_ENV=production
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

4. No painel MP → **Webhooks**: URL `https://seu-dominio.com/api/webhook/mercadopago` (evento `payment`)

| Endpoint | Uso |
|----------|-----|
| `POST /api/payments/mercadopago` | Cria Preference e devolve `init_point` |
| `POST /api/webhook/mercadopago` | Notificação de pagamento |
| `/checkout/sucesso` | Retorno aprovado |
| `/checkout/falha` | Retorno rejeitado |
| `/checkout/pendente` | Pix/boleto em análise |

Em **localhost**, o redirect funciona; o webhook só chega com URL pública (ngrok/produção).

### Asaas

```env
ASAAS_API_KEY=$aact_...
ASAAS_ENV=sandbox
ASAAS_WEBHOOK_TOKEN=seu_token
```

| Endpoint | Uso |
|----------|-----|
| `POST /api/payments/asaas` | Cria cobrança (Pix / cartão / boleto) |
| `GET /api/payments/asaas/[id]/status` | Polling de confirmação Pix |
| `POST /api/webhook/asaas` | Webhook `PAYMENT_RECEIVED` / `PAYMENT_CONFIRMED` |

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Home |
| `/catalogo` | Catálogo completo |
| `/categorias` | Lista de categorias |
| `/categorias/[slug]` | Produtos da categoria |
| `/produto/[slug]` | Detalhe do produto |
| `/assinaturas` | Planos Studio+ |
| `/checkout` | Checkout multi-gateway |

## Próximos passos

1. PayPal real
2. Persistência de pedidos (banco + auth)
3. Painel admin para cadastro de produtos
4. Entrega automática (download / chave / provisionamento SaaS)

## Licença

Projeto privado — ISStudio.
