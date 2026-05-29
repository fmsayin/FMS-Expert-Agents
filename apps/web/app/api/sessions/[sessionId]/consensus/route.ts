import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ sessionId: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { sessionId } = await params;
  return NextResponse.json({
    draft: {
      recommendationSummary:
        "Pursue a sequenced diplomatic–security package with verified de-escalation milestones and protected humanitarian corridors.",
      strategicPillars: [
        { title: "Verified de-escalation", description: "Independent monitoring of ceasefire compliance." },
        { title: "Inclusive dialogue", description: "Expand beyond elite tracks to youth and civil society." },
      ],
      phasedActions: [
        { phase: "0–90 days", actions: ["Confidence-building measures", "Humanitarian access protocol"] },
        { phase: "6–12 months", actions: ["Political roadmap negotiations", "Economic CBMs"] },
      ],
      dissent: [
        { agentId: "strategic_security", position: "Verification timelines may be too optimistic given spoiler incentives." },
      ],
      confidenceScore: 0.78,
      ethicsCleared: true,
      blockingConcerns: [],
    },
  });
}
