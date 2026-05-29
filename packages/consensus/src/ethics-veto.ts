import { AgentId } from "@fms/shared";

/** Apply ethics agent veto on blocking concerns (stub). */
export function applyEthicsVeto(
  draft: unknown,
  flags: { agentId: string; blocking: boolean }[],
): { approved: boolean; draft: unknown } {
  const blocking = flags.some(
    (f) => f.agentId === AgentId.ETHICS_RIGHTS && f.blocking,
  );
  return { approved: !blocking, draft };
}
