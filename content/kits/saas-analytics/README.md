# Pulse Analytics

Product analytics privacy-first: funis, cohorts e SDK leve.

**Stack:** Go (ingest) · ClickHouse · React (dashboard)

## Rodando local

```bash
docker compose up -d   # ClickHouse
cp .env.example .env
# SDK JS em packages/sdk — 2kb gzipped target
```

## Estrutura

```
packages/sdk/src/index.ts   SDK browser (beacon + queue offline)
infra/clickhouse/init.sql   Tabelas de eventos e materializadas
src/lib/funnels.ts          Definição e cálculo de funis
```

## Por onde começar

1. Embuta o SDK com `pulse('track', 'signup_started')`.
2. Defina funis em `src/lib/funnels.ts`.
3. Cohorts usam a tabela materializada `user_first_seen`.

## Decisões do kit

- **Sem cookies de terceiros.** Identidade é `anonymousId` em localStorage +
  `userId` opcional após login.
- **Beacon API** com fallback para `fetch` keepalive — sobrevive a navegação.
- Eventos em ClickHouse, não em Postgres: volume alto, agregação barata.
