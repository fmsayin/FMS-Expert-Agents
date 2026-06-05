import { NextResponse } from "next/server";
import { z } from "zod";

import type { CustomFigureEnrichment } from "@/lib/custom-figures-storage";
import { CUSTOM_FIGURE_LIMITS } from "@/lib/custom-figures-storage";
import { getOpenAIApiKey, getOpenAIModel } from "@/lib/load-secrets";

const hintSchema = z.object({
  name: z.string().trim().min(1).max(CUSTOM_FIGURE_LIMITS.fullName),
  activeYears: z.string().max(CUSTOM_FIGURE_LIMITS.activeYears).optional(),
  titleRole: z.string().max(CUSTOM_FIGURE_LIMITS.titleRole).optional(),
  shortDescription: z.string().max(CUSTOM_FIGURE_LIMITS.shortDescription).optional(),
});

const ENRICH_JSON_SCHEMA = `{
  "fullName": "string — full display name",
  "activeYears": "string — birth–death or active period e.g. 1961–Present",
  "titleRole": "string — title/role line for cards e.g. President & Statesman",
  "shortDescription": "string — one sentence card subtitle",
  "biography": "string — 2-4 sentences for debate persona",
  "expertise": "string — comma-separated domains e.g. Diplomacy, Governance, Law",
  "leadershipStyle": "string — how they lead and decide",
  "ideologyPhilosophy": "string — core beliefs and worldview",
  "debateStyle": "string — how they argue in round table",
  "keyAchievements": "string — bullet-style achievements, semicolon-separated",
  "historicalContext": "string — era and setting they draw on",
  "notableQuotes": "string — 1-2 representative quotes in quotation marks"
}`;

function clampField(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function parseEnrichmentJson(raw: string, fallbackName: string): CustomFigureEnrichment | null {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const L = CUSTOM_FIGURE_LIMITS;

    return {
      fullName: clampField(parsed.fullName ?? parsed.name, L.fullName) || fallbackName,
      activeYears: clampField(parsed.activeYears ?? parsed.era, L.activeYears),
      titleRole: clampField(parsed.titleRole ?? parsed.role, L.titleRole),
      shortDescription: clampField(parsed.shortDescription, L.shortDescription),
      biography: clampField(parsed.biography, L.biography),
      expertise: clampField(parsed.expertise, L.expertise),
      leadershipStyle: clampField(parsed.leadershipStyle ?? parsed.personality, L.leadershipStyle),
      ideologyPhilosophy: clampField(parsed.ideologyPhilosophy, L.ideologyPhilosophy),
      debateStyle: clampField(parsed.debateStyle, L.debateStyle),
      keyAchievements: clampField(parsed.keyAchievements, L.keyAchievements),
      historicalContext: clampField(parsed.historicalContext, L.historicalContext),
      notableQuotes: clampField(parsed.notableQuotes, L.notableQuotes),
      profileImageUrl: "",
    };
  } catch {
    return null;
  }
}

async function callOpenAIForEnrichment(
  name: string,
  hints: z.infer<typeof hintSchema>,
): Promise<string> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) throw new Error("MISSING_API_KEY");

  const model = getOpenAIModel();
  const hintLines: string[] = [`Figure name: ${name}`];
  if (hints.activeYears?.trim()) hintLines.push(`Active years hint: ${hints.activeYears}`);
  if (hints.titleRole?.trim()) hintLines.push(`Role hint: ${hints.titleRole}`);
  if (hints.shortDescription?.trim()) {
    hintLines.push(`Description hint: ${hints.shortDescription}`);
  }

  const systemPrompt = `You are a historian preparing profiles for the FMS Think Tank Historical Round Table.
Given a historical or contemporary figure name, produce an accurate, scholarly profile as valid JSON only (no markdown fences).
Use this exact schema:
${ENRICH_JSON_SCHEMA}

Expertise must be comma-separated domain labels suitable for tags (e.g. Diplomacy, Governance, Human Rights).
Write in English. Be factual; if uncertain, use cautious scholarly phrasing.`;

  const userPrompt = `${hintLines.join("\n")}

Return only the JSON object.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1400,
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
  let body: z.infer<typeof hintSchema>;
  try {
    const json: unknown = await request.json();
    body = hintSchema.parse(json);
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

  try {
    const raw = await callOpenAIForEnrichment(body.name, body);
    const profile = parseEnrichmentJson(raw, body.name);

    if (!profile?.fullName) {
      return NextResponse.json(
        { error: "Failed to parse profile from model response" },
        { status: 502 },
      );
    }

    return NextResponse.json({ profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Enrichment failed";
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
