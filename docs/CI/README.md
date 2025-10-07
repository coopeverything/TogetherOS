# DDP CI / Actions Debug Playbook

Date: 2025-09-03

## Goal
Ensure GitHub Actions can execute minimal workflows (ping.yml, manual-ping.yml, deploy.yml) and that runs produce at least one job on ubuntu-latest.

## Quick Facts
- Workflows normalized: spaces (no tabs), LF, UTF-8 (no BOM).
- Triggers:
 - ping.yml: workflow_dispatch
 - manual-ping.yml: workflow_dispatch
 - deploy.yml: workflow_dispatch + push on main

## Suspected Blocker
Repo Actions policy or permissions likely prevent runs from queuing (dispatch accepted, but no jobs appear).

## One-Liners (PowerShell, paste as-is)

L1 â€” Confirm repo and branch
LOCAL â€” PowerShell (Windows)
Set-Location G:\Coopeverything\TogetherOS\ddp-on-vps; $ErrorActionPreference='Stop'; if(-not (git rev-parse --is-inside-work-tree 2>$null)){Write-Host "[ERR] Not a git repo";exit 2}; git remote -v; $b=(git rev-parse --abbrev-ref HEAD); Write-Host ("CHECKPOINT L1 repo+branch OK -> branch={0}" -f $b)

L2 â€” Repo Actions policy
LOCAL â€” PowerShell (Windows)
Set-Location G:\Coopeverything\TogetherOS\ddp-on-vps; $ErrorActionPreference='Stop'; $repo='TheEpicuros/ddp'; Write-Host "[POLICY/REPO]"; gh api "repos/$repo/actions/permissions" --jq '.enabled,.allowed_actions,.default_workflow_permissions'

L3 â€” Workflow permissions (read or read+write)
LOCAL â€” PowerShell (Windows)
Set-Location G:\Coopeverything\TogetherOS\ddp-on-vps; $ErrorActionPreference='Stop'; $repo='TheEpicuros/ddp'; Write-Host "[WF-PERMS/REPO]"; gh api "repos/$repo/actions/permissions/workflow" --jq '.can_approve_pull_request_reviews,.default_workflow_permissions'

L4 â€” List workflows and states
LOCAL â€” PowerShell (Windows)
Set-Location G:\Coopeverything\TogetherOS\ddp-on-vps; $ErrorActionPreference='Stop'; $repo='TheEpicuros/ddp'; Write-Host "[WF-LIST] id|state|path"; gh api "repos/$repo/actions/workflows" --jq '.workflows[] | "(.id)|(.state)|(.path)"'

L5 â€” Runs across all workflows
LOCAL â€” PowerShell (Windows)
Set-Location G:\Coopeverything\TogetherOS\ddp-on-vps; $ErrorActionPreference='Stop'; $repo='TheEpicuros/ddp'; Write-Host "[RUNS] id|name|event|status|conclusion|branch"; gh run list --repo $repo --limit 20 --json databaseId,workflowName,event,status,conclusion,headBranch --jq '.[] | "(.databaseId)|(.workflowName)|(.event)|(.status)|(.conclusion)//""|(.headBranch)"'

L6 â€” Re-dispatch deploy.yml by ID
LOCAL â€” PowerShell (Windows)
Set-Location G:\Coopeverything\TogetherOS\ddp-on-vps; $ErrorActionPreference='Stop'; $repo='TheEpicuros/ddp'; $branch='main'; $wfId=(gh api "repos/$repo/actions/workflows" --jq '.workflows[] | select(.path==".github/workflows/deploy.yml") | .id'); if(-not $wfId){Write-Host "[ERR] deploy.yml not registered";exit 1}; gh workflow run $wfId --repo $repo --ref $branch; Write-Host "[DISPATCH] sent -> deploy.yml"

L7 â€” Poll run and job count
LOCAL â€” PowerShell (Windows)
Set-Location G:\Coopeverything\TogetherOS\ddp-on-vps; $ErrorActionPreference='Stop'; $repo='TheEpicuros/ddp'; $branch='main'; $wfId=(gh api "repos/$repo/actions/workflows" --jq '.workflows[] | select(.path==".github/workflows/deploy.yml") | .id'); $rid=$null; for($i=0;$i -lt 25;$i++){ $runs=gh run list --repo $repo --workflow $wfId --limit 5 --json databaseId,headBranch --jq '.[] | select(.headBranch=="'+$branch+'") | .databaseId'; if($runs){ $rid=$runs | Select-Object -First 1; break }; Start-Sleep -Seconds 2 }; if(-not $rid){ Write-Host "[DEPLOY] no run found for branch "+$branch; exit 0 }; $jobs=[int](gh run view $rid --repo $repo --json jobs --jq '.jobs | length'); $st=gh run view $rid --repo $repo --json status,conclusion --jq '.status + "/" + ( .conclusion // "pending")'; Write-Host ("[DEPLOY] runId={0} jobs={1} status={2}" -f $rid,$jobs,$st)

## If Policies Restrict Actions
- Settings â†’ Actions â†’ General â†’ Actions permissions: enable "Allow GitHub Actions to run this repository".
- Workflow permissions: at least Read repository contents (Read and write is fine).
- Allowed actions: temporarily "Allow all actions and reusable workflows" while testing.

## Housekeeping
- This file lives at docs/CI/README.md in the repo.
- Keep workflows tab-free and LF-separated.
- Use minimal echo steps for first validation, then expand to SSH deploy.
