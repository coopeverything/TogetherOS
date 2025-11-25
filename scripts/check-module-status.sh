#!/usr/bin/env bash
# Module Status Synchronization Check
# Compares module progress across INDEX.md, STATUS_v2.md, and individual specs
# Usage: ./scripts/check-module-status.sh [module-name]

set -euo pipefail

MODULE="${1:-}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$REPO_ROOT"

echo "=== Module Status Synchronization Check ==="
echo ""

# Extract all progress markers from STATUS_v2.md
echo "📊 Progress markers in STATUS_v2.md:"
grep -o "progress:[a-z-]*=[0-9]*" docs/STATUS_v2.md | sort | while read -r marker; do
  module_name=$(echo "$marker" | cut -d: -f2 | cut -d= -f1)
  percentage=$(echo "$marker" | cut -d= -f2)
  echo "  $module_name: $percentage%"
done

echo ""
echo "📄 Individual module specs:"
find docs/modules -name "*.md" -type f ! -name "INDEX.md" | while read -r spec_file; do
  if grep -q "<!-- progress:" "$spec_file"; then
    marker=$(grep -o "progress:[a-z-]*=[0-9]*" "$spec_file" | head -1)
    module_name=$(echo "$marker" | cut -d: -f2 | cut -d= -f1)
    percentage=$(echo "$marker" | cut -d= -f2)
    echo "  $module_name: $percentage% ($spec_file)"
  fi
done

echo ""
echo "🏠 INDEX.md mentions:"
grep -E "[0-9]+% complete|spec only|production-ready|planned" docs/modules/INDEX.md | \
  sed 's/^- /  /' | head -20

echo ""
echo "=== Discrepancy Detection ==="

# Function to extract percentage from STATUS_v2.md
get_status_percentage() {
  local module="$1"
  grep -o "progress:$module=[0-9]*" docs/STATUS_v2.md 2>/dev/null | cut -d= -f2 || echo "NOT_FOUND"
}

# Function to extract percentage from module spec
get_spec_percentage() {
  local module="$1"
  local spec_file="docs/modules/$module.md"
  if [[ -f "$spec_file" ]]; then
    grep -o "progress:$module=[0-9]*" "$spec_file" 2>/dev/null | head -1 | cut -d= -f2 || echo "NOT_FOUND"
  else
    echo "NO_SPEC"
  fi
}

# Function to extract percentage from INDEX.md (parses "X% complete" format)
get_index_percentage() {
  local module="$1"
  # Map module names to their INDEX.md display names
  local search_term=""
  case "$module" in
    scaffold) search_term="Monorepo & Scaffolding" ;;
    ui) search_term="UI System" ;;
    auth) search_term="Identity & Auth" ;;
    profiles) search_term="Profiles" ;;
    groups) search_term="Groups & Orgs" ;;
    feed) search_term="Feed" ;;
    forum) search_term="Forum" ;;
    governance) search_term="Proposals & Decisions" ;;
    onboarding) search_term="Onboarding" ;;
    search) search_term="Search" ;;
    notifications) search_term="Notifications" ;;
    docs-hooks) search_term="Docs Site Hooks" ;;
    observability) search_term="Observability" ;;
    security) search_term="Security" ;;
    reputation) search_term="Support Points & Reputation" ;;
    gamification) search_term="Gamification" ;;
    social-economy) search_term="Social Economy Primitives" ;;
    admin-accountability) search_term="Admin Accountability" ;;
    support-points-ui) search_term="Support Points & Reward Points UI" ;;
    moderation-transparency) search_term="Moderation Transparency" ;;
    *) search_term="$module" ;;
  esac

  # Search for the module line and extract percentage
  local line
  line=$(grep -i "$search_term" docs/modules/INDEX.md 2>/dev/null | head -1)

  if [[ -z "$line" ]]; then
    echo "NOT_FOUND"
    return
  fi

  # Check for "planned" (meaning 0% or not implemented)
  if echo "$line" | grep -qi "(planned)"; then
    echo "PLANNED"
    return
  fi

  # Extract percentage from various patterns: "X% complete", "X% —", "(X%"
  local pct
  pct=$(echo "$line" | grep -oE "\([0-9]+%" | grep -oE "[0-9]+" | head -1 || echo "")

  if [[ -n "$pct" ]]; then
    echo "$pct"
  else
    echo "NO_PCT"
  fi
}

# Check specific module or all modules
if [[ -n "$MODULE" ]]; then
  MODULES=("$MODULE")
else
  # Extract module names from STATUS_v2.md
  mapfile -t MODULES < <(grep -o "progress:[a-z-]*=" docs/STATUS_v2.md | cut -d: -f2 | cut -d= -f1 | sort -u)
fi

DISCREPANCIES=0
INDEX_ISSUES=0

echo ""
echo "📋 Checking STATUS_v2.md ↔ Module specs:"
for module in "${MODULES[@]}"; do
  status_pct=$(get_status_percentage "$module")
  spec_pct=$(get_spec_percentage "$module")

  if [[ "$status_pct" != "NOT_FOUND" && "$spec_pct" != "NOT_FOUND" && "$spec_pct" != "NO_SPEC" ]]; then
    if [[ "$status_pct" != "$spec_pct" ]]; then
      echo "⚠️  MISMATCH: $module"
      echo "   STATUS_v2.md: $status_pct%"
      echo "   Module spec: $spec_pct%"
      echo "   → Should sync to: $status_pct%"
      DISCREPANCIES=$((DISCREPANCIES + 1))
    fi
  fi
done

# Modules tracked in STATUS_v2.md but NOT in INDEX.md (CI/DevEx and Path-scoped)
# These are intentionally in different sections of STATUS_v2.md
SKIP_INDEX_CHECK=(
  "ci-lint" "ci-docs" "ci-smoke" "deploy" "devcontainer" "secrets"
  "path-education" "path-governance" "path-community" "path-media"
  "path-wellbeing" "path-economy" "path-technology" "path-planet"
  "events" "metrics"
)

echo ""
echo "📋 Checking STATUS_v2.md ↔ INDEX.md:"
for module in "${MODULES[@]}"; do
  # Skip modules not tracked in INDEX.md
  if [[ " ${SKIP_INDEX_CHECK[*]} " =~ " ${module} " ]]; then
    continue
  fi

  status_pct=$(get_status_percentage "$module")
  index_pct=$(get_index_percentage "$module")

  if [[ "$status_pct" == "NOT_FOUND" ]]; then
    continue
  fi

  # Check for "planned" in INDEX.md when STATUS_v2.md shows progress
  if [[ "$index_pct" == "PLANNED" && "$status_pct" -gt 0 ]]; then
    echo "❌ INDEX.md says 'planned' but STATUS_v2.md shows $status_pct%: $module"
    INDEX_ISSUES=$((INDEX_ISSUES + 1))
    continue
  fi

  # Check for missing percentage in INDEX.md
  if [[ "$index_pct" == "NO_PCT" || "$index_pct" == "NOT_FOUND" ]]; then
    echo "⚠️  INDEX.md missing progress for: $module (STATUS_v2.md: $status_pct%)"
    INDEX_ISSUES=$((INDEX_ISSUES + 1))
    continue
  fi

  # Check for mismatched percentages
  if [[ "$index_pct" != "PLANNED" && "$index_pct" != "$status_pct" ]]; then
    echo "⚠️  INDEX.md mismatch: $module"
    echo "   STATUS_v2.md: $status_pct%"
    echo "   INDEX.md: $index_pct%"
    INDEX_ISSUES=$((INDEX_ISSUES + 1))
  fi
done

TOTAL_ISSUES=$((DISCREPANCIES + INDEX_ISSUES))

echo ""
if [[ $TOTAL_ISSUES -eq 0 ]]; then
  echo "✅ All module progress markers are synchronized!"
  echo "   STATUS_v2.md ↔ Module specs: OK"
  echo "   STATUS_v2.md ↔ INDEX.md: OK"
else
  echo "❌ Found issues:"
  [[ $DISCREPANCIES -gt 0 ]] && echo "   - $DISCREPANCIES spec file mismatch(es)"
  [[ $INDEX_ISSUES -gt 0 ]] && echo "   - $INDEX_ISSUES INDEX.md issue(s)"
  echo ""
  echo "To fix:"
  echo "1. Update individual module specs to match STATUS_v2.md"
  echo "2. Update docs/modules/INDEX.md descriptions with correct percentages"
  echo "3. Commit: git commit -m 'docs(modules): sync status markers'"
  exit 1
fi
