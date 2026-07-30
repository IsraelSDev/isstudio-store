# Inbox Studio

SaaS de atendimento omnichannel: e-mail, WhatsApp e chat no mesmo painel.

**Stack:** Next.js · Redis · WebSocket

## Rodando local

```bash
npm install
cp .env.example .env
npm run dev
```

## Estrutura

```
src/lib/channels.ts     Contrato comum de canais (e-mail, WhatsApp, chat)
src/lib/queues.ts       Filas, SLA e atribuição de agentes
src/app/inbox/page.tsx  Inbox unificada (placeholder)
```

## Por onde começar

1. Implemente um canal de cada vez atrás da interface `ChannelAdapter`.
2. Defina SLAs em `src/lib/queues.ts` — o dashboard deriva o status delas.
3. Multi-tenant: cada workspace tem `tenantId`; filtre sempre por ele.

## Decisões do kit

Canais como adaptadores. A inbox só conhece `InboundMessage` — WhatsApp Cloud
API, Gmail ou widget web entram pela mesma porta.
