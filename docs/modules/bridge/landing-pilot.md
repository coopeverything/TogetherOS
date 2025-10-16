# Bridge — Landing Pilot (Owner-led, Contributor-assisted)

**Purpose**  
Ship a minimal public page where visitors can ask "What is TogetherOS?" and get a calm, mission-first answer. This creates real usage, seeds the Bridge FAQ, and informs the fuller Bridge module.

**Owner:** @coopeverything-core  
**Labels:** module:bridge, slice:qna, type:increment, size:XS|S, target:Now  
**Status:** Planned (pre-MVP)

---

## What & Why

A single `/bridge` page with one text box and a streaming answer. Start with a hosted LLM via API (no tools), log anonymized requests, and learn from trusted testers. The goal is understanding before expanding scope.

### Outcomes
- Real questions from visitors → a curated seed Bridge FAQ.
- Proven streaming UI + rate-limited API route.
- Append-only logs + validator in CI.

---

## UX Spec (Minimal)

- **Intro:** "Ask Bridge what TogetherOS is."
- **Input:** single line, submit on Enter, disabled while streaming.
- **Output:** streamed Markdown; below it show a short disclaimer: "Bridge may be imperfect; verify important details."
- **Footer stub:** "Sources (coming soon)."

### States
- Empty → placeholder prompt
- Loading → animated dots
- Error → toast with retry
- Rate-limited → message with suggested wait

---

## API Contract (Fixture-free, provider API only)

**Route:** POST `/api/bridge/ask`

Request (JSON)
```json
{
  "question": "What is TogetherOS?"
}
```

Response (JSON)
```json
{
  "answer": "TogetherOS is…",
  "disclaimer": "Bridge may be imperfect; verify important details."
}
```

### Errors
- 204 — Empty/whitespace input
- 401 — Missing/invalid key
- 429 — Rate limit exceeded
- 500 — Unexpected server error

Notes:
- Initial answers are uncited (citations arrive with MCP/RAG in later phases).
- Keep answers brief and grounded in curated snippets.
- Streaming response required.

---

## System Prompt (paste into server-side call)

You are Bridge, the assistant of TogetherOS. Speak plainly, avoid jargon, and emphasize cooperation, empathy, and human decision-making. Answer only what was asked. Prefer concrete examples over abstractions and be concise. (Use the above as the server-side system prompt; adapt as needed for provider API conventions.)

---

## Privacy, Logs, and CI

- **Rate-limit:** default 30 requests/hour/IP.
- **Logging:** append a line to `logs/bridge/actions-YYYY-MM-DD.ndjson` for each ask. Example NDJSON line:

```ndjson
{ "id": "ulid...", "ts": "2025-10-15T12:00:00Z", "action": "ask", "ip_hash": "sha256(salt+ip)", "q_len": 142, "latency_ms": 820 }
```

- **No PII stored** (hash only). Avoid storing raw prompts during the pilot; if enabled later, redact emails/phones/handles.

### Validator
`scripts/validate.sh` must parse the last non-empty line of that NDJSON file and print exactly:

```
LINT=OK
VALIDATORS=GREEN
SMOKE=OK
```

Ensure CI runs `scripts/validate.sh` against the log file as part of the smoke checks.

---

## Implementation Notes (Monorepo)

Paths and responsibilities:
- `apps/frontend/app/bridge/page.tsx` — UI with streaming.
- `apps/frontend/app/api/bridge/ask/route.ts` — validates input, rate-limits, calls provider API, logs NDJSON, streams back.
- `logs/bridge/.gitkeep` — ensure directory tracked.
- `.env` — `OPENAI_API_KEY`, `BRIDGE_ENV=prod`, optional `RATE_LIMIT_PER_HOUR=30`.

VPS checklist:
- Node 20 + pnpm; Nginx proxy on 80/443; Let’s Encrypt.
- Deploy via existing rsync + Compose; smoke route returns `SMOKE=OK`.

---

## Content Prep (Owner)

- Curate 6–10 canonical snippets (Manifesto “why”, Modules Hub, Status snapshot) to anchor answers.
- Maintain `docs/modules/bridge/faq-seed.md` with high-quality Q&A from testers.

---

## Contributor Tasks (XS/S)

Implement the following; each task should include acceptance criteria and a tiny proof (e.g., validator output).

- Implement streaming UI and API route (with 204/401/429/500 taxonomy).  
  - Acceptance: public `/bridge` page streams tokens from the server and handles error states listed above.  
  - Proof: screenshots or Storybook story + logs showing streaming behavior.

- Add NDJSON logger + validator script.  
  - Acceptance: `logs/bridge/actions-YYYY-MM-DD.ndjson` receives append-only lines and `scripts/validate.sh` prints the exact validator output.  
  - Proof: validator output captured in CI log.

- Storybook story for the chat box (empty/loading/error).  
  - Acceptance: story covers states and passes accessibility checks.  
  - Proof: Storybook URL or snapshot.

- Basic a11y: labels, focus ring, keyboard submit, reduced motion.  
  - Acceptance: axe/lighthouse audit passes basic a11y checks.  
  - Proof: audit report snippet.

---

## Metrics for the Pilot

- p95 time-to-first-token < 800 ms (provider + network permitting).
- Helpful rating from testers ≥ 70%.
- 10–30 good questions captured into `faq-seed.md`.

---

## Upgrade Path (Later)

- Citations: add MCP server exposing `docs.search` / `docs.get(path, range)`; render source chips.
- Thread tidy: add button → structured summary (problem/options/trade-offs/next).
- Agent policy: migrate to agent/tooling with repository-audited prompts.

---

## Working with the Assistant (Bridge)

- Ask the assistant to draft system prompts, validator scripts, and copy tweaks.
- Use it to simulate testers ("Ask me 5 hard questions a newcomer might ask").
- Use it to turn answers into FAQ entries and propose concise improvements.
- Request self-verifying commands with BEGIN/END SUMMARY for any shell work.

---

## Risks & Mitigations

- Over-promising: keep answers brief and cautionary; point to pilot scope.
- PII leakage: redaction policy; no raw prompt storage in pilot.
- Cost drift: keep answers short; cap requests/IP; see cost scenarios in main Bridge doc.

---

## Done Definition

- Public `/bridge` page live with streaming answers.
- Logs appended and validator prints proof lines in CI.
- `faq-seed.md` contains ≥ 10 curated Q&A.

---

Notes / Tips
- If you prefer the JSON/NDJSON samples to render in code blocks inside this file, you can add fenced code blocks (as shown above). Avoid wrapping the entire document in a single large code fence.
- Keep the pilot scope small and measurable.
