"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  parseStreamPayload,
  type DebateTurn,
  type StreamEvent,
} from "@/lib/api-client";

export type StreamStatus = "idle" | "connecting" | "live" | "paused" | "complete" | "error";

export interface UseSessionStreamOptions {
  enabled?: boolean;
  onEvent?: (event: StreamEvent) => void;
}

export function useSessionStream(
  sessionId: string,
  options: UseSessionStreamOptions = {},
) {
  const { enabled = true, onEvent } = options;
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [turns, setTurns] = useState<DebateTurn[]>([]);
  const [phase, setPhase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (!sessionId || !enabled) return () => undefined;

    setStatus("connecting");
    setError(null);

    const es = new EventSource(`/api/sessions/${sessionId}/stream`);

    const handlePayload = (eventName: string | null, raw: string) => {
      const parsed = parseStreamPayload(eventName, raw);
      if (!parsed) return;
      onEventRef.current?.(parsed);

      switch (parsed.type) {
        case "debate_turn":
          setTurns((prev) => {
            const exists = prev.some((t) => t.id === parsed.turn.id);
            if (exists) return prev;
            return [...prev, parsed.turn];
          });
          setStatus("live");
          break;
        case "phase_change":
          setPhase(parsed.phase);
          setStatus("live");
          break;
        case "complete":
          setStatus("complete");
          es.close();
          break;
        case "error":
          setError(parsed.message);
          setStatus("error");
          break;
        default:
          setStatus("live");
      }
    };

    es.onmessage = (msg) => handlePayload(null, msg.data);
    es.addEventListener("debate_turn", (msg) =>
      handlePayload("debate_turn", (msg as MessageEvent).data),
    );
    es.addEventListener("phase_change", (msg) =>
      handlePayload("phase_change", (msg as MessageEvent).data),
    );
    es.addEventListener("complete", () => {
      setStatus("complete");
      es.close();
    });
    es.addEventListener("error", (msg) => {
      if ((msg as MessageEvent).data) {
        handlePayload("error", (msg as MessageEvent).data);
      }
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) return;
      setError("Connection lost");
      setStatus("error");
    };

    es.onopen = () => setStatus("live");

    return () => {
      es.close();
      setStatus("idle");
    };
  }, [sessionId, enabled]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  const retry = useCallback(() => {
    connect();
  }, [connect]);

  return {
    status,
    turns,
    phase,
    error,
    retry,
    setTurns,
    setPhase,
    setStatus,
  };
}
