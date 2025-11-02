# Manual Setup Guide - Error Catching & Monitoring

This guide provides step-by-step instructions for configuring the error catching and monitoring systems implemented in Phase 1.

**Prerequisites:**
- Production VPS access (`ssh root@72.60.27.167`)
- GitHub admin access to https://github.com/coopeverything/TogetherOS
- Email account for alerts
- Slack workspace (optional but recommended)

**Total Time:** ~20-30 minutes

---

## 1. Sentry Error Tracking Setup

**Time:** ~10 minutes

### Step 1.1: Create Sentry Account

1. Visit https://sentry.io/signup/
2. Click "Sign Up" in top-right corner
3. Choose sign-up method:
   - **Recommended:** "Continue with GitHub" (auto-links repos)
   - Alternative: Email + password
4. Verify email if using email signup
5. **Pricing verification (2025):**
   - Free tier: 5,000 events/month, 1 user, error + performance monitoring
   - Paid tier: Starts at $26/month for Team plan (unlimited users)

**Expected outcome:** Logged into Sentry dashboard

### Step 1.2: Create Organization

1. Organization name: `coopeverything` or `togetheros`
2. Organization slug: Will auto-generate (e.g., `coopeverything-ab`)
3. Click "Create Organization"

**Expected outcome:** Organization dashboard visible

### Step 1.3: Create Project

1. Click "Create Project" button
2. **Platform:** Select "Next.js"
3. **Alert frequency:** Select "Alert me on every new issue" (recommended initially)
4. **Project name:** `togetheros`
5. **Team:** Leave as default (your organization)
6. Click "Create Project"

**Expected outcome:** Project created, setup instructions shown

### Step 1.4: Get DSN (Data Source Name)

1. Look for DSN in setup instructions (format: `https://[key]@o[id].ingest.sentry.io/[project-id]`)
2. **Copy both DSNs:**
   - **Public DSN** (for client-side): Starts with `https://`
   - **Auth Token DSN** (for server-side): Same as public DSN
3. Example DSN:
   ```
   https://abc123def456@o4507234567890.ingest.sentry.io/4507234567891
   ```

**Expected outcome:** DSN copied to clipboard

### Step 1.5: Configure Environment Variables

**On VPS:**
```bash
# SSH to VPS
ssh root@72.60.27.167

# Navigate to app directory
cd /var/www/togetheros

# Edit .env.local (create if doesn't exist)
nano .env.local

# Add these lines (replace with your actual DSN):
SENTRY_DSN=https://your-key@o1234567.ingest.sentry.io/1234567
NEXT_PUBLIC_SENTRY_DSN=https://your-key@o1234567.ingest.sentry.io/1234567
SENTRY_ORG=coopeverything
SENTRY_PROJECT=togetheros

# Save and exit (Ctrl+X, Y, Enter)
```

**Locally (for development):**
```bash
# In your local repo
cp apps/web/.env.example apps/web/.env.local

# Edit .env.local and add same Sentry variables
```

### Step 1.6: Get Auth Token (for source maps)

1. In Sentry dashboard, click your avatar (top-right)
2. Click "Organization settings"
3. Click "Auth Tokens" in left sidebar
4. Click "Create New Token"
5. **Token name:** `TogetherOS CI/CD`
6. **Scopes:**
   - ✅ `project:read`
   - ✅ `project:releases`
   - ✅ `org:read`
7. Click "Create Token"
8. **Copy token** (shown only once!)

**Add to VPS:**
```bash
# SSH to VPS
ssh root@72.60.27.167
cd /var/www/togetheros

# Edit .env.local
nano .env.local

# Add:
SENTRY_AUTH_TOKEN=your_auth_token_here

# Save and exit
```

**Add to GitHub Secrets:**
```bash
# Using GitHub CLI locally
gh secret set SENTRY_AUTH_TOKEN --body "your_auth_token_here"

# Or manually:
# 1. Go to https://github.com/coopeverything/TogetherOS/settings/secrets/actions
# 2. Click "New repository secret"
# 3. Name: SENTRY_AUTH_TOKEN
# 4. Value: <paste token>
# 5. Click "Add secret"
```

### Step 1.7: Configure Slack Alerts (Optional but Recommended)

1. In Sentry project dashboard, click "Settings" (left sidebar)
2. Click "Integrations"
3. Find "Slack" and click "Add to Workspace"
4. **Select Slack workspace:** Your TogetherOS workspace
5. **Authorize** Sentry app
6. **Configure alerts:**
   - Channel: `#engineering` or `#alerts`
   - Trigger: "New Issue" + "Error Spike"
7. Click "Save"

**Alert Rules (Recommended):**
- **Error Spike:** >50 errors in 5 minutes → Slack notification
- **New Issue:** First occurrence → Slack notification
- **Critical Error:** Any unhandled exception → Slack notification

### Step 1.8: Test Sentry

**Via test page:**
```bash
# Visit production test page
https://coopeverything.org/test/monitoring

# Click "Test Sentry (Caught)"
# Click "Test Sentry (Uncaught)"
```

**Expected outcome:**
1. Alert box appears: "Test error sent to Sentry!"
2. Within 30 seconds, check Sentry dashboard: https://sentry.io/organizations/[your-org]/issues/
3. Two new issues visible: "Test error from monitoring page" + "Unhandled test error"
4. If Slack configured, notification in channel

**Troubleshooting:**
- **No errors appearing:** Check DSN is correct in `.env.local`
- **403 Forbidden:** Auth token invalid or missing scopes
- **Errors not sending:** Restart Next.js: `pm2 restart togetheros`

---

## 2. UptimeRobot Setup

**Time:** ~10 minutes

### Step 2.1: Create Account

1. Visit https://uptimerobot.com/
2. Click "Free Sign Up"
3. Choose sign-up method:
   - Email + password (recommended for free tier)
   - Continue with Google
4. Verify email
5. **Pricing verification (2025):**
   - Free tier: 50 monitors, 5-minute interval, unlimited alerts
   - Paid tier: Starts at $7/month for 1-minute interval

**Expected outcome:** Logged into UptimeRobot dashboard

### Step 2.2: Create Monitors

**Monitor 1: Health Endpoint**

1. Click "Add New Monitor" (big blue button)
2. **Monitor Type:** HTTP(s)
3. **Friendly Name:** `TogetherOS Health Endpoint`
4. **URL:** `https://coopeverything.org/api/health`
5. **Monitoring Interval:** 5 minutes
6. **Keyword:** (expand "Advanced" section)
   - **Keyword Type:** Exists
   - **Keyword:** `"status":"ok"`
   - **Case sensitivity:** Disabled
7. Click "Create Monitor"

**Monitor 2: Homepage**

1. Click "Add New Monitor"
2. **Monitor Type:** HTTP(s)
3. **Friendly Name:** `TogetherOS Homepage`
4. **URL:** `https://coopeverything.org/`
5. **Monitoring Interval:** 5 minutes
6. Click "Create Monitor"

**Monitor 3: Signup Page**

1. Click "Add New Monitor"
2. **Monitor Type:** HTTP(s)
3. **Friendly Name:** `TogetherOS Signup`
4. **URL:** `https://coopeverything.org/signup`
5. **Monitoring Interval:** 5 minutes
6. Click "Create Monitor"

**Monitor 4: Login Page**

1. Click "Add New Monitor"
2. **Monitor Type:** HTTP(s)
3. **Friendly Name:** `TogetherOS Login`
4. **URL:** `https://coopeverything.org/login`
5. **Monitoring Interval:** 5 minutes
6. Click "Create Monitor"

**Expected outcome:** 4 monitors visible, all showing "Up" status

### Step 2.3: Configure Alert Contacts

**Email Alerts (Default):**
- Already configured during signup
- Check "My Settings" → "Alert Contacts" to verify

**Slack Webhook (Recommended):**

1. **In Slack workspace:**
   - Go to https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - App name: `UptimeRobot`
   - Workspace: Select your workspace
   - Click "Create App"
   - Click "Incoming Webhooks" in left sidebar
   - Toggle "Activate Incoming Webhooks" to ON
   - Click "Add New Webhook to Workspace"
   - Select channel: `#alerts` or `#engineering`
   - Click "Allow"
   - **Copy webhook URL** (format: `https://hooks.slack.com/services/T00/B00/xxx`)

2. **In UptimeRobot:**
   - Click "My Settings" (top-right)
   - Click "Alert Contacts" tab
   - Click "Add Alert Contact"
   - **Type:** Slack
   - **Friendly Name:** `Slack #alerts`
   - **Webhook URL:** Paste your Slack webhook URL
   - Click "Create Alert Contact"

3. **Assign to monitors:**
   - Go back to "Monitors" tab
   - For each monitor, click "Edit"
   - Under "Alert Contacts to Notify," select:
     - ✅ Your email
     - ✅ Slack #alerts
   - Click "Save Changes"

### Step 2.4: Configure Alert Thresholds

For each monitor:

1. Click "Edit" on monitor
2. Scroll to "Alert Contacts to Notify"
3. **After how many minutes should we alert you if your monitor goes down?**
   - Set to: `2` (means 2 consecutive failures = 10 minutes for 5-min interval)
4. **Send "up again" notification?**
   - ✅ Enable (get notified when service restores)
5. Click "Save Changes"

### Step 2.5: Setup Public Status Page (Optional)

1. Click "Status Pages" in top menu
2. Click "Add New Status Page"
3. **Friendly Name:** `TogetherOS Status`
4. **Select monitors to show:** ✅ All 4 monitors
5. **Custom domain:** (optional, requires DNS setup)
   - Default URL: `https://stats.uptimerobot.com/[unique-id]`
   - Custom: `status.coopeverything.org` (requires CNAME)
6. Click "Create Status Page"

**Expected outcome:** Public status page at provided URL

### Step 2.6: Test UptimeRobot

**Simulate downtime:**
```bash
# SSH to VPS
ssh root@72.60.27.167

# Stop PM2
pm2 stop togetheros

# Wait 10 minutes (2 × 5-minute checks)
# You should receive:
# - Email alert: "TogetherOS Health Endpoint is DOWN"
# - Slack notification (if configured)

# Restore service
pm2 start togetheros

# Wait 5 minutes
# You should receive:
# - Email: "TogetherOS Health Endpoint is UP"
# - Slack notification
```

**Expected outcome:**
- Down alert received within 10 minutes
- Up alert received within 5 minutes of restoration

**Troubleshooting:**
- **No alerts:** Check Alert Contacts are assigned to monitors
- **False positives:** Check URL is accessible from external network
- **Keyword not found:** Verify `/api/health` returns `"status":"ok"`

---

## 3. GitHub Advanced Security Setup

**Time:** ~5 minutes

### Step 3.1: Enable Code Scanning (CodeQL)

1. Visit https://github.com/coopeverything/TogetherOS/security
2. Click "Code scanning" section
3. Click "Set up code scanning"
4. **CodeQL Analysis workflow** already exists (`.github/workflows/codeql.yml`)
5. Workflow will run automatically on:
   - Every push to `main` or `yolo`
   - Every pull request
   - Weekly schedule (Mondays at 6 AM UTC)

**Manual trigger (optional):**
```bash
# Using GitHub CLI
gh workflow run codeql.yml --ref yolo
```

**Expected outcome:**
- Workflow runs successfully (check Actions tab)
- Security tab shows "Code scanning: 0 alerts" (or alerts if issues found)

**Pricing verification (2025):**
- ✅ **FREE for public repositories** (unlimited scans)
- Paid: $49/user/month for private repos (GitHub Advanced Security)

### Step 3.2: Enable Secret Scanning

1. Visit https://github.com/coopeverything/TogetherOS/settings/security_analysis
2. Scroll to "Secret scanning"
3. Click "Enable" next to:
   - ✅ **Secret scanning**
   - ✅ **Push protection** (prevents committing secrets)
4. Click "Enable secret scanning"

**Expected outcome:**
- "Secret scanning: Enabled" visible in settings
- Historical scan runs (may take a few minutes)

**Pricing verification (2025):**
- ✅ **FREE for public repositories**

### Step 3.3: Enable Dependabot

1. Visit https://github.com/coopeverything/TogetherOS/settings/security_analysis
2. Scroll to "Dependabot"
3. Click "Enable" next to:
   - ✅ **Dependabot alerts**
   - ✅ **Dependabot security updates**
   - ✅ **Dependabot version updates**
4. **Dependabot configuration already exists:** `.github/dependabot.yml`
5. Dependabot will:
   - Check dependencies weekly (Mondays at 6 AM)
   - Create PRs for vulnerable packages
   - Max 10 open PRs at once

**Expected outcome:**
- "Dependabot: Enabled" visible in settings
- First scan runs within a few minutes
- Security tab shows "Dependabot: X alerts" (if vulnerabilities found)

**Pricing verification (2025):**
- ✅ **FREE for all repositories**

### Step 3.4: Configure Security Policy

**Already created:** `SECURITY.md` in repo root

**Verify visibility:**
1. Visit https://github.com/coopeverything/TogetherOS/security/policy
2. Should display contents of `SECURITY.md`

**Update if needed:**
```bash
# Edit SECURITY.md
nano SECURITY.md

# Update email if security@coopeverything.org not monitored
# Commit changes
git add SECURITY.md
git commit -m "docs(security): update contact email"
git push origin yolo
```

### Step 3.5: Configure Notifications

1. Visit https://github.com/settings/notifications
2. Scroll to "Watching"
3. Ensure you're watching `coopeverything/TogetherOS`
4. **Security alerts:** Should be enabled by default
5. **Recommended settings:**
   - ✅ Email for: Code scanning alerts, Secret scanning alerts, Dependabot alerts
   - ✅ Web notification for: All alerts

**Expected outcome:** Email notifications for all security alerts

### Step 3.6: Test Security Scanning

**Test CodeQL (optional):**
```bash
# Introduce intentional vulnerability
git checkout -b test/security-scan
echo 'eval(userInput)' >> lib/test-vuln.ts

# Commit and push
git add lib/test-vuln.ts
git commit -m "test: trigger CodeQL alert"
git push -u origin test/security-scan

# Create PR
gh pr create --base yolo --title "Test: Security Scan"

# Wait 3-5 minutes for CodeQL to run
# Check Security tab for alert about 'eval' usage

# Delete test branch
git checkout yolo
git branch -D test/security-scan
gh pr close --delete-branch
```

**Expected outcome:** CodeQL detects `eval()` usage and creates alert

---

## 4. Health Endpoint Verification

**Time:** ~2 minutes

### Step 4.1: Test Health Endpoint

**Via browser:**
```
https://coopeverything.org/api/health
```

**Via curl:**
```bash
curl -s https://coopeverything.org/api/health | jq
```

**Expected output:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T12:34:56.789Z",
  "uptime": 12345.67,
  "checks": {
    "database": {
      "status": "ok",
      "latency": 23
    },
    "memory": {
      "used": 123456789,
      "total": 512000000,
      "percentage": 24.11,
      "status": "ok"
    }
  }
}
```

**Verify deployment verification:**
```bash
# Check latest deployment workflow
gh run list --workflow=auto-deploy-production --limit 1

# View logs
gh run view [run-id] --log
```

**Expected log output:**
```
⏳ Waiting for application to stabilize...
🔍 Checking PM2 status...
🏥 Checking /api/health endpoint...
🧪 Testing critical endpoints...
✅ All health checks passed!
HEALTH_STATUS=ok
```

---

## 5. Test Page Verification

**Time:** ~2 minutes

### Step 5.1: Access Test Page

**URL:** https://coopeverything.org/test/monitoring

**Features to test:**

1. **Check Health** button
   - Click button
   - Should display current health status
   - All checks should be "OK" (green)

2. **Auto-refresh** checkbox
   - Enable checkbox
   - Health status should update every 5 seconds

3. **Test Sentry (Caught)** button
   - Click button
   - Alert appears: "Test error sent to Sentry!"
   - Check Sentry dashboard for new issue

4. **Test Sentry (Uncaught)** button
   - Click button
   - Page shows error UI (Next.js error boundary)
   - Check Sentry dashboard for new issue

5. **View Raw Response** (expandable section)
   - Expand section
   - See JSON health response

**Expected outcome:** All features work, errors appear in Sentry

---

## 6. Verify Auto-Rollback

**Time:** ~10 minutes (mostly waiting)

### Step 6.1: Trigger Intentional Deployment Failure

**Option 1: Break health endpoint (recommended for testing)**

```bash
# Create test branch
git checkout -b test/auto-rollback

# Break health endpoint by commenting out database check
# Edit apps/web/app/api/health/route.ts
nano apps/web/app/api/health/route.ts

# Comment out line:
# await pool.query('SELECT 1');
# Replace with:
throw new Error('Simulated database failure');

# Commit and push
git add apps/web/app/api/health/route.ts
git commit -m "test: simulate health check failure"
git push -u origin test/auto-rollback

# Merge to yolo (deployment will trigger)
gh pr create --base yolo --title "Test: Auto-Rollback"
gh pr merge --squash --delete-branch
```

**Expected outcome:**
1. Deployment workflow starts
2. Preflight checks pass (build succeeds)
3. Deploy to VPS succeeds
4. **Health check fails** (status != "ok")
5. Auto-rollback triggers:
   - SSH to VPS
   - `git reset --hard HEAD~1`
   - Rebuild and restart
6. Verify rollback succeeded
7. Workflow exits with failure status

**Check logs:**
```bash
# View deployment logs
gh run list --workflow=auto-deploy-production --limit 1
gh run view [run-id] --log

# Look for:
# "❌ Health check failed (status: unhealthy), initiating rollback..."
# "✅ Rollback successful, previous version restored"
```

**Restore:**
```bash
# Revert the test commit
git checkout yolo
git revert HEAD
git push origin yolo

# Auto-deploy will trigger with fixed code
```

---

## 7. Cost Monitoring

### Current Costs (2025 Pricing)

| Service | Free Tier | Usage | Cost |
|---------|-----------|-------|------|
| Sentry | 5K events/month | <100 events/month | $0 |
| UptimeRobot | 50 monitors | 4 monitors | $0 |
| GitHub Advanced Security | Unlimited (public) | N/A | $0 |
| GitHub Actions | 2,000 min/month | ~500 min/month | $0 |

**Total: $0/month**

### Upgrade Triggers

**Sentry ($26/month for Team plan):**
- Trigger: >5,000 errors/month (~167 errors/day)
- **When:** ~1,000+ daily active users with typical error rate

**UptimeRobot ($7/month for 10 monitors):**
- Trigger: Need 1-minute interval checks (faster alerts)
- **When:** SLA requirements demand <5-min detection

**GitHub Advanced Security ($49/user/month):**
- Trigger: Move to private repository
- **When:** Decision to privatize codebase

### Monitor Usage

**Sentry quota:**
```bash
# Check Sentry dashboard: Settings → Usage & Billing
# View "Events" graph for current month usage
```

**GitHub Actions minutes:**
```bash
# View: https://github.com/coopeverything/TogetherOS/settings/billing
# Check "Actions & Packages" usage
```

---

## 8. Troubleshooting

### Sentry Issues

**Issue:** Errors not appearing in Sentry
**Solutions:**
1. Verify DSN is correct in `.env.local`
2. Restart Next.js: `pm2 restart togetheros`
3. Check Sentry project is active (not paused)
4. Verify network can reach `sentry.io` (no firewall blocks)

**Issue:** "Project not found" error
**Solutions:**
1. Verify `SENTRY_ORG` and `SENTRY_PROJECT` match Sentry dashboard
2. Check auth token has correct scopes

**Issue:** Source maps not uploading
**Solutions:**
1. Verify `SENTRY_AUTH_TOKEN` is set in GitHub Secrets
2. Check auth token is not expired
3. Review deployment logs for Sentry upload errors

### UptimeRobot Issues

**Issue:** False "down" alerts
**Solutions:**
1. Check site is accessible from external network (not just VPS)
2. Verify URL is correct (no typos)
3. Increase alert threshold to 3 consecutive failures (15 minutes)

**Issue:** Keyword not found (health endpoint)
**Solutions:**
1. Visit health endpoint manually, verify response contains `"status":"ok"`
2. Check for exact match (case-sensitive if enabled)
3. Try broader keyword like just `ok`

### GitHub Security Issues

**Issue:** CodeQL workflow failing
**Solutions:**
1. Check workflow logs: `gh run view [run-id] --log`
2. Common causes: Syntax errors, invalid TypeScript, build failures
3. Fix code issues and re-run workflow

**Issue:** Too many Dependabot PRs
**Solutions:**
1. Edit `.github/dependabot.yml`
2. Change `open-pull-requests-limit` to lower number (e.g., 5)
3. Or change schedule to `monthly` instead of `weekly`

### Health Endpoint Issues

**Issue:** Health endpoint returns 503
**Solutions:**
1. Check database is running: `systemctl status postgresql`
2. Check memory usage: `free -h`
3. Review error logs: `pm2 logs togetheros --lines 50 --err`

**Issue:** Health check takes too long
**Solutions:**
1. Check database latency (should be <100ms)
2. Optimize database connection pool
3. Check for slow queries

---

## 9. Next Steps After Setup

### Immediate (First Week)

1. **Monitor Sentry dashboard daily**
   - Watch for new error types
   - Fix critical issues immediately
   - Track error trends

2. **Verify UptimeRobot alerts**
   - Ensure alerts are received (email + Slack)
   - Test incident response process
   - Adjust thresholds if needed

3. **Review GitHub Security alerts**
   - Check Dependabot PRs weekly
   - Merge security updates promptly
   - Review CodeQL findings

### Short-term (First Month)

4. **Expand test coverage (Phase 2)**
   - Write unit tests for all validators
   - Add integration tests for API routes
   - Create E2E tests for critical paths

5. **Setup custom Sentry dashboards**
   - Error rate by page/endpoint
   - Error types distribution
   - User impact metrics

6. **Optimize alert thresholds**
   - Reduce false positives
   - Tune alert severity levels
   - Setup escalation rules

### Medium-term (Months 2-3)

7. **Add APM (Phase 3)**
   - Vercel Analytics or New Relic
   - Track p95 latency
   - Identify slow endpoints

8. **Implement canary deployment (Phase 4)**
   - Gradual rollout strategy
   - Error rate monitoring
   - Auto-rollback on regressions

9. **Security audit**
   - Third-party penetration testing
   - GDPR compliance review
   - Security incident playbooks

---

## 10. Support & Resources

### Documentation

- [Observability Module](../modules/observability.md)
- [Security Module](../modules/security.md)
- [Error Catching Overview](../ERROR_CATCHING.md)
- [Monitoring Setup](./MONITORING.md)

### External Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [UptimeRobot API](https://uptimerobot.com/api/)
- [GitHub Advanced Security Docs](https://docs.github.com/en/code-security)
- [CodeQL Query Reference](https://codeql.github.com/docs/)

### Getting Help

- **GitHub Discussions:** https://github.com/coopeverything/TogetherOS/discussions
- **GitHub Issues:** For bugs or feature requests
- **Security Issues:** security@coopeverything.org

---

**Setup Complete!** ✅

You now have comprehensive error catching and monitoring for fully automated vibe coding deployments.
