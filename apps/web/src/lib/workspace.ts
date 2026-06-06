export type WorkspaceId = "platform" | "roundtable" | "policy";

const POLICY_PREFIXES = ["/agents", "/sessions", "/policy-lab"] as const;

export function getWorkspaceFromPathname(pathname: string): WorkspaceId {
  if (pathname === "/roundtable" || pathname.startsWith("/roundtable/")) {
    return "roundtable";
  }
  if (POLICY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return "policy";
  }
  return "platform";
}

export const WORKSPACE_ATTR = "data-workspace" as const;
