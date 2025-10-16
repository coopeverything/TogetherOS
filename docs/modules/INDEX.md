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
- [Proposals & Decisions (Governance)](./governance.md)
- [Social Economy Primitives](./social-economy.md)
- [Support Points & Reputation](./reputation.md)
- [Onboarding](./onboarding.md)
- [Bridge — Internal pilot (core team only)](./bridge/landing-pilot.md)
- [Search & Tags](./search.md)
- [Notifications & Inbox](./notifications.md)
- [Docs Site Hooks](./docs-hooks.md)
- [Observability](./observability.md)
- [Security & Privacy](./security.md)

## How we build
- **Branches:** `feature/-` from `main` (one tiny change per PR).
- **Issues:** use the **Increment** template; label `module:`, `type:increment`, and `size:S|M|L`.
- **Status:** authoritative overview lives in [../STATUS_v2.md](../STATUS_v2.md); each module page shows its own `Progress: X%`.
- **Definition of Done (DoD):** code merged → docs updated (this hub or module page) → proofs in PR body: `LINT=OK` `VALIDATORS=GREEN` `SMOKE=OK`.
