from __future__ import annotations

import asyncio
from typing import Callable

from agents import Agent, Runner
from openai.types.responses import ResponseTextDeltaEvent

from debate.agents import build_expert_agent, build_moderator_agent
from debate.config import DebateSettings, ExpertPersona
from debate.display import DebateEntry, DebateTranscript, print_entry


class DebateOrchestrator:
    """Code-orchestrated multi-round debate using OpenAI Agents SDK."""

    def __init__(
        self,
        settings: DebateSettings,
        on_entry: Callable[[DebateEntry], None] | None = None,
        on_token: Callable[[str], None] | None = None,
        on_turn_start: Callable[[DebateEntry], None] | None = None,
    ) -> None:
        settings.validate()
        self.settings = settings
        self.on_entry = on_entry
        self.on_token = on_token
        self.on_turn_start = on_turn_start
        self.moderator = build_moderator_agent(settings)
        self.experts = [build_expert_agent(persona, settings) for persona in settings.experts]
        self.transcript = DebateTranscript(topic=settings.topic)

    async def run(self) -> DebateTranscript:
        await self._run_introduction()
        for round_number in range(1, self.settings.rounds + 1):
            await self._run_debate_round(round_number)
            await self._run_round_summary(round_number)
        await self._run_conclusion()
        return self.transcript

    def run_sync(self) -> DebateTranscript:
        return asyncio.run(self.run())

    async def _run_introduction(self) -> None:
        expert_list = ", ".join(f"{p.name} ({p.role})" for p in self.settings.experts)
        prompt = (
            f"Introduce a debate on the topic: \"{self.settings.topic}\".\n"
            f"The panelists are: {expert_list}.\n"
            f"There will be {self.settings.rounds} round(s) of discussion.\n"
            "Set expectations for a constructive, evidence-informed exchange."
        )
        content = await self._invoke_agent(self.moderator, prompt)
        self._record(
            DebateEntry(
                speaker="Moderator",
                role="Moderator",
                content=content,
                phase="introduction",
            )
        )

    async def _run_debate_round(self, round_number: int) -> None:
        for index, (persona, agent) in enumerate(zip(self.settings.experts, self.experts)):
            pending = DebateEntry(
                speaker=persona.name,
                role=persona.role,
                content="",
                round_number=round_number,
                phase="debate",
            )
            if self.on_turn_start:
                self.on_turn_start(pending)
            elif self.settings.stream:
                print_entry(pending)
            prompt = self._build_expert_prompt(persona, round_number, index)
            content = await self._invoke_agent(agent, prompt)
            pending = DebateEntry(
                speaker=persona.name,
                role=persona.role,
                content=content,
                round_number=round_number,
                phase="debate",
            )
            self._record(pending)

    async def _run_round_summary(self, round_number: int) -> None:
        prompt = (
            f"Summarize Round {round_number} of the debate on \"{self.settings.topic}\".\n"
            "Identify the strongest arguments, key disagreements, and any emerging consensus.\n\n"
            f"Transcript so far:\n{self.transcript.format_for_context()}"
        )
        content = await self._invoke_agent(self.moderator, prompt)
        self._record(
            DebateEntry(
                speaker="Moderator",
                role="Moderator",
                content=content,
                round_number=round_number,
                phase="round_summary",
            )
        )

    async def _run_conclusion(self) -> None:
        prompt = (
            f"Deliver a final conclusion for the debate on \"{self.settings.topic}\".\n"
            "Synthesize the panel's arguments, note unresolved tensions, and offer balanced "
            "takeaways for the audience.\n\n"
            f"Full transcript:\n{self.transcript.format_for_context()}"
        )
        content = await self._invoke_agent(self.moderator, prompt)
        self._record(
            DebateEntry(
                speaker="Moderator",
                role="Moderator",
                content=content,
                phase="conclusion",
            )
        )

    def _build_expert_prompt(
        self, persona: ExpertPersona, round_number: int, speaker_index: int
    ) -> str:
        other_experts = [
            f"{p.name} ({p.role})"
            for i, p in enumerate(self.settings.experts)
            if i != speaker_index
        ]
        position_hint = (
            "Open the discussion with your perspective on the topic."
            if round_number == 1 and not self.transcript.entries
            else "Respond directly to the other experts' latest points."
        )
        return (
            f"Debate topic: \"{self.settings.topic}\"\n"
            f"Current round: {round_number} of {self.settings.rounds}\n"
            f"You are {persona.name}, the {persona.role}.\n"
            f"Other panelists: {', '.join(other_experts)}.\n\n"
            f"{position_hint}\n\n"
            f"Transcript so far:\n{self.transcript.format_for_context()}"
        )

    async def _invoke_agent(self, agent: Agent, prompt: str) -> str:
        if self.settings.stream:
            return await self._invoke_agent_streamed(agent, prompt)
        result = await Runner.run(agent, prompt, max_turns=3)
        return str(result.final_output)

    async def _invoke_agent_streamed(self, agent: Agent, prompt: str) -> str:
        result = Runner.run_streamed(agent, prompt, max_turns=3)
        chunks: list[str] = []
        async for event in result.stream_events():
            if event.type != "raw_response_event":
                continue
            if not isinstance(event.data, ResponseTextDeltaEvent):
                continue
            delta = event.data.delta or ""
            if not delta:
                continue
            chunks.append(delta)
            if self.on_token:
                self.on_token(delta)
            else:
                print(delta, end="", flush=True)
        if not self.on_token:
            print()
        return "".join(chunks).strip() or str(result.final_output)

    def _record(self, entry: DebateEntry) -> None:
        self.transcript.add(entry)
        if self.on_entry:
            self.on_entry(entry)
        elif not (self.settings.stream and entry.phase == "debate"):
            print_entry(entry)
