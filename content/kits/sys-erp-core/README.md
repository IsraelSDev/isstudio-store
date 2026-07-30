# ERP Core — Kit inicial

ERP modular para PMEs: financeiro, estoque, pedidos e documentos fiscais.

**Stack:** NestJS (API) · Next.js (painel) · PostgreSQL

## Estrutura do monorepo

```
apps/api/          NestJS — regras de negócio e integrações fiscais
apps/web/          Next.js — painel administrativo
packages/shared/   Tipos e contratos usados pelos dois lados
src/modules.ts     Registro dos módulos ativáveis
docker-compose.yml Postgres para desenvolvimento
```

Este kit entrega o **esqueleto do monorepo e o registro de módulos**. Cada módulo
(financeiro, estoque, pedidos, fiscal) é ativado por configuração.

## Rodando local

```bash
docker compose up -d        # Postgres em localhost:5432
npm install
cp .env.example .env
npm run dev                 # sobe api (3333) e web (3000)
```

## Ativando módulos

Edite `ERP_MODULES` no `.env`:

```env
ERP_MODULES=financeiro,estoque,pedidos
```

`src/modules.ts` valida a lista no boot e resolve as dependências entre módulos
— `pedidos` exige `estoque`, por exemplo. Se faltar uma dependência, a aplicação
falha ao subir em vez de quebrar em produção.

## Por onde começar

1. **Escolha os módulos** do primeiro cliente e desative o resto. Menos
   superfície, menos suporte.
2. **Plano de contas.** O financeiro assume plano de contas configurável; comece
   pelo modelo do contador do cliente.
3. **Integração fiscal.** O módulo `fiscal` é um adaptador. Implemente o provedor
   (Focus NFe, eNotas, PlugNotas) por trás da interface, não direto no controller.

## Decisões do kit

- **Módulos como registro explícito**, não descoberta automática de pastas.
  Boot previsível e erro claro quando falta dependência.
- **API separada do painel.** O ERP costuma ganhar integrações (PDV, marketplace,
  app de campo) que consomem a mesma API.
