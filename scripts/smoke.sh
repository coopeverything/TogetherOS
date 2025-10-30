#!/usr/bin/env bash
set -euo pipefail

echo "SMOKE: repo root=$(pwd)"

# Check for critical taxonomy file
test -f "codex/taxonomy/CATEGORY_TREE.json" || { echo "missing CATEGORY_TREE.json"; exit 1; }

# Check for critical workflows
test -f ".github/workflows/auto-progress-update.yml" || { echo "missing auto-progress-update.yml"; exit 1; }

echo "SMOKE=OK"
