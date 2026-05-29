# FMS Expert Agents

**Building Peace Through Intelligence, Diplomacy, and Human Dignity.**

Multi-agent AI think tank: 13 domain experts independently analyze strategic topics, debate and challenge assumptions, and produce consensus **Strategic Peace Recommendation Reports (SPRR)**.

## Status

Architecture documentation is complete. The **Turborepo monorepo** includes `apps/web` REST + SSE API routes and `packages/*`. See **[apps/web/README.md](./apps/web/README.md)** for endpoints and curl examples.

## Quick start

```bash
pnpm install
pnpm dev
```

## Documentation

Start here: **[docs/README.md](./docs/README.md)** · Master overview: **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**

## Official publication

**FMS Strategic Review, Volume 1, Issue 1 (2026)** — flagship policy publication (Markdown), **authored and edited by Dr. Fatih Sayin**, Foundation for Multilateral Strategies (FMS):

**[reports/FMS-Strategic-Review-AI-Diplomacy-Peace-Publication.md](./reports/FMS-Strategic-Review-AI-Diplomacy-Peace-Publication.md)**

Multidisciplinary study on AI-powered diplomacy and the FMS Peace Architecture Framework™. HTML journal exports under `reports/publication/` are deprecated; see [reports/publication/README.md](./reports/publication/README.md).

## Tech Stack (Planned)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router), TypeScript, shadcn/ui |
| Orchestration | **LangGraph.js** |
| LLM | OpenAI (structured outputs) |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Deployment | Vercel |

## Legacy Prototype

The `debate/` folder contains an early Python prototype using the OpenAI Agents SDK with three generic personas. It is **deprecated** in favor of the architecture in `docs/`. See [docs/ARCHITECTURE.md § Legacy Code](./docs/ARCHITECTURE.md#legacy-code).

## License

TBD
