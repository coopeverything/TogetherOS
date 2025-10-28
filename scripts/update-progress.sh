#!/usr/bin/env bash
set -euo pipefail

# update-progress.sh
#
# Updates module progress percentage in docs/STATUS_v2.md
# Usage: ./scripts/update-progress.sh <module-key> <new-percentage> [increment]
#
# Examples:
#   ./scripts/update-progress.sh scaffold 10           # Set to 10%
#   ./scripts/update-progress.sh onboarding +5         # Increment by 5%
#   ./scripts/update-progress.sh governance 25 "Completed proposal creation MVP"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
cd "${repo_root}"

STATUS_FILE="docs/STATUS_v2.md"

usage() {
  cat <<EOF
Usage: $0 <module-key> <percentage> [description]

Updates module progress in ${STATUS_FILE}

Arguments:
  module-key    The progress marker key (e.g., scaffold, onboarding, governance)
  percentage    New percentage (0-100) or +N to increment
  description   Optional description of what was completed

Examples:
  $0 scaffold 10
  $0 onboarding +5
  $0 governance 25 "Completed proposal creation MVP"

Module keys (from STATUS_v2.md):
  scaffold, ui, auth, profiles, groups, forum, governance, social-economy,
  reputation, onboarding, search, notifications, docs-hooks, observability, security
  path-education, path-governance, path-community, path-media, path-wellbeing,
  path-economy, path-technology, path-planet
  devcontainer, ci-lint, ci-docs, ci-smoke, deploy, secrets

EOF
  exit 1
}

if [[ $# -lt 2 ]]; then
  usage
fi

MODULE_KEY="$1"
PERCENTAGE_ARG="$2"
DESCRIPTION="${3:-}"

# Check if STATUS file exists
if [[ ! -f "${STATUS_FILE}" ]]; then
  echo "ERROR: ${STATUS_FILE} not found" >&2
  exit 1
fi

# Parse percentage (handle +N increments)
if [[ "${PERCENTAGE_ARG}" =~ ^\+([0-9]+)$ ]]; then
  # Increment mode: extract current value first
  CURRENT=$(grep -oP "<!-- progress:${MODULE_KEY}=\K[0-9]+" "${STATUS_FILE}" || echo "0")
  INCREMENT="${BASH_REMATCH[1]}"
  NEW_PERCENTAGE=$((CURRENT + INCREMENT))
  echo "Incrementing ${MODULE_KEY}: ${CURRENT}% → ${NEW_PERCENTAGE}%"
else
  NEW_PERCENTAGE="${PERCENTAGE_ARG}"
  echo "Setting ${MODULE_KEY}: ${NEW_PERCENTAGE}%"
fi

# Validate percentage range
if [[ ! "${NEW_PERCENTAGE}" =~ ^[0-9]+$ ]] || [[ ${NEW_PERCENTAGE} -lt 0 ]] || [[ ${NEW_PERCENTAGE} -gt 100 ]]; then
  echo "ERROR: Percentage must be 0-100, got: ${NEW_PERCENTAGE}" >&2
  exit 1
fi

# Update the progress marker in STATUS_v2.md
# Pattern: <!-- progress:MODULE_KEY=XX --> XX%
if grep -q "<!-- progress:${MODULE_KEY}=" "${STATUS_FILE}"; then
  # Use sed to update both the HTML comment and the visible percentage
  sed -i "s/<!-- progress:${MODULE_KEY}=[0-9]* --> [0-9]*%/<!-- progress:${MODULE_KEY}=${NEW_PERCENTAGE} --> ${NEW_PERCENTAGE}%/g" "${STATUS_FILE}"
  echo "✓ Updated ${MODULE_KEY} to ${NEW_PERCENTAGE}% in ${STATUS_FILE}"
else
  echo "ERROR: Module key '${MODULE_KEY}' not found in ${STATUS_FILE}" >&2
  echo "Available keys:" >&2
  grep -oP "<!-- progress:\K[a-z-]+" "${STATUS_FILE}" | sort -u >&2
  exit 1
fi

# Optional: Add entry to change log (if description provided)
if [[ -n "${DESCRIPTION}" ]]; then
  CHANGELOG="STATUS/progress-log.md"
  mkdir -p "$(dirname "${CHANGELOG}")"

  if [[ ! -f "${CHANGELOG}" ]]; then
    cat > "${CHANGELOG}" <<'HEADER'
# Progress Update Log

This file tracks module progress changes with timestamps and descriptions.

HEADER
  fi

  TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
  echo "- **${TIMESTAMP}** - ${MODULE_KEY}: ${NEW_PERCENTAGE}% - ${DESCRIPTION}" >> "${CHANGELOG}"
  echo "✓ Logged to ${CHANGELOG}"
fi

echo "PROGRESS_UPDATE=OK"
