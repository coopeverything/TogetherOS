#!/usr/bin/env bash
set -euo pipefail

# detect-merge-conflicts.sh
# Identifies files that have been modified by multiple PRs in the same day
# Helps track features that may have been lost in parallel development

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Get date parameter or use today
DATE=${1:-$(date '+%Y-%m-%d')}

echo "Analyzing merge conflicts for: $DATE"
echo "========================================="

# Get all commits from today
COMMITS=$(git log --since="$DATE 00:00:00" --until="$DATE 23:59:59" --pretty=format:"%H|%s|%ad" --date=format:'%H:%M')

if [ -z "$COMMITS" ]; then
  echo "No commits found for $DATE"
  exit 0
fi

# Track files and their modifications
declare -A file_commits
declare -A file_pr_numbers
declare -A commit_files

# Process each commit
while IFS='|' read -r hash message timestamp; do
  # Extract PR number from commit message
  PR_NUM=$(echo "$message" | grep -oP '#\K\d+' | head -1 || echo "direct")

  # Get files changed in this commit
  FILES=$(git diff-tree --no-commit-id --name-only -r "$hash" 2>/dev/null || continue)

  # Store files for this commit
  commit_files[$hash]="$FILES"

  # Track which commits touched each file
  while IFS= read -r file; do
    [ -z "$file" ] && continue

    if [ -z "${file_commits[$file]:-}" ]; then
      file_commits[$file]="$hash"
      file_pr_numbers[$file]="$PR_NUM"
    else
      # Multiple commits touched this file
      file_commits[$file]="${file_commits[$file]} $hash"
      file_pr_numbers[$file]="${file_pr_numbers[$file]} $PR_NUM"
    fi
  done <<< "$FILES"
done <<< "$COMMITS"

# Find conflicts
CONFLICTS_FOUND=0
CONFLICT_DETAILS=""

echo -e "\n${YELLOW}Files Modified Multiple Times:${NC}"
echo "----------------------------------------"

for file in "${!file_commits[@]}"; do
  commit_count=$(echo "${file_commits[$file]}" | wc -w)

  if [ "$commit_count" -gt 1 ]; then
    CONFLICTS_FOUND=$((CONFLICTS_FOUND + 1))

    echo -e "${RED}⚠ $file${NC}"
    echo "  Modified by $commit_count commits:"

    # Show each commit that touched the file
    for commit in ${file_commits[$file]}; do
      commit_msg=$(git log -1 --pretty=format:"%s" "$commit")
      commit_time=$(git log -1 --pretty=format:"%ad" --date=format:'%H:%M' "$commit")
      echo "    - $commit_time: $commit_msg"
    done

    # Check if the file still exists
    if [ ! -f "$file" ]; then
      echo -e "  ${RED}✗ File was deleted${NC}"
    fi

    echo ""

    # Build conflict details for changelog
    PR_LIST=$(echo "${file_pr_numbers[$file]}" | tr ' ' ',')
    CONFLICT_DETAILS="${CONFLICT_DETAILS}\n- $file (PRs: $PR_LIST)"
  fi
done

# Check for reverted commits
echo -e "${YELLOW}Reverted Commits:${NC}"
echo "----------------------------------------"

REVERTS=$(git log --since="$DATE 00:00:00" --until="$DATE 23:59:59" --grep="^Revert" --pretty=format:"%H|%s")

if [ -n "$REVERTS" ]; then
  while IFS='|' read -r hash message; do
    echo -e "${RED}⟲ Reverted:${NC} $message"
    CONFLICTS_FOUND=$((CONFLICTS_FOUND + 1))
  done <<< "$REVERTS"
else
  echo "No reverted commits found"
fi

# Check for force pushes (if we can access reflog)
if git reflog show --since="$DATE 00:00:00" 2>/dev/null | grep -q "forced-update"; then
  echo -e "\n${RED}⚠ WARNING: Force push detected today${NC}"
  echo "Some history may have been rewritten"
  CONFLICTS_FOUND=$((CONFLICTS_FOUND + 1))
fi

# Summary
echo -e "\n========================================="
if [ "$CONFLICTS_FOUND" -gt 0 ]; then
  echo -e "${RED}Total conflicts detected: $CONFLICTS_FOUND${NC}"
  echo -e "\n${YELLOW}Recommended Actions:${NC}"
  echo "1. Review the files listed above for lost functionality"
  echo "2. Check if parallel features were properly merged"
  echo "3. Consider adding integration tests for affected modules"
  echo "4. Update CHANGELOG.md with any lost features that need re-implementation"

  # Output for GitHub Actions
  if [ -n "${GITHUB_ACTIONS:-}" ]; then
    echo "::warning::$CONFLICTS_FOUND merge conflicts detected for $DATE"
    echo "CONFLICTS_FOUND=$CONFLICTS_FOUND" >> $GITHUB_ENV
    echo "CONFLICT_DETAILS<<EOF" >> $GITHUB_ENV
    echo -e "$CONFLICT_DETAILS" >> $GITHUB_ENV
    echo "EOF" >> $GITHUB_ENV
  fi

  exit 0  # Don't fail, just report
else
  echo -e "${GREEN}✓ No conflicts detected for $DATE${NC}"
  echo "All features deployed cleanly"
fi