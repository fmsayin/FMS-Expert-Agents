import { NextResponse } from "next/server";
import { z } from "zod";

import type { ThinkTankAnalysis } from "@/components/roundtable/types";
import { getOpenAIApiKey, getOpenAIModel } from "@/lib/load-secrets";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  figureId: z.string().optional(),
  figureName: z.string().optional(),
  initials: z.string().optional(),
  era: z.string().optional(),
});

const bodySchema = z.object({
  topicFull: z.string().min(1).max(2000),
  messages: z.array(messageSchema).min(1),
});

const ANALYSIS_JSON_SCHEMA = `{
  "consensus": "string — areas of agreement across participants",
  "disagreements": "string — key tensions and opposing views",
  "risks": "string — strategic, ethical, or operational risks identified",
  "recommendations": "string — actionable policy or strategic recommendations",
  "executiveSummary": "string — 2-4 sentence synthesis for leadership",
  "consensusScore": number 0-100,
  "disagreementScore": number 0-100
}`;

function formatTranscriptForPrompt(
  messages: z.infer<typeof messageSchema>[],
): string {
  return messages
    .map((m) => {
      if (m.role === "user") {
        return `MODERATOR: ${m.content.replace(/^Moderator:\s*/i, "")}`;
      }
      return `${m.figureName ?? "FIGURE"}: ${m.content}`;
    })
    .join("\n\n");
}

function parseAnalysisJson(raw: string): ThinkTankAnalysis | null {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const str = (key: string) =>
      typeof parsed[key] === "string" ? (parsed[key] as string) : "";
    const num = (key: string, fallback: number) => {
      const v = parsed[key];
      if (typeof v === "number" && !Number.isNaN(v)) {
        return Math.min(100, Math.max(0, Math.round(v)));
      }
      return fallback;
    };

    return {
      consensus: str("consensus"),
      disagreements: str("disagreements"),
      risks: str("risks"),
      recommendations: str("recommendations"),
      executiveSummary: str("executiveSummary"),
      consensusScore: num("consensusScore", 65),
      disagreementScore: num("disagreementScore", 45),
    };
  } catch {
    return null;
  }
}

async function callOpenAIForAnalysis(
  topicFull: string,
  transcript: string,
): Promise<string> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) throw new Error("MISSING_API_KEY");

  const model = getOpenAIModel();
  const systemPrompt = `You are the analytical secretariat of the FMS Think Tank Historical Round Table.
Given a debate transcript, produce a structured policy analysis as valid JSON only (no markdown fences).
Use this exact schema:
${ANALYSIS_JSON_SCHEMA}

Scores: consensusScore measures agreement level (higher = more consensus); disagreementScore measures unresolved tension (higher = more disagreement).
Be specific, cite participant positions, and write in clear scholarly prose within each string field.`;

  const userPrompt = `Topic: ${topicFull}

Transcript:
${transcript}

Return only the JSON object.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message ?? "OpenAI API error");
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response from OpenAI");
  return text;
}

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    const json: unknown = await request.json();
    body = bodySchema.parse(json);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!getOpenAIApiKey()) {
    return NextResponse.json(
      {
        error:
          "OpenAI API key is not configured. Add OPENAI_API_KEY to secrets/openai.env at the repo root.",
        code: "MISSING_API_KEY",
      },
      { status: 503 },
    );
  }

  const transcript = formatTranscriptForPrompt(body.messages);

  try {
    const raw = await callOpenAIForAnalysis(body.topicFull, transcript);
    const analysis = parseAnalysisJson(raw);

    if (!analysis || !analysis.executiveSummary) {
      return NextResponse.json(
        { error: "Failed to parse analysis from model response" },
        { status: 502 },
      );
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    if (message === "MISSING_API_KEY") {
      return NextResponse.json(
        {
          error:
            "OpenAI API key is not configured. Add OPENAI_API_KEY to secrets/openai.env.",
          code: "MISSING_API_KEY",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
