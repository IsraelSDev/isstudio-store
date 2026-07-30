# CRM Pulse — Kit inicial

CRM comercial com pipeline Kanban, leads, tarefas e metas.

**Stack:** Next.js 16 (App Router) · Prisma · PostgreSQL · Tailwind CSS v4

## Rodando local

```bash
npm install
cp .env.example .env
# aponte DATABASE_URL para um Postgres seu
npx prisma migrate dev --name init
npm run dev
```

Abra http://localhost:3000.

## Estrutura

```
prisma/schema.prisma   Modelo de dados (Lead, Stage, Task, User)
src/app/page.tsx       Board do pipeline
src/lib/db.ts          Cliente Prisma (singleton)
src/lib/pipeline.ts    Estágios, cálculo de métricas e regras do funil
```

## Por onde começar

1. **Ajuste os estágios** em `src/lib/pipeline.ts` para o funil da sua operação.
   Todo o resto (board, métricas, filtros) lê dessa lista.
2. **Rode a primeira migration** e cadastre leads pelo Prisma Studio
   (`npx prisma studio`) para ver o board populado.
3. **Ligue a autenticação.** O kit deixa `ownerId` no modelo `Lead`; conecte ao
   seu provedor (NextAuth, Clerk, Identity Kit API) e filtre por usuário.
4. **Automação de follow-up.** `nextFollowUpAt` já existe no schema — crie um cron
   que busca os vencidos e dispara o e-mail.

## Decisões do kit

- **Sem biblioteca de estado.** O board usa Server Components e Server Actions;
  o estado vive no banco. Isso evita divergência entre UI e dados.
- **Estágios como dados, não enum do banco.** Trocar o funil não exige migration.
- **`Decimal` para valores.** Nunca use float para dinheiro.

## Próximos passos sugeridos

- Relatórios de conversão por estágio e por vendedor
- Importação de leads via CSV
- Webhooks de entrada (formulário do site → lead)
