"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ActiveParticipants } from "@/components/roundtable/ActiveParticipants";
import { AddNotesModal } from "@/components/roundtable/AddNotesModal";
import { DebateFeed } from "@/components/roundtable/DebateFeed";
import { DebateCompleteActions } from "@/components/roundtable/DebateCompleteActions";
import { DebateRetentionBar } from "@/components/roundtable/DebateRetentionBar";
import { DebateStatusBar } from "@/components/roundtable/DebateStatusBar";
import { RoundtableOnboarding } from "@/components/roundtable/RoundtableOnboarding";
import { FigureKnowledgePanel } from "@/components/roundtable/FigureKnowledgePanel";
import { FigureProfilePanel } from "@/components/roundtable/FigureProfilePanel";
import { RoundtableRightPanel } from "@/components/roundtable/RoundtableRightPanel";
import { SavedDebatesDrawer } from "@/components/roundtable/SavedDebatesDrawer";
import { ThemeSwitcher } from "@/components/roundtable/ThemeSwitcher";
import { TopicSidebar } from "@/components/roundtable/TopicSidebar";
import { loadTurkishViewMode } from "@/components/roundtable/TurkishModeToggle";
import type {
  DebateProgress,
  DebateStatus,
  RoundTableChatMessage,
  RoundTableChatMode,
  RoundTableCustomTopic,
  RoundTableThemeId,
  RoundtableRightTab,
  ThinkTankAnalysis,
  TurkishExecutiveReport,
  TurkishSummaryEntry,
  TurkishSummaryStructured,
  TurkishViewMode,
  TypingFigure,
} from "@/components/roundtable/types";
import { SAMPLE_DEBATE_MESSAGES } from "@/components/roundtable/sample-debate";
import { SAMPLE_THINK_TANK_ANALYSIS } from "@/components/roundtable/sample-analysis";
import { ROUNDTABLE_THEMES, themeToCssVars } from "@/components/roundtable/themes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_ACTIVE_FIGURE_IDS } from "@/data/historical-figures";
import {
  listCustomFigures,
  parseCustomFigureUuid,
  type CustomFigure,
} from "@/lib/custom-figures-storage";
import {
  customFigureToPayload,
  getFigureById,
  type CustomFigurePayload,
} from "@/lib/roundtable-figures";
import { sortDisplayNames } from "@/lib/figure-sort";
import type { HistoricalFigure } from "@/data/historical-figures";
import {
  CUSTOM_ROUNDTABLE_TOPIC_ID,
  DEFAULT_ROUNDTABLE_TOPIC_ID,
  buildCustomTopicFull,
  buildPredefinedTopicFull,
  getRoundTableTopicById,
} from "@/data/roundtable-topics";
import {
  saveDebateSession,
  toggleDebateBookmark,
  updateDebateSessionNotes,
  type DebateSession,
} from "@/lib/debate-sessions-storage";
import { cn } from "@/lib/utils";

const DEBATE_DELAY_MS = 400;
const CONSENSUS_MESSAGE_INTERVAL = 2;
const CONSENSUS_DEBOUNCE_MS = 3000;

/** Interim consensus/disagreement until incremental analyze returns. */
function computeInterimDebateScores(
  exchangeCount: number,
  participantCount: number,
): { consensus: number; disagreement: number } {
  if (exchangeCount <= 0) {
    return { consensus: 50, disagreement: 50 };
  }
  const depth = Math.min(25, Math.round((participantCount * exchangeCount) / 4));
  return {
    consensus: Math.min(72, 48 + depth),
    disagreement: Math.min(68, 42 + Math.round(depth * 0.85)),
  };
}

function shouldScheduleIncrementalAnalysis(exchangeCount: number): boolean {
  return (
    exchangeCount >= 1 &&
    (exchangeCount === 1 || exchangeCount % CONSENSUS_MESSAGE_INTERVAL === 0)
  );
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1).trimEnd()}…`;
}

type ApiErrorBody = { error?: string; code?: string };

async function fetchFigureReply(params: {
  figureId: string;
  topicId?: string;
  topicDescription?: string;
  customTopic?: { title: string; description?: string };
  customFigure?: CustomFigurePayload;
  messages: RoundTableChatMessage[];
  mode: RoundTableChatMode;
  moderatorText?: string;
}): Promise<{ content: string; citations?: { sourceName: string; snippet: string }[] }> {
  const body: Record<string, unknown> = {
    figureId: params.figureId,
    messages: params.messages,
    mode: params.mode,
    moderatorText: params.moderatorText,
  };
  if (params.customFigure) {
    body.customFigure = params.customFigure;
  }
  if (params.customTopic) {
    body.customTopic = params.customTopic;
  } else if (params.topicId) {
    body.topicId = params.topicId;
    if (params.topicDescription) {
      body.topicDescription = params.topicDescription;
    }
  }

  const res = await fetch("/api/roundtable/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as ApiErrorBody & {
    content?: string;
    citations?: { sourceName: string; snippet: string }[];
  };
  if (!res.ok) {
    const err = new Error(data.error ?? "Request failed");
    if (data.code) (err as Error & { code?: string }).code = data.code;
    throw err;
  }
  if (!data.content) throw new Error("Empty response");
  return {
    content: data.content,
    citations: data.citations,
  };
}

async function fetchAnalysis(params: {
  topicFull: string;
  messages: RoundTableChatMessage[];
}): Promise<ThinkTankAnalysis> {
  const res = await fetch("/api/roundtable/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as ApiErrorBody & { analysis?: ThinkTankAnalysis };
  if (!res.ok) {
    const err = new Error(data.error ?? "Analysis failed");
    if (data.code) (err as Error & { code?: string }).code = data.code;
    throw err;
  }
  if (!data.analysis) throw new Error("Empty analysis");
  return data.analysis;
}

async function fetchTurkishSummary(params: {
  content: string;
  figureName: string;
  topicContext: string;
}): Promise<{ summary: string; structured?: TurkishSummaryStructured }> {
  const res = await fetch("/api/roundtable/turkish-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as ApiErrorBody & {
    summary?: string;
    structured?: TurkishSummaryStructured;
  };
  if (!res.ok) {
    const err = new Error(data.error ?? "Turkish summary failed");
    if (data.code) (err as Error & { code?: string }).code = data.code;
    throw err;
  }
  if (!data.summary) throw new Error("Empty Turkish summary");
  return { summary: data.summary, structured: data.structured };
}

async function fetchTurkishReport(params: {
  topicFull: string;
  messages: RoundTableChatMessage[];
}): Promise<TurkishExecutiveReport> {
  const res = await fetch("/api/roundtable/turkish-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as ApiErrorBody & { report?: TurkishExecutiveReport };
  if (!res.ok) {
    const err = new Error(data.error ?? "Turkish report failed");
    if (data.code) (err as Error & { code?: string }).code = data.code;
    throw err;
  }
  if (!data.report) throw new Error("Empty Turkish report");
  return data.report;
}

function newSummaryId(): string {
  return `tr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function deriveDebateStatus(params: {
  messages: RoundTableChatMessage[];
  topicFull: string;
  activeFigureCount: number;
  isDebateLoading: boolean;
  isAnalyzeLoading: boolean;
  debateFinished: boolean;
  analysis: ThinkTankAnalysis | null;
}): DebateStatus {
  if (params.isAnalyzeLoading) return "consensus_building";
  if (params.isDebateLoading) return "in_progress";
  if (params.debateFinished && params.analysis) return "complete";
  if (params.messages.length > 0) return "in_progress";
  if (
    params.messages.length === 0 &&
    params.topicFull &&
    params.activeFigureCount > 0
  ) {
    return "waiting";
  }
  return "idle";
}

export function RoundTableClient() {
  const [themeId, setThemeId] = useState<RoundTableThemeId>("editorial");
  const [activeTopicId, setActiveTopicId] = useState<string>(DEFAULT_ROUNDTABLE_TOPIC_ID);
  const [customTopic, setCustomTopic] = useState<RoundTableCustomTopic | null>(null);
  const [customTopicDescription, setCustomTopicDescription] = useState("");
  const [predefinedTopicDescriptions, setPredefinedTopicDescriptions] = useState<
    Record<string, string>
  >({});
  const [activeFigureIds, setActiveFigureIds] = useState<string[]>([...DEFAULT_ACTIVE_FIGURE_IDS]);
  const [customFigures, setCustomFigures] = useState<CustomFigure[]>([]);
  const [profileFigure, setProfileFigure] = useState<HistoricalFigure | null>(null);
  const [knowledgeFigure, setKnowledgeFigure] = useState<HistoricalFigure | null>(null);
  const [messages, setMessages] = useState<RoundTableChatMessage[]>([]);
  const [typingFigure, setTypingFigure] = useState<TypingFigure | null>(null);
  const [input, setInput] = useState("");
  const [isDebateLoading, setIsDebateLoading] = useState(false);
  const [isAnalyzeLoading, setIsAnalyzeLoading] = useState(false);
  const [debateProgress, setDebateProgress] = useState<DebateProgress | null>(null);
  const [analysis, setAnalysis] = useState<ThinkTankAnalysis | null>(null);
  const [analysisIsPlaceholder, setAnalysisIsPlaceholder] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [turkishMode, setTurkishMode] = useState<TurkishViewMode>("bilingual");
  const [turkishSummaries, setTurkishSummaries] = useState<TurkishSummaryEntry[]>([]);
  const [turkishReport, setTurkishReport] = useState<TurkishExecutiveReport | null>(null);
  const [isTurkishReportLoading, setIsTurkishReportLoading] = useState(false);
  const [turkishReportError, setTurkishReportError] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<RoundtableRightTab>("participants");
  const [reportsBadge, setReportsBadge] = useState(false);
  const [isIncrementalAnalyze, setIsIncrementalAnalyze] = useState(false);
  const [debateFinished, setDebateFinished] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionBookmarked, setSessionBookmarked] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debateStartedAtRef = useRef<number | null>(null);
  const analysisDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFinalAnalyzeRef = useRef(false);

  useEffect(() => {
    setCustomFigures(listCustomFigures());
  }, []);

  useEffect(() => {
    setTurkishMode(loadTurkishViewMode());
  }, []);

  useEffect(() => {
    if (turkishMode === "turkish_only") setRightTab("observer");
  }, [turkishMode]);

  const theme = ROUNDTABLE_THEMES[themeId];

  useEffect(() => {
    const root = document.documentElement;
    const vars = themeToCssVars(theme);
    for (const [key, value] of Object.entries(vars)) {
      if (typeof value === "string") root.style.setProperty(key, value);
    }
    return () => {
      for (const key of Object.keys(vars)) {
        root.style.removeProperty(key);
      }
    };
  }, [theme]);

  const isCustomActive =
    activeTopicId === CUSTOM_ROUNDTABLE_TOPIC_ID && customTopic !== null;
  const predefinedTopic = isCustomActive ? undefined : getRoundTableTopicById(activeTopicId);

  const topicFull = useMemo(() => {
    if (isCustomActive && customTopic) {
      return buildCustomTopicFull(customTopic.title, customTopicDescription);
    }
    if (predefinedTopic) {
      return buildPredefinedTopicFull(
        predefinedTopic.full,
        predefinedTopicDescriptions[predefinedTopic.id],
      );
    }
    return "";
  }, [
    isCustomActive,
    customTopic,
    customTopicDescription,
    predefinedTopic,
    predefinedTopicDescriptions,
  ]);

  const displayTitle = isCustomActive ? customTopic?.title : predefinedTopic?.full;
  const displayDescription = useMemo(() => {
    if (isCustomActive) {
      const desc = customTopicDescription.trim();
      if (desc) return truncateText(desc, 120);
    }
    if (predefinedTopic) {
      const desc = predefinedTopicDescriptions[predefinedTopic.id]?.trim();
      if (desc) return truncateText(desc, 120);
    }
    return null;
  }, [
    isCustomActive,
    customTopicDescription,
    predefinedTopic,
    predefinedTopicDescriptions,
  ]);

  const topicRequestParams = useMemo(() => {
    if (isCustomActive && customTopic) {
      const description = customTopicDescription.trim();
      return {
        customTopic: {
          title: customTopic.title,
          description: description || undefined,
        },
      };
    }
    if (predefinedTopic) {
      const description = predefinedTopicDescriptions[predefinedTopic.id]?.trim();
      return {
        topicId: predefinedTopic.id,
        topicDescription: description || undefined,
      };
    }
    return null;
  }, [
    isCustomActive,
    customTopic,
    customTopicDescription,
    predefinedTopic,
    predefinedTopicDescriptions,
  ]);

  const activeFigures = useMemo(
    () =>
      activeFigureIds
        .map((id) => getFigureById(id, customFigures))
        .filter((f): f is NonNullable<typeof f> => Boolean(f)),
    [activeFigureIds, customFigures],
  );

  const exchangeCount = useMemo(
    () => messages.filter((m) => m.role === "assistant").length,
    [messages],
  );

  const strategicComplexityScore = useMemo(() => {
    if (exchangeCount === 0) return 0;
    return Math.min(
      100,
      Math.max(8, Math.round((activeFigures.length * exchangeCount) / 10)),
    );
  }, [activeFigures.length, exchangeCount]);

  const interimScores = useMemo(
    () => computeInterimDebateScores(exchangeCount, activeFigures.length),
    [exchangeCount, activeFigures.length],
  );

  const displayConsensusScore =
    analysis?.consensusScore ??
    (exchangeCount > 0 ? interimScores.consensus : null);
  const displayDisagreementScore =
    analysis?.disagreementScore ??
    (exchangeCount > 0 ? interimScores.disagreement : null);

  const debateStatus = deriveDebateStatus({
    messages,
    topicFull,
    activeFigureCount: activeFigureIds.length,
    isDebateLoading,
    isAnalyzeLoading,
    debateFinished,
    analysis,
  });

  const progressLabel = useMemo(() => {
    if (isAnalyzeLoading) return "Synthesizing think tank analysis…";
    if (debateProgress) {
      return `Speaking ${debateProgress.current} of ${debateProgress.total} — ${debateProgress.figureName}…`;
    }
    return null;
  }, [isAnalyzeLoading, debateProgress]);

  const startTimer = useCallback(() => {
    if (debateStartedAtRef.current != null) return;
    debateStartedAtRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (debateStartedAtRef.current) {
        setDurationSeconds(
          Math.floor((Date.now() - debateStartedAtRef.current) / 1000),
        );
      }
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const resolveCustomPayload = useCallback(
    (figureId: string): CustomFigurePayload | undefined => {
      const uuid = parseCustomFigureUuid(figureId);
      if (!uuid) return undefined;
      const custom = customFigures.find((f) => f.id === uuid);
      if (!custom) return undefined;
      return customFigureToPayload(custom);
    },
    [customFigures],
  );

  const handleCustomFigureDeleted = useCallback((storageId: string) => {
    setActiveFigureIds((prev) => {
      if (!prev.includes(storageId)) return prev;
      const next = prev.filter((id) => id !== storageId);
      return next.length > 0 ? next : [...DEFAULT_ACTIVE_FIGURE_IDS];
    });
  }, []);

  const resetTurkishState = useCallback(() => {
    setTurkishSummaries([]);
    setTurkishReport(null);
    setTurkishReportError(null);
    setIsTurkishReportLoading(false);
  }, []);

  const resetDebateState = useCallback(() => {
    setMessages([]);
    setAnalysis(null);
    setAnalysisIsPlaceholder(false);
    setApiError(null);
    setDebateProgress(null);
    setDurationSeconds(0);
    setCurrentSessionId(null);
    setSessionBookmarked(false);
    setSessionNotes("");
    setReportsBadge(false);
    setDebateFinished(false);
    debateStartedAtRef.current = null;
    if (analysisDebounceRef.current) {
      clearTimeout(analysisDebounceRef.current);
      analysisDebounceRef.current = null;
    }
    resetTurkishState();
    stopTimer();
  }, [stopTimer, resetTurkishState]);

  const turkishLayerActive = turkishMode !== "english_only";

  const requestTurkishSummary = useCallback(
    async (content: string, figureName: string) => {
      if (!turkishLayerActive || !topicFull) return;

      const entryId = newSummaryId();
      const placeholder: TurkishSummaryEntry = {
        id: entryId,
        timestamp: Date.now(),
        figureName,
        summary: "",
        isLoading: true,
      };
      setTurkishSummaries((prev) => [...prev, placeholder]);

      try {
        const { summary, structured } = await fetchTurkishSummary({
          content,
          figureName,
          topicContext: topicFull,
        });
        setTurkishSummaries((prev) =>
          prev.map((e) =>
            e.id === entryId
              ? { ...e, summary, structured, isLoading: false }
              : e,
          ),
        );
      } catch (e) {
        const err = e as Error & { code?: string };
        const msg =
          err.code === "MISSING_API_KEY"
            ? err.message
            : err.message || "Turkish summary failed";
        setTurkishSummaries((prev) =>
          prev.map((entry) =>
            entry.id === entryId
              ? { ...entry, isLoading: false, error: msg }
              : entry,
          ),
        );
      }
    },
    [turkishLayerActive, topicFull],
  );

  const runTurkishReport = useCallback(
    async (history: RoundTableChatMessage[]) => {
      if (!turkishLayerActive || !topicFull || history.length === 0) return;

      setIsTurkishReportLoading(true);
      setTurkishReportError(null);

      try {
        const report = await fetchTurkishReport({ topicFull, messages: history });
        setTurkishReport(report);
      } catch (e) {
        const err = e as Error & { code?: string };
        setTurkishReportError(err.message || "Turkish report failed");
      } finally {
        setIsTurkishReportLoading(false);
      }
    },
    [turkishLayerActive, topicFull],
  );

  const handleSelectTopic = useCallback(
    (id: string) => {
      setActiveTopicId(id);
      setCustomTopic(null);
      resetDebateState();
    },
    [resetDebateState],
  );

  const handleApplyCustomTopic = useCallback(
    (topic: RoundTableCustomTopic) => {
      setActiveTopicId(CUSTOM_ROUNDTABLE_TOPIC_ID);
      setCustomTopic({ title: topic.title, description: "" });
      resetDebateState();
    },
    [resetDebateState],
  );

  const handleClearCustomTopic = useCallback(() => {
    if (activeTopicId === CUSTOM_ROUNDTABLE_TOPIC_ID) {
      setActiveTopicId(DEFAULT_ROUNDTABLE_TOPIC_ID);
      setCustomTopic(null);
      setCustomTopicDescription("");
      resetDebateState();
    }
  }, [activeTopicId, resetDebateState]);

  const handlePredefinedTopicDescriptionChange = useCallback(
    (topicId: string, description: string) => {
      setPredefinedTopicDescriptions((prev) => ({
        ...prev,
        [topicId]: description,
      }));
    },
    [],
  );

  const handleCustomTopicDescriptionChange = useCallback((description: string) => {
    setCustomTopicDescription(description);
  }, []);

  const toggleFigure = useCallback((id: string) => {
    setActiveFigureIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter((f) => f !== id);
      }
      return [...prev, id];
    });
  }, []);

  const runAnalysis = useCallback(
    async (history: RoundTableChatMessage[], options?: { final?: boolean }) => {
      if (!topicFull || history.length === 0) return;

      const isFinal = options?.final ?? false;
      if (isFinal) {
        isFinalAnalyzeRef.current = true;
        if (analysisDebounceRef.current) {
          clearTimeout(analysisDebounceRef.current);
          analysisDebounceRef.current = null;
        }
      }

      if (isFinal) {
        setIsAnalyzeLoading(true);
      } else {
        setIsIncrementalAnalyze(true);
      }
      setApiError(null);

      try {
        const result = await fetchAnalysis({ topicFull, messages: history });
        setAnalysis(result);
        setAnalysisIsPlaceholder(false);
        setReportsBadge(true);
        if (isFinal) {
          stopTimer();
          if (turkishLayerActive) {
            void runTurkishReport(history);
          }
        }
      } catch (e) {
        const err = e as Error & { code?: string };
        if (err.code === "MISSING_API_KEY") {
          setAnalysis(SAMPLE_THINK_TANK_ANALYSIS);
          setAnalysisIsPlaceholder(true);
          setApiError(err.message);
          setReportsBadge(true);
        } else if (isFinal) {
          setApiError(err.message || "Analysis failed");
        }
      } finally {
        if (isFinal) {
          setIsAnalyzeLoading(false);
          isFinalAnalyzeRef.current = false;
        } else {
          setIsIncrementalAnalyze(false);
        }
      }
    },
    [topicFull, stopTimer, turkishLayerActive, runTurkishReport],
  );

  const scheduleIncrementalAnalysis = useCallback(
    (history: RoundTableChatMessage[]) => {
      if (!topicFull || history.length === 0 || isFinalAnalyzeRef.current) return;
      if (analysisDebounceRef.current) clearTimeout(analysisDebounceRef.current);
      analysisDebounceRef.current = setTimeout(() => {
        void runAnalysis(history, { final: false });
      }, CONSENSUS_DEBOUNCE_MS);
    },
    [topicFull, runAnalysis],
  );

  const buildSessionPayload = useCallback(
    (history: RoundTableChatMessage[]) => ({
      topic: displayTitle ?? "Round Table Debate",
      topicFull,
      participants: sortDisplayNames(activeFigures.map((f) => f.name)),
      participantIds: activeFigureIds,
      messages: history,
      englishAnalysis: analysis,
      turkishReport,
      turkishSummaries,
      notes: sessionNotes,
      bookmarked: sessionBookmarked,
      durationSeconds,
      themeId,
      topicId: activeTopicId,
    }),
    [
      displayTitle,
      topicFull,
      activeFigures,
      activeFigureIds,
      analysis,
      turkishReport,
      turkishSummaries,
      sessionNotes,
      sessionBookmarked,
      durationSeconds,
      themeId,
      activeTopicId,
    ],
  );

  const persistSession = useCallback(
    (history: RoundTableChatMessage[]) => {
      const saved = saveDebateSession({
        id: currentSessionId ?? undefined,
        ...buildSessionPayload(history),
      });
      setCurrentSessionId(saved.id);
      setSessionBookmarked(saved.bookmarked);
      setSessionNotes(saved.notes);
      return saved;
    },
    [currentSessionId, buildSessionPayload],
  );

  const handleRestoreSession = useCallback(
    (session: DebateSession) => {
      setActiveTopicId(session.topicId ?? DEFAULT_ROUNDTABLE_TOPIC_ID);
      setActiveFigureIds(session.participantIds);
      setMessages(session.messages);
      setAnalysis(session.englishAnalysis);
      setAnalysisIsPlaceholder(false);
      setTurkishSummaries(session.turkishSummaries);
      setTurkishReport(session.turkishReport);
      setDurationSeconds(session.durationSeconds);
      setCurrentSessionId(session.id);
      setSessionBookmarked(session.bookmarked);
      setSessionNotes(session.notes);
      setApiError(null);
      setDebateFinished(Boolean(session.englishAnalysis));
      if (session.messages.length > 0) {
        debateStartedAtRef.current = Date.now() - session.durationSeconds * 1000;
        startTimer();
      }
    },
    [startTimer],
  );

  const runFigureSequence = useCallback(
    async (
      figureIds: string[],
      buildParams: (history: RoundTableChatMessage[]) => {
        mode: RoundTableChatMode;
        moderatorText?: string;
      },
      initialHistory?: RoundTableChatMessage[],
      options?: { autoAnalyze?: boolean },
    ) => {
      if (!topicRequestParams) return;
      setIsDebateLoading(true);
      setDebateFinished(false);
      setApiError(null);
      setDebateProgress(null);
      startTimer();

      let history = initialHistory ?? [...messages];
      const total = figureIds.length;
      let index = 0;

      for (const figureId of figureIds) {
        index += 1;
        const figure = getFigureById(figureId, customFigures);
        if (!figure) continue;

        const customFigurePayload = resolveCustomPayload(figureId);

        setDebateProgress({ current: index, total, figureName: figure.name });
        setTypingFigure({ figureId: figure.id, name: figure.name, initials: figure.initials });

        try {
          const { mode, moderatorText } = buildParams(history);
          const { content, citations } = await fetchFigureReply({
            figureId,
            ...topicRequestParams,
            customFigure: customFigurePayload,
            messages: history,
            mode,
            moderatorText,
          });

          const assistantMsg: RoundTableChatMessage = {
            role: "assistant",
            content,
            figureId: figure.id,
            figureName: figure.name,
            initials: figure.initials,
            era: figure.era,
            ...(citations?.length ? { citations } : {}),
          };
          history = [...history, assistantMsg];
          setMessages(history);
          void requestTurkishSummary(content, figure.name);
          const exchanges = history.filter((m) => m.role === "assistant").length;
          if (shouldScheduleIncrementalAnalysis(exchanges)) {
            scheduleIncrementalAnalysis(history);
          }
        } catch (e) {
          const err = e as Error & { code?: string };
          const msg =
            err.code === "MISSING_API_KEY"
              ? err.message
              : err.message || "Generation failed";
          setApiError(msg);
          const failMsg: RoundTableChatMessage = {
            role: "assistant",
            content: `[Error: ${msg}]`,
            figureId: figure.id,
            figureName: figure.name,
            initials: figure.initials,
            era: figure.era,
          };
          history = [...history, failMsg];
          setMessages(history);
          if (err.code === "MISSING_API_KEY") break;
        } finally {
          setTypingFigure(null);
        }

        await new Promise((r) => setTimeout(r, DEBATE_DELAY_MS));
      }

      setDebateProgress(null);
      setIsDebateLoading(false);
      setDebateFinished(true);

      if (options?.autoAnalyze && history.length > 0) {
        await runAnalysis(history, { final: true });
      }
    },
    [
      topicRequestParams,
      messages,
      customFigures,
      resolveCustomPayload,
      startTimer,
      runAnalysis,
      requestTurkishSummary,
      scheduleIncrementalAnalysis,
    ],
  );

  const startDebate = useCallback(async () => {
    if (!topicFull) {
      setApiError("Please select a topic first.");
      return;
    }
    if (isDebateLoading || isAnalyzeLoading) return;
    setAnalysis(null);
    setAnalysisIsPlaceholder(false);
    await runFigureSequence(activeFigureIds, () => ({ mode: "debate" }), [], {
      autoAnalyze: true,
    });
  }, [
    topicFull,
    activeFigureIds,
    isDebateLoading,
    isAnalyzeLoading,
    runFigureSequence,
  ]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !topicFull || isDebateLoading || isAnalyzeLoading) return;

    const userMsg: RoundTableChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setAnalysis(null);
    setAnalysisIsPlaceholder(false);

    await runFigureSequence(
      activeFigureIds,
      () => ({
        mode: "interjection",
        moderatorText: text,
      }),
      nextMessages,
      { autoAnalyze: true },
    );
  }, [
    input,
    topicFull,
    isDebateLoading,
    isAnalyzeLoading,
    messages,
    activeFigureIds,
    runFigureSequence,
  ]);

  const handleGenerateAnalysis = useCallback(() => {
    if (messages.length === 0 || isAnalyzeLoading || isDebateLoading) return;
    setDebateFinished(true);
    void runAnalysis(messages, { final: true });
  }, [messages, isAnalyzeLoading, isDebateLoading, runAnalysis]);

  const handleSaveDebate = useCallback(() => {
    if (messages.length === 0) return;
    persistSession(messages);
  }, [messages, persistSession]);

  const handleBookmark = useCallback(() => {
    if (messages.length === 0) return;
    const saved = persistSession(messages);
    const updated = toggleDebateBookmark(saved.id);
    if (updated) setSessionBookmarked(updated.bookmarked);
  }, [messages, persistSession]);

  const handleContinueLater = useCallback(() => {
    if (messages.length === 0) return;
    persistSession(messages);
  }, [messages, persistSession]);

  const handleSaveNotes = useCallback(
    (notes: string) => {
      setSessionNotes(notes);
      if (messages.length > 0) {
        const saved = saveDebateSession({
          id: currentSessionId ?? undefined,
          ...buildSessionPayload(messages),
          notes,
        });
        setCurrentSessionId(saved.id);
      }
    },
    [messages, currentSessionId, buildSessionPayload],
  );

  const handleGenerateTurkishReport = useCallback(() => {
    if (messages.length === 0 || isTurkishReportLoading || isDebateLoading) return;
    void runTurkishReport(messages);
  }, [messages, isTurkishReportLoading, isDebateLoading, runTurkishReport]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const isLoading = isDebateLoading || isAnalyzeLoading;
  const participantNames = useMemo(
    () => sortDisplayNames(activeFigures.map((f) => f.name)),
    [activeFigures],
  );
  const showDebatePreview =
    debateStatus === "waiting" && messages.length === 0 && topicFull.length > 0;
  const showLaunchButton =
    debateStatus !== "complete" &&
    debateStatus !== "consensus_building" &&
    topicFull.length > 0 &&
    activeFigureIds.length > 0;
  const showCompleteActions =
    messages.length > 0 && Boolean(analysis) && debateStatus === "complete";
  const showRetentionBar = showCompleteActions;
  const analyzeDisabledReason =
    messages.length === 0
      ? "Launch a debate or add messages before generating analysis."
      : null;

  return (
    <div
      data-theme="roundtable"
      className="overflow-hidden rounded-xl border transition-colors duration-300"
      style={{
        ...themeToCssVars(theme),
        backgroundColor: "var(--rt-bg)",
        color: "var(--rt-text)",
        borderColor: "var(--rt-border)",
        fontFamily: "var(--rt-font-body)",
        backgroundImage: `
          radial-gradient(ellipse at 20% 0%, color-mix(in srgb, var(--rt-accent) 8%, transparent), transparent 50%),
          radial-gradient(ellipse at 80% 100%, color-mix(in srgb, var(--rt-border) 25%, transparent), transparent 45%),
          repeating-linear-gradient(
            105deg,
            transparent,
            transparent 3px,
            color-mix(in srgb, var(--rt-border) 12%, transparent) 3px,
            color-mix(in srgb, var(--rt-border) 12%, transparent) 4px
          )
        `,
      }}
    >
      <header
        className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 md:px-5"
        style={{
          borderColor: "var(--rt-border)",
          backgroundColor: "var(--rt-surface)",
        }}
      >
        <p
          className="text-sm font-semibold tracking-wide"
          style={{ fontFamily: "var(--rt-font-head)", color: "var(--rt-text)" }}
        >
          <span style={{ color: "var(--rt-accent)" }}>FMS</span> THINK TANK · Historical Round Table
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <SavedDebatesDrawer
            onRestore={handleRestoreSession}
            triggerClassName="border-[var(--rt-border)] text-[11px] text-[var(--rt-muted)]"
          />
          <ThemeSwitcher themeId={themeId} onThemeChange={setThemeId} />
        </div>
      </header>

      {apiError && (
        <div
          className="border-b px-4 py-2 text-xs md:px-5"
          style={{
            borderColor: "var(--rt-border)",
            backgroundColor: "var(--rt-surface)",
            color: "var(--rt-accent)",
          }}
          role="alert"
        >
          {apiError}
        </div>
      )}

      <div className="grid min-h-[min(720px,85vh)] grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_368px]">
        <aside
          className="flex flex-col border-b lg:border-b-0 lg:border-r"
          style={{
            borderColor: "var(--rt-border)",
            backgroundColor: "var(--rt-surface)",
          }}
        >
          <TopicSidebar
            activeTopicId={activeTopicId}
            appliedCustomTopic={customTopic}
            predefinedTopicDescriptions={predefinedTopicDescriptions}
            customTopicDescription={customTopicDescription}
            onPredefinedTopicDescriptionChange={handlePredefinedTopicDescriptionChange}
            onCustomTopicDescriptionChange={handleCustomTopicDescriptionChange}
            onSelectTopic={handleSelectTopic}
            onApplyCustomTopic={handleApplyCustomTopic}
            onClearCustomTopic={handleClearCustomTopic}
          />
        </aside>

        <div className="flex min-h-0 flex-1 flex-col">
          <>
              <div
                className="rt-controls-zone shrink-0 border-b px-3 py-2 md:px-4"
                style={{ borderColor: "var(--rt-border)" }}
              >
                <h2
                  className="text-base font-semibold leading-snug"
                  style={{ fontFamily: "var(--rt-font-head)" }}
                >
                  {displayTitle ?? "Select a topic to begin the debate"}
                </h2>
                {displayDescription && (
                  <p className="mt-0.5 text-[11px] text-[var(--rt-muted)]">{displayDescription}</p>
                )}
                <p className="mt-0.5 text-[10px] leading-snug text-[var(--rt-muted)]">
                  {displayTitle
                    ? "Launch the debate or interject with your own question"
                    : "Choose an agent topic from the left panel"}
                </p>
              </div>

              <ActiveParticipants
                variant="compact"
                figures={activeFigures}
                onRemove={toggleFigure}
                onViewProfile={setProfileFigure}
                onOpenKnowledge={setKnowledgeFigure}
              />

              <DebateStatusBar
                status={debateStatus}
                participantCount={activeFigures.length}
                exchangeCount={exchangeCount}
                durationSeconds={durationSeconds}
                consensusScore={displayConsensusScore}
                disagreementScore={displayDisagreementScore}
                strategicComplexityScore={strategicComplexityScore}
                consensusRefreshing={isIncrementalAnalyze}
                disagreementRefreshing={isIncrementalAnalyze}
                progressLabel={progressLabel}
                showLaunchButton={showLaunchButton}
                onLaunch={() => void startDebate()}
                launchDisabled={isLoading}
                isLaunchLoading={isDebateLoading || isAnalyzeLoading}
              />

              <RoundtableOnboarding />

              <div className="rt-transcript-stage">
                <DebateFeed
                  messages={messages}
                  previewMessages={showDebatePreview ? SAMPLE_DEBATE_MESSAGES : undefined}
                  typingFigure={typingFigure}
                />
              </div>

              {showCompleteActions && (
                <DebateCompleteActions
                  topicTitle={displayTitle ?? "Round Table Debate"}
                  topicFull={topicFull}
                  messages={messages}
                  analysis={analysis}
                  participantNames={participantNames}
                  turkishReport={turkishReport}
                  turkishSummaries={turkishSummaries}
                  onSaveDebate={handleSaveDebate}
                  disabled={isLoading}
                />
              )}

              {showRetentionBar && (
                <DebateRetentionBar
                  bookmarked={sessionBookmarked}
                  onBookmark={handleBookmark}
                  onAddNotes={() => setNotesModalOpen(true)}
                  onContinueLater={handleContinueLater}
                  disabled={isLoading}
                />
              )}
          </>

          {turkishMode === "turkish_only" && (
            <div
              className="border-b px-4 py-2 md:px-5"
              style={{ borderColor: "var(--rt-border)" }}
            >
              <p className="text-[11px] text-[var(--rt-muted)]">
                <span className="font-semibold text-[var(--rt-text)]">{displayTitle}</span>
                {" — "}
                Tartışma İngilizce yürütülür; analiz Gözlemci sekmesinde sunulur.
              </p>
            </div>
          )}

          <div
            className="rt-controls-zone flex shrink-0 flex-col gap-1.5 border-t p-2 sm:flex-row sm:items-end md:px-4"
            style={{ borderColor: "var(--rt-border)" }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Interject into the debate…"
              rows={2}
              disabled={isLoading || !topicFull}
              className={cn(
                "min-h-[40px] flex-1 resize-none border-[var(--rt-border)] bg-[var(--rt-surface)] text-[13px] text-[var(--rt-text)]",
                "placeholder:text-[var(--rt-muted)] focus-visible:ring-[var(--rt-accent)]",
              )}
              style={{ fontFamily: "var(--rt-font-body)" }}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => void sendMessage()}
              disabled={
                isLoading || !topicFull || activeFigureIds.length === 0 || !input.trim()
              }
              className="shrink-0 border border-[var(--rt-accent)] bg-transparent text-[var(--rt-accent)] hover:bg-[var(--rt-accent)] hover:text-[var(--rt-bg)]"
            >
              Send
            </Button>
          </div>
        </div>

        <RoundtableRightPanel
          activeTab={rightTab}
          onTabChange={setRightTab}
          reportsBadge={reportsBadge}
          onReportsTabViewed={() => setReportsBadge(false)}
          activeFigureIds={activeFigureIds}
          customFigures={customFigures}
          onCustomFiguresChange={setCustomFigures}
          onToggleFigure={toggleFigure}
          onCustomFigureDeleted={handleCustomFigureDeleted}
          turkishMode={turkishMode}
          onTurkishModeChange={setTurkishMode}
          turkishSummaries={turkishSummaries}
          turkishReport={turkishReport}
          isTurkishReportLoading={isTurkishReportLoading}
          turkishReportError={turkishReportError}
          onGenerateTurkishReport={handleGenerateTurkishReport}
          canGenerateTurkishReport={messages.length > 0 && !isDebateLoading}
          topicTitle={displayTitle ?? "Round Table Debate"}
          topicFull={topicFull}
          messages={messages}
          analysis={analysis}
          isAnalyzeLoading={isAnalyzeLoading}
          isIncrementalAnalyze={isIncrementalAnalyze}
          analysisIsPlaceholder={analysisIsPlaceholder}
          onGenerateAnalysis={handleGenerateAnalysis}
          canGenerateAnalysis={messages.length > 0 && !isDebateLoading}
          analyzeDisabledReason={analyzeDisabledReason}
          isDebateLoading={isDebateLoading}
          disabled={isLoading}
          participantNames={participantNames}
          sessionId={currentSessionId}
          showTurkishInReports={turkishMode === "bilingual"}
        />
      </div>

      <AddNotesModal
        open={notesModalOpen}
        onOpenChange={setNotesModalOpen}
        initialNotes={sessionNotes}
        onSave={handleSaveNotes}
      />

      <FigureProfilePanel
        open={profileFigure !== null}
        onOpenChange={(open) => {
          if (!open) setProfileFigure(null);
        }}
        figure={profileFigure}
        customFigures={customFigures}
      />

      <FigureKnowledgePanel
        open={knowledgeFigure !== null}
        onOpenChange={(open) => {
          if (!open) setKnowledgeFigure(null);
        }}
        figure={knowledgeFigure}
      />
    </div>
  );
}
