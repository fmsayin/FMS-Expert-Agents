import { ALL_AGENTS } from "@/lib/agents";
import { AgentPanel } from "@/components/agents/AgentPanel";
import type { AgentStatus } from "@/components/agents/AgentPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { Badge } from "@/components/ui/badge";

const AGENT_REGISTRY_SHORT: Record<string, string> = {
  chief_peace_architect: "Integrative strategist chairing cross-domain synthesis.",
  peace_conflict: "Mediation, ceasefires, and local peace agreements.",
  diplomacy_ir: "Multilateral forums, treaties, and alliance dynamics.",
  strategic_security: "Deterrence, stability, and arms control.",
  humanitarian: "Civilian protection, aid access, and IHL compliance.",
  ai_peace: "AI governance, dual-use tech, and peace technology.",
  economic_dev: "Inclusive growth, sanctions economics, reconstruction.",
  civilization_culture: "Intercultural dialogue and historical grievances.",
  education_youth: "Peace education and youth inclusion.",
  media_comms: "Strategic narratives and counter-disinformation.",
  environmental_security: "Climate-conflict nexus and environmental peacebuilding.",
  space_future: "Space governance and emerging technology policy.",
  ethics_rights: "Human rights, accountability, and ethical limits.",
};

export function AgentDirectoryGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ALL_AGENTS.map((agent) => (
        <Card key={agent.id}>
          <CardHeader className="flex flex-row items-start gap-3 space-y-0">
            <AgentAvatar agentId={agent.id} size="lg" />
            <div>
              <CardTitle className="text-base">{agent.displayName}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {AGENT_REGISTRY_SHORT[agent.id]}
              </CardDescription>
              {agent.ethicsVeto && (
                <Badge variant="warning" className="mt-2">
                  Ethics veto
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs capitalize text-muted-foreground">
              Accent: {agent.accentGroup}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SessionAgentRoster({
  agentStatuses,
}: {
  agentStatuses: Record<string, AgentStatus>;
}) {
  return (
    <ul className="space-y-2" aria-label="Expert roster">
      {ALL_AGENTS.map((agent) => (
        <li key={agent.id}>
          <AgentPanel
            agentId={agent.id}
            status={agentStatuses[agent.id] ?? "idle"}
            compact
          />
        </li>
      ))}
    </ul>
  );
}
