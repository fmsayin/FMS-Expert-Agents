import { NextResponse } from "next/server";
import { z } from "zod";

import { getOpenAIApiKey } from "@/lib/load-secrets";
import { ingestFigureText } from "@/lib/figure-rag/ingest";
import { listFigureSources } from "@/lib/figure-rag/store";
import type { FigureSourceType } from "@/lib/figure-rag/types";

const addBodySchema = z.object({
  text: z.string().trim().min(1).max(200_000),
  sourceName: z.string().trim().min(1).max(200),
  sourceType: z.enum(["text", "pdf", "notes"]).default("notes"),
});

type RouteContext = { params: Promise<{ figureId: string }> };

function figureIdFromContext(ctx: RouteContext): Promise<string> {
  return ctx.params.then((p) => p.figureId);
}

export async function GET(_request: Request, context: RouteContext) {
  const figureId = await figureIdFromContext(context);
  if (!figureId?.trim()) {
    return NextResponse.json({ error: "Missing figure id" }, { status: 400 });
  }

  const { sources, chunkCount } = listFigureSources(figureId);
  return NextResponse.json({ figureId, sources, chunkCount });
}

export async function POST(request: Request, context: RouteContext) {
  const figureId = await figureIdFromContext(context);
  if (!figureId?.trim()) {
    return NextResponse.json({ error: "Missing figure id" }, { status: 400 });
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

  let body: z.infer<typeof addBodySchema>;
  try {
    const json: unknown = await request.json();
    body = addBodySchema.parse(json);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { source, chunkCount } = await ingestFigureText({
      figureId,
      text: body.text,
      sourceName: body.sourceName,
      sourceType: body.sourceType as FigureSourceType,
    });
    return NextResponse.json({ source, chunkCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ingest failed";
    if (message === "MISSING_API_KEY") {
      return NextResponse.json(
        { error: "OpenAI API key is not configured.", code: "MISSING_API_KEY" },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
