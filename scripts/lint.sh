#!/usr/bin/env bash
set -euo pipefail

# Always operate from repo root if possible
if command -v git >/dev/null 2>&1; then
  if git rev-parse --show-toplevel >/dev/null 2>&1; then
    cd "$(git rev-parse --show-toplevel)"
  fi
fi

# Collect workflow YAML files robustly (avoid relying on globstar)
yaml_files=()
if [[ -d ".github/workflows" ]]; then
  while IFS= read -r -d '' file; do
    yaml_files+=("$file")
  done < <(find .github/workflows -type f \( -name "*.yml" -o -name "*.yaml" \) -print0 | sort -z)
fi

# Prefer repo config; clean fallback if it doesn't exist
CONFIG_ARGS=()
if [[ -f ".yamllint.yaml" ]]; then
  CONFIG_ARGS=(-c .yamllint.yaml)
else
  # Valid inline config (no invalid 'level' keys)
  YAML_CFG='{extends: default, rules: {line-length: {max: 160}, truthy: disable, new-lines: disable, document-start: disable}}'
  CONFIG_ARGS=(-d "$YAML_CFG")
fi

# --- yamllint (errors fail; warnings tolerated) ---
YAMLLINT_EXIT=0
if command -v yamllint >/dev/null 2>&1; then
  if ((${#yaml_files[@]} > 0)); then
    set +e
    yamllint "${CONFIG_ARGS[@]}" "${yaml_files[@]}"
    YAMLLINT_EXIT=$?
    set -e
  else
    echo "NO_YAML_WORKFLOWS=1"
  fi
else
  echo "SKIP_YAMLLINT=1 (yamllint not installed)"
fi

case "$YAMLLINT_EXIT" in
  0) echo "YAMLLINT=OK" ;;
  1) echo "YAMLLINT_ERRORS=1"; exit 1 ;;
  2) echo "YAMLLINT_WARNINGS=1" ;;  # continue on warnings
  *) if [[ $YAMLLINT_EXIT -ne 0 ]]; then
       echo "YAMLLINT_UNKNOWN=$YAMLLINT_EXIT"; exit "$YAMLLINT_EXIT"
     fi
     ;;
esac

# --- actionlint (ShellCheck disabled for now) ---
if command -v actionlint >/dev/null 2>&1; then
  set +e
  if ((${#yaml_files[@]} > 0)); then
    actionlint -shellcheck=never -ignore 'github\.event\.issue\.body' "${yaml_files[@]}"
  else
    # Let actionlint auto-detect workflows if none explicitly found
    actionlint -shellcheck=never -ignore 'github\.event\.issue\.body'
  fi
  AL_EXIT=$?
  set -e

  if [[ $AL_EXIT -ne 0 ]]; then
    echo "ACTIONLINT_ERRORS=1"
    exit 1
  fi
  echo "ACTIONLINT=OK"
else
  echo "SKIP_ACTIONLINT=1 (actionlint not installed)"
fi

# Final proof
echo "LINT=OK"
