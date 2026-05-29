import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ sessionId: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { sessionId } = await params;
  return NextResponse.json({ sessionId, turns: [] });
}
