#!/usr/bin/env bash
#
# TogetherOS VPS Setup Checker
# Verifies database and environment configuration on production VPS
#
# Usage: ./scripts/check-vps-setup.sh [user@host]
# Example: ./scripts/check-vps-setup.sh root@72.60.27.167

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
# Use environment variables with fallback to hardcoded defaults
# Set VPS_IP and VPS_USER env vars to override
VPS_HOST="${1:-${VPS_USER:-root}@${VPS_IP:-72.60.27.167}}"

echo "=================================================="
echo "TogetherOS VPS Setup Checker"
echo "=================================================="
echo "Target: $VPS_HOST"
echo ""

# Helper functions
function check_step() {
    echo -e "${BLUE}→${NC} $1"
}

function check_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
}

function check_fail() {
    echo -e "  ${RED}✗${NC} $1"
}

function check_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
}

# Check 1: SSH connectivity
check_step "Check 1: SSH connectivity"
if ssh -o ConnectTimeout=5 -o BatchMode=yes "$VPS_HOST" "echo 'connected'" > /dev/null 2>&1; then
    check_pass "SSH connection successful"
else
    check_fail "Cannot connect via SSH"
    echo ""
    echo "Please ensure:"
    echo "  1. SSH key is configured"
    echo "  2. Host is correct: $VPS_HOST"
    echo "  3. Port 22 is open"
    exit 1
fi

# Check 2: Project directory exists
check_step "Check 2: Project directory"
if ssh "$VPS_HOST" "test -d /var/www/togetheros"; then
    check_pass "Project directory exists at /var/www/togetheros"
else
    check_fail "Project directory not found"
    exit 1
fi

# Check 3: Git branch
check_step "Check 3: Git branch status"
BRANCH=$(ssh "$VPS_HOST" "cd /var/www/togetheros && git branch --show-current")
if [ "$BRANCH" = "yolo" ]; then
    check_pass "On yolo branch"
else
    check_warn "On branch: $BRANCH (expected: yolo)"
fi

COMMIT=$(ssh "$VPS_HOST" "cd /var/www/togetheros && git log -1 --format='%h - %s'")
echo "  Latest commit: $COMMIT"

# Check 4: Environment variables
check_step "Check 4: Environment variables"
ENV_CHECK=$(ssh "$VPS_HOST" "cd /var/www/togetheros && cat .env 2>/dev/null || echo 'missing'")

if [ "$ENV_CHECK" = "missing" ]; then
    check_fail ".env file not found"
    echo ""
    echo "Create .env file on VPS:"
    echo "  ssh $VPS_HOST"
    echo "  cd /var/www/togetheros"
    echo "  nano .env"
    echo ""
    echo "Required variables:"
    echo "  JWT_SECRET=<generate with: openssl rand -base64 48>"
    echo "  DB_HOST=localhost"
    echo "  DB_PORT=5432"
    echo "  DB_NAME=togetheros"
    echo "  DB_USER=togetheros_app"
    echo "  DB_PASSWORD=<your_password>"
else
    check_pass ".env file exists"

    # Check specific variables
    HAS_JWT=$(echo "$ENV_CHECK" | grep -c "JWT_SECRET=" || echo "0")
    HAS_DB=$(echo "$ENV_CHECK" | grep -c "DB_HOST=" || echo "0")

    if [ "$HAS_JWT" -gt 0 ]; then
        check_pass "JWT_SECRET is set"
    else
        check_fail "JWT_SECRET not found in .env"
        echo "    Generate with: openssl rand -base64 48"
    fi

    if [ "$HAS_DB" -gt 0 ]; then
        check_pass "Database variables present"
    else
        check_warn "Database variables may be missing"
    fi
fi

# Check 5: PostgreSQL running
check_step "Check 5: PostgreSQL status"
if ssh "$VPS_HOST" "systemctl is-active postgresql > /dev/null 2>&1"; then
    check_pass "PostgreSQL is running"
else
    check_fail "PostgreSQL is not running"
    echo "    Start with: sudo systemctl start postgresql"
fi

# Check 6: Database exists
check_step "Check 6: Database existence"
DB_EXISTS=$(ssh "$VPS_HOST" "sudo -u postgres psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -w togetheros | wc -l" || echo "0")

if [ "$DB_EXISTS" -gt 0 ]; then
    check_pass "Database 'togetheros' exists"

    # Check tables
    TABLES=$(ssh "$VPS_HOST" "sudo -u postgres psql -d togetheros -c '\dt' 2>/dev/null | grep -c 'users\|sessions' || echo '0'")

    if [ "$TABLES" -gt 0 ]; then
        check_pass "Database tables exist (users, sessions, etc.)"
    else
        check_warn "Database exists but tables may be missing"
        echo ""
        echo "Run schema on VPS:"
        echo "  sudo -u postgres psql -d togetheros -f /var/www/togetheros/db/schema.sql"
    fi
else
    check_fail "Database 'togetheros' not found"
    echo ""
    echo "Create database on VPS:"
    echo "  sudo -u postgres psql -c \"CREATE DATABASE togetheros;\""
    echo "  sudo -u postgres psql -c \"CREATE USER togetheros_app WITH PASSWORD 'your_password';\""
    echo "  sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE togetheros TO togetheros_app;\""
    echo "  sudo -u postgres psql -d togetheros -f /var/www/togetheros/db/schema.sql"
fi

# Check 7: Node.js and dependencies
check_step "Check 7: Node.js and dependencies"
NODE_VERSION=$(ssh "$VPS_HOST" "cd /var/www/togetheros && node --version 2>/dev/null || echo 'missing'")

if [ "$NODE_VERSION" != "missing" ]; then
    check_pass "Node.js installed: $NODE_VERSION"
else
    check_fail "Node.js not found"
fi

if ssh "$VPS_HOST" "test -d /var/www/togetheros/node_modules"; then
    check_pass "Dependencies installed"
else
    check_warn "node_modules not found - run npm install"
fi

# Check 8: PM2 status
check_step "Check 8: PM2 application status"
PM2_STATUS=$(ssh "$VPS_HOST" "pm2 status togetheros 2>/dev/null || echo 'not found'")

if [[ "$PM2_STATUS" == *"online"* ]]; then
    check_pass "Application is running (PM2)"
elif [[ "$PM2_STATUS" == *"stopped"* ]]; then
    check_warn "Application is stopped - restart with: pm2 restart togetheros"
else
    check_warn "Application not found in PM2"
    echo "    Start with: pm2 start ecosystem.config.js"
fi

# Check 9: Build artifacts
check_step "Check 9: Build artifacts"
if ssh "$VPS_HOST" "test -d /var/www/togetheros/apps/web/.next"; then
    check_pass "Next.js build artifacts exist"
else
    check_warn "No build artifacts found"
    echo "    Build with: cd apps/web && npm run build"
fi

# Summary
echo ""
echo "=================================================="
echo "Setup Summary"
echo "=================================================="

READY=$(ssh "$VPS_HOST" "
    if [ -f /var/www/togetheros/.env ] && \
       [ -d /var/www/togetheros/node_modules ] && \
       [ -d /var/www/togetheros/apps/web/.next ]; then
        echo 'yes'
    else
        echo 'no'
    fi
")

if [ "$READY" = "yes" ] && [ "$DB_EXISTS" -gt 0 ]; then
    echo -e "${GREEN}✓ VPS is configured and ready${NC}"
    echo ""
    echo "Test the deployment:"
    echo "  ./scripts/verify-deployment.sh https://coopeverything.org"
else
    echo -e "${YELLOW}⚠ VPS setup incomplete${NC}"
    echo ""
    echo "Remaining steps:"
    [ "$ENV_CHECK" = "missing" ] && echo "  1. Create .env file with JWT_SECRET and DB_* variables"
    [ "$DB_EXISTS" -eq 0 ] && echo "  2. Create PostgreSQL database and run schema"
    [ ! -d "node_modules" ] && echo "  3. Run npm install"
    echo "  4. Run npm run build in apps/web"
    echo "  5. Restart PM2: pm2 restart togetheros"
    echo ""
    echo "Quick setup guide:"
    echo "  ssh $VPS_HOST"
    echo "  cd /var/www/togetheros"
    echo "  # Follow prompts from checks above"
fi

echo ""
echo "Full documentation:"
echo "  docs/auth/DEPLOYMENT_READY.md"
echo "=================================================="
