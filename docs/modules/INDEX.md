# TogetherOS — Modules Hub

This hub lists all platform modules with links to specs, active increments, and current progress.

> Update this index whenever a module page is added or renamed.

Each module keeps tiny public metrics or proof-lines (e.g., dashboards or `LINT=OK`, `VALIDATORS=GREEN`, `SMOKE=OK`) so progress stays visible across the repo.

## Core Modules

- **Monorepo & Scaffolding** — Project infrastructure and build system ([source](https://github.com/coopeverything/TogetherOS/blob/main/docs/PACKAGES.md))
- **UI System** — Shared component library ([docs](./ui/README.md))
- **Identity & Auth** — User identity management (planned)
- **Profiles** — Member profiles and contribution history (planned)
- [Groups & Orgs](./groups.md) — Community self-organization with transparent governance
- [Feed](./feed.md) — Social media feed with imported content, multi-dimensional reactions, and discussion initiation (Phase 1: 40% complete)
- [Gamification](./gamification.md) — Local community growth tracking, milestone celebrations, invitation rewards (15% complete — spec only)
- [Forum / Deliberation](./forum.md) — Structured discussion threads for deep deliberation (Feed discussions flow here)
- [Proposals & Decisions (Governance)](./governance.md) — Transparent proposal creation and consent-based decision making
- [Social Economy Primitives](./social-economy.md) — Support Points, timebanking, and cooperative treasury
- **Support Points & Reputation** — Fair contribution recognition system (planned)
- **Onboarding** — Guided introduction to TogetherOS principles (planned)
- [Bridge — Internal pilot (core team only)](./bridge/landing-pilot.md) — AI assistant providing conversational Q&A
  - [Full Bridge Specification](./bridge.md)
- [Search & Tags](./search.md) — Global search with path/keyword filters and topic discovery (50% complete — Phase 1 foundation)
- **Notifications & Inbox** — Real-time notifications and updates (planned)
- **Docs Site Hooks** — Documentation integration (planned)
- [Observability](./observability.md) — Platform health monitoring and error tracking (40% complete — Phase 1.5: self-hosted stack ready)
- [Security & Privacy](./security.md) — Privacy-first architecture with audit logs
- [Admin Accountability](./admin-accountability.md) — Decision implementation tracking with cooperative safeguards (0% — spec only)
- [Support Points & Reward Points UI](./support-points-ui.md) — Member-facing SP allocation + RP → SP exchange (35% — Phase 1 complete)
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

- **Branches:** `feature/<topic>` from `main` (one tiny change per PR).
- **Issues:** use the **Increment** template; label `module:`, `type:increment`, and `size:S|M|L`.
- **Status:** authoritative overview lives in [../STATUS_v2.md](../STATUS_v2.md); each module page shows its own `Progress: X%`.
- **Definition of Done (DoD):** code merged + docs updated (this hub or module page) + proofs in PR body: `LINT=OK` `VALIDATORS=GREEN` `SMOKE=OK`.
