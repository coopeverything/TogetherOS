#!/usr/bin/env bash
set -euo pipefail

echo "SMOKE: repo root=$(pwd)"
test -f ".github/workflows/codex-gateway.yml" || { echo "missing codex-gateway.yml"; exit 1; }

# Optional quick checks (don't fail if tools missing)
command -v actionlint >/dev/null 2>&1 && actionlint .github/workflows/codex-gateway.yml || true

echo "SMOKE=OK"
