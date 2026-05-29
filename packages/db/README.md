# @fms/db

PostgreSQL data layer for FMS Expert Agents. Schema source of truth: [`docs/architecture/03-database.md`](../../docs/architecture/03-database.md).

**ORM:** Prisma (migrations via `prisma migrate`).

## Setup

1. Copy environment variables from the repo root [`.env.example`](../../.env.example) or [`packages/db/.env.example`](./.env.example).
2. Set `DATABASE_URL` to a PostgreSQL 16 connection string (e.g. Neon `dev-local` branch).
3. Install dependencies from the monorepo root:

```bash
pnpm install
```

## Commands

Run from the repo root (recommended):

| Script | Command | Purpose |
|--------|---------|---------|
| Generate client | `pnpm db:generate` | Regenerate `@prisma/client` after schema changes |
| Create & apply migration | `pnpm db:migrate` | Interactive `prisma migrate dev` (requires `DATABASE_URL`) |
| Deploy migrations | `pnpm db:migrate:deploy` | `prisma migrate deploy` (CI / staging / prod) |
| Push schema (prototyping) | `pnpm db:push` | Sync schema without migration files |
| Studio | `pnpm db:studio` | Prisma Studio GUI |
| Seed | `pnpm db:seed` | Run `prisma/seed.ts` (skips when `NODE_ENV=production`) |

Or from this package:

```bash
pnpm --filter @fms/db db:generate
pnpm --filter @fms/db db:migrate
```

## First migration

When `DATABASE_URL` is set:

```bash
pnpm db:migrate
# Name prompt example: init
```

This creates `prisma/migrations/` and applies SQL to your database.

Without a database, you can still generate the client:

```bash
pnpm db:generate
```

## Exports

```typescript
import { prisma, db, SessionStatus, Prisma } from "@fms/db";
```

## Models

| Model | Table | Notes |
|-------|-------|-------|
| `User` | `users` | Clerk identity |
| `Session` | `sessions` | Think-tank run / LangGraph thread |
| `AgentAnalysis` | `agent_analyses` | Phase 1 outputs |
| `DebateTurn` | `debate_turns` | Phase 2 transcript |
| `ChallengeRecord` | `challenge_records` | Phase 3 challenges |
| `ConsensusDraft` | `consensus_drafts` | Phase 4 (1:1 with session) |
| `Report` | `reports` | Phase 5 SPRR |
| `Citation` | `citations` | Source references |
| `StreamEvent` | `stream_events` | SSE backfill |
| `GraphCheckpoint` | `graph_checkpoints` | LangGraph checkpointer (`thread_id` text, no FK) |
| `AuditEvent` | `audit_events` | Append-only audit log |
