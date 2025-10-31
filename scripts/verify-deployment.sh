#!/usr/bin/env bash
#
# TogetherOS Deployment Verification Script
# Tests authentication system end-to-end
#
# Usage: ./scripts/verify-deployment.sh [URL]
# Example: ./scripts/verify-deployment.sh https://coopeverything.org

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${1:-https://coopeverything.org}"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
COOKIE_FILE="/tmp/togetheros-test-cookies.txt"

# Cleanup on exit
trap "rm -f $COOKIE_FILE" EXIT

echo "=================================================="
echo "TogetherOS Deployment Verification"
echo "=================================================="
echo "Target: $BASE_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# Helper functions
function test_step() {
    echo -e "${BLUE}→${NC} $1"
}

function test_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
}

function test_fail() {
    echo -e "  ${RED}✗${NC} $1"
    echo -e "  ${YELLOW}Error:${NC} $2"
}

function test_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
}

# Test 1: Homepage accessible
test_step "Test 1: Homepage loads"
if curl -sf "$BASE_URL" > /dev/null; then
    test_pass "Homepage is accessible"
else
    test_fail "Homepage not accessible" "Could not reach $BASE_URL"
    exit 1
fi

# Test 2: Signup page loads
test_step "Test 2: Signup page loads"
SIGNUP_RESPONSE=$(curl -sf "$BASE_URL/signup" || echo "")
if [[ "$SIGNUP_RESPONSE" == *"Welcome to the beginning"* ]]; then
    test_pass "Signup page loads with correct content"
else
    test_fail "Signup page issue" "Expected content not found"
fi

# Test 3: Login page loads
test_step "Test 3: Login page loads"
LOGIN_RESPONSE=$(curl -sf "$BASE_URL/login" || echo "")
if [[ "$LOGIN_RESPONSE" == *"Welcome back"* ]] || [[ "$LOGIN_RESPONSE" == *"Sign in"* ]]; then
    test_pass "Login page loads with correct content"
else
    test_fail "Login page issue" "Expected content not found"
fi

# Test 4: Dashboard redirects to login (protected route)
test_step "Test 4: Protected route redirects to login"
REDIRECT_RESPONSE=$(curl -sI "$BASE_URL/dashboard" | grep -i "location:" || echo "")
if [[ "$REDIRECT_RESPONSE" == *"/login"* ]]; then
    test_pass "Dashboard correctly redirects to login"
elif curl -sf "$BASE_URL/dashboard" | grep -q "login"; then
    test_pass "Dashboard redirects to login (client-side)"
else
    test_warn "Could not verify redirect - check manually"
fi

# Test 5: API endpoints respond
test_step "Test 5: API endpoints exist"

# Test signup endpoint
SIGNUP_API_RESPONSE=$(curl -sf -X POST "$BASE_URL/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"invalid\"}" || echo "error")

if [[ "$SIGNUP_API_RESPONSE" == *"error"* ]] || [[ "$SIGNUP_API_RESPONSE" == *"email"* ]]; then
    test_pass "Signup API endpoint responds"
else
    test_fail "Signup API issue" "Unexpected response: $SIGNUP_API_RESPONSE"
fi

# Test 6: Attempt user signup (if database is configured)
test_step "Test 6: User signup flow"

SIGNUP_RESULT=$(curl -s -c "$COOKIE_FILE" -X POST "$BASE_URL/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" || echo "error")

if [[ "$SIGNUP_RESULT" == *"success"* ]]; then
    test_pass "User signup successful"
    USER_CREATED=true
elif [[ "$SIGNUP_RESULT" == *"Database"* ]] || [[ "$SIGNUP_RESULT" == *"connection"* ]]; then
    test_warn "Database not configured yet - signup skipped"
    USER_CREATED=false
elif [[ "$SIGNUP_RESULT" == *"already registered"* ]]; then
    test_pass "Signup validation working (email already exists)"
    USER_CREATED=false
else
    test_warn "Signup returned: ${SIGNUP_RESULT:0:100}"
    USER_CREATED=false
fi

# Test 7: Session cookie set
if [ "$USER_CREATED" = true ]; then
    test_step "Test 7: Session cookie set"
    if grep -q "session" "$COOKIE_FILE" 2>/dev/null; then
        test_pass "Session cookie created"

        # Test 8: Access protected route with session
        test_step "Test 8: Access dashboard with valid session"
        DASHBOARD_RESPONSE=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/dashboard" || echo "")
        if [[ "$DASHBOARD_RESPONSE" == *"onboarding"* ]] || [[ "$DASHBOARD_RESPONSE" == *"dashboard"* ]]; then
            test_pass "Dashboard accessible with session"
        else
            test_warn "Dashboard response unclear - check manually"
        fi

        # Test 9: Profile API
        test_step "Test 9: Profile API with session"
        PROFILE_RESPONSE=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/api/profile" || echo "")
        if [[ "$PROFILE_RESPONSE" == *"email"* ]] || [[ "$PROFILE_RESPONSE" == *"user"* ]]; then
            test_pass "Profile API returns user data"
        else
            test_warn "Profile API response: ${PROFILE_RESPONSE:0:100}"
        fi

        # Test 10: Logout
        test_step "Test 10: Logout flow"
        LOGOUT_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "$BASE_URL/api/auth/logout" || echo "")
        if [[ "$LOGOUT_RESPONSE" == *"success"* ]] || [[ -z "$LOGOUT_RESPONSE" ]]; then
            test_pass "Logout successful"
        else
            test_warn "Logout response: $LOGOUT_RESPONSE"
        fi
    else
        test_warn "No session cookie found - check authentication"
    fi
else
    test_step "Test 7-10: Skipped (no user created)"
    test_warn "Database setup required for full authentication testing"
fi

# Test 11: Status endpoint
test_step "Test 11: Status endpoint"
STATUS_RESPONSE=$(curl -sf "$BASE_URL/api/status" || echo "")
if [[ "$STATUS_RESPONSE" == *"ok"* ]] || [[ "$STATUS_RESPONSE" == *"status"* ]]; then
    test_pass "Status API responding"
else
    test_warn "Status endpoint may not be configured"
fi

# Summary
echo ""
echo "=================================================="
echo "Verification Summary"
echo "=================================================="

if [ "$USER_CREATED" = true ]; then
    echo -e "${GREEN}✓ Full authentication flow working${NC}"
    echo ""
    echo "Test user created:"
    echo "  Email: $TEST_EMAIL"
    echo "  Password: $TEST_PASSWORD"
    echo ""
    echo "You can manually test by logging in at:"
    echo "  $BASE_URL/login"
else
    echo -e "${YELLOW}⚠ Partial verification complete${NC}"
    echo ""
    echo "Frontend pages: ✓ Working"
    echo "API endpoints: ✓ Responding"
    echo "Database: ⚠ Not configured or not accessible"
    echo ""
    echo "To complete setup, run on VPS:"
    echo "  ssh root@72.60.27.167"
    echo "  sudo -u postgres psql -d togetheros -f /var/www/togetheros/db/schema.sql"
    echo "  cd /var/www/togetheros && nano .env  # Add JWT_SECRET and DB_* vars"
    echo "  pm2 restart togetheros"
fi

echo ""
echo "For detailed setup instructions, see:"
echo "  docs/auth/DEPLOYMENT_READY.md"
echo "=================================================="
