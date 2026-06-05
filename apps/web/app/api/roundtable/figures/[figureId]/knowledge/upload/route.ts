import { NextResponse } from "next/server";

import { getOpenAIApiKey } from "@/lib/load-secrets";
import { ingestFigureText } from "@/lib/figure-rag/ingest";
import { extractPdfText } from "@/lib/figure-rag/pdf";
import type { FigureSourceType } from "@/lib/figure-rag/types";

const MAX_BYTES = 8 * 1024 * 1024;

type RouteContext = { params: Promise<{ figureId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { figureId } = await context.params;
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

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 400 });
  }

  const sourceName =
    (formData.get("sourceName") as string | null)?.trim() || file.name || "Upload";
  const buffer = Buffer.from(await file.arrayBuffer());
  const lowerName = file.name.toLowerCase();
  const isPdf =
    file.type === "application/pdf" || lowerName.endsWith(".pdf");
  const isText =
    file.type.startsWith("text/") ||
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md");

  let text = "";
  let sourceType: FigureSourceType = "text";

  if (isPdf) {
    sourceType = "pdf";
    try {
      text = await extractPdfText(buffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : "PDF parse failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  } else if (isText) {
    text = buffer.toString("utf8");
  } else {
    return NextResponse.json(
      { error: "Unsupported file type. Upload .pdf, .txt, or .md" },
      { status: 400 },
    );
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "No extractable text in file" }, { status: 400 });
  }

  try {
    const { source, chunkCount } = await ingestFigureText({
      figureId,
      text,
      sourceName,
      sourceType,
      fileName: file.name,
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
