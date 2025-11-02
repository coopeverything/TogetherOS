# Production Monitoring Setup

## Overview

TogetherOS uses a multi-layered monitoring approach to catch errors and ensure uptime:

1. **Error Tracking** - Sentry (runtime errors, exceptions)
2. **Health Endpoint** - `/api/health` (system status checks)
3. **Uptime Monitoring** - UptimeRobot (external availability checks)
4. **Deployment Verification** - GitHub Actions (post-deploy health checks)

---

## 1. Sentry Error Tracking

### Setup

**Free Tier:** 5,000 errors/month

1. Create account at https://sentry.io
2. Create new project "togetheros" (Next.js platform)
3. Get DSN from project settings

### Environment Variables

Add to `.env.local` and production environment:

```bash
# Sentry Error Tracking
SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/123456
NEXT_PUBLIC_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/123456
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=togetheros
SENTRY_AUTH_TOKEN=your-auth-token
```

### Testing

```bash
# Trigger test error
curl -X POST https://coopeverything.org/api/test-error

# Check Sentry dashboard for error
# https://sentry.io/organizations/your-org/issues/
```

### Alert Configuration

**Recommended Alerts:**

1. **Error Spike**
   - Condition: >50 errors in 5 minutes
   - Action: Slack webhook notification
   - Severity: Critical

2. **New Issue**
   - Condition: First occurrence of new error
   - Action: Email notification
   - Severity: Warning

3. **Unhandled Exception**
   - Condition: Any unhandled promise rejection or uncaught exception
   - Action: Slack webhook notification
   - Severity: High

---

## 2. Health Endpoint

### Endpoint

```
GET https://coopeverything.org/api/health
```

### Response Format

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

### Status Codes

- **200** - System healthy (`status: "ok"` or `status: "degraded"`)
- **503** - System unhealthy (`status: "unhealthy"`)

### Health States

1. **ok** - All checks passing
2. **degraded** - Minor issues (memory warning >80%, high latency)
3. **unhealthy** - Critical issues (database down, memory >90%, process crashed)

### Testing Locally

```bash
# Start app
npm run dev

# Check health
curl http://localhost:3000/api/health | jq

# Expected response
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 45.67,
  "checks": { ... }
}
```

---

## 3. UptimeRobot Setup

### Free Tier

- 50 monitors
- 5-minute interval checks
- Unlimited alerts

### Configuration

1. **Create Account**
   - Visit https://uptimerobot.com
   - Sign up (free tier)

2. **Add Monitors**

   **Monitor 1: Health Endpoint**
   - Type: HTTP(s)
   - URL: `https://coopeverything.org/api/health`
   - Interval: 5 minutes
   - Keyword: `"status":"ok"`
   - Alert threshold: 2 consecutive failures

   **Monitor 2: Homepage**
   - Type: HTTP(s)
   - URL: `https://coopeverything.org/`
   - Interval: 5 minutes
   - Expected HTTP status: 200
   - Alert threshold: 2 consecutive failures

   **Monitor 3: Signup Page**
   - Type: HTTP(s)
   - URL: `https://coopeverything.org/signup`
   - Interval: 5 minutes
   - Expected HTTP status: 200
   - Alert threshold: 2 consecutive failures

   **Monitor 4: Login Page**
   - Type: HTTP(s)
   - URL: `https://coopeverything.org/login`
   - Interval: 5 minutes
   - Expected HTTP status: 200
   - Alert threshold: 2 consecutive failures

3. **Alert Contacts**

   **Slack Webhook (Recommended)**
   - Create Slack incoming webhook
   - Add as alert contact in UptimeRobot
   - Format: `https://hooks.slack.com/services/YOUR/WEBHOOK/URL`

   **Email**
   - Add email addresses
   - Enable alerts for: Down, Up, SSL expires

### Testing UptimeRobot

```bash
# Simulate downtime by stopping PM2
ssh root@72.60.27.167
pm2 stop togetheros

# Wait 10 minutes (2 × 5-minute checks)
# UptimeRobot should send alert

# Restore service
pm2 start togetheros

# Wait 5 minutes
# UptimeRobot should send "service restored" alert
```

---

## 4. Deployment Health Checks

### What Gets Checked

After every deployment to production, GitHub Actions verifies:

1. **PM2 Status** - Process is running
2. **Health Endpoint** - Returns `ok` or `degraded`
3. **Critical Pages** - Homepage, signup, login return 200

### Auto-Rollback

If any check fails, deployment automatically rolls back:

```bash
# Rollback process:
1. SSH to VPS
2. git reset --hard HEAD~1
3. npm run build:packages
4. npm run build
5. pm2 restart togetheros
6. Verify health endpoint
```

### Manual Rollback

If auto-rollback fails:

```bash
# SSH to VPS
ssh root@72.60.27.167

# Navigate to app directory
cd /var/www/togetheros

# Check recent commits
git log -5 --oneline

# Reset to known good commit
git reset --hard <commit-sha>

# Rebuild
npm run build:packages
cd apps/web && npm run build

# Restart
pm2 restart togetheros

# Verify
curl https://coopeverything.org/api/health | jq
```

---

## 5. Monitoring Dashboard

### Recommended Tools (Free Tier)

1. **UptimeRobot Public Status Page**
   - URL: `https://status.coopeverything.org` (custom domain)
   - Shows real-time uptime stats
   - Free on UptimeRobot

2. **Sentry Dashboard**
   - URL: `https://sentry.io/organizations/your-org/issues/`
   - View errors, stack traces, user impact
   - Free: 5K errors/month

3. **PM2 Monit** (on VPS)
   ```bash
   ssh root@72.60.27.167
   pm2 monit
   ```
   - Real-time CPU, memory, logs
   - Terminal-based dashboard

---

## 6. Alert Escalation

### Severity Levels

**Critical (Immediate Action)**
- Site down (all monitors fail)
- Database connection lost
- >100 errors in 5 minutes
- Auto-rollback triggered

**High (Action within 1 hour)**
- Health endpoint degraded
- Memory >90%
- >50 errors in 5 minutes
- SSL certificate expires in 7 days

**Medium (Action within 24 hours)**
- Memory >80%
- Slow response times (>2s p95)
- >20 errors in 5 minutes
- Dependency vulnerabilities (high/critical)

**Low (Monitor)**
- Memory >60%
- New error type (first occurrence)
- Dependency vulnerabilities (medium)

### On-Call Rotation

**Not implemented yet** - Defer until team size >3

---

## 7. Metrics to Track

### Uptime

- **Target:** 99.9% (43 minutes downtime/month)
- **Current:** View at UptimeRobot dashboard

### Error Rate

- **Target:** <10 errors/hour
- **Current:** View at Sentry dashboard

### Response Time

- **Target:** <500ms p95
- **Current:** Add APM (Vercel Analytics or New Relic) - Phase 3

### Health Check Latency

- **Database:** <100ms
- **API:** <300ms
- **Current:** View in `/api/health` response

---

## 8. Runbooks

### "Site is Down" Runbook

1. **Check UptimeRobot** - Is it really down or false positive?
2. **Check Sentry** - Any recent error spike?
3. **SSH to VPS** - `ssh root@72.60.27.167`
4. **Check PM2** - `pm2 status togetheros`
   - If stopped: `pm2 start togetheros`
   - If errored: `pm2 logs togetheros --lines 50`
5. **Check health** - `curl localhost:3000/api/health`
6. **Check database** - `psql -U togetheros_app -d togetheros -c "SELECT 1;"`
7. **Restart if needed** - `pm2 restart togetheros`
8. **Verify** - `curl https://coopeverything.org/api/health`

### "Error Spike" Runbook

1. **Open Sentry** - Identify error type
2. **Check recent deployments** - Any correlation?
3. **If deployment related** - Rollback via GitHub Actions or manual
4. **If traffic related** - Check for DDoS, rate limit adjustments
5. **If database related** - Check connections, slow queries
6. **Document findings** - Add to incident log

### "Memory Warning" Runbook

1. **SSH to VPS** - `ssh root@72.60.27.167`
2. **Check PM2** - `pm2 monit` (live memory usage)
3. **Check logs** - `pm2 logs togetheros --lines 100` (memory leaks?)
4. **Restart if >90%** - `pm2 restart togetheros`
5. **Monitor** - Watch for memory growth
6. **If persistent** - Investigate memory leaks (heap snapshot)

---

## 9. Cost Summary

| Service | Free Tier | Cost When Exceeded |
|---------|-----------|-------------------|
| Sentry | 5K errors/month | $26/month (Team: 50K errors) |
| UptimeRobot | 50 monitors, 5-min interval | $7/month (Pro: 1-min interval) |
| Vercel Analytics | Unlimited (on Vercel) | Free |
| GitHub Actions | 2,000 minutes/month | $0.008/minute |

**Current Total:** $0/month

**Estimated upgrade trigger:** 1,000+ daily active users

---

## 10. Next Steps (Phase 2-4)

### Phase 2: Enhanced Testing (Week 3-6)
- Add E2E tests for critical paths
- Expand unit test coverage to 80%
- Add property-based testing (fast-check)
- Add mutation testing (Stryker)

### Phase 3: Advanced Monitoring (Week 7-10)
- Add APM (Vercel Analytics or New Relic)
- Add synthetic monitoring (Checkly)
- Add contract testing (Pact)
- Performance regression detection

### Phase 4: Gradual Rollout (Week 11-14)
- Implement canary deployment (10%→50%→100%)
- Add feature flags (LaunchDarkly or custom)
- Error rate monitoring with auto-rollback
- Blue-green deployment option

---

## Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [UptimeRobot API Docs](https://uptimerobot.com/api/)
- [PM2 Monitoring](https://pm2.keymetrics.io/docs/usage/monitoring/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
