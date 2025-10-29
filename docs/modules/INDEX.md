# TogetherOS — Modules Hub

This hub lists all platform modules with links to specs, active increments, and current progress.

> Update this index whenever a module page is added or renamed.

Each module keeps tiny public metrics or proof-lines (e.g., dashboards or `LINT=OK`, `VALIDATORS=GREEN`, `SMOKE=OK`) so progress stays visible across the repo.

## Core Modules

- [Monorepo & Scaffolding](./scaffold.md)
- [UI System](./ui.md)
- [Identity & Auth](./auth.md)
- [Profiles](./profiles.md)
- [Groups & Orgs](./groups.md)
- [Forum / Deliberation](./forum.md)
- [Proposals & Decisions (Governance)](../../governance.md)
- [Social Economy Primitives](modules/social-economy.md)
- [Support Points & Reputation](./reputation.md)
- [Onboarding](./onboarding.md)
- [Bridge — Internal pilot (core team only)](./bridge/landing-pilot.md)
  - [Full Bridge Specification](../../bridge.md)
- [Search & Tags](./search.md)
- [Notifications & Inbox](./notifications.md)
- [Docs Site Hooks](./docs-hooks.md)
- [Observability](./observability.md)
- [Security & Privacy](./security.md)

## Knowledge Base (Comprehensive Specs)

For detailed implementation guides and architecture patterns, see:

- [Main Knowledge Base](../../.claude/knowledge/togetheros-kb.md) — Core identity and workflow
- [Tech Stack](../.tech-stack.md) — Framework versions, dependencies, tooling
- [Architecture Patterns](../.architecture.md) — Data models, API contracts, monorepo structure
- [Bridge Module](../../bridge.md) — Complete AI assistant specification
- [Governance Module](../../governance.md) — Proposals & decisions implementation
- [Social Economy](../.modules/social-economy.md) — Support Points, timebanking, Social Horizon currency
- [Cooperation Paths](../../.cooperation-paths.md) — Full taxonomy with subcategories
- [CI/CD Discipline](../../.claude/knowledge/ci-cd-discipline.md) — Proof lines, validation workflows
- [Data Models](../../.data-models.md) — Core entities and relationships

## How we build

- **Branches:** `feature/<topic>` from `main` (one tiny change per PR).
- **Issues:** use the **Increment** template; label `module:`, `type:increment`, and `size:S|M|L`.
- **Status:** authoritative overview lives in [../STATUS_v2.md](../STATUS_v2.md); each module page shows its own `Progress: X%`.
- **Definition of Done (DoD):** code merged + docs updated (this hub or module page) + proofs in PR body: `LINT=OK` `VALIDATORS=GREEN` `SMOKE=OK`.
