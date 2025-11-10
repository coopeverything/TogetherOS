#!/usr/bin/env bash
# Handle Copilot SWE Agent sub-PRs
# Usage: ./scripts/handle-sub-pr.sh <parent-pr-number>

set -euo pipefail

# Check if PR number provided
if [ $# -eq 0 ]; then
  echo "Usage: $0 <parent-pr-number>"
  echo ""
  echo "Example: $0 136"
  exit 1
fi

PR_NUMBER=$1

echo "🔍 Checking for Copilot sub-PR for parent PR #$PR_NUMBER..."

# Check if Copilot created a sub-PR
SUB_PR=$(gh pr list --author "app/copilot-swe-agent" \
  --search "sub-pr-$PR_NUMBER in:title" \
  --json number --jq '.[0].number // empty')

if [ -z "$SUB_PR" ]; then
  echo "ℹ️  No sub-PR found for PR #$PR_NUMBER"
  echo "✅ Safe to proceed with merging parent PR"
  exit 0
fi

echo "✓ Found sub-PR #$SUB_PR"
echo ""
echo "=========================================="
echo "SUB-PR DETAILS"
echo "=========================================="
gh pr view $SUB_PR

echo ""
echo "=========================================="
echo "SUB-PR DIFF (first 50 lines)"
echo "=========================================="
gh pr diff $SUB_PR --patch | head -50

echo ""
echo "=========================================="
echo "What would you like to do?"
echo "=========================================="
echo "[c] Cherry-pick changes to parent PR branch"
echo "[n] Note for later (close sub-PR, document findings)"
echo "[i] Ignore (close sub-PR, no action needed)"
echo "[v] View full diff"
echo "[q] Quit (take no action)"
echo ""
read -p "Choose action: " -n 1 -r action
echo ""

case $action in
  c|C)
    echo "🍒 Cherry-picking changes from sub-PR #$SUB_PR..."

    # Get parent PR branch name
    PARENT_BRANCH=$(gh pr view $PR_NUMBER --json headRefName --jq '.headRefName')

    echo "Parent branch: $PARENT_BRANCH"

    # Checkout sub-PR to see commits
    gh pr checkout $SUB_PR

    echo ""
    echo "Commits in sub-PR:"
    git log --oneline copilot/sub-pr-$PR_NUMBER ^yolo

    echo ""
    echo "Return to parent branch and cherry-pick?"
    read -p "Continue? (y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
      git checkout "$PARENT_BRANCH"

      echo "Cherry-pick individual commits or merge entire branch?"
      echo "[c] Cherry-pick individual commits"
      echo "[m] Merge entire branch"
      read -p "Choose: " -n 1 -r merge_action
      echo ""

      if [[ $merge_action =~ ^[Mm]$ ]]; then
        git merge --no-ff copilot/sub-pr-$PR_NUMBER -m "merge: incorporate Copilot sub-PR #$SUB_PR fixes"
        echo "✓ Merged sub-PR branch"
      else
        echo "Enter commit SHAs to cherry-pick (space-separated):"
        read -r commits
        for commit in $commits; do
          git cherry-pick "$commit"
        done
        echo "✓ Cherry-picked commits: $commits"
      fi

      echo ""
      echo "Push changes to parent PR?"
      read -p "(y/n) " -n 1 -r
      echo ""

      if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin "$PARENT_BRANCH"
        echo "✓ Pushed to $PARENT_BRANCH"
      fi

      # Close sub-PR
      gh pr close $SUB_PR --comment "Changes incorporated into parent PR #$PR_NUMBER via cherry-pick. Thank you Copilot!"
      echo "✓ Closed sub-PR #$SUB_PR"
    else
      git checkout "$PARENT_BRANCH"
      echo "Cancelled. Returned to $PARENT_BRANCH"
    fi
    ;;

  n|N)
    echo "📝 Noting feedback for later..."

    # Get sub-PR title for documentation
    SUB_PR_TITLE=$(gh pr view $SUB_PR --json title --jq '.title')

    # Comment on sub-PR
    gh pr comment $SUB_PR --body "Thanks for the suggestions in '$SUB_PR_TITLE'. These improvements are noted for a future PR focused on code quality. Closing sub-PR as parent PR #$PR_NUMBER will merge first."

    # Close sub-PR
    gh pr close $SUB_PR

    # Document in parent PR
    gh pr comment $PR_NUMBER --body "Note: Copilot sub-PR #$SUB_PR ('$SUB_PR_TITLE') suggested improvements. Will address in follow-up PR."

    echo "✓ Sub-PR #$SUB_PR closed with note"
    echo "✓ Comment added to parent PR #$PR_NUMBER"
    ;;

  i|I)
    echo "🚫 Ignoring sub-PR..."
    gh pr close $SUB_PR --comment "Sub-PR created after parent was already reviewed and ready to merge. No additional changes needed at this time."
    echo "✓ Sub-PR #$SUB_PR closed"
    ;;

  v|V)
    echo "📄 Full diff:"
    gh pr diff $SUB_PR --patch | less
    # Re-run script after viewing
    exec "$0" "$PR_NUMBER"
    ;;

  q|Q)
    echo "❌ No action taken. Sub-PR #$SUB_PR remains open."
    echo "⚠️  Remember to handle sub-PR before merging parent PR #$PR_NUMBER!"
    exit 0
    ;;

  *)
    echo "Invalid option. No action taken."
    exit 1
    ;;
esac

echo ""
echo "✅ Sub-PR handling complete!"
echo "Parent PR #$PR_NUMBER is now safe to merge."
