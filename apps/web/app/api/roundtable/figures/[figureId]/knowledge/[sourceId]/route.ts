import { NextResponse } from "next/server";

import { deleteFigureSource } from "@/lib/figure-rag/store";

type RouteContext = { params: Promise<{ figureId: string; sourceId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const { figureId, sourceId } = await context.params;
  if (!figureId?.trim() || !sourceId?.trim()) {
    return NextResponse.json({ error: "Missing figure or source id" }, { status: 400 });
  }

  const removed = deleteFigureSource(figureId, sourceId);
  if (!removed) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
