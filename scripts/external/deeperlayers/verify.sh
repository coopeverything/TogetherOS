#!/bin/bash
#
# DeeperLayers.com Post-Optimization Verification Script
#
# Usage: Run from any machine with curl access
#   bash verify.sh
#
# What this script checks:
#   1. Meta description present
#   2. Only one H1 tag
#   3. Hero image has alt text
#   4. Reduced font loading
#   5. GA4 present (not Monster Insights)

set -euo pipefail

URL="https://deeperlayers.com"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
info() { echo -e "[INFO] $1"; }

echo "============================================"
echo "DeeperLayers.com Optimization Verification"
echo "============================================"
echo ""

# Fetch the page once
info "Fetching $URL..."
PAGE=$(curl -sL "$URL" 2>/dev/null)

if [ -z "$PAGE" ]; then
    fail "Could not fetch $URL"
    exit 1
fi

ERRORS=0

echo ""
echo "=== SEO Checks ==="

# 1. Meta description
if echo "$PAGE" | grep -q '<meta name="description"'; then
    DESC=$(echo "$PAGE" | grep -oP '<meta name="description" content="\K[^"]+' | head -1)
    if [ ${#DESC} -gt 50 ]; then
        pass "Meta description present (${#DESC} chars)"
    else
        warn "Meta description present but short (${#DESC} chars) - aim for 120-160"
    fi
else
    fail "Meta description MISSING"
    ERRORS=$((ERRORS + 1))
fi

# 2. H1 count
H1_COUNT=$(echo "$PAGE" | grep -o '<h1' | wc -l)
if [ "$H1_COUNT" -eq 1 ]; then
    pass "Exactly 1 H1 tag found"
elif [ "$H1_COUNT" -eq 0 ]; then
    fail "No H1 tag found"
    ERRORS=$((ERRORS + 1))
else
    fail "Multiple H1 tags found ($H1_COUNT) - should be exactly 1"
    ERRORS=$((ERRORS + 1))
fi

# 3. Hero image alt text
if echo "$PAGE" | grep -q 'Elbow-Trap-Full' && echo "$PAGE" | grep -q 'alt="'; then
    if echo "$PAGE" | grep 'Elbow-Trap-Full' | grep -q 'alt=""'; then
        fail "Hero image has empty alt text"
        ERRORS=$((ERRORS + 1))
    else
        pass "Hero image has alt text"
    fi
else
    warn "Could not verify hero image alt text (may need manual check)"
fi

echo ""
echo "=== Speed Checks ==="

# 4. Font loading (check for Google Fonts subset)
FONT_WEIGHTS=$(echo "$PAGE" | grep -oP 'fonts\.googleapis\.com[^"]+' | head -1)
if [ -n "$FONT_WEIGHTS" ]; then
    # Count weight specifications
    WEIGHT_COUNT=$(echo "$FONT_WEIGHTS" | grep -oP 'wght@[\d;]+' | tr ';' '\n' | wc -l)
    if [ "$WEIGHT_COUNT" -le 6 ]; then
        pass "Optimized font loading ($WEIGHT_COUNT weights)"
    else
        warn "Font loading not fully optimized ($WEIGHT_COUNT weights, target <=4)"
    fi
else
    warn "Could not detect Google Fonts loading pattern"
fi

# 5. Check for Monster Insights vs lightweight GA4
if echo "$PAGE" | grep -q 'monsterinsights'; then
    warn "Monster Insights still loading (overhead present)"
elif echo "$PAGE" | grep -q 'gtag.*G-P60F4568DX'; then
    pass "Lightweight GA4 detected"
else
    warn "Analytics configuration unclear - check manually"
fi

# 6. Check for child theme
if echo "$PAGE" | grep -q 'divi-child'; then
    pass "Child theme active"
else
    warn "Child theme may not be active"
fi

echo ""
echo "=== Additional Checks ==="

# 7. Check for preconnect hints
if echo "$PAGE" | grep -q 'preconnect.*fonts.gstatic.com'; then
    pass "Font preconnect hint present"
else
    warn "Font preconnect hint missing (minor perf impact)"
fi

# 8. Check for excessive inline CSS
INLINE_CSS_SIZE=$(echo "$PAGE" | grep -oP '<style[^>]*>.*?</style>' | wc -c)
if [ "$INLINE_CSS_SIZE" -gt 50000 ]; then
    warn "Large inline CSS detected (${INLINE_CSS_SIZE} bytes) - consider static CSS file"
else
    pass "Inline CSS reasonable (${INLINE_CSS_SIZE} bytes)"
fi

echo ""
echo "============================================"
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}All critical checks passed!${NC}"
else
    echo -e "${RED}$ERRORS critical issue(s) found${NC}"
fi
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Run PageSpeed Insights: https://pagespeed.web.dev/analysis?url=$URL"
echo "  2. Check WebP delivery in DevTools Network tab"
echo "  3. Verify responsive images with srcset in DevTools"
echo ""

exit $ERRORS
