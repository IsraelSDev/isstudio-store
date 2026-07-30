# Edge Hosting

Hospedagem Next.js com CDN, SSL e preview deployments.

**Stack:** Edge · Docker · Nginx

## Conteúdo do kit

Este pacote traz o **guia de provisionamento** e os templates de config que o
time de infra usa ao liberar um projeto no plano Edge Hosting.

```
nginx/nextjs.conf.template   Reverse proxy + cache de estáticos
scripts/healthcheck.sh       Probe HTTP usado no monitoramento
PROVISIONAMENTO.md           Passo a passo pós-compra
```

Após a compra, o provisionamento automático (quando disponível) usa os mesmos
arquivos. Enquanto isso, abra um chamado com o número do pedido.
