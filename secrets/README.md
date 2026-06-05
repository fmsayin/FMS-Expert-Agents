# Local secrets

API keys for local development are **not** committed to git.

## OpenAI (Historical Round Table)

1. Copy `openai.env.example` to `openai.env` (or create `openai.env` with one line).
2. Set `OPENAI_API_KEY=sk-...` in `openai.env`.
3. Optionally set `OPENAI_MODEL=gpt-4o` in the same file or in your shell environment.

The Next.js app loads this file from server routes only when `OPENAI_API_KEY` is not already set in the environment.
