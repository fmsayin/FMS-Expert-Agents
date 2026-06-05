import type { RoundTableChatMessage } from "@/components/roundtable/types";

export function buildDebateUserPrompt(topicFull: string, messages: RoundTableChatMessage[]): string {
  if (messages.length === 0) {
    return `Open the debate on "${topicFull}" with your most important perspective. Be bold and direct.`;
  }
  const last = messages
    .slice(-2)
    .map((m) =>
      m.role === "user"
        ? `Moderator said: "${m.content}"`
        : `${m.figureName ?? "Figure"} said: "${m.content}"`,
    )
    .join("\n");
  return `Continue the round-table debate on "${topicFull}". Recent exchanges:\n${last}\n\nRespond to what was said, agree or disagree, build on or challenge the previous point.`;
}

export function buildInterjectionUserPrompt(
  topicFull: string,
  moderatorText: string,
  messages: RoundTableChatMessage[],
): string {
  const recentCtx = messages
    .slice(-4)
    .map((m) =>
      m.role === "user"
        ? `Moderator: "${m.content}"`
        : `${m.figureName ?? "Figure"}: "${m.content}"`,
    )
    .join("\n");
  return `The moderator just said: "${moderatorText}"\n\nRecent context:\n${recentCtx}\n\nRespond directly to the moderator's point in the context of the "${topicFull}" debate.`;
}
