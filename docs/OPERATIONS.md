# Operations Playbook (Deploy & Secrets)
_Last updated: 2025-09-24_

**Purpose:** This file tells you exactly what to click for deploys and what secrets we need.  
CI proof-lines and validators live in the root **`OPERATIONS.md`** (Path A). This page is only about **deploy & secrets**.

---

## 1) Where temporary notes live
We keep short-lived notes in `/temporary`. They will be merged or deleted later.

- [Automation_Summary.md](../temporary/Automation_Summary.md)
- [DEPLOY_TEST.md](../temporary/DEPLOY_TEST.md)

---

## 2) Repository secrets (production & preview)

**Location in GitHub UI:**  
Repo → **Settings** → **Secrets and variables** → **Actions** → **Repository secrets**

**Must exist (production deploy):**
- `SSH_PRIVATE_KEY` — used by Actions to SSH to the VPS
- `VPS_HOST` — VPS hostname (e.g., `example.yourdomain.tld`)
- `VPS_USER` — deploy user on the VPS
- `VPS_PATH` — target path on the VPS (e.g., `/srv/ddp`)

**Optional (preview/apps):**
- `OPENAI_API_KEY`
- `PREVIEW_BASE_PORT`
- `VPS_IP` — only if you bypass DNS

**Rules:**
- Secret **names must match exactly** (copy/paste them).
- **Never** echo secret values in logs.

---

## 3) What our deploy pipeline does (Codex/Copilot compatible)
**Files involved:**
- `.github/workflows/deploy.yml`
- `scripts/Get-GitSlugBranch.ps1`
- `scripts/Get-GitUrls.ps1`

**Triggers:**
- Manual: `workflow_dispatch`
- Auto: `push` to `main` (scoped to `apps/frontend`)
- PRs: label `staging-ok`

**High level steps:**
1. Sync `./apps/frontend` to the VPS via `rsync`.
2. Run `./redeploy-frontend.sh` on the VPS (rebuild/restart containers).
3. Confirm app is up (containers) and CSS renders.

---

## 4) How YOU run a deploy (step-by-step, no coding)

### A) Manual deploy from the Actions tab
1. Repo → **Actions** → choose **Deploy** workflow.
2. Click **Run workflow** → Branch: `main` → **Run workflow**.
3. Open the run → wait for green.
4. When it’s green, confirm on VPS:
   - `ssh <VPS_USER>@<VPS_HOST>`
   - `docker compose ps` → containers should be `Up`
5. In the browser, open your site (e.g., `/signup`) to confirm CSS changes visible.

### B) Auto deploy on `push` to `main` (apps/frontend only)
- If you commit/merge a change under `apps/frontend`, the workflow runs automatically.
- Verify the same way (Actions run → VPS containers → page check).

### C) Deploy a PR to staging (optional)
1. Open the PR.
2. Add label **`staging-ok`**.
3. Open **Actions** → find the run for this PR → wait for green.
4. Verify on the preview endpoint if configured (port from `PREVIEW_BASE_PORT`).

---

## 5) Quick troubleshooting (plain-English)

- **Action fails on SSH**  
  Check `SSH_PRIVATE_KEY`, `VPS_HOST`, `VPS_USER`, `VPS_PATH` exist in **Repository secrets** and are spelled exactly.
- **Sync path is wrong**  
  Confirm `VPS_PATH` folder exists on VPS and your deploy user owns it:  
  `ssh <user>@<host>`, then `ls -la /the/path` and `whoami`.
- **Containers didn’t come up**  
  `ssh` into server → `docker compose ps` → if not `Up`, run `docker compose logs -n 100` to read the last lines.
- **No “Deploy” workflow in Actions**  
  The file `.github/workflows/deploy.yml` might be missing or disabled on your branch. Open the file in **Code** tab to confirm it exists on `main`.

---

## 6) Roles with Codex (later)
When enabling Codex to open branches/PRs:
- Add a fine-grained PAT as repo secret: `CODEX_GH_PAT` (scopes: Contents, Pull requests, Actions).
- Codex will use our existing CI rails (see root `OPERATIONS.md`) and this playbook for deploys.

---

## 7) What to tell someone who’s new (one screen)
- Deploy button lives in **Actions → Deploy → Run workflow (main)**.
- Required secrets: `SSH_PRIVATE_KEY`, `VPS_HOST`, `VPS_USER`, `VPS_PATH`.
- After green, `ssh` to server → `docker compose ps` should be `Up`.
- Root **`OPERATIONS.md`** = CI proof-lines.  
  This **`docs/OPERATIONS.md`** = Deploy & Secrets Playbook.

---
