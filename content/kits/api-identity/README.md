# Identity Kit API — Kit inicial

Camada de identidade pronta: e-mail/senha, OAuth social, MFA TOTP, sessões
revogáveis e RBAC básico.

**Stack:** Node.js · TypeScript · PostgreSQL · Redis

## Rodando local

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:4100
```

## Estrutura

```
src/tokens.ts      Access token (JWT curto) + refresh token rotativo
src/mfa.ts         TOTP compatível com Google Authenticator / Authy
src/rbac.ts        Papéis e permissões
```

## Modelo de sessão

O kit usa **access token curto + refresh token rotativo**:

- **Access token:** JWT de 15 minutos, validado sem ir ao banco.
- **Refresh token:** opaco, de 30 dias, guardado no Redis como hash. Cada uso
  invalida o anterior e emite um novo.

Rotação existe para detectar roubo: se um refresh token já usado aparecer de
novo, ou ele foi replicado ou vazou. Nesse caso a família inteira de tokens
daquela sessão é revogada. `detectReuse` em `src/tokens.ts` implementa isso.

Guardamos apenas o **hash** do refresh token. Vazamento do Redis não vira sessão
válida.

## Por onde começar

1. **Defina os papéis** em `src/rbac.ts`. Comece com poucos; papel demais é a
   principal fonte de bug de permissão.
2. **Ligue um provedor social.** O fluxo é o mesmo para Google e GitHub: troque
   `code` por perfil, case pelo e-mail verificado, crie a sessão.
3. **MFA opcional por usuário**, obrigatório por papel. `src/mfa.ts` já valida com
   janela de tolerância para relógio dessincronizado.

## Segurança — não altere sem pensar

- `JWT_SECRET` precisa ter no mínimo 32 bytes aleatórios.
- Nunca aumente a validade do access token para "resolver" logout inesperado; o
  problema costuma ser o refresh não estar sendo chamado.
- Compare códigos TOTP em tempo constante (`timingSafeEqual`), como o kit faz.
