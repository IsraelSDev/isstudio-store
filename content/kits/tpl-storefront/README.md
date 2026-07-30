# Storefront Commerce

E-commerce headless de alta conversão em Next.js.

**Stack:** Next.js 16 · Zustand · Tailwind CSS v4

## Rodando local

```bash
npm install
npm run dev
```

## Estrutura

```
src/store/cart.ts          Carrinho persistente (Zustand + localStorage)
src/lib/catalog.ts         Produtos de exemplo
src/app/page.tsx           Vitrine
src/app/checkout/page.tsx  Checkout (plugue seu gateway)
```

## Por onde começar

1. **Troque o catálogo** em `src/lib/catalog.ts` pela sua API ou CMS.
2. **Ligue o gateway** na página de checkout. O store já expõe `subtotal` e
   `items` no formato certo para Payments Gateway API.
3. **SEO.** As páginas usam `generateMetadata` — preencha title/description por
   produto.

## Decisões do kit

- **Carrinho no cliente.** Persistência local sobrevive a refresh; o servidor só
  entra no checkout.
- **Preço só no servidor na cobrança.** O valor exibido no carrinho é
  informativo — a API de pagamento deve recalcular a partir do catálogo.