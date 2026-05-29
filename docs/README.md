# FMS Expert Agents — Architecture Documentation

**Mission:** Building Peace Through Intelligence, Diplomacy, and Human Dignity.

This folder contains the production architecture for **FMS Expert Agents**, a multi-agent AI think tank that independently analyzes topics, debates across 13 domain experts, challenges assumptions, and produces consensus strategic recommendation reports.

## Document Index

| # | Document | Description |
|---|----------|-------------|
| — | [ARCHITECTURE.md](./ARCHITECTURE.md) | Master overview, principles, and navigation |
| 01 | [System Architecture](./architecture/01-system.md) | Components, data flow, Vercel deployment, security, observability |
| 02 | [Folder Structure](./architecture/02-folder-structure.md) | Turborepo monorepo layout (Next.js + API + shared packages) |
| 03 | [Database Design](./architecture/03-database.md) | PostgreSQL schema, Drizzle ORM, migrations |
| 04 | [Agent Definitions](./architecture/04-agent-definitions.md) | All 13 agents: roles, prompts, tools, I/O, debate rules |
| 05 | [LangGraph Workflow](./architecture/05-langgraph-workflow.md) | State machine, nodes, edges, state schema |
| 06 | [API Design](./architecture/06-api-design.md) | REST routes, streaming, auth, request/response shapes |
| 07 | [UI/UX Design](./architecture/07-ui-ux-design.md) | Page map, screens, component hierarchy, design tokens |
| 08 | [Production Roadmap](./architecture/08-roadmap.md) | MVP → beta → production phases, milestones, risks |

## Reading Order

1. **ARCHITECTURE.md** — context and decisions in one pass  
2. **01-system.md** — how pieces connect at runtime  
3. **04-agent-definitions.md** + **05-langgraph-workflow.md** — core product logic  
4. **03-database.md** + **06-api-design.md** — persistence and contracts  
5. **02-folder-structure.md** + **07-ui-ux-design.md** — implementation layout  
6. **08-roadmap.md** — delivery sequence  

## Relationship to Existing Code

The repository currently contains a **Python prototype** (`debate/`) using the OpenAI Agents SDK with three generic personas. The architecture documented here **supersedes** that prototype for production. See [ARCHITECTURE.md § Legacy Code](./ARCHITECTURE.md#legacy-code) for migration notes.

## Strategic Review publication

Official flagship (Markdown): **[../reports/FMS-Strategic-Review-AI-Diplomacy-Peace-Publication.md](../reports/FMS-Strategic-Review-AI-Diplomacy-Peace-Publication.md)**

## Status

| Area | Status |
|------|--------|
| Architecture docs | Complete (design phase) |
| Application implementation | Not started |
| LangGraph orchestrator | Designed, not implemented |
| Database | Schema designed, not migrated |
