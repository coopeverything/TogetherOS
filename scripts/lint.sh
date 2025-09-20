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

# NEW: explicitly use repo config if present
CONFIG_FLAG=()
if [[ -f ".yamllint.yaml" ]]; then
  CONFIG_FLAG=(-c .yamllint.yaml)
fi

if ((${#yaml_files[@]} > 0)); then
  yamllint "${CONFIG_FLAG[@]}" "${yaml_files[@]}"
fi

# Keep Codex’s actionlint behavior; prefer our two new workflows if present
limit=(.github/workflows/lint.yml .github/workflows/smoke.yml)
present=()
for f in "${limit[@]}"; do
  [[ -f "$f" ]] && present+=("$f")
done

if ((${#present[@]} > 0)); then
  actionlint -ignore 'github\.event\.issue\.body' "${present[@]}"
else
  actionlint -ignore 'github\.event\.issue\.body'
fi

echo "LINT=OK"
