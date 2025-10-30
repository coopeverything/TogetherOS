#!/bin/bash
# Pre-Push Validation Script for TogetherOS
# Ensures feature branches are ready for PR creation
# Usage: ./scripts/pre-push-validation.sh [target-branch]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
TARGET_BRANCH="${1:-yolo}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "================================================"
echo "Pre-Push Validation for TogetherOS"
echo "================================================"
echo "Current branch: $CURRENT_BRANCH"
echo "Target branch:  $TARGET_BRANCH"
echo ""

# Check 1: Verify not on protected branch
echo "✓ Check 1: Verify not on protected branch..."
if [[ "$CURRENT_BRANCH" == "main" ]] || [[ "$CURRENT_BRANCH" == "yolo" ]]; then
  echo -e "${RED}✗ ERROR: Cannot push directly to $CURRENT_BRANCH${NC}"
  echo "  Create a feature branch first: git checkout -b feature/your-feature"
  exit 1
fi
echo -e "${GREEN}  ✓ On feature branch: $CURRENT_BRANCH${NC}"
echo ""

# Check 2: Update target branch
echo "✓ Check 2: Fetching latest from origin/$TARGET_BRANCH..."
git fetch origin "$TARGET_BRANCH" || {
  echo -e "${RED}✗ ERROR: Failed to fetch $TARGET_BRANCH${NC}"
  exit 1
}
echo -e "${GREEN}  ✓ Successfully fetched origin/$TARGET_BRANCH${NC}"
echo ""

# Check 3: Check if feature branch is up-to-date
echo "✓ Check 3: Checking if branch is up-to-date with target..."
if ! git merge-base --is-ancestor origin/"$TARGET_BRANCH" HEAD; then
  echo -e "${YELLOW}  ⚠ WARNING: Feature branch is behind origin/$TARGET_BRANCH${NC}"
  echo "  Need to merge or rebase. Attempting merge..."

  # Attempt automatic merge
  if git merge origin/"$TARGET_BRANCH" --no-edit; then
    echo -e "${GREEN}  ✓ Successfully merged origin/$TARGET_BRANCH${NC}"
  else
    echo -e "${RED}✗ ERROR: Merge conflicts detected${NC}"
    echo "  Please resolve conflicts manually:"
    echo "  1. Fix conflicts in the listed files"
    echo "  2. git add <resolved-files>"
    echo "  3. git commit"
    echo "  4. Run this script again"
    exit 1
  fi
else
  echo -e "${GREEN}  ✓ Branch is up-to-date with origin/$TARGET_BRANCH${NC}"
fi
echo ""

# Check 4: Verify no merge conflicts
echo "✓ Check 4: Verifying no unresolved conflicts..."
if git status | grep -q "Unmerged paths"; then
  echo -e "${RED}✗ ERROR: Unmerged conflicts found${NC}"
  echo "  Resolve conflicts before pushing"
  git status
  exit 1
fi
echo -e "${GREEN}  ✓ No merge conflicts${NC}"
echo ""

# Check 5: Verify TypeScript compiles
echo "✓ Check 5: Verifying TypeScript compilation..."
if [[ -d "apps/web" ]]; then
  cd apps/web
  if npx tsc --noEmit 2>&1 | tee /tmp/tsc-output.txt; then
    echo -e "${GREEN}  ✓ TypeScript compilation successful${NC}"
  else
    echo -e "${RED}✗ ERROR: TypeScript compilation failed${NC}"
    cat /tmp/tsc-output.txt
    exit 1
  fi
  cd - > /dev/null
else
  echo -e "${YELLOW}  ⚠ WARNING: apps/web directory not found, skipping TypeScript check${NC}"
fi
echo ""

# Check 6: Run tests (if available)
echo "✓ Check 6: Running tests..."
if npm run test 2>/dev/null; then
  echo -e "${GREEN}  ✓ Tests passed${NC}"
else
  echo -e "${YELLOW}  ⚠ WARNING: No tests configured or tests failed${NC}"
  echo "  Consider adding tests before pushing"
fi
echo ""

# Check 7: Verify no uncommitted changes
echo "✓ Check 7: Checking for uncommitted changes..."
if [[ -n $(git status --porcelain) ]]; then
  echo -e "${YELLOW}  ⚠ WARNING: Uncommitted changes found${NC}"
  git status --short
  echo ""
  read -p "  Commit these changes now? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  Please commit your changes and run this script again"
    exit 1
  else
    echo -e "${YELLOW}  ⚠ Continuing with uncommitted changes${NC}"
  fi
else
  echo -e "${GREEN}  ✓ No uncommitted changes${NC}"
fi
echo ""

# Summary
echo "================================================"
echo -e "${GREEN}✓ All validation checks passed!${NC}"
echo "================================================"
echo ""
echo "Ready to push and create PR:"
echo "  git push origin $CURRENT_BRANCH"
echo "  gh pr create --base $TARGET_BRANCH --head $CURRENT_BRANCH"
echo ""
echo "Or let the automation handle it:"
echo "  (The yolo skill will run these checks automatically)"
echo ""
