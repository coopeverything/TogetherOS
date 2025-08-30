#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
SOURCE="${1:-}"; BASE="${2:-main}"; TITLE="${3:-codex PR}"; BODY_FILE="${4:-}"
if ! command -v gh >/dev/null 2>&1; then echo "gh CLI not found" >&2; exit 1; fi
if [ -n "${BODY_FILE}" ] && [ -f "${BODY_FILE}" ]; then
gh pr create --base "${BASE}" --head "${SOURCE}" --title "${TITLE}" --body-file "${BODY_FILE}"
else
gh pr create --base "${BASE}" --head "${SOURCE}" --title "${TITLE}" --body "Automated Codex PR"
fi
