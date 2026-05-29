from __future__ import annotations

from agents import Agent

from debate.config import DebateSettings, ExpertPersona


EXPERT_DEBATE_RULES = """
You are participating in a structured expert debate.

Rules:
- Stay fully in character and speak in the first person.
- Directly engage with other experts: reference their claims, agree, challenge, or refine them.
- Do not repeat your opening points verbatim; advance the discussion each turn.
- Be concise: 2-4 short paragraphs, no bullet lists unless essential.
- Avoid meta commentary about being an AI.
""".strip()

MODERATOR_RULES = """
You are the debate moderator.

Rules:
- Remain neutral and clear.
- Highlight key tensions, agreements, and open questions.
- Do not take sides.
- Be concise: 2-3 short paragraphs.
""".strip()


def build_expert_agent(persona: ExpertPersona, settings: DebateSettings) -> Agent:
    return Agent(
        name=persona.name,
        instructions=f"{persona.instructions}\n\n{EXPERT_DEBATE_RULES}",
        model=settings.model,
    )


def build_moderator_agent(settings: DebateSettings) -> Agent:
    return Agent(
        name="Moderator",
        instructions=(
            "You are an impartial debate moderator facilitating a panel of domain experts. "
            "Your job is to introduce the topic, summarize each round, and deliver a final "
            "conclusion that synthesizes the strongest arguments on all sides.\n\n"
            f"{MODERATOR_RULES}"
        ),
        model=settings.model,
    )
