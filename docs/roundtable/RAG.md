# Historical Round Table — Figure RAG

Per-figure knowledge bases ground debate replies in user-provided sources. Built-in figures still use their profile (`style` in `historical-figures.ts`) when no chunks are indexed.

## Storage

- **Path:** `.data/figure-rag/store.json` at the monorepo root (gitignored).
- **Format:** JSON document with `sources` and `chunks` (each chunk stores an OpenAI embedding vector).
- **Why JSON:** Avoids native SQLite bindings in Next.js; same logical model as `figure_chunks(figure_id, chunk_id, content, embedding_json, source_name, source_type, created_at)`.

## Adding knowledge (UI)

1. Open **Round Table** → figure card → **book** icon (or active participant bar).
2. **Add text:** paste notes, set source name, click **Index text**.
3. **Upload:** PDF, `.txt`, or `.md` (max 8 MB). Text is extracted server-side with `pdf-parse`.
4. **Delete:** trash icon on a source removes it and all its chunks.

Custom figures (`custom-*` ids) use the same APIs and storage keyed by figure id.

## API

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/roundtable/figures/[figureId]/knowledge` | List sources + chunk count |
| `POST` | `/api/roundtable/figures/[figureId]/knowledge` | Body: `{ text, sourceName, sourceType }` |
| `POST` | `/api/roundtable/figures/[figureId]/knowledge/upload` | Multipart `file`, optional `sourceName` |
| `DELETE` | `/api/roundtable/figures/[figureId]/knowledge/[sourceId]` | Remove source + chunks |

Requires `OPENAI_API_KEY` (see `secrets/openai.env`) for embedding and debate retrieval.

## Debate retrieval

Before each chat completion, `retrieveFigureContext` embeds the query (topic + recent transcript + mode), loads top **3–5** chunks by cosine similarity, and appends a **Retrieved knowledge** block to the system prompt. The API may return `citations: { sourceName, snippet }[]` for transcript footnotes.

If no chunks exist, behavior is unchanged (`buildFigureSystemPrompt` only).

## Code layout

- `apps/web/src/lib/figure-rag/` — chunking, embeddings, store, retrieve, ingest
- `apps/web/app/api/roundtable/figures/[figureId]/knowledge/` — HTTP routes
- `apps/web/app/api/roundtable/chat/route.ts` — RAG injection
- `apps/web/src/components/roundtable/FigureKnowledgePanel.tsx` — UI

## Limitations (v1)

- **URL / link import:** not implemented (UI stub only).
- **Built-in figures:** not pre-indexed; only user uploads create chunks.
- **Store:** single local file; not shared across machines or Vercel serverless instances without a shared volume.
- **Embeddings model:** `text-embedding-3-small` via `getOpenAIEmbedding()` in `load-secrets.ts`.
