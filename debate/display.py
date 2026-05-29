from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable


@dataclass
class DebateEntry:
    speaker: str
    role: str
    content: str
    round_number: int | None = None
    phase: str = "debate"


@dataclass
class DebateTranscript:
    topic: str
    entries: list[DebateEntry] = field(default_factory=list)

    def add(self, entry: DebateEntry) -> None:
        self.entries.append(entry)

    def format_for_context(self) -> str:
        if not self.entries:
            return "(No statements yet.)"
        lines: list[str] = []
        for entry in self.entries:
            header = f"{entry.speaker} ({entry.role})"
            if entry.round_number is not None:
                header += f" — Round {entry.round_number}"
            lines.append(f"{header}:\n{entry.content}")
        return "\n\n".join(lines)


def print_banner(topic: str, experts: list[str], rounds: int) -> None:
    print("\n" + "=" * 72)
    print("EXPERT DEBATE PLATFORM")
    print("=" * 72)
    print(f"Topic : {topic}")
    print(f"Experts: {', '.join(experts)}")
    print(f"Rounds: {rounds}")
    print("=" * 72 + "\n")


def print_entry(entry: DebateEntry) -> None:
    label = entry.speaker
    if entry.role:
        label += f" ({entry.role})"
    if entry.round_number is not None:
        label += f" — Round {entry.round_number}"
    print(f"\n--- {label} ---\n")
    print(entry.content)
    print()


def make_stream_printer(on_token: Callable[[str], None] | None = None) -> Callable[[str], None]:
    def emit(text: str) -> None:
        print(text, end="", flush=True)
        if on_token:
            on_token(text)

    return emit
