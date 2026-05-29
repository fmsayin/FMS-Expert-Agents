"""Dry-run checks that do not require an OpenAI API key."""

from __future__ import annotations

import os
import sys

# Ensure imports work without OPENAI_API_KEY
os.environ.pop("OPENAI_API_KEY", None)

from debate.agents import build_expert_agent, build_moderator_agent
from debate.config import DEFAULT_PERSONAS, DebateSettings
from debate.display import DebateEntry, DebateTranscript
from debate.orchestrator import DebateOrchestrator


def test_settings_validation() -> None:
    settings = DebateSettings(
        topic="Should AI be open source?",
        rounds=2,
        expert_keys=["economist", "ethicist"],
    )
    settings.validate()
    assert len(settings.experts) == 2


def test_agent_construction() -> None:
    settings = DebateSettings(topic="Test", expert_keys=list(DEFAULT_PERSONAS.keys()))
    moderator = build_moderator_agent(settings)
    experts = [build_expert_agent(p, settings) for p in settings.experts]
    assert moderator.name == "Moderator"
    assert len(experts) == 3


def test_transcript_formatting() -> None:
    transcript = DebateTranscript(topic="Test")
    transcript.add(
        DebateEntry(
            speaker="Dr. Elena Vasquez",
            role="Economist",
            content="Markets need clear incentives.",
            round_number=1,
        )
    )
    formatted = transcript.format_for_context()
    assert "Dr. Elena Vasquez" in formatted
    assert "Markets need clear incentives." in formatted


def test_orchestrator_prompt_building() -> None:
    settings = DebateSettings(
        topic="Climate policy",
        expert_keys=["economist", "ethicist"],
        stream=False,
    )
    orchestrator = DebateOrchestrator(settings=settings)
    prompt = orchestrator._build_expert_prompt(settings.experts[0], 1, 0)
    assert "Climate policy" in prompt
    assert "Dr. Elena Vasquez" in prompt


def main() -> int:
    tests = [
        test_settings_validation,
        test_agent_construction,
        test_transcript_formatting,
        test_orchestrator_prompt_building,
    ]
    for test in tests:
        test()
        print(f"PASS: {test.__name__}")
    print(f"\nAll {len(tests)} dry tests passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
