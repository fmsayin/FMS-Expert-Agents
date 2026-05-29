import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import {
  AGENT_REGISTRY,
  buildSystemPrompt,
  analysisArtifactSchema,
  challengeRecordSchema,
  debateTurnSchema,
  type AnalysisArtifact,
  type ChallengeRecord,
  type DebateTurn,
} from "@fms/agents";
import type { AgentId } from "@fms/shared";
import type { ThinkTankState } from "../state/think-tank-state.js";

export function shouldMockLlm(explicit?: boolean): boolean {
  if (explicit === true) return true;
  if (process.env.MOCK_LLM === "true") return true;
  return !process.env.OPENAI_API_KEY;
}

function modelForAgent(agentId: AgentId, overrides: Record<string, string>): string {
  if (overrides[agentId]) return overrides[agentId]!;
  const tier = AGENT_REGISTRY[agentId].modelTier;
  return tier === "gpt-4.1" ? "gpt-4.1-mini" : "gpt-4o-mini";
}

function createLlm(agentId: AgentId, overrides: Record<string, string>): ChatOpenAI {
  return new ChatOpenAI({
    model: modelForAgent(agentId, overrides),
    temperature: 0.4,
  });
}

export async function invokeAgentAnalysis(
  agentId: AgentId,
  state: ThinkTankState,
  mock?: boolean,
): Promise<AnalysisArtifact> {
  if (shouldMockLlm(mock)) {
    return mockAnalysis(agentId, state);
  }

  const agent = AGENT_REGISTRY[agentId];
  const llm = createLlm(agentId, state.modelOverrides).withStructuredOutput(
    analysisArtifactSchema,
    { name: "analysis_artifact" },
  );

  const userContent = JSON.stringify({
    sessionId: state.sessionId,
    topic: state.topic,
    context: state.context,
    agentId,
  });

  const result = await llm.invoke([
    new SystemMessage(buildSystemPrompt(agent)),
    new HumanMessage(
      `Produce independent analysis for topic: ${state.topic}. Return structured JSON matching the schema.`,
    ),
    new HumanMessage(userContent),
  ]);

  return {
    ...result,
    agentId,
    usage: { prompt: 0, completion: 0 },
  };
}

export async function invokeAgentDebate(
  agentId: AgentId,
  state: ThinkTankState,
  round: number,
  contextPrompt: string,
  mock?: boolean,
): Promise<DebateTurn> {
  if (shouldMockLlm(mock)) {
    return mockDebateTurn(agentId, round, state);
  }

  const agent = AGENT_REGISTRY[agentId];
  const llm = createLlm(agentId, state.modelOverrides).withStructuredOutput(
    debateTurnSchema.omit({ round: true }),
    { name: "debate_turn" },
  );

  const result = await llm.invoke([
    new SystemMessage(buildSystemPrompt(agent)),
    new HumanMessage(contextPrompt),
  ]);

  return {
    ...result,
    agentId,
    round,
  };
}

export async function invokeAgentChallenge(
  agentId: AgentId,
  state: ThinkTankState,
  targetClaimId: string,
  mock?: boolean,
): Promise<ChallengeRecord> {
  if (shouldMockLlm(mock)) {
    return mockChallenge(agentId, targetClaimId, state, mock);
  }

  const agent = AGENT_REGISTRY[agentId];
  const llm = createLlm(agentId, state.modelOverrides).withStructuredOutput(
    challengeRecordSchema.omit({ challengerAgentId: true }),
    { name: "challenge_record" },
  );

  const result = await llm.invoke([
    new SystemMessage(buildSystemPrompt(agent)),
    new HumanMessage(
      `Issue a structured challenge against claim ${targetClaimId} for topic: ${state.topic}.`,
    ),
  ]);

  return {
    ...result,
    challengerAgentId: agentId,
  };
}

function mockAnalysis(agentId: AgentId, state: ThinkTankState): AnalysisArtifact {
  const agent = AGENT_REGISTRY[agentId];
  return {
    agentId,
    executiveSummary: `[mock] ${agent.displayName} analysis on "${state.topic}".`,
    keyFindings: [
      { id: `${agentId}-f1`, text: `Key finding from ${agent.displayName}` },
    ],
    recommendations: [
      {
        id: `${agentId}-r1`,
        text: `Recommendation from ${agent.displayName}`,
        priority: "high",
      },
    ],
    risks: [
      {
        id: `${agentId}-risk1`,
        description: "Mock implementation risk",
        severity: "medium",
      },
    ],
    assumptions: ["Mock mode — no live LLM call"],
    questionsForDebate: [`How should ${agent.displayName} engage other experts?`],
    citations: [],
    usage: { prompt: 10, completion: 20 },
  };
}

function mockDebateTurn(
  agentId: AgentId,
  round: number,
  state: ThinkTankState,
): DebateTurn {
  const claimId = `${agentId}-c${round}`;
  return {
    agentId,
    round,
    content: `[mock] Debate turn by ${agentId} on "${state.topic}" (round ${round}).`,
    claimsAddressed: state.debateTurns.slice(-1)[0]?.newClaims[0]?.id
      ? [state.debateTurns.slice(-1)[0]!.newClaims[0]!.id]
      : [],
    stance: "nuance",
    newClaims: [{ id: claimId, text: `Claim from ${agentId} in round ${round}` }],
    references: [],
  };
}

function mockChallenge(
  agentId: AgentId,
  targetClaimId: string,
  state: ThinkTankState,
  mock?: boolean,
): ChallengeRecord {
  const severity =
    agentId === "ethics_rights" && !shouldMockLlm(mock)
      ? ("blocking" as const)
      : ("medium" as const);
  return {
    challengerAgentId: agentId,
    targetClaimId,
    challengeType: agentId === "ethics_rights" ? "ethics" : "assumption",
    content: `[mock] Challenge from ${agentId} on ${targetClaimId} for "${state.topic}".`,
    severity,
    resolution: undefined,
  };
}
