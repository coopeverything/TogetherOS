#!/bin/bash
# Cleanup old GitHub Actions workflow runs

set -e

REPO="coopeverything/TogetherOS"
CUTOFF_DATE="2025-10-16T00:00:00Z"
KEEP_DAYS=14

echo "🧹 Cleaning up workflow runs for $REPO"
echo "📅 Deleting all runs before: $CUTOFF_DATE"
echo ""

# Function to delete runs
delete_old_runs() {
    echo "Fetching old workflow runs..."

    # Get all runs before cutoff date
    OLD_RUNS=$(gh api "repos/$REPO/actions/runs?per_page=100" \
        --paginate \
        --jq ".workflow_runs[] | select(.created_at < \"$CUTOFF_DATE\") | .id")

    COUNT=$(echo "$OLD_RUNS" | grep -c . || echo "0")

    if [ "$COUNT" -eq 0 ]; then
        echo "✅ No old runs to delete"
        return
    fi

    echo "Found $COUNT old runs to delete"
    echo "Starting deletion..."

    DELETED=0
    FAILED=0

    for RUN_ID in $OLD_RUNS; do
        if gh api -X DELETE "repos/$REPO/actions/runs/$RUN_ID" 2>/dev/null; then
            DELETED=$((DELETED + 1))
            echo -ne "\r🗑️  Deleted: $DELETED/$COUNT"
        else
            FAILED=$((FAILED + 1))
        fi
    done

    echo ""
    echo "✅ Deleted $DELETED runs"
    [ "$FAILED" -gt 0 ] && echo "⚠️  Failed: $FAILED runs"
}

# Function to delete failed runs (older than 3 days)
delete_old_failures() {
    FAILURE_CUTOFF=$(date -d "3 days ago" -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -v-3d -u +%Y-%m-%dT%H:%M:%SZ)

    echo ""
    echo "🔴 Deleting failed runs before: $FAILURE_CUTOFF"

    FAILED_RUNS=$(gh api "repos/$REPO/actions/runs?status=failure&per_page=100" \
        --paginate \
        --jq ".workflow_runs[] | select(.created_at < \"$FAILURE_CUTOFF\") | .id")

    COUNT=$(echo "$FAILED_RUNS" | grep -c . || echo "0")

    if [ "$COUNT" -eq 0 ]; then
        echo "✅ No old failed runs to delete"
        return
    fi

    echo "Found $COUNT failed runs to delete"

    DELETED=0
    for RUN_ID in $FAILED_RUNS; do
        if gh api -X DELETE "repos/$REPO/actions/runs/$RUN_ID" 2>/dev/null; then
            DELETED=$((DELETED + 1))
            echo -ne "\r🗑️  Deleted: $DELETED/$COUNT"
        fi
    done

    echo ""
    echo "✅ Deleted $DELETED failed runs"
}

# Main execution
echo "Starting cleanup..."
echo ""

delete_old_runs
delete_old_failures

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "📊 Summary:"
gh api "repos/$REPO/actions/runs?per_page=1" --jq '.total_count' | xargs -I {} echo "Remaining runs: {}"
