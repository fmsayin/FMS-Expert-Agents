# @fms/orchestrator

LangGraph.js multi-agent workflow for the FMS Expert Agents peace think tank pipeline.

## Flow

```
START → initializeSession → parallelAnalysis → analyze_agent (×13 via Send)
  → collect_analyses → debate_round (loop N) → risk_challenge_pass
  → build_consensus → [human_review_gate if ethics blocking] → generate_report → finalize → END
```

## Usage

```typescript
import { runDebateWorkflow } from "@fms/orchestrator";

const result = await runDebateWorkflow(
  {
    sessionId: "550e8400-e29b-41d4-a716-446655440000",
    topic: "Sustainable ceasefire architecture in Region X",
    rounds: 2,
    context: { region: "Region X", timeHorizon: "1y" },
  },
  {
    mockLlm: !process.env.OPENAI_API_KEY,
    onEvent: async (event) => {
      // Stream to SSE clients
      console.log(event.type, event.payload);
    },
  },
);

console.log(result.report?.executiveSummary);
```

### Compile graph only

```typescript
import { createDebateGraph } from "@fms/orchestrator";

const graph = createDebateGraph({ checkpointer: mySaver });
await graph.invoke(initialState, {
  configurable: { thread_id: sessionId },
});
```

### Human review resume (ethics interrupt)

When `ethicsBlocking` is true, the graph pauses at `human_review_gate`. Resume with:

```typescript
await graph.invoke(
  { humanReviewStatus: "approved" },
  { configurable: { thread_id: sessionId } },
);
```

## Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | For live LLM | Agent analysis, debate, challenges |
| `MOCK_LLM=true` | Optional | Force stub responses (no API calls) |
| `DATABASE_URL` | Phase 2 | Postgres checkpointer persistence |

## Scripts

```bash
pnpm --filter @fms/orchestrator typecheck
pnpm --filter @fms/orchestrator test
```

## Package layout

- `src/graph.ts` — compiled `StateGraph`
- `src/state/` — `Annotation.Root` schema & reducers
- `src/nodes/` — graph nodes
- `src/debate/` — scheduling & context builder
- `src/runners/` — LLM invoke + `runDebateWorkflow`

See [docs/architecture/05-langgraph-workflow.md](../../docs/architecture/05-langgraph-workflow.md).
