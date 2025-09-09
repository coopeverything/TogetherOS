# DDP OPS — CHATGPT PROJECT KNOWLEDGE (v2)

## REPO
- **Owner/Repo**: TheEpicuros/ddp  
- **Default branch**: main

## WORKFLOWS
- **Deploy** → `.github/workflows/deploy.yml` → dispatchable (`on: workflow_dispatch`)  
- **codex-secret-smoke** → `.github/workflows/codex-secret-smoke.yml` → verifies `CODEX_PAT`; can trigger Deploy.  
- **codex-gateway** → `.github/workflows/codex-gateway.yml` → issue-driven PR creator; JSON body required; path must start with `codex/`.  
- **codex-autolabel** → `.github/workflows/codex-autolabel.yml` → auto-adds `codex-task` when title starts with `Codex:`.  

## SECRETS & TOKENS
- **Repo secret**: `CODEX_PAT` (fine-grained PAT; scopes: Contents RW, Pull requests RW, Actions RW).  
- Verified usable end-to-end: create branch → commit file → open PR → merge → delete branch → dispatch workflow.  

## ISSUE → GATEWAY JSON
Body must be strict JSON, no extra characters:

```json
{
  "path": "codex/<subpath>/<file>",
  "message": "commit message",
  "title": "PR title",
  "content_mode": "text" | "base64",
  "content": "file contents (text or base64)",
  "branch_prefix": "codex"
}
```

## HARDENING
- Path allowlist: `codex/*`  
- Opt-in fan-out (Deploy trigger only via label/input)  
- Minimal permissions  
- Error taxonomy (401, 403, 422) documented  
- Observability one-liners included  

## NEXT STEPS TO FULL AUTOMATION
1. Add schema guard (jq validate JSON fields/types).  
2. Pre-commit formatting/linting for codex/* files.  
3. Branch protection & required status checks (CI/smoke).  
4. Gateway error → comment feedback on issue.  
5. Add content size guards (base64 option for binaries).  
6. Idempotency checks (“no changes” shortcut).  
7. PAT rotation policy → future GitHub App migration.  
8. Roll-forward / rollback hooks (post-merge triggers).  
