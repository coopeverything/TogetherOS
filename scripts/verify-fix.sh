#!/bin/bash
#
# verify-fix.sh - Run verification tests based on changed files
#
# Usage:
#   ./scripts/verify-fix.sh              # Verify changes in last commit
#   ./scripts/verify-fix.sh HEAD~3       # Verify changes in last 3 commits
#   ./scripts/verify-fix.sh feed         # Run specific module tests
#
# Environment:
#   BASE_URL=https://coopeverything.org  # Target URL (default: production)
#

set -e

BASE_URL="${BASE_URL:-https://coopeverything.org}"
COMMIT_RANGE="${1:-HEAD~1}"

echo "======================================"
echo "  TogetherOS Fix Verification"
echo "======================================"
echo "Target: $BASE_URL"
echo ""

# Function to run tests for a module
run_module_tests() {
    local module=$1
    local test_file="tests/e2e/verify/verify-${module}.spec.ts"

    if [ -f "$test_file" ]; then
        echo "Running verification tests for: $module"
        BASE_URL="$BASE_URL" npx playwright test "$test_file" --reporter=list
        return $?
    else
        echo "Warning: No verification tests found for $module ($test_file)"
        return 0
    fi
}

# If specific module provided, run that
if [[ "$1" =~ ^[a-z]+$ ]] && [ ! -f "$1" ]; then
    run_module_tests "$1"
    exit $?
fi

# Otherwise, detect changed modules from git
echo "Analyzing changes from: $COMMIT_RANGE"
echo ""

# Get changed files
CHANGED_FILES=$(git diff "$COMMIT_RANGE" --name-only 2>/dev/null || git diff HEAD~1 --name-only)

if [ -z "$CHANGED_FILES" ]; then
    echo "No changed files detected."
    exit 0
fi

echo "Changed files:"
echo "$CHANGED_FILES" | head -20
echo ""

# Map files to modules
MODULES_TO_TEST=""

if echo "$CHANGED_FILES" | grep -qE "feed"; then
    MODULES_TO_TEST="$MODULES_TO_TEST feed"
fi

if echo "$CHANGED_FILES" | grep -qE "governance|proposal"; then
    MODULES_TO_TEST="$MODULES_TO_TEST governance"
fi

if echo "$CHANGED_FILES" | grep -qE "group"; then
    MODULES_TO_TEST="$MODULES_TO_TEST groups"
fi

if echo "$CHANGED_FILES" | grep -qE "auth|login|signup|session"; then
    MODULES_TO_TEST="$MODULES_TO_TEST auth"
fi

if echo "$CHANGED_FILES" | grep -qE "timebank|service"; then
    MODULES_TO_TEST="$MODULES_TO_TEST timebank"
fi

if echo "$CHANGED_FILES" | grep -qE "forum|topic|thread"; then
    MODULES_TO_TEST="$MODULES_TO_TEST forum"
fi

# Remove duplicates
MODULES_TO_TEST=$(echo "$MODULES_TO_TEST" | tr ' ' '\n' | sort -u | tr '\n' ' ')

if [ -z "$MODULES_TO_TEST" ]; then
    echo "No module-specific changes detected."
    echo "Running basic health checks..."
    BASE_URL="$BASE_URL" npx playwright test tests/e2e/synthetic/critical-paths.spec.ts --grep "health" --reporter=list
    exit $?
fi

echo "Modules to verify: $MODULES_TO_TEST"
echo ""

# Run tests for each module
FAILED=0
for module in $MODULES_TO_TEST; do
    echo "--------------------------------------"
    if ! run_module_tests "$module"; then
        FAILED=1
        echo "FAILED: $module verification"
    else
        echo "PASSED: $module verification"
    fi
    echo ""
done

echo "======================================"
if [ $FAILED -eq 0 ]; then
    echo "  ALL VERIFICATIONS PASSED"
    echo "======================================"
    echo ""
    echo "You may now claim the fix is complete."
    exit 0
else
    echo "  VERIFICATION FAILED"
    echo "======================================"
    echo ""
    echo "DO NOT claim the fix is complete."
    echo "Review failures, fix issues, and re-run verification."
    exit 1
fi
