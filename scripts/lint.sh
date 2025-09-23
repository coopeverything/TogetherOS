#!/usr/bin/env bash
set -euo pipefail

# Glob workflow YAML files
mapfile -t yaml_files < <(find .github/workflows -type f \( -name "*.yml" -o -name "*.yaml" \))

# Inline yamllint config
yamllint_config='{
  "line-length": {"max": 160},
  "truthy": {"level": "disable"},
  "new-lines": {"level": "disable"},
  "document-start": {"level": "disable"}
}'

# Run yamllint with inline config
yamllint -d "$yamllint_config" "${yaml_files[@]}"
yamllint_exit=$?

if [[ $yamllint_exit -eq 1 ]]; then
  echo "YAMLLINT_ERRORS=1"
  exit 1
elif [[ $yamllint_exit -eq 2 ]]; then
  echo "YAMLLINT_WARNINGS=1"
  # continue
elif [[ $yamllint_exit -eq 0 ]]; then
  echo "YAMLLINT=OK"
fi

# Run actionlint with ignore as before
actionlint -ignore 'github\.event\.issue\.body' "${yaml_files[@]}"

echo "LINT=OK"
