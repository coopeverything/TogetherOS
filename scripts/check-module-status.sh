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

# Check specific module or all modules
if [[ -n "$MODULE" ]]; then
  MODULES=("$MODULE")
else
  # Extract module names from STATUS_v2.md
  mapfile -t MODULES < <(grep -o "progress:[a-z-]*=" docs/STATUS_v2.md | cut -d: -f2 | cut -d= -f1 | sort -u)
fi

DISCREPANCIES=0

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

echo ""
if [[ $DISCREPANCIES -eq 0 ]]; then
  echo "✅ All module progress markers are synchronized!"
else
  echo "❌ Found $DISCREPANCIES discrepancy/discrepancies"
  echo ""
  echo "To fix:"
  echo "1. Update individual module specs to match STATUS_v2.md"
  echo "2. Update docs/modules/INDEX.md descriptions"
  echo "3. Commit: git commit -m 'docs(modules): sync status markers'"
  exit 1
fi
