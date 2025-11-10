#!/usr/bin/env bash
# Validate that PR descriptions include required proof lines
# Hook: PreToolUse(Bash)
# Matcher: Bash gh pr create*

set -euo pipefail

# Get command from hook stdin
COMMAND=$(jq -r '.tool_input.command // ""' 2>/dev/null || echo "")

# Only check gh pr create commands
if [[ ! "$COMMAND" =~ "gh pr create" ]]; then
  exit 0
fi

# Extract PR body from command (between --body " and ")
if [[ "$COMMAND" =~ --body[[:space:]]+\"(.*)\" ]]; then
  PR_BODY="${BASH_REMATCH[1]}"
else
  # Try heredoc format
  if [[ "$COMMAND" =~ \$\(cat[[:space:]]+\<\<\'EOF\' ]]; then
    echo "⚠️  Using heredoc for PR body - cannot validate proof lines automatically"
    echo "Remember to include proof lines:"
    echo "  - LINT=OK"
    echo "  - VALIDATORS=GREEN (or SMOKE=OK or DOCS=OK)"
    exit 0
  else
    echo "⚠️  Could not extract PR body - ensure it includes proof lines"
    exit 0
  fi
fi

# Check for required proof lines based on PR type
HAS_LINT=false
HAS_VALIDATION=false

if echo "$PR_BODY" | grep -q "LINT=OK"; then
  HAS_LINT=true
fi

if echo "$PR_BODY" | grep -qE "(VALIDATORS=GREEN|SMOKE=OK|DOCS=OK)"; then
  HAS_VALIDATION=true
fi

# Validate based on CI/CD discipline
if [[ "$HAS_LINT" == false ]] || [[ "$HAS_VALIDATION" == false ]]; then
  echo "❌ PR body missing required proof lines!"
  echo ""
  echo "Required proof lines (per CI/CD discipline):"
  echo "  - LINT=OK"
  echo "  - One of: VALIDATORS=GREEN, SMOKE=OK, DOCS=OK"
  echo ""
  echo "Current PR body:"
  echo "$PR_BODY"
  echo ""
  echo "Run validation locally: ./scripts/validate.sh"
  exit 1
fi

echo "✅ PR body includes required proof lines"
exit 0
