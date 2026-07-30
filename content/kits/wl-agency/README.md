# Agency White Label Suite

Painel de revenda: branding custom, clientes e margem recorrente.

**Stack:** Next.js multi-tenant · Billing

## Rodando local

```bash
npm install
cp .env.example .env
npm run dev
```

## Estrutura

```
src/lib/tenants.ts      Resolução de tenant por domínio / slug
src/lib/branding.ts     Tokens de marca por tenant
src/lib/commissions.ts  Cálculo de comissão recorrente
kit-vendas/             Scripts e one-pagers para o time comercial
```

## Por onde começar

1. Cadastre o primeiro tenant com domínio próprio.
2. Aplique branding via `resolveBranding(tenant)`.
3. Defina a tabela de comissão em `src/lib/commissions.ts`.

## Decisões do kit

Tenant resolvido no edge/middleware pelo Host header. Assim o mesmo deploy
serve `app.agencia.com` e `cliente.agencia.com` sem build por cliente.
