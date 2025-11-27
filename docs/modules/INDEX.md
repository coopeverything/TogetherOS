# TogetherOS — Modules Hub

This hub lists all platform modules with links to specs, active increments, and current progress.

> Update this index whenever a module page is added or renamed.

Each module keeps tiny public metrics or proof-lines (e.g., dashboards or `LINT=OK`, `VALIDATORS=GREEN`, `SMOKE=OK`) so progress stays visible across the repo.

## Core Modules

- **Monorepo & Scaffolding** — Project infrastructure and build system (100% complete — production-ready ✅) ([source](https://github.com/coopeverything/TogetherOS/blob/main/docs/PACKAGES.md))
- **UI System** — Shared component library (100% complete — 25 components with dark mode ✅) ([docs](./ui/README.md))
- **Identity & Auth** — User identity management (100% complete — OAuth + email verification ✅)
- **Profiles** — Member profiles and contribution history (100% complete — production-ready ✅)
- [Groups & Orgs](./groups.md) — Community self-organization with transparent governance (100% complete — production-ready ✅)
- [Feed](./feed.md) — Social media feed with imported content, multi-dimensional reactions, discussion initiation, all 9 phases complete (100% complete — production-ready ✅)
- [Gamification](./gamification.md) — Local community growth tracking, milestone celebrations, invitation rewards, daily challenges, first-week journey (100% complete — production-ready ✅)
- [Forum / Deliberation](./forum.md) — Structured discussion threads for deep deliberation, topic/post/reply system, empathy reactions (100% complete — production-ready ✅)
- [Proposals & Decisions (Governance)](./governance.md) — Transparent proposal creation and consent-based decision making (100% complete — production-ready ✅)
- [Social Economy Primitives](./social-economy.md) — Support Points, timebanking, and cooperative treasury (0% — spec only)
- **Support Points & Reputation** — Fair contribution recognition system (45% complete — backend complete, UI pending)
- **Onboarding ("Bridge")** — Behavioral AI system with member states, decision loop, action palette, 8-step wizard with RP rewards (100% complete — production-ready ✅)
- [Bridge — Internal pilot (core team only)](./bridge/landing-pilot.md) — AI assistant providing conversational Q&A
  - [Full Bridge Specification](./bridge.md)
- [Search & Tags](./search.md) — Global search with path/keyword filters, full-text search across proposals + forum topics + posts (85% complete — Phase 1-2 complete, production-verified)
- **Notifications & Inbox** — Real-time notifications and updates (65% complete — MVP with 6 endpoints + 3 UI components ✅)
- **Docs Site Hooks** — Documentation integration (60% complete — stable doc routes)
- [Observability](./observability.md) — Platform health monitoring and error tracking (100% complete — full observability stack ✅)
- [Security & Privacy](./security.md) — Privacy-first architecture with audit logs (30% complete — threat model checklist)
- [Admin Accountability](./admin-accountability.md) — Decision implementation tracking with cooperative safeguards (0% — spec only)
- [Support Points & Reward Points UI](./support-points-ui.md) — Member-facing SP allocation + RP dashboard + admin panels (100% — production-ready ✅)
- [Moderation Transparency](./moderation-transparency.md) — Quality-scored moderation with RP incentives (0% — spec only)

## Knowledge Base (Comprehensive Specs)

For detailed implementation guides and architecture patterns, see:

- [Main Knowledge Base](https://github.com/coopeverything/TogetherOS/blob/main/.claude/knowledge/togetheros-kb.md) — Core identity and workflow
- [Tech Stack](../tech-stack.md) — Framework versions, dependencies, tooling
- [Architecture Patterns](../architecture.md) — Data models, API contracts, monorepo structure
- [Bridge Module](./bridge.md) — Complete AI assistant specification
- [Governance Module](./governance.md) — Proposals & decisions implementation
- [Social Economy](./social-economy.md) — Support Points, timebanking, Social Horizon currency
- [Cooperation Paths](../cooperation-paths.md) — Full taxonomy with subcategories
- [CI/CD Discipline](https://github.com/coopeverything/TogetherOS/blob/main/.claude/knowledge/ci-cd-discipline.md) — Proof lines, validation workflows
- [Data Models](../data-models.md) — Core entities and relationships

## How we build

- **Branches:** `feature/<topic>` from `yolo` (one tiny change per PR).
- **Issues:** use the **Increment** template; label `module:`, `type:increment`, and `size:S|M|L`.
- **Status:** authoritative overview lives in [../STATUS_v2.md](../STATUS_v2.md); each module page shows its own `Progress: X%`.
- **Definition of Done (DoD):** code merged + docs updated (this hub or module page) + proofs in PR body: `LINT=OK` `VALIDATORS=GREEN` `SMOKE=OK`.
