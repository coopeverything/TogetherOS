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
3. **Proof lines required:** Every PR must include `TESTS=OK` (yolo) or `LINT=OK SMOKE=OK TESTS=OK` (main)
4. **One change per PR:** No bundling unrelated work
5. **Path labels mandatory:** All issues/PRs tagged with 1 of 8 Cooperation Paths

### Repository Link Convention

When linking to files: Always use `yolo` branch, format: `https://github.com/coopeverything/TogetherOS/blob/yolo/{filepath}`

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

## Error Prevention Protocols

For detailed error prevention protocols, see: `.claude/knowledge/error-learnings.md`

| Code | Summary |
|------|---------|
| err-005 | UX fix verification - trace to exact source before fixing |
| err-008 | Theme implementation - update ALL components, not just CSS vars |
| err-011 | Path alias restructuring - map dependency graph BEFORE changes |
| err-012 | SQL table names - verify with `\dt` before assuming |
| err-013 | SQL table structure - check for discriminator columns |
| err-014 | SQL type casting - verify column types before comparisons |

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
4. **Run validation:** `npm test` (required), `./scripts/validate.sh` (recommended)
5. **Open PR** with proof lines, path label, files touched
6. **After merge:** Update `docs/STATUS_v2.md` if progress changed

### Branch Naming

- **Feature branches:** `feature/<short-topic>`
- **Docs branches:** `docs/<short-topic>`
- **Claude sessions:** `claude/{module}-{sessionId}` (must start with `claude/` and end with session ID)

### Git Push

- Always use `git push -u origin <branch-name>`
- Branch must match naming convention or push fails with 403
- Retry on network errors: Up to 4 retries with exponential backoff

---

## Key File Locations

### Documentation
- **Vision:** `docs/Manifesto.md`
- **Architecture:** `docs/TogetherOS_WhitePaper.md`
- **Module specs:** `docs/modules/{module}.md`
- **Status tracking:** `docs/STATUS_v2.md`

### Taxonomy
- **Machine-readable:** `codex/taxonomy/CATEGORY_TREE.json`
- **Human-readable:** `docs/TogetherOS_CATEGORIES_AND_KEYWORDS.md`

### Scripts & CI
- **Main validator:** `scripts/validate.sh`
- **Workflows:** `.github/workflows/`

---

## Architecture Patterns

### Domain-Driven Structure
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

### Federation-Ready
- **Group handles:** Inter-group protocols
- **Local autonomy:** Per-group data silos with opt-in federation
- **Proposal sync:** Cross-group initiatives with result mirroring

---

## Success Metrics

### For Bridge (AI Assistant)
- Time-to-first-useful-answer (p95) < 800ms
- Citation coverage = 100%
- Trust index: >= 70% "helpful" ratings

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

```bash
# Validate repo health
./scripts/validate.sh

# Run tests (required before commit)
npm test

# Type check
npx tsc --noEmit

# Create feature branch
git checkout -b feature/bridge-qa-endpoint

# Push with upstream tracking
git push -u origin <branch-name>
```

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
3. **Always run tests before commit** — `npm test` must pass
4. **Update STATUS_v2.md after changes** — Bump progress markers using HTML comments
5. **All PRs need Path labels** — Use canonical names from CATEGORY_TREE.json
6. **Notion UUID errors are expected** — Claude Code bug (issue #5504); simply retry

---

## TypeScript Critical Rules

For complete TypeScript verification workflow, see: `.claude/workflows/typescript-verification.md`

### Non-Negotiable

1. **Browser APIs in apps/web/ only** — NO localStorage, window, document in `apps/api/`
2. **Use `export type` for interfaces** — Required by `isolatedModules: true`
3. **Package aliases for monorepo imports** — Use `@togetheros/*`, never relative paths to packages

### Configuration

- `moduleResolution: "bundler"` (not "node16")
- `isolatedModules: true` (Next.js requirement)
- TypeScript 5.9.3

### Path Aliases (Current Pattern)

```typescript
// apps/web/tsconfig.json
"@/lib/*": ["../../lib/*"],      // Shared utilities (root lib/)
"@web/*": ["./lib/*"],           // Web-specific (apps/web/lib/)
```

### Accepted Limitations

- `lib/db` has 2 TypeScript errors (composite project constraints)
- Runtime works correctly; use force deploy if needed
- Future fix: Create `@togetheros/lib` package

---

## Infrastructure & Recovery

For production incidents and recovery procedures, see: `.claude/knowledge/infrastructure-incidents.md`

**Quick recovery (if site 502):**
```bash
ssh root@72.60.27.167 "cd /var/www/togetheros/apps/web && npm run build && pm2 restart togetheros"
curl https://coopeverything.org/api/health
```

---

## Related KB Files

- [Error Learnings](./error-learnings.md) — err-XXX codes, session references, mistake prevention
- [Infrastructure Incidents](./infrastructure-incidents.md) — Production outages, recovery procedures
- [CI/CD Discipline](./ci-cd-discipline.md) — Proof lines, validation workflows, contributor rules
- [TypeScript Workflow](../workflows/typescript-verification.md) — Pre-flight checklist, verification steps
