# Bridge — AI Assistant Platform

> An always‑available assistant that helps people understand, deliberate, and act together. Bridge answers questions from our knowledge, tidies threads, and assists moderation with transparent, auditable suggestions — to change how humans decide and behave with one another and the planet.

**Owner(s):** @coopeverything-core
**Labels:** module:bridge, type:increment, size:XS|S, slice:qna|tidy|ops, target:Now|Next|Later
**Status:** Progress 0%
**Next milestone:** Pilot Bridge-assisted landing page (minimal `/bridge` with streaming Q&A, rate-limit, and NDJSON logs)
**Blockers/Notes:** None

---

> ### Parts (subpages)
> This page is the canonical overview. Detailed work happens in these focused subpages:
> - **docs/modules/bridge/landing-pilot.md** — minimal public `/bridge` page, streaming Q&A, logs & validator **(ready)**.
> - **docs/modules/bridge/faq-seed.md** — curated questions & answers from pilot testers **(coming soon)**.
> - **docs/modules/bridge/api.md** — ask/tidy API contracts, error taxonomy, examples **(coming soon)**.
> - **docs/modules/bridge/ethics-charter.md** — tone, privacy, assist-not-adjudicate guardrails **(coming soon)**.

---

## 1) Why Bridge

Bridge is a **cooperation amplifier**. It lowers friction to collective intelligence: people can grasp the facts, the trade‑offs, and the next steps without wading through miles of text or adversarial back‑and‑forth. Bridge teaches and reinforces the practices that make cooperation real.

* **Lower friction for understanding**: converts long docs/threads into concise, cited summaries so members *understand before reacting*.
* **Nudge empathy and deliberation**: encourages steel‑manning, calm language, and trade‑off thinking; suggests reframes when a discussion heats up.
* **Preserve shared memory**: keeps auditable logs of questions, sources, and summaries; makes learning cumulative across the network.
* **Empower local ↔ global**: connects local questions to global knowledge while respecting privacy and consent.
* **Build trust in AI**: every suggestion includes sources, a confidence disclaimer, and appears as assistance — never as adjudication.

**North‑star outcomes**

* Faster, calmer decisions with documented trade‑offs.
* More first‑time contributors completing a helpful action in their first session.
* Fewer circular debates; clearer next steps in threads and proposals.

---

## 2) Principles & Guardrails (the Social Contract in code)

* **Assist, not adjudicate.** Bridge suggests; humans decide.
* **Cite & disclaim.** Every answer shows sources and includes: *“Bridge may be imperfect; verify important details.”*
* **Privacy first.** Index only public repo docs + approved KB exports; redact PII (emails/phones/handles) in outputs and logs.
* **Auditability.** Append‑only logs with IDs, timestamps, content hashes; validation scripts prove integrity.
* **Small, reversible steps.** Deliver tiny increments with clear acceptance and roll‑back paths.

---

## 3) Scope (What Bridge does)

**Member Q&A / Brainstorm (grounded)**
Answers questions using TogetherOS documentation and approved knowledge exports. Provides citations and simple, respectful prompting for brainstorming.

**Thread tidy (summaries, tags, actions)**
Summarizes forum topics into a standard structure (problem → options → trade‑offs → open questions → next steps), proposes tags, and extracts candidate actions with links.

**Moderation assist (suggestions, not decisions)**
Detects heated tone or derailments and suggests de‑escalations, label proposals, or merge/split hints. Includes an appeal link and logs the suggestion with reasons.

**Onboarding nudge**
“Ask Bridge” is present on first run; suggests two tiny next actions and a person/project to follow, reducing time‑to‑first‑contribution.

Out of scope (for now): punitive moderation, decision‑making authority, automated enforcement.

---

## 4) Success Metrics (SLOs tied to human behavior)

* **Time‑to‑first‑useful‑answer (p95)** in fixture mode < 800ms
* **Citation coverage** = 100% for non‑empty answers/summaries
* **Deliberation quality**: % of threads with a tidy card and extracted actions
* **Trust index**: ≥ 70% “helpful” ratings after 30 days
* **Appeals**: median resolution within 7 days; 5xx error budget tracked

---

## 5) Phased Plan (each phase = small, verifiable)

### Phase 0 — Foundations (Now)

**Goal:** Ground Bridge in our knowledge and ethics.

* Curate **Bridge Knowledge Dataset** → `packages/bridge-fixtures/docs.jsonl` (Manifesto, OPS/CI, STATUS, Modules, Social Contract).
* Write the **Bridge Ethics Charter** (tone, fairness, transparency, non‑punitive suggestions).
* Build **dataset curation script** (dedupe, trim, redact PII); add to CI with proof lines.
* Define **citation format** `{ path, lines[] }` + standard disclaimer text.

**Acceptance:** JSONL exists and passes `scripts/validate.sh`; random samples map to real docs.

---

### Phase 1 — MVP: Q&A + Tidy + Logs (Now)

**Goal:** Answer a docs question and summarize a thread with sources and logs.

**API (fixture‑first)**

* `POST /api/bridge/qa` → `{ "answer": "<markdown>", "sources": [{"path":"docs/<file>.md","lines":[x,y]}], "disclaimer":"…" }`
* `POST /api/bridge/tidy` → `{ "summary":"<markdown>", "tags":["type:increment","size:S"], "links":["<url>"], "sources":[…], "disclaimer":"…" }`

**UI**

* Persistent **Ask Bridge** input (page‑aware).
* **Tidy with Bridge** button on forum topics → non‑blocking summary card with Copy/Hide/Show + source chips.

**Logs (append‑only)**

* `logs/bridge/actions-YYYY-MM-DD.ndjson` entries: `{ id, ts, action: "qa|tidy", inputs, sources, content_hash }`
* `scripts/validate.sh` checks: file exists, last non‑empty line parses as JSON; prints `LINT=OK`, `VALIDATORS=GREEN`, `SMOKE=OK`.

**Acceptance**

* Non‑empty outputs include ≥1 valid source from `docs/**` or `STATUS/**`.
* Storybook story renders tidy card; empty/loading/error states covered.

---

### Phase 2 — Deliberation Structure & Empathy (Next)

**Goal:** Encourage better conversations.

* Standard **summary structure** enforced in templates (problem → options → trade‑offs → open questions → next steps).
* **Tone cues** (light heuristics): suggest neutral reframes; never punitive.
* **Action extraction**: propose 1–3 next steps + tags (human‑editable).

**Acceptance:** ≥10 sample threads produce structured summaries; facilitators rate ≥70% “useful”.

---

### Phase 3 — Moderation Assist (Suggestions only) (Later)

**Goal:** Transparent moderation support with appeal paths.

* Detect toxicity/derail and **suggest** labels/merges/splits with short rationales and links.
* **Appeal link** on each suggestion; corrections form a learning queue (governed).

**Acceptance:** Suggestions include source/explanation; appeals logged; no auto‑punitive action.

---

### Phase 4 — Federation & Local Knowledge (Later)

**Goal:** Help local groups while sharing learning globally.

* **Per‑group indices** (workspace scoping) with opt‑in export.
* Global **insight cards** (anonymized patterns) curated by humans.

**Acceptance:** Local index enabled; global feed shows anonymized insights with curator sign‑off.

---

### Phase 5 — Continuous Learning & Audits (Later)

**Goal:** Community‑governed improvement.

* Feedback tagging (helpful/bias/off‑topic) and weekly review.
* Monthly **audit MD** (what Bridge suggested, where it erred, how it changed).

**Acceptance:** Monthly audit published; trending issues down over time.

---

## 6) Architecture (minimal, auditable)

* **Interfaces** → `apps/frontend/app/(modules)/bridge/*`
  `/bridge` explainer page; Ask input; Tidy button + card; Storybook stories.
* **Domain** → `packages/bridge-domain/*`
  Entities: `BridgeQuery`, `BridgeAnswer`, `BridgeSummary`.
* **API** → `packages/bridge-api/*`
  Handlers: `/api/bridge/qa`, `/api/bridge/tidy` (fixture‑first, schema‑checked).
* **Fixtures** → `packages/bridge-fixtures/*`
  `docs.jsonl` + tiny keyword index (deterministic search for MVP).
* **Logs** → `logs/bridge/`
  Append‑only NDJSON; daily rotation; `.gitkeep` tracked.

**Config**: `BRIDGE_ENABLED`, `BRIDGE_TIDY_ENABLED`, `BRIDGE_FIXTURES`, `BRIDGE_LOG_DIR`, `BRIDGE_LOG_KEY`.

---

## 7) Data, Privacy & Ethics

* Index only **public repo docs + approved KB exports**; exclude private messages by default.
* Redact PII in summaries and logs; store **paths + line ranges**, not bodies.
* Every output shows disclaimer + source chips; members can click **Challenge/Correct**.

---

## 8) Training & Setup (clear actions)

1. **Assemble dataset** → export Manifesto, OPS/CI, STATUS, Modules into `docs.jsonl` with `{title, path, text}`.
2. **Curation script** → dedupe, trim, and PII redaction (emails/phones/handles/URLs).
3. **Fixture‑first retrieval** → keyword index over JSONL; normalize citations to `{ path, lines[] }`.
4. **Summarizer** → deterministic template‑based summarizer; optional local LLM (Ollama) later behind a flag.
5. **Tone cues** → minimal heuristic rules (e.g., 2nd‑person accusations, all‑caps spikes) with suggested reframes.
6. **Logging** → NDJSON append with `id, ts, inputs, sources, content_hash`; integrity check in `scripts/validate.sh`.
7. **Governance loop** → Bridge Oversight Circle; appeal labels; weekly triage.

---

## 9) API Contracts (MVP)

**POST /api/bridge/qa**

```json
Req:  { "question": "How do I run smoke?" }
Res:  {
  "answer": "Run `scripts/smoke.sh` …",
  "sources": [{ "path": "docs/CI/Actions_Playbook.md", "lines": [42, 60] }],
  "disclaimer": "Bridge may be imperfect; verify important details."
}
Errors: 204 (empty), 401, 403, 422 (no sources), 500
```

**POST /api/bridge/tidy**

```json
Req:  { "threadId": "abc123" }
Res:  {
  "summary": "- What’s proposed…\n- Open questions…",
  "tags": ["type:increment","size:S"],
  "links": ["https://…/thread/abc123"],
  "sources": [{ "path": "STATUS/What_we_finished_What_is_left.md", "lines": [12, 28] }],
  "disclaimer": "Bridge may be imperfect; verify important details."
}
```

**Schemas & errors** should be validated (Zod or equivalent) with a standard taxonomy: `401` unauth, `403` disabled/flag off, `422` contract breach (e.g., missing sources), `204` empty input, `500` unexpected.

---

## 10) CI Hooks & Proof Lines

* `scripts/validate.sh` must output exactly:

```
LINT=OK
VALIDATORS=GREEN
SMOKE=OK
```

* Checks: JSONL fixture integrity, last log line parses as JSON, API example schemas pass, Storybook builds.

---

## 11) Smaller Projects (to split into docs & issues)

Break this module into contributor‑friendly projects:

1. **Bridge Knowledge Dataset**
   *Docs export + curation script + JSONL fixtures*

2. **Bridge Ethics Charter**
   *Codifies tone, fairness, transparency; links to Social Contract; informs prompts and UI*

3. **Q&A Endpoint (Fixture‑First)**
   *`/api/bridge/qa` + schemas + tests + citations*

4. **Thread‑Tidy Endpoint (Fixture‑First)**
   *`/api/bridge/tidy` + structure template + tests + tags*

5. **Ask Bridge UI**
   *Global input, loading/empty/error states, source chips, a11y*

6. **Tidy Card UI**
   *Summary card with Copy/Hide/Show; Storybook; keyboard/focus order*

7. **Append‑only Logs**
   *NDJSON writer + daily rotation + integrity validator*

8. **Tone Cues & Reframes (Heuristics)**
   *Non‑punitive prompts that suggest listening and trade‑offs*

9. **Appeals & Feedback Loop**
   *Challenge/Correct UI; oversight cadence; monthly audit template*

10. **Federated Indices (Local ↔ Global)**
    *Workspace scoping; anonymized insight cards pipeline*

Each project should include: **scope, acceptance, labels (module:bridge, slice:*, size:XS|S, target:Now|Next|Later)** and a tiny proof (contract test or script output).

---

## 12) Pilot: Public Landing Page (Owner-led)

We’ll first ship a minimal /bridge page so visitors can ask “What is TogetherOS?” and get a calm, mission-first, streamed answer. This pilot uses a hosted LLM via API (no tools yet), logs anonymized requests, and seeds the Bridge FAQ we’ll curate from trusted testers. Contributors can help with the streaming UI, the /api/bridge/ask endpoint (rate-limit + error taxonomy + NDJSON logs), Storybook states, and a CI validator that prints LINT=OK / VALIDATORS=GREEN / SMOKE=OK.
For full scope, acceptance, and owner guidance (including how I’ll work with the assistant to draft prompts, simulate testers, and curate the FAQ), see docs/modules/bridge/landing-pilot.md.

---

## 13) Link Hygiene

* Keep this doc referenced from the **Modules Hub** and from the **Manifesto CTA** for contributors: “Find the whole list of modules here.”
* When renaming/moving files, list likely inbound links and provide a safe find/replace command in the PR description.

---

**When code starts:** open branch `feature/bridge-qna-tidy-mvp` and implement Phase 1.
