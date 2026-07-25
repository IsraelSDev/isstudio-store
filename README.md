# ISStudio Store

Marketplace de soluções digitais — sistemas, APIs, templates, plugins, licenças, SaaS, IA, white label, hospedagem e assinaturas.

## Stack

- **Next.js 16** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS v4**
- Carrinho com persistência em `localStorage`
- Checkout simulado com **Asaas**, **Mercado Pago** e **PayPal**

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

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
