# Readora

A retrieval-augmented chat interface for PDF documents. Upload a file and ask grounded, citation-style questions. This README documents the retrieval pipeline and the design choices behind it.

## Pipeline

```
PDF ─▶ parse (pdf-parse) ─▶ chunk (1000c / 200 overlap, recursive)
                              │
                              ▼
                       embed (Gemini gemini-embedding-001, 768-d)
                              │
                              ▼
                  upsert ─▶ Pinecone (one namespace per file)
                              │
  user query ─▶ embed ─▶ query (top-K=5, score ≥ 0.5) ─▶ context
                                                              │
                                                              ▼
                              streamText (Gemini 2.0 Flash) ─▶ UI
```

Every stage is its own module under `lib/rag/` — chunking, embeddings, vectorstore, ingest, retrieval. Swapping the embedding model or the vector store is a one-file change.

## Architecture

```
app/
  api/
    upload/         Vercel Blob handle-upload endpoint (signed client uploads)
    create-chat/    Ingests the uploaded PDF and creates a chat row
    chat/           Streaming chat endpoint (retrieves context, calls LLM)
    get-messages/   Loads persisted message history
  chat/[chatId]/    Two-pane chat UI (PDF viewer + chat)
  page.tsx          Landing & upload

lib/
  rag/              embeddings · chunking · vectorstore · ingest · retrieval
  storage/          Vercel Blob download helper
  db/               Drizzle schema + Neon Postgres client
  utils.ts

components/
  buttons/          Client-side upload widget
  layouts/          Sidebar, chat, PDF viewer
  ui/               Radix primitives
```

## Stack

| Layer        | Choice                                  |
| ------------ | --------------------------------------- |
| Embedder     | Google `gemini-embedding-001` (768-d, asymmetric task types) |
| Vector store | Pinecone (file-key namespaces)          |
| LLM          | `gemini-2.5-flash` (streaming)          |
| Chunker      | RecursiveCharacterTextSplitter (1000/200) |
| Storage      | Vercel Blob (client uploads, 10MB cap)  |
| Database     | Neon Postgres + Drizzle ORM             |
| Auth         | Clerk                                   |
| Framework    | Next.js 15 (App Router) + Bun           |

## Local development

```bash
bun install
cp .env.example .env
# fill in the env vars
bun run db:push      # apply schema to Neon
bun run dev          # http://localhost:3000
```

## Known limitations

- Text-only PDF parsing. Tables and figures are flattened to whitespace.
- No reranker — raw cosine similarity decides top-K.
- No retrieval evaluation harness yet (Recall@K / MRR / Faithfulness). On the roadmap.
- Pure vector search; no hybrid (BM25 + dense) fallback for queries with rare tokens.

## Roadmap

1. Eval harness with a labeled QA set; publish Recall@K, MRR, and LLM-judged faithfulness.
2. Cross-encoder reranker between Pinecone top-25 → final top-5.
3. Swap Pinecone for `pgvector` on Neon (collapse two services into one).
4. Hybrid search via Postgres `tsvector` + RRF fusion.
5. Query rewriting / HyDE for short queries.
