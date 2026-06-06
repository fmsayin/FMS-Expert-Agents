"use client";

import { useEffect, useState } from "react";
import {
  CUSTOM_ROUNDTABLE_TOPIC_ID,
  ROUNDTABLE_TOPICS,
} from "@/data/roundtable-topics";
import type { RoundTableCustomTopic } from "@/components/roundtable/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TITLE_MAX = 120;
const DESC_MAX = 500;

type Props = {
  activeTopicId: string;
  appliedCustomTopic: RoundTableCustomTopic | null;
  predefinedTopicDescriptions: Record<string, string>;
  customTopicDescription: string;
  onPredefinedTopicDescriptionChange: (topicId: string, description: string) => void;
  onCustomTopicDescriptionChange: (description: string) => void;
  onSelectTopic: (id: string) => void;
  onApplyCustomTopic: (topic: RoundTableCustomTopic) => void;
  onClearCustomTopic: () => void;
};

export function TopicSidebar({
  activeTopicId,
  appliedCustomTopic,
  predefinedTopicDescriptions,
  customTopicDescription,
  onPredefinedTopicDescriptionChange,
  onCustomTopicDescriptionChange,
  onSelectTopic,
  onApplyCustomTopic,
  onClearCustomTopic,
}: Props) {
  const [title, setTitle] = useState("");
  const isCustomActive = activeTopicId === CUSTOM_ROUNDTABLE_TOPIC_ID;

  useEffect(() => {
    if (appliedCustomTopic) {
      setTitle(appliedCustomTopic.title);
    }
  }, [appliedCustomTopic]);

  const handleApply = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onApplyCustomTopic({
      title: trimmedTitle.slice(0, TITLE_MAX),
      description: "",
    });
  };

  const handleClear = () => {
    setTitle("");
    onClearCustomTopic();
  };

  const showClearLink = Boolean(title || isCustomActive);
  const activePredefinedTopic = !isCustomActive
    ? ROUNDTABLE_TOPICS.find((t) => t.id === activeTopicId)
    : undefined;

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "border-b px-3 pb-3",
          isCustomActive && "border-l-2 border-l-[var(--rt-accent)] bg-[var(--rt-bg)]",
        )}
        style={{ borderColor: "var(--rt-border)" }}
      >
        <p
          className={cn(
            "px-0 py-2 text-[10px] font-semibold uppercase tracking-widest",
            isCustomActive ? "text-[var(--rt-accent)]" : "text-[var(--rt-muted)]",
          )}
          style={{ fontFamily: "var(--rt-font-head)" }}
        >
          Custom Topic
        </p>
        <div className="space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            placeholder="Topic title (required)"
            maxLength={TITLE_MAX}
            aria-label="Custom topic title"
            className={cn(
              "h-8 border-[var(--rt-border)] bg-[var(--rt-bg)] text-xs text-[var(--rt-text)]",
              "placeholder:text-[var(--rt-muted)] focus-visible:ring-[var(--rt-accent)]",
            )}
            style={{ fontFamily: "var(--rt-font-body)" }}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              disabled={!title.trim()}
              className="h-7 border border-[var(--rt-accent)] bg-transparent px-2.5 text-[11px] text-[var(--rt-accent)] hover:bg-[var(--rt-accent)] hover:text-[var(--rt-bg)]"
            >
              Use custom topic
            </Button>
            {showClearLink && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] text-[var(--rt-muted)] underline-offset-2 hover:text-[var(--rt-text)] hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <p
        className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--rt-muted)]"
        style={{ fontFamily: "var(--rt-font-head)" }}
      >
        Agent Topics
      </p>
      <nav aria-label="Debate topics" className="flex-1">
        <ul>
          {ROUNDTABLE_TOPICS.map((topic) => {
            const active = !isCustomActive && activeTopicId === topic.id;
            return (
              <li key={topic.id}>
                <button
                  type="button"
                  onClick={() => onSelectTopic(topic.id)}
                  className={cn(
                    "w-full border-l-2 px-3.5 py-1.5 text-left text-xs leading-snug transition-colors",
                    active
                      ? "border-[var(--rt-accent)] bg-[var(--rt-bg)] font-semibold text-[var(--rt-accent)]"
                      : "border-transparent text-[var(--rt-muted)] hover:bg-[var(--rt-bg)] hover:text-[var(--rt-text)]",
                  )}
                  style={{ fontFamily: "var(--rt-font-body)" }}
                >
                  {topic.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {(activePredefinedTopic || appliedCustomTopic) && (
        <div
          className="border-t px-3 py-3"
          style={{ borderColor: "var(--rt-border)" }}
        >
          <label
            htmlFor="topic-description"
            className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[var(--rt-muted)]"
            style={{ fontFamily: "var(--rt-font-head)" }}
          >
            Description (optional but recommended)
          </label>
          <Textarea
            id="topic-description"
            value={
              appliedCustomTopic
                ? customTopicDescription
                : (predefinedTopicDescriptions[activePredefinedTopic!.id] ?? "")
            }
            onChange={(e) => {
              const value = e.target.value.slice(0, DESC_MAX);
              if (appliedCustomTopic) {
                onCustomTopicDescriptionChange(value);
              } else if (activePredefinedTopic) {
                onPredefinedTopicDescriptionChange(activePredefinedTopic.id, value);
              }
            }}
            maxLength={DESC_MAX}
            rows={3}
            aria-label={
              appliedCustomTopic
                ? "Description for custom topic"
                : `Description for ${activePredefinedTopic!.label}`
            }
            className={cn(
              "min-h-[60px] resize-none border-[var(--rt-border)] bg-[var(--rt-bg)] text-xs text-[var(--rt-text)]",
              "placeholder:text-[var(--rt-muted)] focus-visible:ring-[var(--rt-accent)]",
            )}
            style={{ fontFamily: "var(--rt-font-body)" }}
          />
          <p className="mt-1 text-[10px] text-[var(--rt-muted)]">
            Add context, framing questions, or instructions for this debate…
          </p>
        </div>
      )}
    </div>
  );
}
