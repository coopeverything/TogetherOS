#!/usr/bin/env bash
# TogetherOS CSS Validation Script
# Runs before deployment to catch CSS errors
# Called by yolo1 skill before PR merge

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "TogetherOS CSS Validation"
echo "=========================================="

ERRORS=0
WARNINGS=0

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# ==========================================
# 1. Check for CSS syntax errors using stylelint (if available)
# ==========================================
echo -e "\n${YELLOW}[1/5] Checking CSS syntax...${NC}"

if command_exists npx; then
  # Check if stylelint is available
  if npx stylelint --version >/dev/null 2>&1; then
    if npx stylelint "apps/web/**/*.css" --quiet 2>/dev/null; then
      echo -e "${GREEN}✓ CSS syntax OK${NC}"
    else
      echo -e "${YELLOW}⚠ CSS syntax issues found (non-blocking)${NC}"
      WARNINGS=$((WARNINGS + 1))
    fi
  else
    echo -e "${YELLOW}⚠ stylelint not installed, skipping syntax check${NC}"
  fi
else
  echo -e "${YELLOW}⚠ npx not available, skipping syntax check${NC}"
fi

# ==========================================
# 2. Check for undefined CSS variables
# ==========================================
echo -e "\n${YELLOW}[2/5] Checking for undefined CSS variables...${NC}"

# Extract all CSS variable usages
USED_VARS=$(grep -roh 'var(--[a-zA-Z0-9_-]*)' apps/web/ --include="*.css" --include="*.tsx" 2>/dev/null | \
  sed 's/var(//g; s/)//g' | sort -u || true)

# Extract all CSS variable definitions from theme files
DEFINED_VARS=$(grep -roh '\-\-[a-zA-Z0-9_-]*:' .claude/skills/ux-designer/design-system/ --include="*.css" 2>/dev/null | \
  sed 's/://g' | sort -u || true)

# Also check apps/web for definitions
DEFINED_VARS_APP=$(grep -roh '\-\-[a-zA-Z0-9_-]*:' apps/web/ --include="*.css" 2>/dev/null | \
  sed 's/://g' | sort -u || true)

ALL_DEFINED=$(echo -e "${DEFINED_VARS}\n${DEFINED_VARS_APP}" | sort -u)

# Known legacy variables that exist in codebase but aren't in our design system yet
# (shadcn/ui defaults and existing codebase variables)
LEGACY_VARS="error ink-300 ink-500 ink-600 background foreground card card-foreground popover popover-foreground primary primary-foreground secondary secondary-foreground muted muted-foreground accent accent-foreground destructive destructive-foreground border input ring radius"

UNDEFINED_COUNT=0
if [ -n "$USED_VARS" ]; then
  while IFS= read -r var; do
    if [ -n "$var" ] && ! echo "$ALL_DEFINED" | grep -qF -- "$var"; then
      # Skip Tailwind's internal variables
      if [[ ! "$var" =~ ^--tw- ]]; then
        # Strip -- prefix for legacy check
        var_name="${var#--}"
        # Skip known legacy variables (shadcn/ui defaults)
        if ! echo "$LEGACY_VARS" | grep -qw "$var_name"; then
          echo -e "${YELLOW}  ⚠ Undefined: $var${NC}"
          UNDEFINED_COUNT=$((UNDEFINED_COUNT + 1))
        fi
      fi
    fi
  done <<< "$USED_VARS"
fi

if [ "$UNDEFINED_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✓ All CSS variables defined (or known legacy)${NC}"
else
  echo -e "${YELLOW}⚠ Found $UNDEFINED_COUNT undefined CSS variables${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# ==========================================
# 3. Check for responsive breakpoints
# ==========================================
echo -e "\n${YELLOW}[3/5] Checking responsive breakpoints...${NC}"

# Count pages without mobile styles
PAGES_WITHOUT_MOBILE=0
for file in apps/web/app/**/page.tsx; do
  if [ -f "$file" ]; then
    # Check if file uses responsive classes (sm:, md:, lg:, or media queries)
    if ! grep -qE '(sm:|md:|lg:|xl:|@media)' "$file" 2>/dev/null; then
      # Only warn for substantial pages (more than 50 lines)
      LINE_COUNT=$(wc -l < "$file")
      if [ "$LINE_COUNT" -gt 50 ]; then
        echo -e "${YELLOW}  ⚠ No responsive styles: $file${NC}"
        PAGES_WITHOUT_MOBILE=$((PAGES_WITHOUT_MOBILE + 1))
      fi
    fi
  fi
done 2>/dev/null || true

if [ "$PAGES_WITHOUT_MOBILE" -eq 0 ]; then
  echo -e "${GREEN}✓ Responsive styles present${NC}"
else
  echo -e "${YELLOW}⚠ $PAGES_WITHOUT_MOBILE pages may need responsive review${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# ==========================================
# 4. Check for accessibility (focus states)
# ==========================================
echo -e "\n${YELLOW}[4/5] Checking accessibility focus states...${NC}"

# Look for interactive elements without focus styles
FOCUS_ISSUES=0

# Check for buttons/links without focus-visible
for file in apps/web/app/**/page.tsx apps/web/components/**/*.tsx; do
  if [ -f "$file" ]; then
    # Check if file has buttons/links
    if grep -qE '<(button|a |Link )' "$file" 2>/dev/null; then
      # Check if it has focus styles
      if ! grep -qE '(focus:|focus-visible:|:focus)' "$file" 2>/dev/null; then
        # Only flag if there are multiple interactive elements
        INTERACTIVE_COUNT=$(grep -cE '<(button|a |Link )' "$file" 2>/dev/null || echo "0")
        if [ "$INTERACTIVE_COUNT" -gt 2 ]; then
          echo -e "${YELLOW}  ⚠ Review focus states: $file${NC}"
          FOCUS_ISSUES=$((FOCUS_ISSUES + 1))
        fi
      fi
    fi
  fi
done 2>/dev/null || true

if [ "$FOCUS_ISSUES" -eq 0 ]; then
  echo -e "${GREEN}✓ Focus states look good${NC}"
else
  echo -e "${YELLOW}⚠ $FOCUS_ISSUES files may need focus state review${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# ==========================================
# 5. Check Tailwind class validity (basic)
# ==========================================
echo -e "\n${YELLOW}[5/5] Checking Tailwind classes...${NC}"

# Look for potentially invalid Tailwind classes (common mistakes)
INVALID_CLASSES=0
INVALID_PATTERNS=(
  'class="[^"]*text-primary-[0-9]'  # text-primary doesn't take numbers in our config
  'class="[^"]*bg-primary-[0-9]'
  'class="[^"]*flex-center'          # Should be flex items-center justify-center
  'class="[^"]*margin-'              # Should be m- or mx- etc
  'class="[^"]*padding-'             # Should be p- or px- etc
)

for pattern in "${INVALID_PATTERNS[@]}"; do
  MATCHES=$(grep -rlE "$pattern" apps/web/ --include="*.tsx" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    echo -e "${YELLOW}  ⚠ Potential invalid class pattern: $pattern${NC}"
    INVALID_CLASSES=$((INVALID_CLASSES + 1))
  fi
done

if [ "$INVALID_CLASSES" -eq 0 ]; then
  echo -e "${GREEN}✓ Tailwind classes look valid${NC}"
else
  echo -e "${YELLOW}⚠ $INVALID_CLASSES potential class issues${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# ==========================================
# Summary
# ==========================================
echo -e "\n=========================================="
echo "Validation Summary"
echo "=========================================="

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo -e "${GREEN}✓ All CSS checks passed!${NC}"
  echo "CSS=OK"
  exit 0
elif [ "$ERRORS" -eq 0 ]; then
  echo -e "${YELLOW}⚠ Passed with $WARNINGS warning(s)${NC}"
  echo "CSS=OK (with warnings)"
  exit 0
else
  echo -e "${RED}✗ Failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
  echo "CSS=FAILED"
  exit 1
fi
