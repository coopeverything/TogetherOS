#!/usr/bin/env bash
# Log all documentation changes to audit trail
# Hook: PostToolUse(Edit), PostToolUse(Write)
# Matcher: Edit docs/**/*.md, Write docs/**/*.md

set -euo pipefail

# Create logs directory if it doesn't exist
LOGS_DIR="/mnt/g/Coopeverything/TogetherOS/logs/hooks"
mkdir -p "$LOGS_DIR"

# Get current date for log file naming
LOG_FILE="$LOGS_DIR/doc-changes-$(date +%Y-%m-%d).ndjson"

# Get tool details from stdin
TOOL_NAME=$(jq -r '.tool_name // "unknown"' 2>/dev/null || echo "unknown")
FILE_PATH=$(jq -r '.tool_input.file_path // ""' 2>/dev/null || echo "")

# Only log docs changes
if [[ ! "$FILE_PATH" =~ ^docs/.*\.md$ ]]; then
  exit 0
fi

# Create log entry
LOG_ENTRY=$(jq -n \
  --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg tool "$TOOL_NAME" \
  --arg file "$FILE_PATH" \
  --arg user "${USER:-unknown}" \
  '{
    timestamp: $timestamp,
    event_type: "doc_change",
    tool: $tool,
    file: $file,
    user: $user
  }')

# Append to log file
echo "$LOG_ENTRY" >> "$LOG_FILE"

echo "📝 Logged documentation change: $FILE_PATH"
