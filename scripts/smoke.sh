#!/usr/bin/env bash
set -euo pipefail

echo "== Local repo smoke =="
test -f README.md || (echo "README.md missing" && exit 1)
test -d .github/workflows || (echo ".github/workflows missing" && exit 1)
echo "OK"