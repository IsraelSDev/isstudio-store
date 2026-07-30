# Aurora SaaS Kit

Template de SaaS dark premium: landing, pricing, dashboard, settings e auth.

**Stack:** Next.js 16 · Tailwind CSS v4 · Radix UI

## Rodando local

```bash
npm install
npm run dev
```

## Estrutura

```
src/app/(marketing)/     Landing, pricing, features
src/app/(app)/           Dashboard autenticado
src/components/ui/       Componentes Radix + tokens
src/styles/tokens.css    Design tokens (cores, raios, sombras)
```

## Por onde começar

1. **Ajuste os tokens** em `src/styles/tokens.css` — a identidade visual inteira
   deriva daí. Não hardcode cores nos componentes.
2. **Troque o copy** das páginas de marketing. O layout já está pronto; o texto
   é o que converte.
3. **Ligue a autenticação.** As rotas em `(app)` assumem um usuário logado;
   conecte ao Identity Kit ou ao seu provedor.

## Decisões do kit

- **Route groups** `(marketing)` e `(app)` compartilham o root layout mas
  têm shells diferentes — header público vs. sidebar.
- **Tokens CSS**, não utilitários hardcoded. Trocar a marca é editar um arquivo.