"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SessionSummary } from "@fms/shared";
import { listSessions } from "@/lib/api-client";
import { SessionCard } from "@/components/sessions/SessionCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function SessionList({ limit = 12 }: { limit?: number }) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const load = async (append = false) => {
    setLoading(true);
    try {
      const data = await listSessions({
        limit,
        cursor: append && cursor ? cursor : undefined,
      });
      setSessions((prev) => (append ? [...prev, ...data.sessions] : data.sessions));
      setNextCursor(data.nextCursor ?? null);
      if (data.nextCursor) setCursor(data.nextCursor);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && sessions.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full" />
        ))}
      </div>
    );
  }

  if (!loading && sessions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-10 text-center">
        <p className="text-lg font-medium">Start your first think tank session</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Submit a strategic question and convene all 13 peace experts.
        </p>
        <Button asChild className="mt-6">
          <Link href="/sessions/new">New session</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((s) => (
          <SessionCard key={s.id} session={s} />
        ))}
      </div>
      {nextCursor && (
        <div className="flex justify-center">
          <Button variant="outline" disabled={loading} onClick={() => void load(true)}>
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
