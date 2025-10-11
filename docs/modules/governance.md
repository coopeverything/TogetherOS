# Proposals & Decisions (Governance)

**Scope:** Create, deliberate, and decide on proposals with transparent rules and lightweight, testable flows.  
**Owner(s):** @coopeverything-core  
**Labels:** `module:governance`

## Status
Progress: <!-- progress:governance=0 --> 0%  
Next milestone: Submit a minimal proposal and see it in a list.  
Blockers/Notes: none

## Why this exists
Members must be able to turn ideas into proposals, discuss them, and make decisions. We ship a thin vertical slice first so contributors can see end-to-end value quickly: submit → list → view details (voting later).

## MVP slices (order)
1. **Proposal create (API + domain)**
   - **acceptance:**
     - `POST /api/proposals` validates with Zod (`title`, `summary`, `authorId`, `createdAt`).
     - Stores to in-memory/fixture repo; returns `201` with `{id}`.
     - Unit test covers happy path + validation errors.
2. **Proposal list (UI)**
   - **acceptance:**
     - Route `/governance` lists `title`, `author`, `createdAt`.
     - Empty state, loading skeleton, and generic error are present.
     - Storybook story for `<ProposalList />` with empty/loaded states.
3. **Proposal details (UI + API)**
   - **acceptance:**
     - `/governance/[id]` shows `title`, `summary`, timestamps.
     - 404 guarded (invalid id).
     - Contract test for `GET /api/proposals/:id` with Zod parsing.
4. **Seed & fixtures (ops)**
   - **acceptance:**
     - `packages/governance-fixtures/seed.ts` adds 3 demo proposals.
     - `pnpm -w seed:governance` runs and logs inserted ids.
     - Proof-line in `scripts/validate.sh` confirms seeds runnable.

## Code map
- `apps/frontend/app/(modules)/governance/*` (routes, server actions, tests)
- `packages/governance-domain/*` (entities, repo interfaces, unit tests)
- `packages/governance-api/*` (REST handlers, Zod contracts)
- `packages/governance-ui/*` (components, Storybook stories)
- `packages/governance-fixtures/*` (seed data, demo JSON)

## UI contract (brief)
- `/governance` → `<ProposalList />` (state: `proposals[]`)
- `/governance/[id]` → `<ProposalView />` (state: `proposal | 404`)
- States required on both pages: **empty**, **loading**, **error**.

## Done → Tell the story (DoD)
- Tests or manual steps verified (list loads, details render, create works).
- Docs updated (this page + link in `docs/modules/INDEX.md` already present).
- Proofs in PR body:  
LINT=OK  
VALIDATORS=GREEN  
SMOKE=OK  
