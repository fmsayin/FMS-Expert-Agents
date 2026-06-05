"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RoundTableChatMessage, TypingFigure } from "@/components/roundtable/types";
import { cn } from "@/lib/utils";
import { Gavel } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type Props = {
  messages: RoundTableChatMessage[];
  previewMessages?: RoundTableChatMessage[];
  typingFigure: TypingFigure | null;
};

function TypingDots() {
  return (
    <span className="inline-flex gap-0.5 align-middle" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1 w-1 animate-bounce rounded-full bg-[var(--rt-accent)]"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  );
}

function ModeratorMessage({ content }: { content: string }) {
  const text = content.replace(/^Moderator:\s*/i, "");

  return (
    <article
      className="rt-moderator-block animate-in fade-in slide-in-from-bottom-1 duration-300"
    >
      <Separator className="rt-moderator-rule" />
      <div className="rt-moderator-card">
        <span className="rt-moderator-accent" aria-hidden />
        <header className="rt-moderator-header">
          <span className="rt-moderator-icon" aria-hidden>
            <Gavel className="h-3.5 w-3.5" />
          </span>
          <p className="rt-moderator-label">Round Table Moderator</p>
        </header>
        <blockquote className="rt-moderator-body">{text}</blockquote>
      </div>
      <Separator className="rt-moderator-rule" />
    </article>
  );
}

function FigureMessage({ message }: { message: RoundTableChatMessage }) {
  return (
    <article
      className={cn(
        "rt-transcript-row flex gap-3.5 animate-in fade-in slide-in-from-bottom-1 duration-300",
      )}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--rt-border)] bg-[var(--rt-surface)] text-[11px] font-semibold text-[var(--rt-accent)]"
        style={{ fontFamily: "var(--rt-font-head)" }}
      >
        {message.initials}
      </div>
      <div className="min-w-0 flex-1">
        <header className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0">
          <p
            className="text-[14px] font-semibold text-[var(--rt-accent)]"
            style={{ fontFamily: "var(--rt-font-head)" }}
          >
            {message.figureName}
          </p>
          <span
            className="text-[11px] text-[var(--rt-muted)]"
            style={{ fontFamily: "var(--rt-font-body)" }}
          >
            {message.era}
          </span>
        </header>
        <blockquote
          className="border-l-2 border-[var(--rt-accent)]/40 py-0.5 pl-3.5 text-[15px] leading-relaxed text-[var(--rt-text)]"
          style={{ fontFamily: "var(--rt-font-body)" }}
        >
          &ldquo;{message.content}&rdquo;
        </blockquote>
        {message.citations && message.citations.length > 0 && (
          <footer className="mt-2 space-y-0.5 pl-3.5">
            {message.citations.map((cite, i) => (
              <p
                key={`${cite.sourceName}-${i}`}
                className="text-[10px] leading-snug text-[var(--rt-muted)]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                <span className="font-medium text-[var(--rt-text)]/70">{cite.sourceName}</span>
                {" — "}
                {cite.snippet}
              </p>
            ))}
          </footer>
        )}
      </div>
    </article>
  );
}

function MessageRow({ message }: { message: RoundTableChatMessage }) {
  if (message.role === "user") {
    return <ModeratorMessage content={message.content} />;
  }
  return <FigureMessage message={message} />;
}

export function DebateFeed({ messages, previewMessages = [], typingFigure }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const displayMessages = messages.length > 0 ? messages : previewMessages;
  const showingPreview = messages.length === 0 && previewMessages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, previewMessages, typingFigure]);

  return (
    <ScrollArea className="rt-transcript-panel min-h-0 flex-1">
      <div
        className="rt-debate-feed flex flex-col"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 27px,
            color-mix(in srgb, var(--rt-border) 35%, transparent) 28px
          )`,
        }}
      >
        {showingPreview && (
          <p
            className="rt-preview-label text-center font-semibold uppercase"
            style={{ fontFamily: "var(--rt-font-head)" }}
          >
            Sample transcript — launch debate for live responses
          </p>
        )}

        {displayMessages.length === 0 && !typingFigure && (
          <div className="rt-onboarding-empty py-6 text-center text-[var(--rt-muted)]">
            <h3
              className="mb-1.5 font-semibold text-[var(--rt-text)]"
              style={{ fontFamily: "var(--rt-font-head)" }}
            >
              The Round Table awaits
            </h3>
            <p
              className="mx-auto max-w-sm leading-relaxed"
              style={{ fontFamily: "var(--rt-font-body)" }}
            >
              Select a topic and figures, then launch a debate or interject with your question.
            </p>
          </div>
        )}

        {displayMessages.map((m, i) => (
          <MessageRow
            key={`${m.role}-${i}-${m.figureId ?? "user"}-${showingPreview ? "preview" : "live"}`}
            message={m}
          />
        ))}

        {typingFigure && (
          <article className="rt-transcript-row flex gap-3.5">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--rt-border)] bg-[var(--rt-surface)] text-[11px] font-semibold text-[var(--rt-accent)]"
              style={{ fontFamily: "var(--rt-font-head)" }}
            >
              {typingFigure.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="mb-1.5 text-[14px] font-semibold text-[var(--rt-accent)]"
                style={{ fontFamily: "var(--rt-font-head)" }}
              >
                {typingFigure.name}
              </p>
              <p className="text-[15px] text-[var(--rt-text)]">
                <TypingDots />
              </p>
            </div>
          </article>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
