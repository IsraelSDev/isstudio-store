# RAG Knowledge Kit

Kit self-hosted para indexar PDFs/Notion e responder com citações.

**Stack:** Python · pgvector · Next.js

## Rodando local

```bash
docker compose up -d
cp .env.example .env
pip install -r requirements.txt
python -m ingest.cli ./docs
npm run dev --prefix web
```

## Estrutura

```
ingest/chunking.py     Split semântico com overlap
ingest/embed.py        Embeddings + upsert no pgvector
web/                   UI de chat com citações
docker-compose.yml     Postgres + pgvector
```

## Por onde começar

1. Coloque PDFs/Markdown em `./docs` e rode o ingest.
2. Ajuste `CHUNK_SIZE` / `CHUNK_OVERLAP` se as respostas ficarem genéricas.
3. Sempre devolva `citations` — a UI destaca o trecho citado.

## Decisões do kit

Chunking com overlap. Sem overlap, respostas que cruzam a fronteira de dois
chunks perdem contexto. Com overlap demais, o custo de embedding explode —
comece em 200 tokens de overlap.
