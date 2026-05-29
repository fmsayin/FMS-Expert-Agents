import { NextResponse } from "next/server";

/** POST create session, GET list sessions (stub). */
export async function GET() {
  const now = new Date().toISOString();
  return NextResponse.json({
    sessions: [
      {
        id: "demo-completed",
        title: "Red Sea shipping de-escalation",
        topic: "What diplomatic and security measures could reduce attacks on commercial shipping?",
        status: "completed",
        phase: "done",
        createdAt: now,
        completedAt: now,
      },
      {
        id: "demo-running",
        title: "Sahel stabilization pathways",
        topic: "How can regional actors advance inclusive governance while addressing extremist violence?",
        status: "running",
        phase: "debate",
        createdAt: now,
      },
    ],
    nextCursor: null,
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    topic?: string;
    config?: { debateRounds?: number };
  };
  const id = crypto.randomUUID();
  return NextResponse.json(
    {
      session: {
        id,
        title: body.title ?? "Untitled session",
        topic: body.topic ?? "",
        status: "queued",
        phase: "intake",
        debateRoundsConfig: body.config?.debateRounds ?? 2,
        createdAt: new Date().toISOString(),
      },
    },
    { status: 201 },
  );
}
