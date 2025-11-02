# TogetherOS Project Knowledge Base

## Core Identity

**TogetherOS** is a **cooperation-first operating system stack** (OS = Operating System, not "open source") designed to help communities self-organize through:
- Transparent, consent-based governance
- Tiny, verifiable steps with public proofs
- Fair social economy (mutual aid, timebanking, cooperative treasury)
- Shared knowledge and power without fragmentation

### The Problem We Solve
Power concentrated in a few hands routes wealth and political power upward and pain downward. This results in struggle, poverty, exploitation, ecological breakdown, anxiety, isolation, and social disconnection.

### The Solution
TogetherOS helps people **unlearn division and learn coordination**. It resets default assumptions (individualism, zero-sum thinking) and cultivates cooperative habits through:
- **Shared decisions, shared power:** Transparent participatory governance with rotating/recallable roles
- **Cooperative economy:** Redirect surplus back to communities (Support Points, timebanking, Social Horizon currency)
- **Tiny, verifiable steps:** Every initiative = shippable increments with public proofs

---

## Key Constraints & Principles

### Non-Negotiable Discipline

1. **Tiny, verifiable steps:** Every change = smallest shippable increment
2. **Docs-first:** Spec before code, always
3. **Proof lines required:** Every PR must include in description:
   ```
   LINT=OK
   VALIDATORS=GREEN (or SMOKE=OK)
   ```
4. **One change per PR:** No bundling unrelated work
5. **Path labels mandatory:** All issues/PRs tagged with 1 of 8 Cooperation Paths

### Privacy & Transparency

- **Privacy-first:** No raw prompts stored, IP hashing, PII redaction
- **Append-only logs:** NDJSON audit trails (Bridge, moderation, transactions)
- **Least-privilege by default:** Minimal tokens, role-based access
- **Exportable data:** Portable identities, decision histories, audit logs

### Governance Principles

- **Leaderless & accountable:** Rotating, recallable roles; traceable actions
- **Minority-interest protection:** Minority reports codified and preserved
- **Consent-based:** Not majority-rule; amendments must address objections
- **Empathy-first moderation:** De-escalation rules, AI-assisted discourse management

---

## Current Phase: Pre-MVP

- **All 17 modules at 0% code implementation**
- **Comprehensive documentation complete:** 1,114+ lines of specs
- **Next priority:** Bridge landing pilot (internal MVP) at `/bridge`
- **Repository type:** Monorepo (Next.js 14 + TypeScript + Tailwind)

---

## 8 Cooperation Paths (Taxonomy)

Every issue, PR, and initiative must be labeled with one of these paths:

1. **Collaborative Education** — Learning, co-teaching, peer mentorship, skill documentation
2. **Social Economy** — Cooperatives, timebanking, mutual aid, repair/reuse networks
3. **Common Wellbeing** — Health, nutrition, mental health, community clinics, care networks
4. **Cooperative Technology** — Open-source software, privacy tools, federated services, human-centered AI
5. **Collective Governance** — Direct legislation, deliberation, empathic moderation, consensus tools
6. **Community Connection** — Local hubs, events, volunteer matching, skill exchanges
7. **Collaborative Media & Culture** — Storytelling, documentaries, cultural restoration, commons media
8. **Common Planet** — Regeneration, local agriculture, circular materials, climate resilience

---

## Development Workflow

### Standard Flow

1. **Check spec:** Read `docs/modules/{module}.md` for requirements
2. **Create branch:** `claude/{module}-{sessionId}` or `feature/{short-topic}`
3. **Implement smallest slice:** One tiny change only
4. **Run validation:** `scripts/validate.sh` (expect: `LINT=OK`, `VALIDATORS=GREEN`, `SMOKE=OK`)
5. **Open PR** with:
   - Clear description (what/why)
   - Proof lines in body
   - Path label (e.g., `path:cooperative-technology`)
   - Files touched list
6. **Update docs:** Keep `docs/STATUS_v2.md` progress markers current
7. **After merge:** Post note in Discussions #88 if it affects contributors

### Branch Naming Conventions

- **Feature branches:** `feature/<short-topic>`
- **Docs branches:** `docs/<short-topic>`
- **Claude sessions:** `claude/{module}-{sessionId}` (must start with `claude/` and end with session ID)

### Git Push Retry Logic

- **For push:** Always use `git push -u origin <branch-name>`
- **CRITICAL:** Branch must start with `claude/` and end with matching session ID, otherwise push fails with 403
- **Retry on network errors:** Up to 4 retries with exponential backoff (2s, 4s, 8s, 16s)
- **For fetch/pull:** Prefer `git fetch origin <branch-name>` with same retry logic

---

## Key File Locations

### Documentation
- **Vision:** `docs/Manifesto.md`
- **Architecture:** `docs/TogetherOS_WhitePaper.md`
- **Operations playbook:** `docs/OPERATIONS.md`
- **CI playbook:** `docs/CI/Actions_Playbook.md`
- **Module specs:** `docs/modules/{module}.md`
- **Modules hub:** `docs/modules/INDEX.md`
- **Status tracking:** `docs/STATUS_v2.md`

### Taxonomy
- **Cooperation Paths (machine-readable):** `codex/taxonomy/CATEGORY_TREE.json`
- **Cooperation Paths (human-readable):** `docs/TogetherOS_CATEGORIES_AND_KEYWORDS.md`

### Scripts & Validation
- **Main validator:** `scripts/validate.sh`
- **Linting:** `scripts/lint.sh`

### CI/CD
- **Workflows:** `.github/workflows/` (16 workflows)
- **Lint:** `.github/workflows/lint.yml`
- **Docs:** `.github/workflows/ci_docs.yml`
- **Deploy:** `.github/workflows/deploy.yml`

---

## Architecture Patterns

### Domain-Driven Structure
Each module follows this pattern:
```
apps/api/src/modules/{module}/
  ├── entities/       # Domain models
  ├── repos/          # Data access layer
  ├── handlers/       # API handlers
  └── fixtures/       # Test data

apps/web/app/{module}/
  ├── page.tsx        # Route component
  └── layout.tsx      # Layout wrapper

packages/types/src/{module}.ts    # Shared TypeScript types
packages/ui/src/{module}/         # Shared UI components
```

### Append-Only Logs (NDJSON)
- **Format:** Newline-delimited JSON
- **Required fields:** `id`, `timestamp`, `event_type`, `metadata`
- **Validation:** SHA-256 chain, integrity checks in CI
- **Privacy:** IP hashing, PII redaction, no raw prompts
- **Examples:** Bridge Q&A logs, moderation events, transactions

### Federation-Ready
- **Group handles:** Inter-group protocols
- **Local autonomy:** Per-group data silos with opt-in federation
- **Proposal sync:** Cross-group initiatives with result mirroring

---

## Success Metrics & North Star

### For Bridge (AI Assistant)
- Time-to-first-useful-answer (p95) < 800ms (fixture mode)
- Citation coverage = 100% for all answers
- Trust index: ≥70% "helpful" ratings after 30 days

### For Governance
- Proposals have documented trade-offs and minority reports
- Decision cycle time measured
- Delivery reports linked to proposals

### For Social Economy
- Support Points allocated fairly (max 10/idea per member)
- Timebank transactions balanced
- Local value retained (tracked via cooperative treasury)

---

## Common Commands

### Local Development
```bash
# Validate repo health
./scripts/validate.sh

# Run linters
./scripts/lint.sh

# Expected output:
# LINT=OK
# VALIDATORS=GREEN
# SMOKE=OK
```

### Git Operations
```bash
# Create feature branch
git checkout -b feature/bridge-qa-endpoint

# Create Claude session branch (required format)
git checkout -b claude/bridge-landing-011CUQtanTsWEweh3xMQupeE

# Push with retry (always use -u)
git push -u origin <branch-name>

# Fetch specific branch
git fetch origin <branch-name>
```

---

## Priority Modules (Implementation Order)

### Phase 1: Bridge Landing Pilot (Now)
- Minimal `/bridge` page
- Streaming Q&A with LLM
- NDJSON logs with validation
- Rate limiting (30 req/hour/IP)
- Citations required for all answers

### Phase 2: Governance MVP (Next)
- Proposal create/list/view
- Zod validation
- Fixture repos (in-memory)
- Routes: `/governance`, `/governance/[id]`

### Phase 3: Monorepo Foundation (Critical)
- Next.js 14 app shell
- tRPC server boilerplate
- Tailwind CSS v4 + shadcn/ui
- Package structure (`@togetheros/ui`, `@togetheros/types`)

---

## When to Ask Questions

### Clarify with the user when:
- Multiple valid architectural approaches exist
- Library/framework choice is ambiguous
- Design decisions affect multiple modules
- Requirements conflict or are unclear
- Security/privacy trade-offs need discussion

### Do NOT ask when:
- The spec in `docs/modules/{module}.md` is clear
- Standard patterns are documented in this KB
- CI/CD workflows are defined in `docs/CI/Actions_Playbook.md`

---

## Important Reminders

1. **Never create files unless necessary** — Always prefer editing existing files
2. **Never create markdown docs proactively** — Only create documentation if explicitly requested
3. **Always run validation before PR** — `./scripts/validate.sh` must pass
4. **Update STATUS_v2.md after changes** — Bump progress markers using HTML comments
5. **Bridge pilot is core-team only** — Not open for public contributions yet
6. **All PRs need Path labels** — Use canonical names from CATEGORY_TREE.json
7. **Notion UUID errors are expected** — Claude Code bug (issue #5504) occasionally corrupts UUIDs; simply retry with original UUID

---

## Related KB Files

- [Tech Stack Details](./tech-stack.md) — Framework versions, dependencies, tooling
- [Architecture Patterns](./architecture.md) — Data models, API contracts, monorepo structure
- [Bridge Module Spec](./bridge-module.md) — Complete AI assistant specification
- [Governance Module Spec](./governance-module.md) — Proposals & decisions implementation
- [Social Economy](./social-economy.md) — Support Points, timebanking, Social Horizon currency
- [Cooperation Paths](./cooperation-paths.md) — Full taxonomy with subcategories
- [CI/CD Discipline](./ci-cd-discipline.md) — Proof lines, validation workflows, contributor rules
- [Data Models](./data-models.md) — Core entities and relationships
