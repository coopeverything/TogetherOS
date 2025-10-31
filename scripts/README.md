# TogetherOS Deployment Scripts

Quick reference for deployment verification and VPS setup checking.

## Scripts

### verify-deployment.sh

Tests the full authentication system end-to-end from the outside (HTTP requests).

**Usage:**
```bash
./scripts/verify-deployment.sh [URL]

# Examples:
./scripts/verify-deployment.sh https://coopeverything.org
./scripts/verify-deployment.sh http://localhost:3000
```

**What it tests:**
- ✓ Homepage loads
- ✓ Signup page loads with correct content
- ✓ Login page loads
- ✓ Protected routes redirect to login
- ✓ API endpoints respond
- ✓ User signup flow (if database configured)
- ✓ Session cookie handling
- ✓ Profile API access
- ✓ Logout flow
- ✓ Status endpoint

**Output:**
- Green ✓ = Test passed
- Yellow ⚠ = Warning or skipped
- Red ✗ = Test failed

---

### check-vps-setup.sh

Checks VPS configuration via SSH (database, environment variables, PM2, etc.).

**Usage:**
```bash
./scripts/check-vps-setup.sh [user@host]

# Example:
./scripts/check-vps-setup.sh root@72.60.27.167
```

**What it checks:**
- ✓ SSH connectivity
- ✓ Project directory exists
- ✓ Git branch status (should be `yolo`)
- ✓ Environment variables (.env file)
- ✓ PostgreSQL status
- ✓ Database and tables exist
- ✓ Node.js and dependencies installed
- ✓ PM2 application status
- ✓ Build artifacts present

**Output:**
- Green ✓ = Check passed
- Yellow ⚠ = Warning or needs attention
- Red ✗ = Check failed (requires action)

---

## Quick Start

### 1. First Deployment

After code is deployed via GitHub Actions:

```bash
# Check VPS setup status
./scripts/check-vps-setup.sh root@72.60.27.167

# If database not configured, SSH to VPS and run:
ssh root@72.60.27.167
sudo -u postgres psql -d togetheros -f /var/www/togetheros/db/schema.sql

# Add environment variables
cd /var/www/togetheros
nano .env  # Add JWT_SECRET, DB_* variables

# Restart application
pm2 restart togetheros
exit

# Verify deployment works
./scripts/verify-deployment.sh https://coopeverything.org
```

### 2. Regular Checks

After pushing to `yolo` branch:

```bash
# Quick verification
./scripts/verify-deployment.sh https://coopeverything.org
```

If issues:

```bash
# Detailed VPS check
./scripts/check-vps-setup.sh root@72.60.27.167
```

---

## Common Scenarios

### Frontend works but signup fails

**Symptom:**
```
Frontend pages: ✓ Working
Database: ⚠ Not configured
```

**Solution:**
```bash
# Run VPS setup check
./scripts/check-vps-setup.sh root@72.60.27.167

# Follow instructions to setup database
ssh root@72.60.27.167
sudo -u postgres psql -d togetheros -f /var/www/togetheros/db/schema.sql
```

### Database exists but auth still fails

**Check environment variables:**
```bash
./scripts/check-vps-setup.sh root@72.60.27.167
# Look for "JWT_SECRET not found" or "Database variables missing"
```

**Fix:**
```bash
ssh root@72.60.27.167
cd /var/www/togetheros
nano .env
# Add missing variables
pm2 restart togetheros
```

### Application not running

**Check PM2 status:**
```bash
./scripts/check-vps-setup.sh root@72.60.27.167
# Look for "Application is stopped" or "not found in PM2"
```

**Fix:**
```bash
ssh root@72.60.27.167
pm2 restart togetheros
# OR
pm2 start ecosystem.config.js
```

---

## Requirements

Both scripts require:
- `curl` (for HTTP testing)
- `ssh` (for VPS checks)
- `grep`, `sed`, `awk` (standard Unix tools)

For VPS checks:
- SSH key configured for VPS access
- Proper permissions on VPS

---

## Exit Codes

- `0` = All checks passed
- `1` = Critical failure (cannot continue)
- Other = Partial success with warnings

---

## Related Documentation

- [Deployment Ready Guide](../docs/auth/DEPLOYMENT_READY.md)
- [Auto-Deploy Setup](../docs/dev/auto-deploy-setup.md)
- [Authentication System](../docs/auth/authentication-system.md)

---

**Last Updated:** October 31, 2025
