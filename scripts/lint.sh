#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob globstar

# Prefer limiting to our new workflows; fallback to all
limit_files=(.github/workflows/lint.yml .github/workflows/smoke.yml)
yaml_files=()

# Collect limited set if present
available_limit=()
for f in "${limit_files[@]}"; do
  [[ -f "$f" ]] && available_limit+=("$f")
done

if ((${#available_limit[@]} > 0)); then
  yaml_files=("${available_limit[@]}")
else
  yamllint_paths=(
    .github/workflows/**/*.yml
    .github/workflows/**/*.yaml
  )
  for path in "${yamllint_paths[@]}"; do
    for file in $path; do
      yaml_files+=("$file")
    done
  done
fi

# Run yamllint (use repo config if present)
if ((${#yaml_files[@]} > 0)); then
  if [[ -f ".yamllint.yaml" ]]; then
    yamllint -c .yamllint.yaml "${yaml_files[@]}"
  else
    yamllint "${yaml_files[@]}"
  fi
fi

# Run actionlint on the same set (ignore known pattern)
if ((${#yaml_files[@]} > 0)); then
  actionlint -ignore 'github\.event\.issue\.body' "${yaml_files[@]}"
else
  actionlint -ignore 'github\.event\.issue\.body'
fi

echo "LINT=OK"
