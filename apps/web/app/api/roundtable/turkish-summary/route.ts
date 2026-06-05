import { NextResponse } from "next/server";
import { z } from "zod";

import { getOpenAIApiKey, getOpenAIModel } from "@/lib/load-secrets";

const bodySchema = z.object({
  content: z.string().min(1).max(8000),
  figureName: z.string().min(1).max(120),
  topicContext: z.string().min(1).max(2000),
});

type TurkishSummaryStructured = {
  anaArguman: string;
  stratejikCikarim: string;
  politikaIliskisi: string;
};

function parseStructuredSummary(raw: string): TurkishSummaryStructured | null {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const str = (key: string) => (typeof parsed[key] === "string" ? (parsed[key] as string) : "");
    const result = {
      anaArguman: str("anaArguman"),
      stratejikCikarim: str("stratejikCikarim"),
      politikaIliskisi: str("politikaIliskisi"),
    };
    if (!result.anaArguman && !result.stratejikCikarim) return null;
    return result;
  } catch {
    return null;
  }
}

async function callOpenAIForSummary(
  content: string,
  figureName: string,
  topicContext: string,
): Promise<{ summary: string; structured: TurkishSummaryStructured | null }> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) throw new Error("MISSING_API_KEY");

  const model = getOpenAIModel();
  const systemPrompt = `Sen "Türk Stratejik Gözlemci" (Turkish Strategic Observer) adlı profesyonel bir Türk politika analistisin.
FMS Think Tank Tarihsel Yuvarlak Masa tartışmalarını izlersin; katılımcı değilsin, yalnızca Türkçe stratejik özet üretirsin.

Görevin: İngilizce konuşmacı yanıtını Türkçe olarak analiz etmek.
Kelime kelime çeviri yapma. Yalnızca geçerli JSON döndür (markdown yok), şu şema ile:
{
  "anaArguman": "Ana Argüman — 1-2 cümle",
  "stratejikCikarim": "Stratejik Çıkarım — 1-2 cümle",
  "politikaIliskisi": "Politika İlişkisi — 1-2 cümle"
}
Akademik, net ve üst düzey karar vericilere uygun bir üslup kullan.`;

  const userPrompt = `Konu bağlamı: ${topicContext}

Konuşmacı: ${figureName}

İngilizce yanıt:
${content}

Yalnızca JSON nesnesini döndür:`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      temperature: 0.4,
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
  const structured = parseStructuredSummary(text);
  const summary = structured
    ? [structured.anaArguman, structured.stratejikCikarim, structured.politikaIliskisi]
        .filter(Boolean)
        .join(" ")
    : text;
  return { summary, structured };
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

  try {
    const { summary, structured } = await callOpenAIForSummary(
      body.content,
      body.figureName,
      body.topicContext,
    );
    return NextResponse.json({ summary, structured });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Summary failed";
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
