# TogetherOS Branch Cleanup Script (PowerShell)
# Generated: 2025-10-29
# Purpose: Remove 31 stale branches from repository

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "TogetherOS Repository Branch Cleanup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will delete 31 stale branches:" -ForegroundColor Yellow
Write-Host "  - 18 codex automation test branches"
Write-Host "  - 3 already-merged branches"
Write-Host "  - 10 abandoned/outdated branches"
Write-Host ""
$confirm = Read-Host "Continue? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Aborted." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "Phase 1: Deleting codex hash-based test branches (7)..." -ForegroundColor Green
git push origin --delete `
    codex-07897b33-1757456373 `
    codex-07897b33-1757459437 `
    codex-07897b33-1757459438 `
    codex-17192e37-1757460930 `
    codex-1c9d9615-1757429457 `
    codex-9fe8fbda-1757448705 `
    codex-b8694ad3-1757461598

Write-Host ""
Write-Host "Phase 2: Deleting codex numbered issue branches (6)..." -ForegroundColor Green
git push origin --delete `
    codex/63-17677454797 `
    codex/65-17687362763 `
    codex/65-17687362771 `
    codex/69-17688758893 `
    codex/69-17688758910 `
    codex/69-17688931887

Write-Host ""
Write-Host "Phase 3: Deleting codex named branches (5)..." -ForegroundColor Green
git push origin --delete `
    codex/create-minimal-ci-workflow-in-github-actions `
    codex/diagnose-failing-workflow-admin-delete-runs.yml `
    codex/fix-codex-gateway-preflight-step `
    codex/fix-shellcheck-warnings-in-yaml-files `
    codex-fix-gateway-issues-trigger

Write-Host ""
Write-Host "Phase 4: Deleting already-merged branches (3)..." -ForegroundColor Green
git push origin --delete `
    claude/add-kb-to-claude-1st-build-011CUWc7VFS3h4Zos9JBDLuC `
    fix/add-markdownlint-config `
    TheEpicuros-patch-2

Write-Host ""
Write-Host "Phase 5: Deleting abandoned/outdated branches (10)..." -ForegroundColor Green
git push origin --delete `
    agent/issue-template `
    agent/proposals-page `
    chore/admin-delete-runs `
    chore/admin-delete-runs2 `
    chore/reconcile-main `
    chore/sync-main-20250828-1921 `
    feat/frontend-skeleton `
    dev/devcontainer-setup `
    55-add-hello-file-under-codex-agent `
    TheEpicuros-patch-1

Write-Host ""
Write-Host "Phase 6: Deleting branch with special characters..." -ForegroundColor Green
Write-Host "Note: The following branch may need manual deletion:"
Write-Host "  chore/cleanup-legacy-workflows-→-Create-branch-from-main"
Write-Host ""
$confirm_special = Read-Host "Attempt to delete it now? (y/N)"
if ($confirm_special -eq 'y' -or $confirm_special -eq 'Y') {
    git push origin --delete "chore/cleanup-legacy-workflows-→-Create-branch-from-main"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed - please delete manually via GitHub UI" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deleted: 31 branches"
Write-Host ""
Write-Host "Repository is now clean!"
