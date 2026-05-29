"""CLI entry point for the expert debate platform."""

from __future__ import annotations

import argparse
import os
import sys

from dotenv import load_dotenv

from debate.config import DEFAULT_PERSONAS, DebateSettings
from debate.display import print_banner, print_entry
from debate.orchestrator import DebateOrchestrator


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run a multi-agent expert debate using the OpenAI Agents SDK."
    )
    parser.add_argument(
        "--topic",
        "-t",
        required=True,
        help="Debate topic or question.",
    )
    parser.add_argument(
        "--rounds",
        "-r",
        type=int,
        default=2,
        help="Number of debate rounds (default: 2).",
    )
    parser.add_argument(
        "--experts",
        "-e",
        default=",".join(DEFAULT_PERSONAS.keys()),
        help=(
            "Comma-separated expert keys. "
            f"Available: {', '.join(DEFAULT_PERSONAS.keys())}"
        ),
    )
    parser.add_argument(
        "--no-stream",
        action="store_true",
        help="Disable token streaming; print each turn after completion.",
    )
    parser.add_argument(
        "--model",
        default=os.getenv("DEBATE_MODEL", "gpt-4o-mini"),
        help="OpenAI model for all agents (default: gpt-4o-mini).",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    load_dotenv()
    args = parse_args(argv)

    if not os.getenv("OPENAI_API_KEY"):
        print(
            "Error: OPENAI_API_KEY is not set. Copy .env.example to .env and add your key.",
            file=sys.stderr,
        )
        return 1

    expert_keys = [key.strip() for key in args.experts.split(",") if key.strip()]
    settings = DebateSettings(
        topic=args.topic,
        rounds=args.rounds,
        expert_keys=expert_keys,
        model=args.model,
        stream=not args.no_stream,
    )

    try:
        settings.validate()
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    print_banner(
        topic=settings.topic,
        experts=[f"{p.name} ({p.role})" for p in settings.experts],
        rounds=settings.rounds,
    )

    orchestrator = DebateOrchestrator(settings=settings)

    def on_entry(entry) -> None:
        if settings.stream and entry.phase == "debate":
            print()
            return
        print_entry(entry)

    if settings.stream:
        orchestrator.on_entry = on_entry

    try:
        orchestrator.run_sync()
    except Exception as exc:
        print(f"\nDebate failed: {exc}", file=sys.stderr)
        return 1

    print("\n" + "=" * 72)
    print("DEBATE COMPLETE")
    print("=" * 72 + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
