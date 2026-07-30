# Payments Gateway API — Kit inicial

Uma API para cobrar via Asaas, Mercado Pago e PayPal, com webhooks normalizados
em um único formato de evento.

**Stack:** Node.js · TypeScript · OpenAPI 3.1 · Redis

## Rodando local

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:4000
```

`GET /health` responde com os provedores configurados.

## Estrutura

```
openapi.yaml                Contrato da API (gere SDKs a partir dele)
src/providers/index.ts      Interface Provider + registro
src/providers/asaas.ts      Implementação de referência
src/webhooks/normalize.ts   Payload de cada gateway → PaymentEvent único
```

## O problema que este kit resolve

Cada gateway nomeia as coisas de um jeito: o Asaas manda `RECEIVED`, o Mercado
Pago `approved`, o PayPal `COMPLETED`. Sem uma camada de tradução, essa diferença
vaza para o seu domínio e cada regra de negócio precisa conhecer três dicionários.

Aqui o webhook de qualquer provedor vira um `PaymentEvent` com status
`pending | paid | failed | refunded`. Sua aplicação só conhece esses quatro.

## Por onde começar

1. **Implemente um provedor só.** Comece pelo que você já usa; a interface
   `Provider` em `src/providers/index.ts` mostra o que precisa existir.
2. **Valide assinatura de webhook** antes de confiar no corpo. O adaptador do
   Asaas mostra o padrão com o header `asaas-access-token`.
3. **Idempotência.** Gateways reentregam eventos. Use o `externalReference` como
   chave e guarde no Redis o que já foi processado.
4. **Gere o SDK** com `npm run sdk` (openapi-typescript) e publique no seu registry
   privado.

## Decisões do kit

- **Contrato antes do código.** O `openapi.yaml` é a fonte da verdade; tipos e SDK
  saem dele.
- **Redis só para idempotência e cache**, nunca como banco primário de cobranças.
- **Valores em centavos (inteiro).** Elimina erro de ponto flutuante entre
  provedores que usam formatos diferentes.
