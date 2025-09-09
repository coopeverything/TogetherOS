# DDP — What we finished / What is left (updated)

## What we achieved (net-new capabilities)
- Fine-grained PAT set, validated, and saved as repo secret `CODEX_PAT`.  
- End-to-end GitHub API control from PowerShell: create branch → add file → open PR → merge → delete branch.  
- Workflow dispatch (Deploy) via API and via smoke workflow; verified 204 and successful runs.  
- `codex-secret-smoke` workflow: verifies token; optional Deploy trigger via input.  
- `codex-gateway` workflow: turns labeled Issues (with strict JSON body) into a branch + file write + PR (path-allowlisted to `codex/`).  
- `codex-autolabel` workflow: auto-adds `codex-task` when the title starts with Codex:; gateway runs on opened|edited|labeled.  
- Hardening: path allowlist (`codex/*`), opt-in fan-out, minimal permissions, clear error taxonomy, observability one-liners.  
- Project discipline doc authored and merged: `docs/DDP-DISCIPLINE.md` (runbook for you/me/Codex).  

## What’s left to reach “full automation” (ranked, bite-size)
1. Schema guard for Issue JSON (jq validate fields + types).  
2. Formatting & linting before PR (Prettier/Black/etc. inside codex/).  
3. Branch protection + status checks (require CI/smoke to pass before merging).  
4. Error feedback to the Issue (comment exact failure reason).  
5. Size/encoding limits (content length guard, base64 option, reject oversize).  
6. Idempotency (detect no-change updates; short-circuit with “no changes” comment).  
7. PAT rotation & migration to GitHub App (later).  
8. Roll-forward/rollback hooks (trigger Deploy or revert automatically).  
