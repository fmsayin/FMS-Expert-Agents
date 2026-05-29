import type { SseEvent } from "@fms/shared";

type Ctx = { params: Promise<{ sessionId: string }> };

/** GET SSE stream for debate/report progress (stub). */
export async function GET(_request: Request, { params }: Ctx) {
  const { sessionId } = await params;
  const encoder = new TextEncoder();
  const event: SseEvent = { type: "phase", phase: "queued", sessionId };

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`event: phase_change\ndata: ${JSON.stringify({ phase: "debate" })}\n\n`),
      );
      controller.enqueue(
        encoder.encode(
          `event: debate_turn\ndata: ${JSON.stringify({
            turn: {
              id: "turn-1",
              agentId: "diplomacy_ir",
              round: 1,
              sequence: 1,
              content:
                "I must challenge the security-first framing. Diplomatic sequencing with verifiable de-escalation milestones offers a more durable path than unilateral force postures.",
              metadata: { stance: "oppose" },
            },
          })}\n\n`,
        ),
      );
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
