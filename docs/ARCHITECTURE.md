# FMS Expert Agents — Master Architecture

**Version:** 1.0.0 (design)  
**Last updated:** 2026-05-29  
**Stack:** Next.js (App Router) · TypeScript · LangGraph · OpenAI · PostgreSQL · Vercel

---

## Executive Summary

FMS Expert Agents is a **multi-agent peace think tank** that takes a user-submitted strategic topic, runs **13 independent domain analyses in parallel**, orchestrates **structured debate rounds** with assumption-challenging and risk passes, builds **weighted consensus**, and emits a **Strategic Peace Recommendation Report** (SPRR). Orchestration is owned by **LangGraph** (not the OpenAI Agents SDK). The web app on **Vercel** streams debate and report progress to operators; **PostgreSQL** (Neon) stores sessions, agent outputs, debate transcripts, and final reports.

---

## Architectural Principles

1. **LangGraph owns orchestration** — graph nodes, state, checkpoints, and human-in-the-loop gates live in `@fms/orchestrator` (LangGraph.js).
2. **Agents are stateless workers** — each agent is a configured LLM call + tools; graph state is the source of truth.
3. **Debate is structured, not free-form chat** — fixed phases (analyze → debate → challenge → consensus → report) with typed artifacts per phase.
4. **Stream everything observable** — SSE/WebSocket events for agent panels, debate turns, and report sections.
5. **Auditability by design** — every LLM turn, tool call, and consensus vote is persisted with provenance.
6. **Fail safe on peace-critical outputs** — ethics agent has veto-weight on consensus; high-risk findings trigger mandatory challenge pass.

---

## System Context

```mermaid
C4Context
  title FMS Expert Agents — System Context

  Person(operator, "Operator", "Analyst, diplomat, researcher")
  System(fms, "FMS Expert Agents", "Multi-agent think tank on Vercel")
  System_Ext(openai, "OpenAI API", "GPT models, structured outputs")
  System_Ext(neon, "Neon PostgreSQL", "Sessions, transcripts, reports")
  System_Ext(vercel, "Vercel Platform", "Hosting, cron, observability")
  System_Ext(search, "Research APIs", "Optional: web search, UN docs")

  Rel(operator, fms, "Submits topics, views debate & reports")
  Rel(fms, openai, "LLM inference")
  Rel(fms, neon, "Persist state & artifacts")
  Rel(fms, vercel, "Deploy & run functions")
  Rel(fms, search, "Tool calls during analysis")
```

---

## High-Level Component Map

```mermaid
flowchart TB
  subgraph Client["apps/web — Next.js"]
    UI[App Router UI]
    SSE[SSE Client]
  end

  subgraph API["apps/web — Route Handlers / apps/api"]
    REST[REST API]
    Stream[SSE Stream Endpoint]
    Auth[Auth Middleware]
  end

  subgraph Orchestration["packages/orchestrator — LangGraph"]
    LG[LangGraph State Machine]
    Agents[13 Agent Runners]
    Debate[Debate Engine]
    Consensus[Consensus Engine]
    Report[Report Generator]
  end

  subgraph Data["packages/db — Drizzle"]
    PG[(PostgreSQL)]
  end

  subgraph Shared["packages/shared, packages/agents"]
    Types[Zod Schemas & Types]
    Prompts[Agent Definitions]
    Tools[Tool Implementations]
  end

  UI --> REST
  UI --> SSE
  SSE --> Stream
  REST --> Auth
  Auth --> LG
  Stream --> LG
  LG --> Agents
  LG --> Debate
  LG --> Consensus
  LG --> Report
  LG --> PG
  Agents --> OpenAI[OpenAI]
  Agents --> Tools
  Report --> PG
```

---

## Core Runtime Flow

```mermaid
sequenceDiagram
  participant U as Operator
  participant W as Web App
  participant A as API
  participant G as LangGraph
  participant DB as PostgreSQL
  participant O as OpenAI

  U->>W: Submit topic + context
  W->>A: POST /api/sessions
  A->>DB: Create session (queued)
  A->>G: Start graph run (async)
  A-->>W: sessionId

  par Independent Analysis
    G->>O: 13 parallel agent analyses
    O-->>G: Structured AnalysisArtifacts
  end
  G->>DB: Persist analyses
  G-->>W: SSE: phase=analysis_complete

  loop Debate Rounds (configurable)
    G->>O: Round-robin / paired debate turns
    O-->>G: DebateTurn[]
    G-->>W: SSE: debate_turn
  end

  G->>O: Risk & Challenge pass
  G-->>W: SSE: phase=challenge_complete

  G->>O: Consensus node (weighted merge)
  G->>DB: Persist consensus draft
  G-->>W: SSE: consensus_update

  G->>O: Report generation (structured sections)
  G->>DB: Final SPRR
  G-->>W: SSE: report_complete
  U->>W: View / export PDF
```

---

## Technology Choices

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Frontend | Next.js 15+ App Router | SSR, API routes, Vercel-native |
| Orchestration | **LangGraph.js** | Explicit state machine, checkpoints, parallel branches |
| LLM | OpenAI (`gpt-4.1` / `gpt-4o` tiering) | Structured outputs, reliability |
| ORM | Drizzle + `drizzle-kit` | Type-safe SQL, edge-friendly |
| Database | Neon PostgreSQL | Vercel integration, branching for dev |
| API style | REST + SSE | Simple streaming for debate UI; tRPC optional later |
| Auth | Clerk or Auth.js | Vercel Marketplace patterns; session-scoped data |
| Monorepo | Turborepo | Shared packages, single CI |
| Long runs | Vercel Workflow DevKit (phase 2) | Debates exceeding serverless timeout |

**Explicit non-choice:** OpenAI Agents SDK as **primary** orchestrator — retained only as reference in legacy `debate/` folder.

---

## Agent Roster (13)

| ID | Agent | Domain |
|----|-------|--------|
| `chief_peace_architect` | Chief Peace Architect | Synthesis & strategic framing |
| `peace_conflict` | Peace & Conflict Resolution | Mediation, ceasefires, DDR |
| `diplomacy_ir` | Diplomacy & International Relations | Treaties, multilateral forums |
| `strategic_security` | Strategic & Security Studies | Deterrence, stability, threats |
| `humanitarian` | Humanitarian Affairs | Protection, aid, IHL |
| `ai_peace` | AI for Peace | Tech ethics, dual-use, peace tech |
| `economic_dev` | Economic Development | Inclusive growth, sanctions relief |
| `civilization_culture` | Civilization & Cultural Dialogue | Identity, reconciliation |
| `education_youth` | Education & Youth Empowerment | CVE, civic education |
| `media_comms` | Media & Strategic Communication | Narratives, information integrity |
| `environmental_security` | Environmental Security | Climate-conflict nexus |
| `space_future` | Space & Future Policy | Space governance, emerging domains |
| `ethics_rights` | Ethics, Human Rights & Global Governance | IHL/IHRL, accountability |

Full definitions: [architecture/04-agent-definitions.md](./architecture/04-agent-definitions.md).

---

## LangGraph Phases

| Phase | Graph nodes | Output artifact |
|-------|-------------|-----------------|
| 1 | `fan_out_analysis` → `collect_analyses` | `AnalysisArtifact[]` |
| 2 | `debate_round_n` (×N) | `DebateTurn[]` |
| 3 | `risk_challenge_pass` | `ChallengeRecord[]` |
| 4 | `build_consensus` | `ConsensusDraft` |
| 5 | `generate_report` | `StrategicPeaceReport` |

Details: [architecture/05-langgraph-workflow.md](./architecture/05-langgraph-workflow.md).

---

## Security & Compliance Posture (Summary)

- **Authentication required** for all session APIs; row-level ownership by `userId`.
- **API keys** only in Vercel env; never exposed to client.
- **PII minimization** in prompts; optional redaction node before persistence.
- **Ethics veto** — `ethics_rights` can flag `BLOCKING_CONCERN` → forces human review gate.
- **Rate limiting** per user and per org via Vercel Firewall / Upstash Redis.
- **Audit log** — immutable append-only `audit_events` table.

Full detail: [architecture/01-system.md](./architecture/01-system.md#security-architecture).

---

## Observability (Summary)

- **Structured logs** — `sessionId`, `runId`, `node`, `agentId` on every line.
- **OpenTelemetry** → Vercel OTel / Datadog (optional).
- **LLM tracing** — LangSmith or Langfuse integration on graph runs.
- **Product analytics** — phase timings, tokens per agent, debate round counts.

---

## Legacy Code

| Path | Status | Action |
|------|--------|--------|
| `debate/agents.py` | Prototype | Deprecate after LangGraph port |
| `debate/config.py` | 3 generic personas | Replace with `packages/agents` (13 peace agents) |
| `requirements.txt` | Python / Agents SDK | Remove when TS monorepo scaffold lands |

**Reuse:** `EXPERT_DEBATE_RULES` and moderator patterns from `debate/agents.py` are incorporated into global debate rules in doc 04.

---

## Documentation Map

- [01 — System Architecture](./architecture/01-system.md)
- [02 — Folder Structure](./architecture/02-folder-structure.md)
- [03 — Database Design](./architecture/03-database.md)
- [04 — Agent Definitions](./architecture/04-agent-definitions.md)
- [05 — LangGraph Workflow](./architecture/05-langgraph-workflow.md)
- [06 — API Design](./architecture/06-api-design.md)
- [07 — UI/UX Design](./architecture/07-ui-ux-design.md)
- [08 — Production Roadmap](./architecture/08-roadmap.md)

---

## Glossary

| Term | Definition |
|------|------------|
| **SPRR** | Strategic Peace Recommendation Report — final deliverable |
| **Session** | One end-to-end run from topic submission to report |
| **Run** | Single LangGraph execution (may checkpoint/resume) |
| **Debate turn** | One agent utterance in a structured round |
| **Consensus draft** | Weighted merge before report prose generation |
| **A2A** | Agent-to-Agent message bus inside graph state |
