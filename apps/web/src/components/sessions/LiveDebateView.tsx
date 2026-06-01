"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import { useSessionStream } from "@/hooks/useSessionStream";
import {
  getAnalyses,
  getConsensus,
  getDebate,
  getReport,
  startSession,
  type AgentAnalysis,
  type ConsensusDraft,
  type DebateTurn,
  type SessionReport,
} from "@/lib/api-client";
import { getAgentMetaById } from "@/lib/agents";
import { SessionAgentRoster } from "@/components/agents/SessionAgentRoster";
import type { AgentStatus } from "@/components/agents/AgentPanel";
import { PhaseTimeline } from "@/components/sessions/PhaseTimeline";
import { ConsensusView } from "@/components/consensus/ConsensusView";
import { ReportView } from "@/components/report/ReportView";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function stanceBadge(stance?: string) {
  switch (stance) {
    case "support":
      return <Badge variant="success">Support</Badge>;
    case "oppose":
      return <Badge>Challenge</Badge>;
    case "nuance":
      return <Badge variant="secondary">Nuance</Badge>;
    case "clarify":
      return <Badge variant="outline">Clarify</Badge>;
    default:
      return null;
  }
}

function DebateTurnCard({ turn }: { turn: DebateTurn }) {
  const meta = getAgentMetaById(turn.agentId);
  return (
    <article
      className="animate-fade-in-up rounded-lg border bg-card p-4 shadow-sm motion-reduce:animate-none"
    >
      <header className="mb-3 flex flex-wrap items-center gap-3">
        <AgentAvatar agentId={turn.agentId} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{meta?.displayName ?? turn.agentId}</p>
          <p className="text-xs text-muted-foreground">
            Round {turn.round}
            {turn.sequence != null ? ` · #${turn.sequence}` : ""}
          </p>
        </div>
        {stanceBadge(turn.metadata?.stance)}
      </header>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{turn.content}</p>
    </article>
  );
}

export function LiveDebateView({ sessionId }: { sessionId: string }) {
  const { session, loading, error, refresh } = useSession(sessionId);
  const {
    status: streamStatus,
    turns: streamTurns,
    phase: streamPhase,
    error: streamError,
    retry,
    setTurns,
  } = useSessionStream(sessionId, {
    enabled: Boolean(sessionId),
  });

  const [historicalTurns, setHistoricalTurns] = useState<DebateTurn[]>([]);
  const [analyses, setAnalyses] = useState<AgentAnalysis[]>([]);
  const [consensus, setConsensus] = useState<ConsensusDraft | null>(null);
  const [report, setReport] = useState<SessionReport | null>(null);
  const [starting, setStarting] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const phase = streamPhase ?? session?.phase ?? "queued";
  const allTurns = useMemo(() => {
    const map = new Map<string, DebateTurn>();
    for (const t of [...historicalTurns, ...streamTurns]) {
      map.set(t.id, t);
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return (a.sequence ?? 0) - (b.sequence ?? 0);
    });
  }, [historicalTurns, streamTurns]);

  const agentStatuses = useMemo(() => {
    const statuses: Record<string, AgentStatus> = {};
    const lastSpeaker = allTurns.at(-1)?.agentId;
    for (const t of allTurns) {
      statuses[t.agentId] = "done";
    }
    if (lastSpeaker && streamStatus === "live") {
      statuses[lastSpeaker] = "speaking";
    }
    if (phase.includes("analysis")) {
      for (const a of analyses) {
        statuses[a.agentId] = "done";
      }
    }
    return statuses;
  }, [allTurns, streamStatus, phase, analyses]);

  useEffect(() => {
    void getDebate(sessionId).then((d) => {
      setHistoricalTurns(d.turns);
      setTurns(d.turns);
    });
  }, [sessionId, setTurns]);

  useEffect(() => {
    void getAnalyses(sessionId).then((d) => setAnalyses(d.analyses));
    void getConsensus(sessionId).then((d) => setConsensus(d.draft));
    void getReport(sessionId).then((d) => setReport(d.report));
  }, [sessionId, phase]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [allTurns.length]);

  const handleStart = async () => {
    setStarting(true);
    try {
      await startSession(sessionId, "start");
      toast.success("Session started");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start session");
    } finally {
      setStarting(false);
    }
  };

  if (loading && !session) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
        <p className="font-medium text-destructive">{error}</p>
        <Button className="mt-4" variant="outline" onClick={() => void refresh()}>
          Retry
        </Button>
      </div>
    );
  }

  const tokenPct = session
    ? Math.min(100, Math.round((session.tokensUsed / session.tokenBudget) * 100))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{session?.title ?? "Session"}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground line-clamp-2">
            {session?.topic}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{session?.status ?? "unknown"}</Badge>
          {(session?.status === "queued" || session?.status === "draft") && (
            <Button onClick={() => void handleStart()} disabled={starting} aria-busy={starting}>
              {starting ? "Starting…" : "Start session"}
            </Button>
          )}
        </div>
      </div>

      <PhaseTimeline phase={phase} />

      {session?.errorMessage && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm" role="alert">
          {session.errorMessage}
        </div>
      )}

      <div className="grid max-w-xs gap-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Token usage</span>
          <span>
            {session?.tokensUsed?.toLocaleString() ?? 0} /{" "}
            {session?.tokenBudget?.toLocaleString() ?? "—"}
          </span>
        </div>
        <Progress value={tokenPct} aria-label="Token budget used" />
      </div>

      {(streamStatus === "connecting" || streamError) && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/40 px-4 py-2 text-sm"
          role="status"
        >
          <span>
            {streamStatus === "connecting"
              ? "Connecting to live stream…"
              : streamError ?? "Reconnecting…"}
          </span>
          {streamError && (
            <Button size="sm" variant="outline" onClick={retry}>
              Retry connection
            </Button>
          )}
        </div>
      )}

      <Tabs defaultValue="debate" className="w-full">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="debate">Live debate</TabsTrigger>
          <TabsTrigger value="analyses">Analyses</TabsTrigger>
          <TabsTrigger value="consensus">Consensus</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        <TabsContent value="debate" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[240px_1fr_280px]">
            <aside className="hidden lg:block">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Expert roster
              </h2>
              <ScrollArea className="h-[min(70vh,640px)]">
                <SessionAgentRoster agentStatuses={agentStatuses} />
              </ScrollArea>
            </aside>

            <section aria-label="Debate timeline">
              <div
                ref={feedRef}
                className="h-[min(70vh,640px)] space-y-4 overflow-y-auto pr-2"
                aria-live="polite"
                aria-relevant="additions"
              >
                {allTurns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Debate turns will stream here as experts speak.
                  </p>
                ) : (
                  allTurns.map((turn) => <DebateTurnCard key={turn.id} turn={turn} />)
                )}
                {streamStatus === "complete" && (
                  <Card className="border-accent/40 bg-accent/5">
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <p className="text-sm font-medium">Session complete</p>
                      <Button asChild size="sm">
                        <Link href={`/sessions/${sessionId}#report`}>View report</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            <aside className="hidden lg:block space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Phase</CardTitle>
                </CardHeader>
                <CardContent className="text-sm capitalize">{phase}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Stream</CardTitle>
                </CardHeader>
                <CardContent className={cn("text-sm capitalize", streamStatus === "live" && "text-accent")}>
                  {streamStatus}
                </CardContent>
              </Card>
            </aside>
          </div>

          <div className="mt-6 lg:hidden">
            <Separator className="mb-4" />
            <h2 className="mb-3 text-sm font-semibold">Expert roster</h2>
            <SessionAgentRoster agentStatuses={agentStatuses} />
          </div>
        </TabsContent>

        <TabsContent value="analyses">
          {analyses.length === 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {analyses.map((a) => (
                <Card key={a.agentId}>
                  <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <AgentAvatar agentId={a.agentId} />
                    <CardTitle className="text-sm">
                      {getAgentMetaById(a.agentId)?.displayName ?? a.agentId}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {a.output.executiveSummary ?? "Analysis in progress…"}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="consensus">
          <ConsensusView draft={consensus} />
        </TabsContent>

        <TabsContent value="report" id="report">
          <ReportView report={report} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
