import { createReportGenerator } from "@fms/report";
import { emitStreamEvent } from "../events/emit.js";
import type { ThinkTankState } from "../state/think-tank-state.js";

const reportGenerator = createReportGenerator();

/** Generate Strategic Peace Recommendation Report (SPRR). */
export async function generateReport(
  state: ThinkTankState,
): Promise<Partial<ThinkTankState>> {
  const consensus =
    state.consensusFinal ?? state.consensusDraft;

  if (!consensus) {
    return {
      errors: ["Cannot generate report without consensus draft"],
      fatalError: true,
      phase: "failed",
      currentPhase: "failed",
    };
  }

  const report = reportGenerator.generate({
    sessionId: state.sessionId,
    topic: state.topic,
    consensus,
    analysesCount: state.analyses.length,
  });

  for (const section of report.sections) {
    await emitStreamEvent({
      type: "report_section",
      sessionId: state.sessionId,
      payload: { sectionId: section.id, content: section.content },
    });
  }

  await emitStreamEvent({
    type: "complete",
    sessionId: state.sessionId,
    payload: { reportId: state.sessionId, title: report.title },
  });

  await emitStreamEvent({
    type: "phase_change",
    sessionId: state.sessionId,
    payload: { phase: "complete" },
  });

  return {
    report,
    reportSections: report.sections,
    consensusFinal: consensus,
    phase: "complete",
    currentPhase: "complete",
  };
}
