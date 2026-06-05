import { NextResponse } from "next/server";
import { z } from "zod";

import type { TurkishExecutiveReport } from "@/components/roundtable/types";
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

const REPORT_JSON_SCHEMA = `{
  "yoneticiOzeti": "string — 2-4 cümle üst düzey özet",
  "konsensus": "string — uzlaşı alanları",
  "anlasmazliklar": "string — temel gerilimler ve karşıt görüşler",
  "riskler": "string — stratejik, etik veya operasyonel riskler",
  "oneriler": "string — uygulanabilir politika ve strateji önerileri"
}`;

function formatTranscriptForPrompt(
  messages: z.infer<typeof messageSchema>[],
): string {
  return messages
    .map((m) => {
      if (m.role === "user") {
        return `MODERATÖR: ${m.content.replace(/^Moderator:\s*/i, "")}`;
      }
      return `${m.figureName ?? "KATILIMCI"}: ${m.content}`;
    })
    .join("\n\n");
}

function parseReportJson(raw: string): TurkishExecutiveReport | null {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const str = (key: string) =>
      typeof parsed[key] === "string" ? (parsed[key] as string) : "";

    const report: TurkishExecutiveReport = {
      yoneticiOzeti: str("yoneticiOzeti"),
      konsensus: str("konsensus"),
      anlasmazliklar: str("anlasmazliklar"),
      riskler: str("riskler"),
      oneriler: str("oneriler"),
    };

    if (!report.yoneticiOzeti) return null;
    return report;
  } catch {
    return null;
  }
}

async function callOpenAIForReport(
  topicFull: string,
  transcript: string,
): Promise<string> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) throw new Error("MISSING_API_KEY");

  const model = getOpenAIModel();
  const systemPrompt = `Sen Türk Stratejik Gözlemci (Turkish Strategic Observer) — profesyonel bir Türk politika analistisin.
FMS Think Tank Tarihsel Yuvarlak Masa İngilizce tartışma transkriptini analiz ederek Türkçe yönetici raporu üretirsin.
Akademik, net ve karar vericilere yönelik bir üslup kullan; katılımcı pozisyonlarına atıf yap.
Yanıt yalnızca geçerli JSON olmalı (markdown fence yok).
Şema:
${REPORT_JSON_SCHEMA}`;

  const userPrompt = `Konu: ${topicFull}

Transkript:
${transcript}

Yalnızca JSON nesnesini döndür.`;

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
    const raw = await callOpenAIForReport(body.topicFull, transcript);
    const report = parseReportJson(raw);

    if (!report) {
      return NextResponse.json(
        { error: "Failed to parse Turkish report from model response" },
        { status: 502 },
      );
    }

    return NextResponse.json({ report });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Report failed";
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
