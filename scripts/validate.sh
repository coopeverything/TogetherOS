#!/usr/bin/env bash
set -euo pipefail

jq --version >/dev/null
printf 'JQ=OK\n'

yamllint --version >/dev/null
printf 'YAMLLINT=OK\n'

actionlint --version >/dev/null
printf 'ACTIONLINT=OK\n'

gh --version >/dev/null
printf 'GH=OK\n'

# Report whether devcontainer file exists (non-fatal either way)
if [ -f ".devcontainer/devcontainer.json" ]; then
  printf 'DEVCONTAINER=OK\n'
else
  printf 'DEVCONTAINER=MISSING\n'
fi

printf 'PREFLIGHT=OK\n'
