# Agent Task Lane — Exploratory Plan

**Goal:** Run small, verified PRs via an Agent task template, gated by a new required check: `agent-pr-checks`.

---

## Step 1 — Add four files (this doc included)
Paths:
- `docs/automation/DDP_Agent_Task_Exploratory.txt`
- `docs/automation/AGENT_TASK_EXPLORATORY_PLAN.md`
- `.github/ISSUE_TEMPLATE/agent-task.yml`
- `.github/workflows/agent-pr-checks.yml`

**Proof after commit (Checks → job):**
`PROOF: AGENT_PR_CHECKS=OK`

## Step 2 — Add the required status check
GitHub → Repo → Settings → Branches → Protect `main` → Require status checks → add `agent-pr-checks`.

**Proof:** Protection page lists `agent-pr-checks` as required.

## Step 3 — Run one live Agent task
Open an Issue using “Agent task” template.

**Goal:** Scaffold `/proposals` page + add nav link.  
**Scope allowlist:** `apps/frontend/*, codex/*`  
**Done / Checks:** Require `agent-pr-checks` green; proof-line: `PROOF: PROPOSALS_PAGE=OK` from smoke.

**Proof in PR Checks:**
`PROOF: ACTIONLINT=OK`, `PROOF: YAMLLINT=OK`, `PROOF: SMOKE=OK`, `PROOF: AGENT_PR_CHECKS=OK`  
Files changed only within allowlist.

## Step 4 — Update knowledge (docs-first)
Update `DDP_Knowledge_*` and `DDP_OPS_CHATGPT_PROJECT_KNOWLEDGE_*`:
- Document Agent task lane, two-lanes rule, Issue template fields, proof-lines, required status name `agent-pr-checks`.

Append to **DISCIPLINE**:
> Agent PRs must include proof-lines from actionlint/yamllint/smoke and touch only the per-Issue allowlist. Reviewer must verify the proof-lines and scope before merge.

**Proof:** New versions committed; any future workflow changes must update these docs.

## Step 5 — Promote to standard (after 2–3 tasks)
- Remove “Exploratory” from titles; fold into `OPERATIONS.md`.
- **Proof:** Changelog note `AGENT_LANE=STANDARD`.
