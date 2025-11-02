# Bridge — AI Assistant Module

## Overview

**Bridge** is TogetherOS's AI-powered cooperation amplifier that helps people:
- Understand complex information quickly (Q&A with citations)
- Structure deliberations (thread tidying)
- Improve discourse (moderation assistance)

**Status:** 40% implementation (Landing Pilot phase), core infrastructure complete
**Owner:** @coopeverything-core
**Labels:** `module:bridge`, `type:increment`
**Current priority:** Landing pilot (internal MVP)

---

## Why Bridge Exists

### The Problem
- Long docs/threads create friction → people react before understanding
- Circular debates waste energy → no clear next steps
- Heated discussions escalate → people disengage

### The Solution
Bridge **assists, not adjudicates**:
- Converts docs/threads into concise, cited summaries
- Encourages steel-manning, calm language, trade-off thinking
- Suggests reframes when discussions heat up (never punitive)
- Keeps auditable logs for transparency

### North-Star Outcomes
- Faster, calmer decisions with documented trade-offs
- More first-time contributors completing actions in first session
- Fewer circular debates; clearer next steps

---

## Principles & Guardrails

### Social Contract in Code

1. **Assist, not adjudicate** — Bridge suggests; humans decide
2. **Cite & disclaim** — Every answer shows sources + "Bridge may be imperfect; verify important details"
3. **Privacy first** — Index only public docs + approved KB; redact PII
4. **Auditability** — Append-only NDJSON logs with IDs, timestamps, content hashes
5. **Small, reversible steps** — Tiny increments with clear rollback paths

---

## Scope: What Bridge Does

### 1. Member Q&A (Grounded)
- Answers questions using TogetherOS documentation
- Provides citations with paths + line ranges
- Simple, respectful prompting for brainstorming
- **Example:** "How do I run smoke?" → Answer + citation to `docs/CI/Actions_Playbook.md:42-60`

### 2. Thread Tidy (Summaries)
- Summarizes forum topics into standard structure:
  - Problem → Options → Trade-offs → Open questions → Next steps
- Proposes tags (e.g., `type:increment`, `size:S`)
- Extracts candidate actions with links
- **Example:** 50-message thread → structured summary card + 3 action items

### 3. Moderation Assist (Suggestions Only)
- Detects heated tone or derailments
- Suggests de-escalations, label proposals, merge/split hints
- Includes appeal link and logs reasons
- **Never punitive** — humans make final decisions

### 4. Onboarding Nudge
- "Ask Bridge" present on first run
- Suggests 2 tiny next actions + person/project to follow
- Reduces time-to-first-contribution

### Out of Scope (Now)
- Punitive moderation
- Decision-making authority
- Automated enforcement

---

## Success Metrics (SLOs)

### Performance
- **Time-to-first-useful-answer (p95):** < 800ms (fixture mode)
- **Citation coverage:** 100% for non-empty answers/summaries
- **Streaming latency:** < 200ms to first token

### Quality
- **Deliberation quality:** % of threads with tidy card + extracted actions
- **Trust index:** ≥70% "helpful" ratings after 30 days
- **Appeals:** Median resolution within 7 days

### Reliability
- **5xx error budget:** Tracked and minimized
- **Rate limiting:** 30 req/hour/IP (landing pilot)

---

## Phased Implementation Plan

### Phase 0: Foundations (Now)
**Goal:** Ground Bridge in our knowledge and ethics

**Deliverables:**
- Bridge Knowledge Dataset → `packages/bridge-fixtures/docs.jsonl`
  - Includes: Manifesto, OPERATIONS, CI playbook, STATUS, module specs
- Bridge Ethics Charter (tone, fairness, transparency)
- Dataset curation script (dedupe, trim, redact PII)
- Citation format: `{ path, lines[] }`
- Standard disclaimer text

**Acceptance:** JSONL exists and passes `scripts/validate.sh`; random samples map to real docs

---

### Phase 1: MVP (Q&A + Tidy + Logs) (Now)
**Goal:** Answer a docs question and summarize a thread with sources and logs

#### API (Fixture-First)

**POST /api/bridge/qa**
```json
// Request
{
  "question": "How do I run smoke?"
}

// Response
{
  "answer": "Run `scripts/smoke.sh` …",
  "sources": [{
    "path": "docs/CI/Actions_Playbook.md",
    "lines": [42, 60]
  }],
  "disclaimer": "Bridge may be imperfect; verify important details."
}

// Errors: 204 (empty), 401, 403, 422 (no sources), 500
```

**POST /api/bridge/tidy**
```json
// Request
{
  "threadId": "abc123"
}

// Response
{
  "summary": "- What's proposed…\n- Open questions…",
  "tags": ["type:increment", "size:S"],
  "links": ["https://…/thread/abc123"],
  "sources": [{
    "path": "STATUS/What_we_finished_What_is_left.md",
    "lines": [12, 28]
  }],
  "disclaimer": "Bridge may be imperfect; verify important details."
}
```

#### UI Components

**Ask Bridge (Persistent Input)**
- Page-aware input field
- Loading states
- Streaming response with source chips
- Copy/Hide/Show controls

**Tidy Button (Forum Topics)**
- "Tidy with Bridge" button on threads
- Non-blocking summary card
- Source citations clickable
- Copy/Hide/Show + feedback (helpful/not)

#### Logs (Append-Only NDJSON)

**Format:**
```json
{
  "id": "uuid",
  "timestamp": "2025-01-15T10:30:00Z",
  "event_type": "qa",
  "metadata": {
    "question_hash": "sha256",
    "answer_length": 245,
    "sources": [{"path": "docs/Manifesto.md", "lines": [12,28]}],
    "ip_hash": "sha256"
  },
  "content_hash": "sha256"
}
```

**Storage:** `logs/bridge/actions-YYYY-MM-DD.ndjson`

**Validation:** `scripts/validate.sh` checks:
- File exists
- Last non-empty line parses as JSON
- Required fields present
- Prints: `LINT=OK`, `VALIDATORS=GREEN`, `SMOKE=OK`

**Acceptance:**
- Non-empty outputs include ≥1 valid source from `docs/**` or `STATUS/**`
- Storybook story renders tidy card with empty/loading/error states

---

### Phase 2: Deliberation Structure & Empathy (Next)
**Goal:** Encourage better conversations

**Features:**
- Standard summary structure enforced (problem → options → trade-offs → questions → next steps)
- Tone cues (light heuristics): suggest neutral reframes, never punitive
- Action extraction: propose 1-3 next steps + tags (human-editable)

**Acceptance:** ≥10 sample threads produce structured summaries; facilitators rate ≥70% "useful"

---

### Phase 3: Moderation Assist (Later)
**Goal:** Transparent moderation support with appeal paths

**Features:**
- Detect toxicity/derail and suggest labels/merges/splits
- Include rationales and links
- Appeal link on each suggestion
- Corrections form learning queue (governed)

**Acceptance:** Suggestions include source/explanation; appeals logged; no auto-punitive action

---

### Phase 4: Federation & Local Knowledge (Later)
**Goal:** Help local groups while sharing learning globally

**Features:**
- Per-group indices (workspace scoping) with opt-in export
- Global insight cards (anonymized patterns) curated by humans

**Acceptance:** Local index enabled; global feed shows anonymized insights with curator sign-off

---

### Phase 5: Continuous Learning & Audits (Later)
**Goal:** Community-governed improvement

**Features:**
- Feedback tagging (helpful/bias/off-topic)
- Weekly review cadence
- Monthly audit MD (what Bridge suggested, where it erred, how it changed)

**Acceptance:** Monthly audit published; trending issues down over time

---

## Code Architecture

### Directory Structure
```
apps/web/app/(modules)/bridge/
├── page.tsx                # /bridge explainer page
├── components/
│   ├── AskBridge.tsx       # Q&A input
│   ├── TidyCard.tsx        # Summary display
│   └── SourceChip.tsx      # Citation links

packages/bridge-domain/
├── entities/
│   ├── BridgeQuery.ts
│   ├── BridgeAnswer.ts
│   └── BridgeSummary.ts

packages/bridge-api/
├── handlers/
│   ├── qa.ts               # POST /api/bridge/qa
│   └── tidy.ts             # POST /api/bridge/tidy

packages/bridge-fixtures/
├── docs.jsonl              # Knowledge dataset
├── index.ts                # Keyword search (deterministic MVP)
└── seed.ts

logs/bridge/
├── actions-2025-01-15.ndjson
└── .gitkeep
```

### Environment Variables
```bash
BRIDGE_ENABLED=true
BRIDGE_TIDY_ENABLED=false         # Feature flag
BRIDGE_FIXTURES=/path/to/docs.jsonl
BRIDGE_LOG_DIR=/path/to/logs/bridge/
BRIDGE_LOG_KEY=<secret>           # For integrity hashing
LLM_API_KEY=<secret>              # Hosted LLM provider
LLM_ENDPOINT=<url>
```

---

## Data & Privacy

### What Gets Indexed
- **Public repo docs only:** Manifesto, OPERATIONS, CI, STATUS, Modules
- **Approved KB exports:** Curated knowledge base
- **Excluded:** Private messages, PII, credentials

### PII Redaction
```typescript
// In all outputs and logs
function redactPII(text: string): string {
  text = text.replace(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi, '[REDACTED_EMAIL]')
  text = text.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED_PHONE]')
  text = text.replace(/@[\w-]+/g, '[REDACTED_HANDLE]')
  return text
}
```

### What Gets Logged (NDJSON)
- **Stored:** Hashes (question, IP), answer length, sources, timestamps
- **NOT stored:** Raw prompts, full responses, identifiable data
- **Log retention:** 90 days (configurable)

### Integrity Validation
```bash
# scripts/validate.sh checks:
# - JSONL file exists
# - Last line is valid JSON
# - Required fields present (id, timestamp, event_type)
# - Content hash chain valid
```

---

## Training & Setup

### Dataset Assembly
```bash
# 1. Export docs to JSONL
node scripts/export-docs-to-jsonl.js

# 2. Curate (dedupe, trim, redact)
node scripts/curate-bridge-dataset.js

# 3. Validate
./scripts/validate.sh

# Expected output:
# LINT=OK
# VALIDATORS=GREEN
# SMOKE=OK
```

### Fixture-First Retrieval
```typescript
// packages/bridge-fixtures/index.ts
import docs from './docs.jsonl'

export function search(query: string): DocMatch[] {
  // Keyword index over JSONL (deterministic MVP)
  // Normalize citations to { path, lines[] }
  return fuzzyMatch(query, docs)
}
```

### Summarizer (MVP)
```typescript
// Deterministic template-based summarizer
// Optional: Local LLM (Ollama) later behind feature flag
export function summarize(thread: Thread): Summary {
  return {
    problem: extractProblem(thread),
    options: extractOptions(thread),
    tradeoffs: extractTradeoffs(thread),
    openQuestions: extractQuestions(thread),
    nextSteps: proposeActions(thread),
  }
}
```

### Tone Cues (Heuristics)
```typescript
// Minimal rule-based detection
const indicators = {
  accusation: /you (always|never)/gi,
  allCaps: /[A-Z]{5,}/g,
  hostility: /(stupid|idiot|moron)/gi,
}

export function suggestReframe(text: string): Suggestion | null {
  if (indicators.accusation.test(text)) {
    return {
      type: 'reframe',
      suggestion: 'Consider rephrasing as "I feel…" or "I observe…"',
      link: '/docs/empathy-guidelines'
    }
  }
  return null
}
```

---

## Landing Pilot (Internal MVP)

### Goal
Ship minimal `/bridge` page for visitors to ask "What is TogetherOS?" and get mission-first streamed answer

### Scope
- Hosted LLM via API (no tools yet)
- Logs anonymized requests (NDJSON)
- Rate limiting: 30 req/hour/IP
- Seeds Bridge FAQ from trusted testers
- **Internal pilot only** — Core team, not public contributions yet

### Deliverables
1. `/bridge` page with streaming Q&A UI
2. `POST /api/bridge/ask` endpoint
3. Rate limiting middleware
4. Error taxonomy (401, 403, 422, 500)
5. NDJSON log writer + validator
6. Storybook states (empty, loading, streaming, error)
7. CI proof lines: `LINT=OK`, `VALIDATORS=GREEN`, `SMOKE=OK`

**Detailed spec:** `docs/modules/bridge/landing-pilot.md`

---

## Current Implementation Status (Landing Pilot)

### ✅ What's Complete (40%)

#### Backend & API
- **Streaming Q&A endpoint:** `apps/web/app/api/bridge/ask/route.ts` (272 lines)
  - OpenAI GPT-3.5-turbo integration
  - RAG with docs indexing
  - Rate limiting (30 req/hour/IP, configurable)
  - NDJSON logging with IP hashing
  - Error taxonomy (204, 401, 429, 500)
  - Source citations appended to responses

#### Shared Libraries
- **docs-indexer.ts** (179 lines) — Document scanning, keyword search, citation sources
- **logger.ts** (118 lines) — NDJSON append-only logging, IP hashing
- **rate-limiter.ts** (114 lines) — In-memory sliding window rate limiter

#### Frontend & UI
- **BridgeChat component:** `packages/ui/src/bridge/BridgeChat.tsx` (201 lines)
  - Streaming state management (idle, loading, streaming, error, rate-limited)
  - Markdown link rendering
  - Error display with user-friendly messages
- **Page route:** `apps/web/app/bridge/page.tsx` (minimal wrapper)

#### Testing & Validation
- **Unit tests:** `packages/ui/src/bridge/__tests__/BridgeChat.test.tsx` (240 lines)
  - Full coverage: rendering, input, submission, error states, streaming
- **NDJSON validator:** `scripts/validate-bridge-logs.sh` (79 lines)
  - Format validation, required fields check, SHA-256 hash validation
- **CI integration:** `scripts/validate.sh` calls Bridge validator automatically

#### Documentation
- **Module spec:** `docs/modules/bridge.md` (this file)
- **Landing pilot spec:** `docs/modules/bridge/landing-pilot.md` (222 lines)
- **Configuration guide:** `docs/modules/bridge/configuration.md` (222 lines)
- **Progress tracking:** `docs/modules/bridge/progress.md` (190 lines)

---

### 🔴 Critical Gaps (Required for "Done")

#### Tier 1: Shipping Blockers (5-10 hours)
1. **Test with real OpenAI API key** (Size: XS, 1-2 hours)
   - Set up `OPENAI_API_KEY` in production `.env`
   - Verify end-to-end streaming works
   - Confirm NDJSON logs write correctly
   - Test rate limiting in practice
   - **Acceptance:** Live `/bridge` page streams answers successfully

2. **Seed FAQ from testers** (Size: S, 4-8 hours)
   - Create `docs/modules/bridge/faq-seed.md`
   - Collect 10-30 curated Q&A pairs from internal testers
   - Measure helpful rating (target: ≥70%)
   - Track p95 time-to-first-token (target: <800ms)
   - **Acceptance:** FAQ seed file created with quality questions

#### Tier 2: Quality Gates (8-16 hours)
3. **Storybook stories** (Size: M, 6-12 hours including setup)
   - **Blocker:** Storybook not set up in repo yet (no `.storybook/` directory)
   - Install and configure Storybook
   - Create `packages/ui/src/bridge/BridgeChat.stories.tsx`
   - Cover all states: empty, loading, streaming, success, errors (204, 429, 500)
   - Add accessibility addon
   - **Acceptance:** Storybook URL accessible, stories pass a11y checks

4. **Accessibility audit** (Size: XS, 2-4 hours)
   - Run axe/lighthouse on `/bridge` page
   - Fix any critical issues (labels, focus rings, keyboard nav)
   - Test reduced motion support
   - Verify keyboard-only navigation
   - **Acceptance:** axe passes, Lighthouse a11y ≥90, keyboard-only nav works

**Total Effort to "Done": 13-26 hours**

---

### 🟡 Future Phases (Not Blocking Landing Pilot)

These are documented in the spec but explicitly deferred:

- **Phase 0:** Knowledge Dataset (`docs.jsonl`), Bridge Ethics Charter
- **Phase 2:** Thread Tidy endpoint, Citation chips UI, MCP server integration
- **Phase 3:** Moderation assist features
- **Phase 4:** Federation capabilities

**See full phase details in sections above.**

---

### Priority Order

**Immediate (This Week):**
1. Set up OpenAI API key in production
2. Test Bridge endpoint end-to-end
3. Fix any bugs discovered in testing

**Short-term (Next 2 Weeks):**
1. Install and configure Storybook
2. Create BridgeChat stories
3. Run accessibility audit and fix issues
4. Collect first 10 FAQ entries from testers

**After Landing Pilot Ships:**
1. Monitor usage metrics (p95 latency, helpful rating)
2. Iterate on FAQ based on real questions
3. Plan Phase 2 (citations) based on user feedback

---

## API Contracts (MVP)

### POST /api/bridge/qa

**Request:**
```json
{
  "question": "How do I run smoke?"
}
```

**Response (Success):**
```json
{
  "answer": "Run `scripts/smoke.sh` from repo root…",
  "sources": [
    { "path": "docs/CI/Actions_Playbook.md", "lines": [42, 60] }
  ],
  "disclaimer": "Bridge may be imperfect; verify important details."
}
```

**Response (Empty):**
```
204 No Content
```

**Response (Validation Error):**
```json
{
  "error": {
    "code": "NO_SOURCES",
    "message": "Answer generated without citations (contract breach)"
  }
}
// Status: 422 Unprocessable Entity
```

**Response (Rate Limit):**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "30 requests/hour exceeded. Try again in 15 minutes."
  }
}
// Status: 429 Too Many Requests
```

---

### POST /api/bridge/tidy

**Request:**
```json
{
  "threadId": "abc123"
}
```

**Response:**
```json
{
  "summary": "## Problem\n...\n## Options\n...\n## Trade-offs\n...\n## Open Questions\n...\n## Next Steps\n...",
  "tags": ["type:increment", "size:S"],
  "links": ["https://github.com/.../discussions/abc123"],
  "sources": [
    { "path": "STATUS/What_we_finished_What_is_left.md", "lines": [12, 28] }
  ],
  "disclaimer": "Bridge may be imperfect; verify important details."
}
```

---

## CI Hooks & Proof Lines

### Validation Requirements
```bash
# scripts/validate.sh must output exactly:
LINT=OK
VALIDATORS=GREEN
SMOKE=OK
```

### What Gets Validated
- JSONL fixture integrity (valid JSON per line)
- Last log line parses as JSON
- API example schemas pass Zod validation
- Storybook builds without errors

---

## Governance & Appeals

### Bridge Oversight Circle
- **Weekly triage:** Review flagged suggestions, appeals
- **Monthly audit:** Publish what Bridge suggested, errors, improvements
- **Community-governed:** Changes to tone rules require proposal

### Appeal Process
1. User clicks "Challenge/Correct" on Bridge suggestion
2. Opens form with context pre-filled
3. Oversight Circle reviews within 7 days
4. Decision logged publicly
5. Correction forms learning queue for next phase

---

## Contributor Projects (Breakdowns)

These are **future scoped tasks** once ready for public contribution:

1. **Bridge Knowledge Dataset** — Export docs, curate, validate JSONL
2. **Bridge Ethics Charter** — Codify tone/fairness rules
3. **Q&A Endpoint (Fixture-First)** — `/api/bridge/qa` + tests
4. **Thread-Tidy Endpoint** — `/api/bridge/tidy` + structured template
5. **Ask Bridge UI** — Global input, streaming states, citations
6. **Tidy Card UI** — Summary display with Copy/Hide/Show
7. **Append-Only Logs** — NDJSON writer + daily rotation + validator
8. **Tone Cues & Reframes** — Non-punitive prompts for empathy
9. **Appeals & Feedback Loop** — Challenge UI + oversight cadence
10. **Federated Indices** — Workspace scoping + anonymized insights

---

## Link Hygiene

- **Module hub:** `docs/modules/INDEX.md` links to this spec
- **Manifesto CTA:** "Find modules here" points to INDEX
- **Landing pilot:** `docs/modules/bridge/landing-pilot.md` (detailed)

When renaming/moving files:
- List likely inbound links
- Provide safe find/replace command in PR description

---

## Related KB Files

- [Main KB](togetheros-kb.md) — Core principles, workflow
- [Architecture](architecture.md) — Domain-driven design, NDJSON patterns
- [Data Models](data-models.md) — BridgeQuery, BridgeAnswer entities
- [CI/CD Discipline](../contributors/WORKFLOW.md) — Proof lines, validation
