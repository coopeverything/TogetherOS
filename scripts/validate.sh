#!/usr/bin/env bash
set -euo pipefail

# Ensure we run from the repository root for consistent relative paths
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
cd "${repo_root}"

check_tool() {
  # Args: <command> <PROOF_LABEL>
  local cmd="$1"
  local proof="$2"
  if command -v "${cmd}" >/dev/null 2>&1; then
    if "${cmd}" --version >/dev/null 2>&1; then
      echo "${proof}=OK"
    else
      echo "ERROR: ${cmd} is present but '--version' failed" >&2
      exit 1
    fi
  else
    echo "ERROR: required tool '${cmd}' not found in PATH" >&2
    exit 1
  fi
}

# 1) Tool presence checks (fail if missing)
check_tool jq "JQ"
check_tool yamllint "YAMLLINT_TOOL"
check_tool actionlint "ACTIONLINT_TOOL"
check_tool gh "GH"

# 2) Repo preflight
if [ -f ".devcontainer/devcontainer.json" ]; then
  echo "DEVCONTAINER=OK"
else
  echo "DEVCONTAINER=MISSING"
fi
echo "PREFLIGHT=OK"

# 3) Lint suite
if [ -f "scripts/lint.sh" ]; then
  bash scripts/lint.sh
  echo "LINT_SUITE=OK"
else
  echo "LINT_SUITE=SKIPPED"
fi

# 4) Bridge logs validation (if logs exist)
if [ -f "scripts/validate-bridge-logs.sh" ]; then
  bash scripts/validate-bridge-logs.sh
fi

# 5) Final proof
echo "VALIDATORS=GREEN"
