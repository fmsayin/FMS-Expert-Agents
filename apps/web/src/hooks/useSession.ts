"use client";

import { useCallback, useEffect, useState } from "react";
import type { SessionDetail } from "@fms/shared";
import { getSession } from "@/lib/api-client";

export function useSession(sessionId: string) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSession(sessionId);
      setSession(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { session, loading, error, refresh };
}
