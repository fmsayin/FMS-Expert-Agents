# FMS Expert Agents — Web App

Next.js App Router dashboard for the FMS Expert Agents think-tank platform.

**Mission:** Building Peace Through Intelligence, Diplomacy, and Human Dignity

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, mission, stats, featured agents, recent outputs |
| `/agents` | Expert agents directory with search, category, and status filters |
| `/agents/[slug]` | Agent profile — capabilities and sample outputs |
| `/outputs` | Research outputs — policy briefs, strategic reviews, working papers |
| `/projects` | Active research projects and assigned agents |
| `/about` | About FMS, methodology, contact placeholder |

Legacy routes `/research` redirects to `/outputs`. Session routes remain under `/sessions` for multi-agent deliberation.

## Development

From the **monorepo root**:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

From this package only:

```bash
pnpm dev
```

Other scripts: `pnpm build`, `pnpm lint`, `pnpm typecheck`.

## Structure

- `app/(dashboard)/` — Main UI routes with `AppShell` layout
- `src/components/layout/` — `AppShell`, `Sidebar`, `Header`, `HeaderSearch`
- `src/components/agents/` — `AgentCard`, `AgentGrid`, `CategoryFilter`, `AgentStatusBadge`
- `src/components/ui/` — Button, Card, Badge, Input (Tailwind + CVA)
- `src/data/agents.ts` — Static showcase data (31 expert agents)
- `src/data/research-outputs.ts`, `projects.ts` — Outputs and projects

## Design

Navy/charcoal/slate palette with gold accent (`app/globals.css`, `tailwind.config.ts`). Responsive: desktop sidebar, mobile hamburger menu, 2-column tablet agent grid.

## Historical Round Table embed (fmsthinktank.org/agents)

Authenticated users on [fmsthinktank.org/agents](https://fmsthinktank.org/agents) receive a short-lived signed `embed_token` from FMS Think Tank. The iframe loads `/roundtable?embed_token=...`; the server validates the HMAC, sets the `fms-rt-access` cookie, and redirects to `/roundtable`. Direct visits to `/roundtable` still require `ROUNDTABLE_PASSCODE`.

| Variable | Purpose |
|----------|---------|
| `ROUNDTABLE_PASSCODE` | Passcode gate for direct `/roundtable` access |
| `ROUNDTABLE_ACCESS_SECRET` | Shared HMAC secret for embed tokens (must match FMS Think Tank) and signed access cookies |
