#!/usr/bin/env bash
# Check for broken links in documentation files
# Hook: PostToolUse(Edit), PostToolUse(Write)
# Matcher: Edit docs/**/*.md, Write docs/**/*.md

set -euo pipefail

# Get file path from hook stdin
FILE_PATH=$(jq -r '.tool_input.file_path // ""' 2>/dev/null || echo "")

# Only process markdown files in docs/
if [[ ! "$FILE_PATH" =~ ^docs/.*\.md$ ]]; then
  exit 0
fi

# Check if file exists
if [[ ! -f "$FILE_PATH" ]]; then
  echo "⚠️  File not found: $FILE_PATH"
  exit 0
fi

# Extract links from markdown file
# Match [text](link) and [text]: link patterns
LINKS=$(grep -oE '\[([^\]]+)\]\(([^)]+)\)|\[([^\]]+)\]:[[:space:]]+(.+)' "$FILE_PATH" 2>/dev/null || true)

if [[ -z "$LINKS" ]]; then
  echo "✅ No links found in $FILE_PATH"
  exit 0
fi

# Check internal links (relative paths)
BROKEN_LINKS=false

while IFS= read -r link; do
  # Extract link href (simple pattern matching)
  if [[ "$link" =~ \]\(([^)]+)\) ]]; then
    HREF="${BASH_REMATCH[1]}"
  elif [[ "$link" =~ \]:[[:space:]]+(.+) ]]; then
    HREF="${BASH_REMATCH[1]}"
  else
    continue
  fi

  # Skip external links (http, https, mailto)
  if [[ "$HREF" =~ ^(https?|mailto): ]]; then
    continue
  fi

  # Skip anchors
  if [[ "$HREF" =~ ^# ]]; then
    continue
  fi

  # Check if internal file exists (relative to repo root)
  REPO_ROOT="/mnt/g/Coopeverything/TogetherOS"
  LINK_PATH="$REPO_ROOT/$HREF"

  if [[ ! -f "$LINK_PATH" ]] && [[ ! -d "$LINK_PATH" ]]; then
    echo "⚠️  Broken link in $FILE_PATH: $HREF"
    BROKEN_LINKS=true
  fi
done <<< "$LINKS"

if [[ "$BROKEN_LINKS" == true ]]; then
  echo ""
  echo "Some internal links may be broken. Verify manually or run: npm run docs:lint"
  # Don't block the operation, just warn
  exit 0
else
  echo "✅ All internal links verified in $FILE_PATH"
  exit 0
fi
