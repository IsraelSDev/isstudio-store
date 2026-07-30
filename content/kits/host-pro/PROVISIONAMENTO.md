# Provisionamento — Pro Cloud

1. Você recebe IP, usuário SSH e senha temporária por e-mail (troque no 1º login).
2. Postgres e Redis já sobem via compose de referência.
3. Aponte o domínio e peça o SSL (Let's Encrypt automático).
4. Migração assistida: envie dump + variáveis; o time aplica em horário combinado.

## Acesso

- SSH na porta 22 (chave preferível a senha)
- Painel de métricas: URL no e-mail de boas-vindas
- Backups: diários, retenção 14 dias
