#!/usr/bin/env bash
# Validate Markdown files using markdownlint-cli2
# Hook: PreToolUse(Edit), PreToolUse(Write)
# Matcher: Edit docs/**/*.md, Write docs/**/*.md

set -euo pipefail

# Get file path from hook stdin
FILE_PATH=$(jq -r '.tool_input.file_path // ""' 2>/dev/null || echo "")

# Only process markdown files in docs/
if [[ ! "$FILE_PATH" =~ ^docs/.*\.md$ ]]; then
  exit 0
fi

# Check if markdownlint-cli2 is available
if ! command -v markdownlint-cli2 &> /dev/null; then
  echo "⚠️  markdownlint-cli2 not installed - skipping validation"
  echo "Install: npm install -g markdownlint-cli2"
  exit 0
fi

# Run markdownlint on the file
if markdownlint-cli2 "$FILE_PATH" 2>&1; then
  echo "✅ Markdown validation passed: $FILE_PATH"
  exit 0
else
  echo "❌ Markdown validation failed: $FILE_PATH"
  echo "Fix issues or run: markdownlint-cli2 --fix $FILE_PATH"
  exit 1
fi
