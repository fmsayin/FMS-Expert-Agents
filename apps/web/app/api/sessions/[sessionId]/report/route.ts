import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ sessionId: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { sessionId } = await params;
  return NextResponse.json({
    report: {
      id: "report-stub",
      version: 1,
      markdown: `# Strategic Peace Recommendation Report\n\n## Executive Summary\n\nThis report synthesizes expert debate on session **${sessionId}** into actionable peace-building recommendations.\n\n## Strategic Recommendations\n\n1. Establish verified de-escalation milestones\n2. Protect humanitarian access under IHL frameworks\n3. Invest in inclusive economic and youth inclusion measures\n`,
      createdAt: new Date().toISOString(),
    },
  });
}
