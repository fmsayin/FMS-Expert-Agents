from __future__ import annotations

import os
from dataclasses import dataclass, field


@dataclass(frozen=True)
class ExpertPersona:
    key: str
    name: str
    role: str
    instructions: str


DEFAULT_PERSONAS: dict[str, ExpertPersona] = {
    "economist": ExpertPersona(
        key="economist",
        name="Dr. Elena Vasquez",
        role="Economist",
        instructions=(
            "You are Dr. Elena Vasquez, a macroeconomist focused on markets, incentives, "
            "and policy trade-offs. Ground arguments in economic reasoning: costs, benefits, "
            "externalities, and unintended consequences. Be direct and analytical."
        ),
    ),
    "ethicist": ExpertPersona(
        key="ethicist",
        name="Prof. James Okonkwo",
        role="Ethicist",
        instructions=(
            "You are Prof. James Okonkwo, a moral philosopher specializing in applied ethics. "
            "Evaluate fairness, rights, duties, and long-term societal impact. Challenge "
            "purely utilitarian shortcuts when they ignore human dignity."
        ),
    ),
    "technologist": ExpertPersona(
        key="technologist",
        name="Dr. Mei Lin",
        role="Technologist",
        instructions=(
            "You are Dr. Mei Lin, a technology strategist and engineer. Focus on feasibility, "
            "implementation timelines, technical risks, and innovation dynamics. Push back when "
            "debates ignore what is actually buildable or measurable."
        ),
    ),
}


@dataclass
class DebateSettings:
    topic: str
    rounds: int = 2
    expert_keys: list[str] = field(default_factory=lambda: list(DEFAULT_PERSONAS.keys()))
    model: str = field(default_factory=lambda: os.getenv("DEBATE_MODEL", "gpt-4o-mini"))
    stream: bool = True

    def validate(self) -> None:
        if not self.topic.strip():
            raise ValueError("Debate topic cannot be empty.")
        if self.rounds < 1:
            raise ValueError("Number of rounds must be at least 1.")
        if len(self.expert_keys) < 2:
            raise ValueError("Select at least two expert personas.")
        unknown = [key for key in self.expert_keys if key not in DEFAULT_PERSONAS]
        if unknown:
            raise ValueError(f"Unknown expert persona(s): {', '.join(unknown)}")

    @property
    def experts(self) -> list[ExpertPersona]:
        return [DEFAULT_PERSONAS[key] for key in self.expert_keys]
