/**
 * FMS Expert Agents — end-to-end think-tank workflow runner.
 * Usage: pnpm dlx tsx scripts/run-think-tank.ts
 */
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ALL_AGENT_IDS } from "../packages/shared/src/constants.js";
import { runDebateWorkflow } from "../packages/orchestrator/src/runners/workflow.js";

const TOPIC =
  process.env.FMS_TOPIC ??
  "How Can AI-Powered Diplomacy Help Prevent Future Wars and Build Sustainable Peace?";

const ROUNDS = Number(process.env.FMS_ROUNDS ?? "3");
const REPORTS_DIR = join(process.cwd(), "reports");
const SESSION_ID = process.env.FMS_SESSION_ID ?? randomUUID();

async function main() {
  const mockLlm =
    process.env.MOCK_LLM === "true" || !process.env.OPENAI_API_KEY;

  console.log(`Session: ${SESSION_ID}`);
  console.log(`Topic: ${TOPIC}`);
  console.log(`Agents: ${ALL_AGENT_IDS.length} (all enabled)`);
  console.log(`Rounds: ${ROUNDS}`);
  console.log(`LLM mode: ${mockLlm ? "mock" : "live OpenAI"}`);

  const result = await runDebateWorkflow(
    {
      sessionId: SESSION_ID,
      topic: TOPIC,
      rounds: ROUNDS,
      agentsEnabled: [...ALL_AGENT_IDS],
      allowPartialAnalyses: true,
      context: {
        mission: "Building Peace Through Intelligence, Diplomacy, and Human Dignity",
        publication: "FMS Strategic Review",
      },
    },
    {
      mockLlm,
      onEvent: async (event) => {
        if (event.type === "phase_change") {
          console.log(`[phase] ${JSON.stringify(event.payload)}`);
        }
      },
    },
  );

  await mkdir(REPORTS_DIR, { recursive: true });

  const artifacts = {
    sessionId: result.sessionId,
    topic: TOPIC,
    phase: result.phase,
    llmMode: mockLlm ? "mock" : "live",
    agentsEnabled: [...ALL_AGENT_IDS],
    rounds: ROUNDS,
    analyses: result.analyses,
    independentAnalyses: result.independentAnalyses,
    debateTranscript: result.debateTranscript,
    challengeRecords: result.challengeRecords,
    consensusDraft: result.consensusDraft,
    report: result.report,
    errors: result.errors,
    ethicsBlocking: result.ethicsBlocking,
    humanReviewStatus: result.humanReviewStatus,
    generatedAt: new Date().toISOString(),
  };

  const artifactsPath = join(REPORTS_DIR, "session-artifacts.json");
  await writeFile(artifactsPath, JSON.stringify(artifacts, null, 2), "utf-8");

  console.log(`\nWorkflow phase: ${result.phase}`);
  console.log(`Analyses: ${result.analyses.length}`);
  console.log(`Debate turns: ${result.debateTranscript.length}`);
  console.log(`Challenges: ${result.challengeRecords.length}`);
  console.log(`Report: ${result.report ? "yes" : "no"}`);
  console.log(`Artifacts: ${artifactsPath}`);

  if (result.phase !== "complete") {
    console.error("Workflow did not complete:", result.errors);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
