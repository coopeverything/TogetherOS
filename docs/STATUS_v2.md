# TogetherOS — Tech Status (v2)

This page tracks the **technology scope** of TogetherOS (what exists, what's next).
For timestamped progress updates, see: [STATUS/progress-log.md](../STATUS/progress-log.md)

> Percentages are rough, contributor-facing indicators. Update after merged PRs.  
> CI can target the HTML comments on each row for automated bumping.

---

## Core Modules — Governance Pipeline

These modules work together as a **unified governance pipeline**: from ideation to decision to execution to continuous improvement.

### Discussion Phase Modules

Ideas begin as informal discussions before becoming formal proposals.

| Module | Scope (what it covers) | Progress | Next milestone | Blockers / Notes |
| --- | --- | ---:| --- | --- |
| **Forum / Deliberation** | Structured discussion threads for deep deliberation, knowledge building, Q&A hub, idea bank, empathy-first moderation, consensus-building tools, conversion to proposals | <!-- progress:forum=100 --> 100% | Production-ready ✅ | PostgreSQL schema + CRUD ✅, Topic/Post/Reply system ✅, Empathy reactions ✅, Moderation queue ✅ |
| **Onboarding ("Bridge")** | Scenario intro, quick profile, "first tiny step", behavioral AI system with member states, 7-type memory, 5-phase decision loop, action palette, questionnaires API, educational content API | <!-- progress:onboarding=100 --> 100% | Production-ready ✅ | All features complete: Behavioral AI ✅, PostgreSQL OnboardingService ✅, 8-step UI wizard with RP rewards ✅, Progress tracking API ✅ |
| **Search & Tags** | Global search with filters, full-text search across proposals + forum topics + posts + profiles (Phase 1-3 ✅), cooperation path filtering, privacy-preserving query tracking, relevance scoring, saved searches, autocomplete | <!-- progress:search=100 --> 100% | Production-ready ✅ | All phases complete: Profile search ✅, Saved searches ✅, Autocomplete ✅, Search history API ✅ |
| **Feed** | Social media feed + native posts, multi-dimensional reactions, topic filtering, post composer (Phase 1-2 ✅), Bridge topic intelligence with AI suggestions, duplicate thread detection, topic-based feeds (Phase 3 ✅), community priorities map with privacy-safe aggregates (Phase 4 ✅), multi-dimensional rating system with reputation scores (Phase 5 ✅), evidence repository with viewpoint tagging and verification (Phase 6 ✅), sentiment visualization with bubble charts and trend lines (Phase 7 ✅), action recommendations with interest profiling (Phase 8 ✅), deliberation progression indicators and breadcrumb navigation (Phase 9 ✅) | <!-- progress:feed=100 --> 100% | Production-ready ✅ | All 9 phases complete: feed → deliberation pipeline fully implemented |

### Decision Phase Modules

Formal proposals, voting, and consent-based decision making.

| Module | Scope (what it covers) | Progress | Next milestone | Blockers / Notes |
| --- | --- | ---:| --- | --- |
| **Proposals & Decisions** | Proposal object, evidence/options, vote, review, minority reports, amendment process, consent-based governance | <!-- progress:governance=100 --> 100% | Production-ready ✅ | PostgreSQL repos ✅, API handlers ✅, UI CRUD ✅, SP allocation integration ✅ |
| **Support Points & Reputation** | Points bank, allocation per idea, badges, SP for governance power (only from contributions), RP for economic claims | <!-- progress:reputation=100 --> 100% | Production-ready ✅ | Full system: DB + API + ReputationService + badge awarding hooks in governance/forum + admin panel + RP balance/transactions API. |
| **Support Points & Reward Points UI** | SP wallet & allocation interface, RP dashboard with earnings tracker, RP → SP exchange at configurable rates, admin tracking panels | <!-- progress:support-points-ui=100 --> 100% | Production-ready ✅ | All phases complete: SP wallet ✅, allocation widget ✅, RP dashboard ✅, admin panels ✅ |
| **Moderation Transparency** | Quality-scored moderation with member ratings (1-5 stars), RP incentives tied to scores, 1-month rotating terms, public moderation log (members-only), coordinator queue with AI assistance, appeal system | <!-- progress:moderation-transparency=0 --> 0% | Flag entity + moderation queue | Spec complete (docs/modules/moderation-transparency.md), no code yet |

### Execution Phase Modules

Implementation, tracking, and accountability for approved decisions.

| Module | Scope (what it covers) | Progress | Next milestone | Blockers / Notes |
| --- | --- | ---:| --- | --- |
| **Admin Accountability** | Decision → implementation → verification pipeline, admin queue, settings classification (assembly vote vs admin discretion), NDJSON audit logs, recall mechanism, delivery reports | <!-- progress:admin-accountability=0 --> 0% | Initiative entity + conversion logic | Spec complete (docs/modules/admin-accountability.md), no code yet |
| **Events & Calendar** | Event management, milestone tracking, meeting scheduling, attendance tracking, auto-creation from initiatives, workgroup meetings, review sessions, RSVP management, meeting notes | <!-- progress:events=100 --> 100% | Production-ready ✅ | All features complete: PostgreSQL schema ✅, CRUD API ✅, calendar UI ✅, RSVP system ✅, recurring events ✅ |
| **Metrics & Review** | Success tracking, outcome measurement, evaluation scheduling, re-evaluation triggers, minority report validation, feedback loops, improvement proposal auto-generation, institutional learning | <!-- progress:metrics=0 --> 0% | Metrics definition + evaluation MVP | Spec complete (docs/modules/metrics.md), creates feedback loop to Governance |

### Foundation Modules

Infrastructure and core platform capabilities.

| Module | Scope (what it covers) | Progress | Next milestone | Blockers / Notes |
| --- | --- | ---:| --- | --- |
| **Monorepo & Scaffolding** | Next.js 14 app (`apps/web`), `packages/ui`, `packages/types`, `packages/validators`, `packages/db`, TypeScript project references, build scripts, 6 module placeholder pages, testing infrastructure (Vitest + React Testing Library), comprehensive docs | <!-- progress:scaffold=100 --> 100% | Production-ready ✅ | Phase 1 (nav/footer/errors/loading) ✅, Phase 2 (monorepo config/TS refs) ✅, Phase 3 (testing/docs) ✅, Phase 4 (@togetheros/db package) ✅ |
| **UI System** | Tailwind config, shadcn/ui, design tokens, layout primitives, icons | <!-- progress:ui=100 --> 100% | Production-ready ✅ | 25 components complete with dark mode |
| **Identity & Auth** | Sign up/in, sessions, roles, privacy (email/handle), email verification, password reset, Google OAuth | <!-- progress:auth=100 --> 100% | Production-ready ✅ | All features complete with security hardening + OAuth env vars documented |
| **Profiles** | Member cards, skills/tags, Path interests | <!-- progress:profiles=100 --> 100% | Production-ready ✅ | All core features complete |
| **Groups & Orgs** | Local groups, org records, federation handles | <!-- progress:groups=100 --> 100% | Production-ready ✅ | All core features complete |
| **Gamification** | Local community growth tracking, research-backed milestone thresholds (5, 15, 25, 50, 100, 150 members), progress visualization, 3D celebration animations, invitation reward mechanics (RP system), ethical design without dark patterns | <!-- progress:gamification=100 --> 100% | Production-ready ✅ | All phases complete: DB schema, invitation flow, onboarding with RP, daily challenges, first-week journey, admin settings, InviteStats, InviteButton, testing page |
| **Social Economy Primitives** | Mutual aid board, timebank, fair-marketplace, 4-ledger system (SP/RP/TBC/SH) | <!-- progress:social-economy=65 --> 65% | Member wallet pages, admin dashboards | TBC system complete: RP→TBC conversion ✅, service browser ✅, fair exchange index ✅. SH system complete: wallet API ✅, purchase events ✅, admin issuance cycles ✅. UI components ✅ |
| **Notifications & Inbox** | Mentions, proposal updates, reminders, preferences management, email digest settings, push notification controls | <!-- progress:notifications=100 --> 100% | Production-ready ✅ | All features complete: PostgreSQL schema ✅, preferences API ✅, settings UI ✅, filtering ✅, mark-as-read ✅ |
| **Docs Site Hooks** | Links from app → docs canon | <!-- progress:docs-hooks=60 --> 60% | Integrate more doc links in app UI | Stable doc routes |
| **Observability** | Self-hosted error/perf logging with PII sanitization, alert manager (Discord/Slack), Prometheus metrics API, monitoring UI, comprehensive test suite, Docker stack ready (Uptime Kuma, Grafana, Loki), APM distributed tracing, contract testing, feature flags, canary deployment, log aggregation, advanced dashboard | <!-- progress:observability=100 --> 100% | Production-ready ✅ | All phases complete - full observability stack |
| **Security & Privacy** | Rate limiting, CSRF protection, security headers (CSP/HSTS), GDPR compliance (data export/deletion), cookie consent, input sanitization, PII redaction, IP hashing, CodeQL scanning, Dependabot | <!-- progress:security=100 --> 100% | Production-ready ✅ | All phases complete: Global rate limiting ✅, Security headers ✅, GDPR endpoints ✅, Cookie consent ✅, Admin dashboard ✅ |

---

## Path-Scoped Tech (initial placeholders)

| Path | Tech focus | Progress | Next milestone |
| --- | --- | ---:| --- |
| **Collaborative Education** | Cohorts, skill trees, lesson runner | <!-- progress:path-education=0 --> 0% | Lesson page template |
| **Collective Governance** | Proposal flow, ballots, reviews | <!-- progress:path-governance=0 --> 0% | Minimal vote UI |
| **Community Connection** | Map/list of groups & events | <!-- progress:path-community=0 --> 0% | Group directory MVP |
| **Collaborative Media & Culture** | Media posts, showcases | <!-- progress:path-media=0 --> 0% | Gallery component |
| **Common Wellbeing** | Peer support board templates | <!-- progress:path-wellbeing=0 --> 0% | Template form |
| **Social Economy** | Mutual aid / marketplace views | <!-- progress:path-economy=0 --> 0% | Listing cards |
| **Cooperative Technology** | OSS integrations, dev tools | <!-- progress:path-technology=0 --> 0% | Dev-container polish |
| **Common Planet** | Project cards w/ metrics | <!-- progress:path-planet=0 --> 0% | Impact metric stub |

---

## DevEx, CI/CD & Environments

| Area | What’s included | Progress | Next milestone |
| --- | --- | ---:| --- |
| **Dev-container** | VS Code, Node, pnpm, lint, compose | <!-- progress:devcontainer=30 --> 30% | Complete devcontainer setup with all tools |
| **CI Lint** | `yamllint`, `actionlint`, path-ignore for .md | <!-- progress:ci-lint=70 --> 70% | Refine linting rules, add more checks |
| **CI Docs** | `markdownlint-cli2`, `lychee` | <!-- progress:ci-docs=80 --> 80% | Fix remaining doc issues, tighten rules |
| **CI Smoke** | `scripts/validate.sh` proof lines | <!-- progress:ci-smoke=60 --> 60% | Expand smoke test coverage |
| **Deploy** | `deploy.yml`, rsync to VPS, compose restart, React 18/19 peer deps support, npm install --legacy-peer-deps CI fix | <!-- progress:deploy=80 --> 80% | Add staging environment |
| **Secrets** | Names only in repo, values in GH | <!-- progress:secrets=50 --> 50% | Audit all secrets, implement secrets management |

---

## Status Notes

- This doc is **tech-scope only** (modules & delivery).  
- “Progress” is a public signal for contributors; bump after merged PRs.  
- If a module needs its own status page, link it from here.

---

## How to update

1. Make a tiny change (one module row or one % bump).  
2. Update the table cell and (optionally) the HTML comment marker.  
3. Commit with `docs(status): bump <module> to X%` and include proof lines in PR body:

LINT=OK  
VALIDATORS=GREEN  
SMOKE=OK  

4. After merge, post a short note in Discussions #88 if it affects onboarding.

— End of Tech Status —

