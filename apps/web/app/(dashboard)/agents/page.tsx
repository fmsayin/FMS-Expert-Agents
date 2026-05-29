import { AgentDirectoryGrid } from "@/components/agents/AgentGrid";
import { MISSION_STATEMENT } from "@/lib/agents";

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Expert directory</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {MISSION_STATEMENT} — meet the 13 peace and security domain experts who analyze,
          debate, and build consensus on your strategic questions.
        </p>
      </div>
      <AgentDirectoryGrid />
    </div>
  );
}
