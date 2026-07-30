# ISStudio Store

Marketplace de soluções digitais — sistemas, APIs, templates, plugins, licenças, SaaS, IA, white label, hospedagem e assinaturas.

## Stack

- **Next.js 16** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS v4**
- Carrinho com persistência em `localStorage`
- **Asaas** (Pix QR + cartão/boleto)
- **Supabase** (pedidos + hash dos códigos de resgate)
- **Resend** (e-mail com o código)
- Kits de código-fonte em `content/kits/` (ZIP gerado na hora do download)

## Fluxo de entrega

1. Cliente finaliza no `/checkout` (só Asaas).
2. O servidor cria o pedido `pending` no Supabase e a cobrança no Asaas.
3. Webhook (ou polling do Pix) confirma o pagamento → gera código `ABCD-EFGH-JKLM`.
4. O **hash** do código é gravado no banco; o código em texto vai no e-mail (Resend).
5. Em `/resgatar`, o cliente digita o código e baixa o `.zip` de cada produto.

O código em claro **não** fica no banco. Só o HMAC-SHA256 (`REDEEM_CODE_SECRET`).

## Como rodar

```bash
npm install
cp .env.example .env.local
# Preencha Asaas, Supabase e Resend
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. SQL Editor → cole e rode `supabase/schema.sql`
3. Project Settings → API → copie **URL** e **service_role** para o `.env.local`

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
REDEEM_CODE_SECRET=cole_um_segredo_longo
DOWNLOAD_TOKEN_SECRET=cole_outro_segredo_longo
```

### 2. Asaas

```env
ASAAS_API_KEY=$aact_...
ASAAS_ENV=sandbox
ASAAS_WEBHOOK_TOKEN=seu_token
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

No painel Asaas → Webhooks: `https://seu-dominio.com/api/webhook/asaas`  
Eventos: `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`.

| Endpoint | Uso |
|----------|-----|
| `POST /api/payments/asaas` | Cria pedido + cobrança |
| `GET /api/payments/asaas/[id]/status` | Polling Pix (também dispara a entrega) |
| `POST /api/webhook/asaas` | Confirma pagamento e emite o código |

Em **localhost** o webhook não chega: o polling do Pix cuida da entrega.

### 3. Resend

```env
RESEND_API_KEY=re_...
RESEND_FROM=ISStudio Store <no-reply@seu-dominio.com>
```

Sem `RESEND_API_KEY` o pagamento ainda confirma e o código aparece na tela de sucesso do Pix; só o e-mail fica desligado.

## Kits de código-fonte

Cada produto do catálogo tem uma pasta em `content/kits/<product-id>/`.  
No download, o servidor empacota a pasta (+ `_shared/` + `LICENCA.txt`) em `.zip`.

Para atualizar um kit, edite os arquivos e faça deploy — não há passo de upload.

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Home |
| `/catalogo` | Catálogo completo |
| `/categorias/[slug]` | Produtos da categoria |
| `/produto/[slug]` | Detalhe do produto |
| `/assinaturas` | Planos Studio+ |
| `/checkout` | Checkout Asaas |
| `/resgatar` | Resgate com código do e-mail |

| API | Descrição |
|-----|-----------|
| `POST /api/orders/redeem` | Valida o código e devolve tokens de download |
| `GET /api/downloads/[productId]?token=...` | Baixa o ZIP (token de 1h) |

## Segurança (resumo)

- Preço recalculado no servidor a partir do catálogo (cliente só manda `id` + `quantity`)
- Código de resgate armazenado como HMAC, nunca em texto
- Links de download com token assinado de vida curta
- Rate limit no endpoint de resgate
- RLS ligado nas tabelas; só a `service_role` (servidor) acessa

## Licença

Projeto privado — ISStudio.
