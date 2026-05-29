import type { AgentId } from "@fms/shared";
import type { ConsensusDraft, DissentRecord } from "@fms/consensus";

export interface SprrSection {
  id: string;
  title: string;
  content: string;
  contributingAgents: AgentId[];
}

export interface Kpi {
  id: string;
  label: string;
  target: string;
}

export interface ReportRisk {
  id: string;
  description: string;
  mitigation: string;
  severity: "low" | "medium" | "high";
}

export interface StrategicPeaceReport {
  title: string;
  sessionId: string;
  generatedAt: string;
  executiveSummary: string;
  sections: SprrSection[];
  dissentAppendix: DissentRecord[];
  indicatorsOfProgress: Kpi[];
  risksAndMitigations: ReportRisk[];
}

export interface ReportGeneratorInput {
  sessionId: string;
  topic: string;
  consensus: ConsensusDraft;
  analysesCount: number;
}

export interface ReportGenerator {
  generate(input: ReportGeneratorInput): StrategicPeaceReport;
}
