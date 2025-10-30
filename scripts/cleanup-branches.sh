#!/bin/bash
# TogetherOS Branch Cleanup Script
# Generated: 2025-10-29
# Purpose: Remove 31 stale branches from repository

set -e

echo "=================================================="
echo "TogetherOS Repository Branch Cleanup"
echo "=================================================="
echo ""
echo "This script will delete 31 stale branches:"
echo "  - 18 codex automation test branches"
echo "  - 3 already-merged branches"
echo "  - 10 abandoned/outdated branches"
echo ""
read -p "Continue? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Phase 1: Deleting codex hash-based test branches (7)..."
git push origin --delete \
    codex-07897b33-1757456373 \
    codex-07897b33-1757459437 \
    codex-07897b33-1757459438 \
    codex-17192e37-1757460930 \
    codex-1c9d9615-1757429457 \
    codex-9fe8fbda-1757448705 \
    codex-b8694ad3-1757461598

echo ""
echo "Phase 2: Deleting codex numbered issue branches (6)..."
git push origin --delete \
    codex/63-17677454797 \
    codex/65-17687362763 \
    codex/65-17687362771 \
    codex/69-17688758893 \
    codex/69-17688758910 \
    codex/69-17688931887

echo ""
echo "Phase 3: Deleting codex named branches (5)..."
git push origin --delete \
    codex/create-minimal-ci-workflow-in-github-actions \
    codex/diagnose-failing-workflow-admin-delete-runs.yml \
    codex/fix-codex-gateway-preflight-step \
    codex/fix-shellcheck-warnings-in-yaml-files \
    codex-fix-gateway-issues-trigger

echo ""
echo "Phase 4: Deleting already-merged branches (3)..."
git push origin --delete \
    claude/add-kb-to-claude-1st-build-011CUWc7VFS3h4Zos9JBDLuC \
    fix/add-markdownlint-config \
    TheEpicuros-patch-2

echo ""
echo "Phase 5: Deleting abandoned/outdated branches (10)..."
git push origin --delete \
    agent/issue-template \
    agent/proposals-page \
    chore/admin-delete-runs \
    chore/admin-delete-runs2 \
    chore/reconcile-main \
    chore/sync-main-20250828-1921 \
    feat/frontend-skeleton \
    dev/devcontainer-setup \
    55-add-hello-file-under-codex-agent \
    TheEpicuros-patch-1

# Note: This branch has a special character that may need escaping
echo ""
echo "Phase 6: Deleting branch with special characters..."
echo "Note: The following branch may need manual deletion:"
echo "  chore/cleanup-legacy-workflows-→-Create-branch-from-main"
echo ""
read -p "Attempt to delete it now? (y/N): " confirm_special
if [[ "$confirm_special" =~ ^[Yy]$ ]]; then
    git push origin --delete "chore/cleanup-legacy-workflows-→-Create-branch-from-main" || \
        echo "Failed - please delete manually via GitHub UI"
fi

echo ""
echo "=================================================="
echo "Cleanup Complete!"
echo "=================================================="
echo ""
echo "Deleted: 31 branches"
echo ""
echo "Remaining branches to evaluate:"
echo "  - docs/pr-template-refresh (potential value)"
echo "  - docs/ops-playbook-refresh (potential value)"
echo "  - chore/bootstrap-agent-lane (potential value)"
echo "  - claude/session-011CUa5wtxBvUBPN5vCGQ1d9 (wait for decision)"
echo ""
echo "Major decision needed:"
echo "  - yolo (46 commits ahead, contains auth system, dashboard, bridge)"
echo ""
