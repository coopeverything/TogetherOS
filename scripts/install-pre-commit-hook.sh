#!/usr/bin/env bash
# Install TogetherOS pre-commit hook
#
# This script copies the pre-commit hook template to .git/hooks
# and makes it executable.
#
# Usage: ./scripts/install-pre-commit-hook.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOK_SOURCE="$SCRIPT_DIR/hooks/pre-commit"
HOOK_DEST="$REPO_ROOT/.git/hooks/pre-commit"

echo "Installing TogetherOS pre-commit hook..."

# Check if we're in a git repository
if [ ! -d "$REPO_ROOT/.git" ]; then
  echo -e "${YELLOW}⚠️  Not in a git repository. Skipping hook installation.${NC}"
  exit 0
fi

# Check if hook source exists
if [ ! -f "$HOOK_SOURCE" ]; then
  echo "❌ ERROR: Hook source not found at $HOOK_SOURCE"
  exit 1
fi

# Backup existing hook if present
if [ -f "$HOOK_DEST" ]; then
  echo "Backing up existing pre-commit hook to pre-commit.backup"
  cp "$HOOK_DEST" "$HOOK_DEST.backup"
fi

# Copy hook to .git/hooks
cp "$HOOK_SOURCE" "$HOOK_DEST"
chmod +x "$HOOK_DEST"

echo -e "${GREEN}✓ Pre-commit hook installed successfully${NC}"
echo ""
echo "The hook will now:"
echo "  - Block commits with build artifact imports in next-env.d.ts"
echo "  - Warn about .next/ directory commits"
echo "  - Warn about node_modules/ commits"
echo "  - Warn about potential secrets in staged changes"
echo ""
echo "To uninstall: rm $HOOK_DEST"
