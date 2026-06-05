# Historical Round Table — Feature Report

**URL:** [http://localhost:3000/roundtable](http://localhost:3000/roundtable)  
**Date:** June 2026  
**App route:** `apps/web/app/(dashboard)/roundtable/page.tsx` → `RoundTableClient`

---

## 1. Overview

The **Historical Round Table** is an FMS Think Tank workspace where users assemble historical (or custom) figures, choose a policy topic, and run an AI-mediated round-table debate. The debate runs in English; an optional **Turkish Intelligence Layer** provides per-turn summaries and a Turkish executive report. After exchanges complete, the system synthesizes **Think Tank outputs** (consensus, disagreements, risks, recommendations, executive summary) and supports export, browser-local session persistence, and integration hooks to Knowledge Base and Projects.

Core orchestration lives in `RoundTableClient`; data definitions in `apps/web/src/data/historical-figures.ts` and `apps/web/src/data/roundtable-topics.ts`.

---

## 2. Layout & navigation

### Three-column grid

On large screens (`lg:` breakpoint), the UI uses a **3-column layout**:

| Column | Width | Content |
|--------|-------|---------|
| Left | `220px` | `TopicSidebar` — custom topic, 9 agent topics, optional description |
| Center | `minmax(0, 1fr)` | Debate transcript, status bar, launch/interject controls, completion actions |
| Right | `368px` | `RoundtableRightPanel` — tabbed participants / observer / reports |

Below `lg`, columns stack vertically (topic → debate → right panel).

### Header

- Title: **FMS THINK TANK · Historical Round Table**
- **Saved Debates** (`SavedDebatesDrawer`) — restore/delete browser-local sessions
- **Theme switcher** (`ThemeSwitcher`) — four visual themes

### Right panel tabs

`RoundtableRightTab`: **`participants`** | **`observer`** | **`reports`**

- **Participants** — `FigureSelector` (panel variant), custom figure CRUD
- **Observer** — `TurkishAnalysisPanel`, `TurkishModeToggle`, Turkish exports
- **Reports** — `ThinkTankOutputs`, `ResearchOutputActions`; badge when new analysis is ready

When Turkish view mode is **Turkish Only**, the right tab auto-switches to **Observer** (debate still runs in English; analysis is shown in Turkish).

### Themes

Four themes in `themes.ts` (`RoundTableThemeId`):

| ID | Label |
|----|-------|
| `scholarly` | Serious & Scholarly |
| `dark` | Modern & Sleek |
| `editorial` | Historical & Editorial (default in client state) |
| `futuristic` | Bold & Futuristic |

Themes apply CSS variables (`--rt-bg`, `--rt-surface`, `--rt-border`, `--rt-text`, `--rt-muted`, `--rt-accent`, fonts) on `document.documentElement` while the round table is mounted.

### Saved Debates

`SavedDebatesDrawer` lists sessions from `fms-roundtable-sessions` localStorage. Each entry shows topic, participants, message count, duration, bookmark state. Actions: **restore** workspace, **delete** session. Empty state directs users to save after a debate.

---

## 3. Topics

### Nine predefined agent topics

Defined in `ROUNDTABLE_TOPICS` (`roundtable-topics.ts`):

1. Peace & Diplomacy  
2. Conflict Resolution  
3. Artificial Intelligence Policy  
4. International Relations  
5. Humanitarian Policy  
6. Strategic & Security Studies  
7. Technology & Future Policy  
8. Economy & Development  
9. Civilization & Society  

Default selection: **Peace & Diplomacy** (`peace-diplomacy`).

### Custom topic

- **Custom Topic** block at top of left sidebar (`TopicSidebar`)
- Title required (max **120** characters); **Use custom topic** applies it
- Custom topic ID: `custom` (`CUSTOM_ROUNDTABLE_TOPIC_ID`)
- Switching predefined/custom topic **resets** the active debate state

### Optional description

For both predefined and custom topics:

- Textarea: **Description (optional but recommended)** (max **500** characters)
- Predefined: appended as `Additional context:` in `buildPredefinedTopicFull`
- Custom: appended after title in `buildCustomTopicFull`
- Description is sent to APIs as `topicDescription` or `customTopic.description`

---

## 4. Figures

### 39 built-in historical figures

Source: `HISTORICAL_FIGURES` in `historical-figures.ts`. Each record includes `id`, `name`, `initials`, `era`, `role`, `expertiseTags` (2–4 tags), and `style` (persona prompt). Authoritative id/name list lives in that file; `BUILT_IN_FIGURE_IDS` in `figure-rag/profiles.ts` stays in sync automatically.

Notable ids (full roster): napoleon, churchill, ataturk, gandhi, roosevelt, mandela, bismarck, caesar, alexander-the-great, genghis-khan, washington, fatih, suleiman-the-magnificent, ibn-khaldun, said-nursi, gulen, rumi, salahuddin, annan, mlk, tutu, carter, al-farabi, al-ghazali, ibn-rushd, akbar, confucius, sun-tzu, tolstoy, gorbachev, fms, ilber-ortayli, henry-kissinger, socrates, plato, aristotle, isaac-newton, albert-einstein, barack-obama.

**Default active participants:** Napoleon, Churchill, Gandhi (`DEFAULT_ACTIVE_FIGURE_IDS`).

At least one figure must remain selected (deselect is blocked when only one remains).

### Custom figures

- Stored in browser: `fms-roundtable-custom-figures`
- Storage ID format: `custom-{uuid}`
- Form fields (`CustomFigureForm`): full name, active years, title/role, short description, biography, expertise, leadership style, ideology, debate style, achievements, historical context, notable quotes, optional profile image URL (data URL or remote, max 500k chars)
- Create / edit / delete with confirmation; delete removes figure from active set (falls back to defaults if none left)

### Enrich API

`POST /api/roundtable/enrich-figure`

- Input: name plus optional hints (`activeYears`, `titleRole`, `shortDescription`)
- Uses OpenAI to return structured JSON matching `CustomFigureEnrichment`
- Populates the custom figure form before save

### Profile panel

`FigureProfilePanel` (dialog):

- Opened from figure card **Info** control or `ActiveParticipants` **View profile**
- Built-in figures: name, era, role, expertise tags, `style` text
- Custom figures: full profile sections (biography, expertise, leadership, ideology, debate style, achievements, context, quotes, optional image)

### Card hierarchy (`FigureSelector` / `FigureCard`)

Visual stack (top → bottom):

1. **Portrait** — initials on gradient (`figure-portrait.ts`), size `md` in panel
2. **Name + era** — headline group
3. **Role** — title/expertise line
4. **Expertise tags** — small tag chips
5. **Actions** (custom only: edit/delete) + **profile** (info) and **knowledge** (book) buttons (top-right)

Compact variant: `ActiveParticipants` in center column (removable chips, view profile, open knowledge). Panel variant: scrollable list in right **Participants** tab.

### Per-figure knowledge (RAG)

`FigureKnowledgePanel` — opened from the figure card **book** icon or active participant bar:

- **Index text** — paste notes; stored as chunked embeddings per `figureId`
- **Upload** — PDF, `.txt`, or `.md` (max 8 MB; PDF via `pdf-parse`)
- **Delete** — remove a source and its chunks
- **URL import** — not implemented (UI notes “planned for a later release”)

Storage: `.data/figure-rag/store.json` (gitignored). Requires OpenAI key for embeddings (`text-embedding-3-small`). See **`docs/roundtable/RAG.md`** for API paths and retrieval behavior.

During debate, `POST /api/roundtable/chat` retrieves top chunks (cosine similarity), injects a **Retrieved knowledge** block into the system prompt, and may return `citations` shown under each reply in `DebateFeed`. With no indexed chunks, the figure uses the built-in `style` profile only (unchanged behavior).

Custom figures (`custom-*` ids) use the same APIs keyed by id.

---

## 5. Debate flow

### Launch

1. Select topic (+ optional description)
2. Select one or more figures (defaults or custom)
3. **Launch Debate** on `DebateStatusBar`

`startDebate()` clears prior analysis, runs `runFigureSequence` over `activeFigureIds` in order with `mode: "debate"`, **400 ms** delay between speakers, then **`autoAnalyze: true`** (final think-tank analysis).

### Interject (moderator)

- Center textarea: **Interject into the debate…**
- **Send** (or Enter without Shift) prepends a **user** message and re-runs all active figures with `mode: "interjection"` and `moderatorText`
- User content is framed as moderator input in prompts (`roundtable-prompts.ts`)

### Moderator & API chat

`POST /api/roundtable/chat` — per-figure replies using `buildFigureSystemPrompt` (built-in) or custom payload; topic from `topicId` + description or `customTopic`. Optional figure RAG: `retrieveFigureContext` appends retrieved passages and returns `citations` when chunks exist for that figure.

### Sample transcript (preview)

Before launch, when status is **waiting**, no messages, and topic is set:

- `DebateFeed` shows `SAMPLE_DEBATE_MESSAGES` (Churchill, Gandhi, Napoleon on AI/peace diplomacy + moderator line)
- Static preview only; not persisted until live debate runs

### Onboarding

`RoundtableOnboarding` — dismissible 4-step guide:

1. Select participants  
2. Enter a topic  
3. Launch debate  
4. Review the report  

Dismissal stored in `fms-roundtable-onboarding-dismissed`.

### Incremental analysis during debate

After assistant messages, incremental analyze may run (debounced **3 s**, every 1st message and every 2nd exchange) via `POST /api/roundtable/analyze` to update consensus/disagreement scores before final synthesis.

### Completion

When final analysis succeeds: status **complete**, `DebateCompleteActions` (exports + save), `DebateRetentionBar` (bookmark, notes, continue later). Turkish executive report auto-runs if Turkish layer is active.

---

## 6. Status & metrics

### Debate status (`DebateStatus`)

| Status | Label | Meaning |
|--------|-------|---------|
| `idle` | Ready | No topic/participants ready |
| `waiting` | Ready to launch | Topic + figures set, no messages |
| `in_progress` | Debate in progress | Messages and/or loading |
| `consensus_building` | Building consensus | Final or incremental analyze loading |
| `complete` | Analysis complete | Final `ThinkTankAnalysis` present |

Progress strip: waiting → in progress → consensus building → complete.

### Live metrics (`DebateStatusBar`)

- **Participants** count  
- **Exchanges** (assistant messages)  
- **Duration** `M:SS` (timer starts on first debate/interject run)  
- **Consensus %** — from analysis or interim heuristic until API returns  
- **Disagreement %** — same  
- **Strategic Depth %** — derived from participants × exchanges (capped 0–100)

Interim scores use `computeInterimDebateScores` when live analysis is not yet available.

---

## 7. Turkish Intelligence Layer

### View modes (`TurkishViewMode`)

Persisted in `fms-roundtable-turkish-mode`:

| Mode | UI label | Behavior |
|------|----------|----------|
| `english_only` | EN | No Turkish API calls; English-only UI |
| `bilingual` | EN+TR | English debate + Turkish observer/reports samples or live |
| `turkish_only` | TR | Forces Observer tab; banner notes debate is English, analysis in Turkish |

### Per-turn summaries

`POST /api/roundtable/turkish-summary` after each successful figure reply (when layer active):

- Structured fields: `anaArguman`, `stratejikCikarim`, `politikaIliskisi`
- Shown in **Observer** tab with timestamps
- Sample observer content when no live summaries (`sample-turkish-observer.ts`)

### Turkish executive report

`POST /api/roundtable/turkish-report` — five sections:

- Yönetici Özeti (`yoneticiOzeti`)  
- Konsensüs (`konsensus`)  
- Anlaşmazlıklar (`anlasmazliklar`)  
- Riskler (`riskler`)  
- Öneriler (`oneriler`)  

Triggered automatically after final English analysis (if layer active), or manually via **Generate** in Observer.

### Turkish export

`TurkishExport` — Markdown, research brief, policy memo, print/PDF (via `turkish-roundtable-export.ts`) when a live report exists.

Bilingual **Reports** tab can show Turkish sample blocks (`SAMPLE_TURKISH_EXECUTIVE_REPORT`) alongside English sample analysis until live data exists.

---

## 8. Think Tank outputs

Five sections (`THINK_TANK_REPORT_SECTIONS` / `ThinkTankAnalysis`):

1. **Executive Summary** (`executiveSummary`)  
2. **Consensus** (`consensus`)  
3. **Disagreements** (`disagreements`)  
4. **Risks** (`risks`)  
5. **Recommendations** (`recommendations`)  

Optional scores: `consensusScore`, `disagreementScore` (0–100).

### Placeholders

Until live analysis exists, `ThinkTankOutputs` displays **`SAMPLE_THINK_TANK_ANALYSIS`** with **Sample** badge (`sample-analysis.ts`). Same pattern for Turkish samples in bilingual mode.

**Generate** button on Reports runs `POST /api/roundtable/analyze` when messages exist and debate is not loading.

On `MISSING_API_KEY`, sample analysis is shown with `analysisIsPlaceholder: true` and an API error banner.

---

## 9. Save & export

### Save debate (local)

- **Save Debate** / **Continue Later** / bookmark / notes → `saveDebateSession` (`fms-roundtable-sessions`)
- Session payload: topic, `topicFull`, participants, messages, English analysis, Turkish report & summaries, notes, bookmark, duration, `themeId`, `topicId`
- **Add Notes** modal (`AddNotesModal`) for session annotations

### English exports

| Output | Source | Requires analysis |
|--------|--------|-------------------|
| Markdown transcript + analysis | `buildDebateMarkdown` | Analysis optional in MD |
| Research Brief | `buildResearchBriefMarkdown` | Yes |
| Policy Memo | `buildPolicyMemoMarkdown` | Yes |
| Executive Summary | `buildExecutiveSummaryMarkdown` | Yes |
| PDF / print | `openPrintView` + `markdownToPrintHtml` | No (transcript always) |

Available in `DebateCompleteActions`, `DebateExport`, and **Reports** → `ResearchOutputActions`.

### Knowledge Base & projects

- **Knowledge Base** — `addKnowledgeBaseEntry` → `fms-knowledge-base` (types: debate, brief, memo, summary); link to `/knowledge` marked **(stub)** in UI  
- **Add to Project** — `AddToProjectModal` → `fms-projects` (requires saved `sessionId`)

### Turkish exports

Observer tab: Turkish markdown, brief, memo, print when `turkishReport` is present.

---

## 10. API requirements

All round-table AI routes use **`getOpenAIApiKey()`** and **`getOpenAIModel()`** from `apps/web/src/lib/load-secrets.ts` (server-only).

### Key resolution order

1. Environment variable **`OPENAI_API_KEY`**  
2. Repo file **`secrets/openai.env`** (relative to app cwd: `../../secrets/openai.env`)  
   - Copy from `secrets/openai.env.example`  
   - Format: `OPENAI_API_KEY=...` (optional `# OPENAI_MODEL=gpt-4o`)

### Model

Default model: **`gpt-4o`** unless `OPENAI_MODEL` is set.

### API routes

| Route | Purpose |
|-------|---------|
| `POST /api/roundtable/chat` | Figure debate / interjection replies |
| `POST /api/roundtable/analyze` | Think tank synthesis (5 sections + scores) |
| `POST /api/roundtable/enrich-figure` | Custom figure AI enrichment |
| `POST /api/roundtable/turkish-summary` | Per-turn Turkish summary |
| `POST /api/roundtable/turkish-report` | Turkish executive report |

Missing key responses use error code **`MISSING_API_KEY`**; client falls back to sample content where implemented and surfaces the error in the header alert.

**Do not commit** `secrets/openai.env` or real API keys to the repository.

---

## 11. localStorage keys

| Key | Module | Contents |
|-----|--------|----------|
| `fms-roundtable-sessions` | `debate-sessions-storage.ts` | Saved debate sessions (transcript, analysis, Turkish data, notes, bookmark) |
| `fms-roundtable-custom-figures` | `custom-figures-storage.ts` | User-created figures |
| `fms-roundtable-turkish-mode` | `TurkishModeToggle.tsx` | `english_only` \| `bilingual` \| `turkish_only` |
| `fms-roundtable-onboarding-dismissed` | `RoundtableOnboarding.tsx` | `"1"` when guide dismissed |
| `fms-knowledge-base` | `knowledge-base-storage.ts` | Entries saved from round table exports |
| `fms-projects` | `projects-storage.ts` | User projects and linked session IDs |

All are **browser-local** only; no server sync.

---

## 12. Known limitations / stubs

- **No authentication** — sessions and custom figures are per-browser, per-device.  
- **OpenAI dependency** — without a valid key, debate turns error or stop; analysis/Turkish fall back to **sample placeholders**.  
- **Sequential debate only** — figures speak one at a time in list order; no parallel agents or user-selected “next speaker.”  
- **Interjection re-runs all active figures** — not a single targeted reply.  
- **Knowledge Base** — storage works locally; `/knowledge` integration labeled **(stub)** in `ResearchOutputActions`.  
- **Projects** — local `fms-projects` only; no backend project workspace.  
- **Theme preference** — not persisted across reloads (resets to `editorial` in component state).  
- **Sample content** — pre-debate transcript, think-tank sections, and Turkish observer samples are editorial previews, not AI-generated.  
- **PDF export** — browser print dialog, not a server-generated PDF file.  
- **Custom figure images** — large data URLs stored in localStorage may hit browser quota.  
- **Topic change** — switching topic clears in-progress debate (by design).  
- **Rate/cost controls** — no token budgeting or turn limits beyond field max lengths.

---

## Key source files

| Area | Path |
|------|------|
| Page | `apps/web/app/(dashboard)/roundtable/page.tsx` |
| Client shell | `apps/web/src/components/roundtable/RoundTableClient.tsx` |
| Figures data | `apps/web/src/data/historical-figures.ts` |
| Topics data | `apps/web/src/data/roundtable-topics.ts` |
| Types | `apps/web/src/components/roundtable/types.ts` |
| Export | `apps/web/src/lib/roundtable-export.ts`, `turkish-roundtable-export.ts` |
| Prompts | `apps/web/src/lib/roundtable-prompts.ts` |
| Secrets loader | `apps/web/src/lib/load-secrets.ts` |
| Figure RAG | `apps/web/src/lib/figure-rag/`, `docs/roundtable/RAG.md` |
