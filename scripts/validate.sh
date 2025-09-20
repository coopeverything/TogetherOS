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

printf 'PREFLIGHT=OK\n'
