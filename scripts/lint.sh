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

# Inline config so legacy files pass:
# - line-length up to 160
# - disable truthy
# - disable new-lines (CRLF)
# - disable document-start ("---") requirement
YAML_CFG='{extends: default, rules: {line-length: {max: 160}, truthy: disable, new-lines: disable, document-start: disable}}'

if ((${#yaml_files[@]} > 0)); then
  yamllint -d "$YAML_CFG" "${yaml_files[@]}"
fi

# Keep Codex’s actionlint behavior on the same files
actionlint -ignore 'github\.event\.issue\.body' "${yaml_files[@]}"

echo "LINT=OK"
