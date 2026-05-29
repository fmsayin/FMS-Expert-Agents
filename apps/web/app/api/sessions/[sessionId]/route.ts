import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ sessionId: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { sessionId } = await params;
  return NextResponse.json({
    id: sessionId,
    title: "Think tank session",
    topic: "Strategic question for expert analysis.",
    status: "running",
    phase: "debate",
    debateRoundCurrent: 1,
    debateRoundsConfig: 2,
    tokensUsed: 42000,
    tokenBudget: 500000,
    createdAt: new Date().toISOString(),
    context: {},
  });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { sessionId } = await params;
  const body = await request.json();
  return NextResponse.json({ id: sessionId, ...body });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { sessionId } = await params;
  return NextResponse.json({ id: sessionId, deleted: true });
}
