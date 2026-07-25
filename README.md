# ISStudio Store

Marketplace de soluções digitais — sistemas, APIs, templates, plugins, licenças, SaaS, IA, white label, hospedagem e assinaturas.

## Stack

- **Next.js 16** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS v4**
- Carrinho com persistência em `localStorage`
- **Asaas real** (mesmo cliente/fluxo do Capivara: Pix QR + cartão/boleto)
- Mercado Pago e PayPal ainda simulados

## Como rodar

```bash
npm install
cp .env.example .env.local
# Cole a mesma ASAAS_API_KEY do Capivara (Render / sandbox.asaas.com)
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Asaas (mesmas vars do Capivara)

```env
ASAAS_API_KEY=$aact_hmlg_...   # ou produção
ASAAS_ENV=sandbox
ASAAS_WEBHOOK_TOKEN=seu_token
```

| Endpoint | Uso |
|----------|-----|
| `POST /api/payments/asaas` | Cria cobrança (Pix / cartão / boleto) |
| `GET /api/payments/asaas/[id]/status` | Polling de confirmação Pix |
| `POST /api/webhook/asaas` | Webhook `PAYMENT_RECEIVED` / `PAYMENT_CONFIRMED` |

Webhook no painel Asaas: `{APP_URL}/api/webhook/asaas` — header `asaas-access-token`.

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

1. Integrar APIs reais de Asaas, Mercado Pago e PayPal
2. Persistência de pedidos (banco + auth)
3. Painel admin para cadastro de produtos
4. Entrega automática (download / chave / provisionamento SaaS)

## Licença

Projeto privado — ISStudio.
