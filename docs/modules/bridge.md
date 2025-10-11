# Bridge — AI Assistant Platform

**Scope:** An always-available assistant for Coopeverything: answers questions from our knowledge, brainstorms respectfully, tidies threads, and assists moderation with transparent, auditable suggestions.  
**Owner(s):** @coopeverything-core  
**Labels:** `module:bridge`, plus palette `type:increment`, `size:XS|S`, `slice:qna|tidy|ops`, `target:Now|Next|Later`

## Status
Progress: <!-- progress:bridge=0 --> 0%  
Next milestone: **Q&A + thread tidy MVP** (answer a question from docs + summarize a thread with disclaimers and logs)  
Blockers/Notes: None.

## Why this exists
Members should get fast, trustworthy help without wading through docs or long threads. Bridge provides:
- **Member Q&A / Brainstorm** (grounded in our KB + repo docs)
- **Thread tidy** (summaries, tags, action extraction)
- **Moderation assist** (suggestions, not decisions), with logs and appeal paths

## Guardrails & Social Contract
- **Assist, not adjudicate:** Bridge suggests; humans decide.  
- **Cite sources & confidence:** Every answer shows where it came from and an “accuracy” disclaimer.  
- **Privacy first:** No PII beyond what’s necessary; redact private data in logs.  
- **Auditability:** All actions (prompt, sources, summary) are logged to an immutable append-only file with timestamps and IDs.

---

## MVP slices (order)

1. **Docs-grounded Q&A (Data + API)**  *(slice: `qna`, size: XS/S)*  
   **Acceptance**
   - Endpoint `POST /api/bridge/qa` with `{ question }` returns:
     ```json
     { "answer": "<markdown>", "sources": ["docs/<path>.md#Lx-Ly", "STATUS/<path>.md"] }
     ```
   - Sources resolve to repo docs only (`docs/**`, `STATUS/**`); no web calls in MVP.
   - Works offline via fixture chunks: `packages/bridge-fixtures/docs.jsonl`.
   - Contract test verifies ≥1 cited source for any non-empty answer.
   - Output includes disclaimer: “Bridge may be imperfect; verify important details.”

2. **Thread tidy (UI + API)**  *(slice: `tidy`, size: S)*  
   **Acceptance**
   - On a forum topic page, a **“Tidy with Bridge”** button posts to `POST /api/bridge/tidy`.
   - Returns:
     ```json
     { "summary": "<markdown>", "tags": ["type:increment","size:S"], "links": ["<url>"] }
     ```
   - UI renders a non-invasive summary card with **Hide/Show** and **Copy to clipboard**.
   - Empty/loading/error states present; Storybook story added.

3. **Explain & Log (Ops)**  *(slice: `ops`, size: XS)*  
   **Acceptance**
   - Every Q&A and Tidy call appends a line to `logs/bridge/actions.ndjson`:
     ```json
     { "ts": "<iso8601>", "action": "qa|tidy", "inputs": { "...": "..." }, "sources": ["docs/..."], "hash": "<sha256>" }
     ```
   - `scripts/validate.sh` checks file exists and **last non-empty line** parses as JSON.
   - (Optional follow-up) wrapper may call `scripts/validate.sh` and echo proof lines.

> Phase 2 (later): lightweight **moderation suggestions** (toxicity/harm heuristics + label proposals), **appeal links**, **opt-out** per user/thread.

---

## Code map
- `apps/frontend/app/(modules)/bridge/*` (UI: helper buttons/cards, pages)
- `packages/bridge-domain/*` (entities: `BridgeQuery`, `BridgeAnswer`, `BridgeSummary`)
- `packages/bridge-api/*` (handlers: `/api/bridge/qa`, `/api/bridge/tidy`)
- `packages/bridge-fixtures/*` (KB chunks, small vector stub or keyword map)
- `logs/bridge/actions.ndjson` (append-only logs; created at runtime)

## UI contract (brief)
- `/bridge` → “What Bridge can do” page with links to try Q&A on a sample doc and Tidy on a sample thread.
- Forum integration: **Tidy with Bridge** button on topic pages; non-blocking summary card with source badges.
- All outputs show: “Bridge may be imperfect; verify important details” + source chips.

## Data & Privacy Notes
- Index only public repo docs + public KB exports (no private messages).  
- Redact emails/handles in summaries; never display secrets.  
- Logs store **hashes** for content bodies; sources store **paths**, not full text.

## Artifacts & Paths
- `logs/bridge/actions.ndjson` (append-only; git-tracked dir via `.gitkeep`)
- `scripts/validate.sh` (must assert log exists and last non-empty line is valid JSON)
- Labels: `module:bridge`, `type:increment`, `size:XS|S`, `slice:qna|tidy|ops`, `target:Now|Next|Later`

## Done → Tell the story (DoD)
- Docs-grounded Q&A returns an answer with ≥1 source for a seeded doc.
- Tidy card renders with summary and tags on a sample thread.
- `logs/bridge/actions.ndjson` receives entries for both actions.
- Proof lines in PR body:  
LINT=OK  
VALIDATORS=GREEN  
SMOKE=OK  
