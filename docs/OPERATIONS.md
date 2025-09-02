# Operations Playbook
## Temporary Notes

Transient automation notes live in /temporary and will be merged or discarded later:
- [Automation_Summary.md](../temporary/Automation_Summary.md)
- [DEPLOY_TEST.md](../temporary/DEPLOY_TEST.md)

Repository Secrets (current) — 2025-09-02 09:27 UTC
Present:

SSH_PRIVATE_KEY — used by Actions to SSH to VPS

VPS_HOST — VPS hostname

VPS_USER — deploy user

VPS_PATH — target path on VPS
Also present (app/preview):

OPENAI_API_KEY

PREVIEW_BASE_PORT
Optional:

VPS_IP — optional for bypassing DNS in deploys
Note: keep secret names exact; do not echo values in logs.
rnRepository Secrets (current) — 2025-09-02 09:31 UTCrnPresent:rn- SSH_PRIVATE_KEY — used by Actions to SSH to VPSrn- VPS_HOST — VPS hostnamern- VPS_USER — deploy userrn- VPS_PATH — target path on VPSrnAlso present (app/preview):rn- OPENAI_API_KEYrn- PREVIEW_BASE_PORTrnOptional:rn- VPS_IP — optional for bypassing DNS in deploysrnNote: keep secret names exact; do not echo values in logs.
r
Codex Automation — GitHub Actions (updated 2025-09-02 09:31 UTC)r
This pipeline deploys apps/frontend to the VPS using rsync and runs ./redeploy-frontend.sh.r
r
Triggers:r
- workflow_dispatch (manual), push to main (scoped to apps/frontend), and PRs with label "staging-ok".r
r
Required repository secrets:r
- SSH_PRIVATE_KEY, VPS_HOST, VPS_USER, VPS_PATH (Optional: VPS_IP, OPENAI_API_KEY, PREVIEW_BASE_PORT)r
r
Files:r
- .github/workflows/deploy.ymlr
- scripts/Get-GitSlugBranch.ps1r
- scripts/Get-GitUrls.ps1r
r
Runbook:r
1) Push to main or add label "staging-ok" to the PR.r
2) Actions syncs ./apps/frontend to  and executes ./redeploy-frontend.sh on the VPS.r
3) Confirm containers are up (docker compose ps) and that CSS changes render on /signup.
