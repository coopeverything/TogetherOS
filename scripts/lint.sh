#!/usr/bin/env bash
set -euo pipefail

# Glob workflow YAML files
mapfile -t yaml_files < <(find .github/workflows -type f \( -name "*.yml" -o -name "*.yaml" \))

# Inline yamllint config
yamllint_config='{ "rules": { "line-length": {"max": 160}, "truthy": {"level": "disable"}, "new-lines": {"level": "disable"}, "document-start": {"level": "disable"} } }'

# Run yamllint with inline config
set +e
yamllint -d "$yamllint_config" "${yaml_files[@]}"
yamllint_exit=$?
set -e

if [[ $yamllint_exit -eq 1 ]]; then
  echo "YAMLLINT_ERRORS=1"
  exit 1
elif [[ $yamllint_exit -eq 2 ]]; then
  echo "YAMLLINT_WARNINGS=1"
elif [[ $yamllint_exit -eq 0 ]]; then
  echo "YAMLLINT=OK"
fi

# Run actionlint with ignore as before
if ! actionlint -shellcheck=never -ignore 'github\.event\.issue\.body' "${yaml_files[@]}"; then
  echo "ACTIONLINT_ERRORS=1"
  exit 1
else
  echo "ACTIONLINT=OK"
fi

echo "LINT=OK"
