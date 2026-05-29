import type { DebateGraphConfig } from "../types/workflow.js";

let graphConfig: DebateGraphConfig = {};

export function setGraphConfig(config: DebateGraphConfig): void {
  graphConfig = config;
}

export function getGraphConfig(): DebateGraphConfig {
  return graphConfig;
}
