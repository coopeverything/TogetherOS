#!/usr/bin/env bash
# Protect critical documentation files from accidental modification
# Hook: PreToolUse(Edit), PreToolUse(Write)
# Matcher: Edit *, Write *

set -euo pipefail

# Get file path from hook stdin
FILE_PATH=$(jq -r '.tool_input.file_path // ""' 2>/dev/null || echo "")

# List of protected documentation files
PROTECTED_DOCS=(
  "docs/Manifesto.md"
  "docs/TogetherOS_WhitePaper.md"
  "docs/TogetherOS_CATEGORIES_AND_KEYWORDS.md"
  "codex/taxonomy/CATEGORY_TREE.json"
  "CLAUDE.md"
  ".claude/knowledge/togetheros-kb.md"
  ".claude/knowledge/ci-cd-discipline.md"
)

# Check if file is protected
for protected in "${PROTECTED_DOCS[@]}"; do
  if [[ "$FILE_PATH" == "$protected" ]]; then
    echo "🚫 BLOCKED: $FILE_PATH is a protected critical document"
    echo "Protected files require explicit user approval and documentation of why changes are needed."
    echo ""
    echo "If you need to modify this file:"
    echo "1. Explain the reason for the change to the user"
    echo "2. Get explicit approval"
    echo "3. Document the change rationale in the commit message"
    echo "4. Consider creating a backup first"
    exit 1
  fi
done

# If not protected, allow the operation
exit 0
