"""Streamlit web UI for the expert debate platform."""

from __future__ import annotations

import os

import streamlit as st
from dotenv import load_dotenv

from debate.config import DEFAULT_PERSONAS, DebateSettings
from debate.orchestrator import DebateOrchestrator

load_dotenv()

st.set_page_config(page_title="Expert Debate Platform", page_icon="⚖️", layout="wide")
st.title("Expert Debate Platform")
st.caption("Multi-agent debates powered by the OpenAI Agents SDK")

if not os.getenv("OPENAI_API_KEY"):
    st.error("Set `OPENAI_API_KEY` in your environment or a `.env` file before running debates.")
    st.stop()

with st.sidebar:
    st.header("Configuration")
    topic = st.text_area(
        "Debate topic",
        value="Should governments regulate advanced AI systems?",
        height=100,
    )
    rounds = st.slider("Number of rounds", min_value=1, max_value=5, value=2)
    selected = st.multiselect(
        "Expert panel",
        options=list(DEFAULT_PERSONAS.keys()),
        default=list(DEFAULT_PERSONAS.keys()),
        format_func=lambda key: f"{DEFAULT_PERSONAS[key].name} ({DEFAULT_PERSONAS[key].role})",
    )
    model = st.text_input("Model", value=os.getenv("DEBATE_MODEL", "gpt-4o-mini"))
    stream = st.checkbox("Stream responses", value=True)
    start = st.button("Start debate", type="primary", use_container_width=True)

if "transcript" not in st.session_state:
    st.session_state.transcript = []

debate_container = st.container()

if start:
    if len(selected) < 2:
        st.warning("Select at least two experts.")
    elif not topic.strip():
        st.warning("Enter a debate topic.")
    else:
        st.session_state.transcript = []
        settings = DebateSettings(
            topic=topic.strip(),
            rounds=rounds,
            expert_keys=selected,
            model=model.strip() or "gpt-4o-mini",
            stream=stream,
        )

        with debate_container:
            st.subheader(f"Topic: {settings.topic}")
            status = st.empty()
            live = st.empty()
            history = st.container()

            buffer = {"text": ""}

            def on_token(token: str) -> None:
                buffer["text"] += token
                live.markdown(buffer["text"])

            def on_turn_start(entry) -> None:
                buffer["text"] = ""
                label = entry.speaker
                if entry.role:
                    label += f" ({entry.role})"
                if entry.round_number is not None:
                    label += f" — Round {entry.round_number}"
                status.info(f"Speaking: {label}")

            def on_entry(entry) -> None:
                buffer["text"] = ""
                live.empty()
                with history:
                    label = f"**{entry.speaker}**"
                    if entry.role:
                        label += f" _({entry.role})_"
                    if entry.round_number is not None:
                        label += f" — Round {entry.round_number}"
                    st.markdown(label)
                    st.write(entry.content)
                    st.divider()
                status.info(f"Latest: {entry.speaker}")

            orchestrator = DebateOrchestrator(
                settings=settings,
                on_entry=on_entry,
                on_token=on_token if stream else None,
                on_turn_start=on_turn_start if stream else None,
            )

            with st.spinner("Running debate..."):
                try:
                    transcript = orchestrator.run_sync()
                    st.session_state.transcript = transcript.entries
                    status.success("Debate complete.")
                except Exception as exc:
                    status.error(f"Debate failed: {exc}")

if st.session_state.transcript:
    with st.expander("Export transcript"):
        lines = []
        for entry in st.session_state.transcript:
            header = entry.speaker
            if entry.role:
                header += f" ({entry.role})"
            if entry.round_number is not None:
                header += f" — Round {entry.round_number}"
            lines.append(f"{header}\n{entry.content}\n")
        st.download_button(
            "Download as text",
            data="\n".join(lines),
            file_name="debate_transcript.txt",
            mime="text/plain",
        )
