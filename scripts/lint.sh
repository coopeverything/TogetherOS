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

# Use repo config if present (fixes truthy + line-length to 160)
CONFIG_FLAG=()
if [[ -f ".yamllint.yaml" ]]; then
  CONFIG_FLAG=(-c .yamllint.yaml)
fi

if ((${#yaml_files[@]} > 0)); then
  yamllint "${CONFIG_FLAG[@]}" "${yaml_files[@]}"
fi

# Run actionlint on the same workflow files (not the whole repo)
actionlint -ignore 'github\.event\.issue\.body' "${yaml_files[@]}"

echo "LINT=OK"
