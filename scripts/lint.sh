#!/usr/bin/env bash
set -euo pipefail

# Keep Codex's structure (globbing all workflow YAMLs)
shopt -s nullglob globstar

yamllint_paths=(
  .github/workflows/**/*.yml
  .github/workflows/**/*.yaml
)

yaml_files=()
for path in "${yamllint_paths[@]}"; do
  for file in $path; do
    yaml_files+=("$file")
  done
done

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
if ((${#yaml_files[@]} > 0)); then
  set +e
  yamllint "${CONFIG_ARGS[@]}" "${yaml_files[@]}"
  YAMLLINT_EXIT=$?
  set -e
else
  echo "NO_YAML_WORKFLOWS=1"
fi

case "$YAMLLINT_EXIT" in
  0) echo "YAMLLINT=OK" ;;
  1) echo "YAMLLINT_ERRORS=1"; exit 1 ;;
  2) echo "YAMLLINT_WARNINGS=1" ;;  # continue on warnings
  *) echo "YAMLLINT_UNKNOWN=$YAMLLINT_EXIT"; exit "$YAMLLINT_EXIT" ;;
esac

# --- actionlint (ShellCheck disabled for now) ---
set +e
if ((${#yaml_files[@]} > 0)); then
  actionlint -shellcheck=never -ignore 'github\.event\.issue\.body' "${yaml_files[@]}"
else
  actionlint -shellcheck=never -ignore 'github\.event\.issue\.body'
fi
AL_EXIT=$?
set -e

if [[ $AL_EXIT -ne 0 ]]; then
  echo "ACTIONLINT_ERRORS=1"
  exit 1
fi
echo "ACTIONLINT=OK"

# Final proof
echo "LINT=OK"
