import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ sessionId: string }> };

/** POST start/resume LangGraph run (stub). */
export async function POST(_request: Request, { params }: Ctx) {
  const { sessionId } = await params;
  return NextResponse.json(
    { sessionId, runId: "stub-run-id", status: "running" },
    { status: 202 },
  );
}
