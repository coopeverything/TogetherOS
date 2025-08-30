# DDP Tech Roadmap

## Technical Stack (current)
- Frontend: Next.js 14 (pages router), React 18, Tailwind CSS v4 + @tailwindcss/postcss.
- Runtime: Docker, Docker Compose; debian-based node image.
- Env: /root/ddp.env loaded via compose `env_file` (no plaintext secrets in repo).

## Status Update (Automation)
- CI baseline: GREEN (sanity + smoke).
- CI adjusted to skip installs if no package.json at repo root.
- Deploy workflow added (pending secrets).

## Immediate Milestones (Weeks 1–4)
1. Signup Experience
   - Finish responsive layout and accessibility polish.
   - Client validations; enable Submit only when terms checked.
   - POST /api/users; on success → /members.
   - Hook up OAuth providers (Google, GitHub first).

2. “Stylesheet Certainty” Playbook
   - CI step: verify `/signup` HTML contains `/_next/static/css/*.css` link.
   - Fetch compiled CSS and assert presence of `.signup` rules (100dvh, hero-title).
   - Provide a `scripts/redeploy-frontend.sh` that rebuilds with `--no-cache`, restarts,
     prints stylesheet URLs, fetches and greps for the rules.

3. Observability
   - Basic server logs; error boundaries; 404/500 pages with incident IDs.
   - Health probes: `/api/health`, `/api/dbcheck` surfaced in uptime monitors.

4. Security & Privacy
   - Rate limits on auth endpoints; CSRF tokens; password hashing (argon2id/bcrypt).
   - Content Security Policy, Referrer-Policy, permissions headers.

## Next Milestones (Weeks 5–8)
- Members directory + profiles.
- Proposals MVP (create, discuss, vote).
- Support Points ledger and allocation UI.
- Email delivery for magic links/confirmations.
- i18n and locale frameworks.

## Deploy & Secrets Checklist
GitHub Actions → Repository secrets (for Deploy Staging workflow):
- SSH_PRIVATE_KEY
- VPS_HOST (continentjump)
- VPS_IP (<YOUR.VPS.IP.HERE>)
- VPS_USER (platform)
- VPS_PATH (/home/platform/htdocs/platform.local/frontend)

## Deliverables to Keep in Repo
- `tailwind.config.js`
- `postcss.config.js`
- `src/pages/_app.tsx`
- `src/styles/globals.css`
- `docker-compose.yml`
- `scripts/redeploy-frontend.sh`
- `scripts/smoke.sh`

## Acceptance Criteria
- CI passes; CSS rules verified; signup POST completes; OAuth providers show buttons and route to provider auth.
