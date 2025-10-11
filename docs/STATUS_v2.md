# TogetherOS — Tech Status (v2)

This page tracks the **technology scope** of TogetherOS (what exists, what’s next).  
For the append-only activity log, see: [STATUS/What_we_finished_What_is_left_v2.txt](../STATUS/What_we_finished_What_is_left_v2.txt)

> Percentages are rough, contributor-facing indicators. Update after merged PRs.  
> CI can target the HTML comments on each row for automated bumping.

---

## Core Modules (Platform)

| Module | Scope (what it covers) | Progress | Next milestone | Blockers / Notes |
| --- | --- | ---:| --- | --- |
| **Monorepo & Scaffolding** | Next.js 14 app (`apps/frontend`), `packages/ui`, scripts, basic pages/routes | <!-- progress:scaffold=0 --> 0% | Create baseline app shell, healthy dev server | Decide base nav + placeholder pages |
| **UI System** | Tailwind config, shadcn/ui, design tokens, layout primitives, icons | <!-- progress:ui=0 --> 0% | Install shadcn/ui, set base typography + colors | Choose token naming + dark mode rule |
| **Identity & Auth** | Sign up/in, sessions, roles, privacy (email/handle) | <!-- progress:auth=0 --> 0% | Wire provider (e.g., NextAuth or custom) | Secret storage & provider choice |
| **Profiles** | Member cards, skills/tags, Path interests | <!-- progress:profiles=0 --> 0% | Minimal profile view/edit | Data model for tags/keywords |
| **Groups & Orgs** | Local groups, org records, federation handles | <!-- progress:groups=0 --> 0% | Create/join group MVP | Federation design (IDs/claims) |
| **Forum / Deliberation** | Topics, posts, summarization hooks, empathy tools | <!-- progress:forum=0 --> 0% | Topic list + post composer MVP | Storage schema + moderation rules |
| **Proposals & Decisions** | Proposal object, evidence/options, vote, review | <!-- progress:governance=0 --> 0% | Proposal create/read MVP | Ballot types + quorum rules |
| **Social Economy Primitives** | Mutual aid board, timebank, fair-marketplace | <!-- progress:social-economy=0 --> 0% | Mutual aid request/fulfill MVP | No payments yet (display only) |
| **Support Points & Reputation** | Points bank, allocation per idea, badges | <!-- progress:reputation=0 --> 0% | 100-point wallet + allocate UI | Abuse caps; per-idea limit logic |
| **Onboarding (“Bridge”)** | Scenario intro, quick profile, “first tiny step” | <!-- progress:onboarding=0 --> 0% | 3-step onboarding flow | Content copy + gating toggles |
| **Search & Tags** | Global search, Path/keyword filters | <!-- progress:search=0 --> 0% | Tag facet filter on lists | Index choice (client/server) |
| **Notifications & Inbox** | Mentions, proposal updates, reminders | <!-- progress:notifications=0 --> 0% | In-app toasts + inbox page | Source events & digest batching |
| **Docs Site Hooks** | Links from app → docs canon | <!-- progress:docs-hooks=0 --> 0% | Surface docs/OPERATIONS.md & CI playbook | Stable doc routes |
| **Observability** | Basic logs, error boundary, uptime ping | <!-- progress:observability=0 --> 0% | Error boundary + simple tracker | Choose provider (self/3rd-party) |
| **Security & Privacy** | Least-privilege tokens, PII handling, audit flags | <!-- progress:security=0 --> 0% | Secrets layout + no-PII logs | Threat model checklist |

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
| **Dev-container** | VS Code, Node, pnpm, lint, compose | <!-- progress:devcontainer=0 --> 0% | Add base `devcontainer.json` |
| **CI Lint** | `yamllint`, `actionlint`, path-ignore for .md | <!-- progress:ci-lint=0 --> 0% | Ensure `.github/workflows/ci_lint.yml` present |
| **CI Docs** | `markdownlint-cli2`, `lychee` | <!-- progress:ci-docs=0 --> 0% | Fix rules so new docs pass |
| **CI Smoke** | `scripts/validate.sh` proof lines | <!-- progress:ci-smoke=0 --> 0% | Add minimal validator script |
| **Deploy** | `deploy.yml`, rsync to VPS, compose restart | <!-- progress:deploy=0 --> 0% | Dry-run to staging |
| **Secrets** | Names only in repo, values in GH | <!-- progress:secrets=0 --> 0% | Verify `SSH_PRIVATE_KEY`, `VPS_HOST`, `VPS_USER`, `VPS_PATH` |

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

