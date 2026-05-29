import type { ConsensusDraft } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { getAgentMetaById } from "@/lib/agents";

export function ConsensusView({ draft }: { draft: ConsensusDraft | null }) {
  if (!draft) {
    return (
      <p className="text-sm text-muted-foreground">
        Consensus has not been built yet. It will appear after the debate and challenge phases.
      </p>
    );
  }

  const confidence = Math.round((draft.confidenceScore ?? 0) * 100);

  return (
    <div className="space-y-6">
      {draft.ethicsCleared === false && (
        <div
          className="rounded-lg border border-warning/50 bg-warning/10 p-4 text-sm"
          role="alert"
        >
          Ethics &amp; Human Rights flagged{" "}
          {draft.blockingConcerns?.length ?? 0} blocking concern(s). Human review required
          before finalization.
          {draft.blockingConcerns && draft.blockingConcerns.length > 0 && (
            <ul className="mt-2 list-inside list-disc">
              {draft.blockingConcerns.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {draft.recommendationSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recommendation summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            {draft.recommendationSummary}
          </CardContent>
        </Card>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Confidence</span>
          <span>{confidence}%</span>
        </div>
        <Progress value={confidence} aria-label="Consensus confidence" />
      </div>

      {draft.strategicPillars && draft.strategicPillars.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold">Strategic pillars</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {draft.strategicPillars.map((pillar, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{pillar.title}</CardTitle>
                </CardHeader>
                {pillar.description && (
                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    {pillar.description}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {draft.phasedActions && draft.phasedActions.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold">Phased actions</h3>
          <ol className="space-y-3">
            {draft.phasedActions.map((phase, i) => (
              <li key={i} className="rounded-lg border p-4">
                <p className="font-medium">{phase.phase}</p>
                {phase.actions && (
                  <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                    {phase.actions.map((a, j) => (
                      <li key={j}>{a}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {draft.dissent && draft.dissent.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold">Dissent</h3>
          <div className="space-y-3">
            {draft.dissent.map((d, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                  <AgentAvatar agentId={d.agentId} size="sm" />
                  <CardTitle className="text-sm">
                    {getAgentMetaById(d.agentId)?.displayName ?? d.agentId}
                  </CardTitle>
                  <Badge variant="outline">Dissent</Badge>
                </CardHeader>
                <CardContent className="text-sm">{d.position}</CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
