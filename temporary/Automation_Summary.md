# Automation Summary — Temporary Phase

This document captures **automation-related changes** during the setup and early deployment
phase of the DDP project. It is temporary and will be merged into permanent docs (e.g. `OPERATIONS.md`)
once stabilized.

---

## CI/CD Adjustments

- ✅ CI baseline: GREEN (sanity + smoke tests pass).
- CI updated to skip npm/yarn installs if no `package.json` exists at the repo root.
- Added deploy workflow (`.github/workflows/deploy.yml`):
  - Uses `rsync` to push to VPS when PR label **staging-ok** is applied.

---

## Deploy Automation

- Added `scripts/redeploy-frontend.sh` on VPS:
  - Rebuilds with `--no-cache`
  - Restarts container
  - Prints stylesheet URLs
  - Fetches CSS and greps for `.signup` + layout rules
- GitHub Actions Deploy secrets (set in repo settings):
  - `SSH_PRIVATE_KEY` → local `G:\AI-Project\ssh_keys\id_ed25519`
  - `VPS_HOST = continentjump`
  - `VPS_USER = platform`
  - `VPS_PATH = /home/platform/htdocs/platform.local/frontend`

---

## Stylesheet Certainty Checks

- CI step: verify `/signup` HTML includes a Next.js CSS link.
- Automated fetch/grep to confirm `.signup` rules (`100dvh`, `hero-title`, etc.) are present.
- `scripts/smoke.sh` runs in CI for repo health.

---

## Repo & Folder Structure Updates

- New monorepo layout: `apps/frontend`, `packages/ui`, `scripts/`, `.github/workflows/`.
- `docs/` folder includes `OPERATIONS.md` (deploy & CSS update playbook).
- Frontend: Next.js 14 + Tailwind v4 with `postcss` plugin.
- Local dev root: `G:\AI-Project\ddp-on-vps`.
- VPS runtime root: `/home/platform/htdocs/platform.local/frontend`.

---

## Security & Permissions

- `/root/ddp.env` mounted via `env_file` (root-only read, 0600).
- SSH keys configured for both `root` and `platform` users.
- App source owned by deploy user; Docker group runs Compose.

---

## Observability

- Health probes: `/api/health`, `/api/dbcheck` for uptime monitoring.
- Error boundaries + incident IDs for 404/500 pages.

---

## Next Automation Milestones (not yet complete)

- Members directory + profiles.
- Proposals MVP (create, discuss, vote).
- Support Points ledger + allocation UI.
- Email delivery (magic links/confirmations).
- i18n and locale frameworks.

---

## Corrections to Previous Notes

- Deploy workflow is **added but pending secrets** (not yet complete).
- Stylesheet verification exists in both CI *and* VPS redeploy script.
- CSS playbook stored in both `OPERATIONS.md` and `redeploy-frontend.sh`.

---

**Status:** Temporary document. To be merged into `OPERATIONS.md` once processes stabilize.
