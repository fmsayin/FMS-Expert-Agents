"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_AGENT_IDS } from "@fms/shared";
import { ALL_AGENTS } from "@/lib/agents";
import { createSession, startSession } from "@/lib/api-client";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NewSessionForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [region, setRegion] = useState("");
  const [actors, setActors] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("1y");
  const [constraints, setConstraints] = useState("");
  const [debateRounds, setDebateRounds] = useState(2);
  const [startImmediately, setStartImmediately] = useState(true);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([...ALL_AGENT_IDS]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (title.trim().length < 3) next.title = "Title must be at least 3 characters";
    if (topic.trim().length < 20) next.topic = "Strategic question must be at least 20 characters";
    if (selectedAgents.length === 0) next.agents = "Select at least one expert";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { sessionId } = await createSession({
        title: title.trim(),
        topic: topic.trim(),
        context: {
          region: region || undefined,
          actors: actors
            ? actors.split(",").map((a) => a.trim()).filter(Boolean)
            : undefined,
          timeHorizon,
          constraints: constraints
            ? constraints.split(",").map((c) => c.trim()).filter(Boolean)
            : undefined,
        },
        config: {
          debateRounds,
          startImmediately,
          allowPartialAnalysis: false,
          selectedAgentIds:
            selectedAgents.length === ALL_AGENT_IDS.length
              ? undefined
              : selectedAgents,
        },
      });

      if (startImmediately) {
        await startSession(sessionId, "start");
      }

      toast.success("Session created");
      router.push(`/sessions/${sessionId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-8" noValidate>
      <div>
        <h1 className="text-2xl font-semibold">New Think Tank Session</h1>
        <p className="mt-1 text-muted-foreground">
          Submit a strategic question for expert analysis, debate, and consensus.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Session title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Red Sea shipping de-escalation"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-sm text-destructive" role="alert">
                {errors.title}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Strategic question</Label>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What diplomatic and security measures could reduce attacks on commercial shipping…"
              aria-invalid={!!errors.topic}
            />
            <p className="text-xs text-muted-foreground">{topic.length} / 20 min characters</p>
            {errors.topic && (
              <p className="text-sm text-destructive" role="alert">
                {errors.topic}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Context</CardTitle>
          <CardDescription>Optional background for the experts</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Middle East / Red Sea"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="actors">Key actors (comma-separated)</Label>
            <Input
              id="actors"
              value={actors}
              onChange={(e) => setActors(e.target.value)}
              placeholder="Houthi forces, coalition navies, UN"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="horizon">Time horizon</Label>
            <Select value={timeHorizon} onValueChange={setTimeHorizon}>
              <SelectTrigger id="horizon" aria-label="Time horizon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6m">6 months</SelectItem>
                <SelectItem value="1y">1 year</SelectItem>
                <SelectItem value="5y">5 years</SelectItem>
                <SelectItem value="10y">10 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="constraints">Constraints (comma-separated)</Label>
            <Input
              id="constraints"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="minimize civilian harm, IHL compliance"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rounds">Debate rounds: {debateRounds}</Label>
            <input
              id="rounds"
              type="range"
              min={1}
              max={3}
              value={debateRounds}
              onChange={(e) => setDebateRounds(Number(e.target.value))}
              className="w-full accent-primary"
              aria-valuemin={1}
              aria-valuemax={3}
              aria-valuenow={debateRounds}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={startImmediately}
              onChange={(e) => setStartImmediately(e.target.checked)}
              className="rounded border-input"
            />
            Start think tank immediately after creation
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Expert selection</CardTitle>
            <CardDescription>
              {selectedAgents.length} of {ALL_AGENTS.length} experts selected
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setSelectedAgents(
                selectedAgents.length === ALL_AGENTS.length ? [] : [...ALL_AGENT_IDS],
              )
            }
          >
            {selectedAgents.length === ALL_AGENTS.length ? "Clear all" : "Select all"}
          </Button>
        </CardHeader>
        <CardContent>
          {errors.agents && (
            <p className="mb-3 text-sm text-destructive" role="alert">
              {errors.agents}
            </p>
          )}
          <ul className="grid gap-2 sm:grid-cols-2">
            {ALL_AGENTS.map((agent) => {
              const selected = selectedAgents.includes(agent.id);
              return (
                <li key={agent.id}>
                  <button
                    type="button"
                    onClick={() => toggleAgent(agent.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                      selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                    )}
                    aria-pressed={selected}
                    aria-label={`${selected ? "Deselect" : "Select"} ${agent.displayName}`}
                  >
                    <AgentAvatar agentId={agent.id} size="sm" />
                    <span className="text-sm font-medium">{agent.displayName}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting} aria-busy={submitting}>
          {submitting ? "Creating…" : "Start think tank →"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
