#!/usr/bin/env bash
set -euo pipefail

# validate-bridge-logs.sh
#
# Validates Bridge NDJSON logs for format and required fields
# Usage: ./scripts/validate-bridge-logs.sh [log-file-path]

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
cd "${repo_root}"

# Get log file path (default to today's log)
LOG_FILE="${1:-}"
if [[ -z "$LOG_FILE" ]]; then
  DATE=$(date -u +%Y-%m-%d)
  LOG_FILE="logs/bridge/actions-${DATE}.ndjson"
fi

# Check if log file exists
if [[ ! -f "$LOG_FILE" ]]; then
  echo "No Bridge logs found at: $LOG_FILE"
  echo "BRIDGE_LOGS=EMPTY"
  exit 0
fi

# Validate NDJSON format
echo "Validating Bridge logs: $LOG_FILE"

LINE_NUM=0
ERRORS=0

while IFS= read -r line || [[ -n "$line" ]]; do
  ((LINE_NUM++))

  # Skip empty lines
  if [[ -z "$line" ]]; then
    continue
  fi

  # Validate JSON format
  if ! echo "$line" | jq empty 2>/dev/null; then
    echo "ERROR: Line $LINE_NUM is not valid JSON"
    ((ERRORS++))
    continue
  fi

  # Check required fields
  REQUIRED_FIELDS=("id" "ts" "action" "ip_hash")
  for field in "${REQUIRED_FIELDS[@]}"; do
    if ! echo "$line" | jq -e ".$field" >/dev/null 2>&1; then
      echo "ERROR: Line $LINE_NUM missing required field: $field"
      ((ERRORS++))
    fi
  done

  # Validate IP hash format (should be SHA-256 hex)
  IP_HASH=$(echo "$line" | jq -r '.ip_hash')
  if [[ ! "$IP_HASH" =~ ^[a-f0-9]{64}$ ]]; then
    echo "WARNING: Line $LINE_NUM has invalid IP hash format: $IP_HASH"
  fi

  # Validate timestamp format (ISO 8601)
  TIMESTAMP=$(echo "$line" | jq -r '.ts')
  if [[ ! "$TIMESTAMP" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T ]]; then
    echo "WARNING: Line $LINE_NUM has invalid timestamp format: $TIMESTAMP"
  fi

done < "$LOG_FILE"

echo "Validated $LINE_NUM log entries"

if [[ $ERRORS -gt 0 ]]; then
  echo "BRIDGE_LOG_ERRORS=$ERRORS"
  exit 1
fi

echo "BRIDGE_LOGS=OK"
