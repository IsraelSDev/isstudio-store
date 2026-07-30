# Shopify Upsell Pro

App Shopify para ofertas pós-add-to-cart e na thank-you page.

**Stack:** Remix · React · Shopify App Bridge

## Rodando local

```bash
npm install
cp .env.example .env
npm run dev
```

Use o CLI do Shopify (`shopify app dev`) para abrir o túnel e instalar na loja de teste.

## Estrutura

```
app/lib/rules.ts            Motor de regras (coleção, ticket, tags)
app/routes/app._index.tsx   Painel de campanhas (placeholder)
```

## Por onde começar

1. Crie a primeira campanha — produto ofertado + regra de disparo.
2. A/B: cada campanha tem variantes com peso; o motor escolhe e registra impressão.
3. Conversão é contabilizada no webhook `orders/create`.

## Decisões do kit

Regras no servidor. A theme extension só pergunta "o que oferecer?" — a decisão
fica na API, então A/B e inventário não vazam para o storefront.
