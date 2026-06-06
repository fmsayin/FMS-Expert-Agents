import type { WorkspaceId } from "@/lib/workspace";

export type { WorkspaceId };

export const WORKSPACE_LABELS: Record<WorkspaceId, string> = {
  platform: "Intelligence Center",
  roundtable: "Historical Archive",
  policy: "Policy Lab",
};

/** Tailwind-friendly workspace wrapper classes */
export const workspaceShellClass: Record<WorkspaceId, string> = {
  platform: "workspace-platform",
  roundtable: "workspace-roundtable",
  policy: "workspace-policy",
};
