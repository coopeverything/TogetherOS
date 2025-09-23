#!/usr/bin/env bash
set -euo pipefail

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

if ((${#yaml_files[@]} > 0)); then
  yamllint "${yaml_files[@]}"
fi

# Only change: disable ShellCheck within actionlint
actionlint -shellcheck=never -ignore 'github\.event\.issue\.body'

echo "LINT=OK"
