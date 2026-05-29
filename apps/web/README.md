# FMS Expert Agents — Web App

Next.js App Router frontend for the multi-agent peace think tank dashboard.

## Pages

| Route | Description |
|-------|-------------|
| `/` · `/dashboard` | Home: mission statement, how-it-works, recent sessions |
| `/sessions` | Session list with status badges and pagination |
| `/sessions/new` | Topic submission: context, debate rounds, expert selection |
| `/sessions/[id]` | Live session: phase timeline, SSE debate feed, analyses, consensus, SPRR |
| `/agents` | Directory of all 13 domain experts |

Auth routes (`/sign-in`, `/sign-up`) use Clerk placeholders for production; the dashboard works without auth in local development when API stubs allow unauthenticated access.

## Development

From the **monorepo root**:

```bash
pnpm install
pnpm dev
```

The web app runs at [http://localhost:3000](http://localhost:3000) (`@fms/web` on port 3000).

From this package only:

```bash
pnpm dev
```

## Structure

- `app/` — App Router pages and API routes
- `src/components/` — UI (shadcn), layout, sessions, agents, consensus, report
- `src/hooks/` — `useSession`, `useSessionStream` (SSE)
- `src/lib/` — `api-client`, agent display metadata

## API

The UI consumes REST + SSE under `/api/sessions/*`. See `docs/architecture/06-api-design.md` for the full contract.
