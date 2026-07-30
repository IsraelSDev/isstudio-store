# Agente de Vendas IA

SDR virtual que qualifica leads no WhatsApp/web e agenda reuniões.

**Stack:** LLM · RAG · WhatsApp Cloud API

## Rodando local

```bash
npm install
cp .env.example .env
npm run dev
```

## Estrutura

```
src/lib/playbook.ts     Qualificação BANT e estados da conversa
src/lib/handoff.ts      Critérios de transferência para humano
prompts/system.md       Prompt de sistema editável
```

## Por onde começar

1. Edite `prompts/system.md` com o playbook comercial da empresa.
2. Ajuste os critérios BANT em `src/lib/playbook.ts`.
3. Conecte o calendário (Google Calendar / Calendly) no handoff de agenda.

## Decisões do kit

Estado da conversa é explícito (máquina de estados), não só o histórico do LLM.
Assim o agente não "pula" etapas e o handoff humano sabe exatamente onde parou.
