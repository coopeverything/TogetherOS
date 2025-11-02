# Observability Module

**Purpose:** Monitor system health, track errors, measure performance, and provide visibility into production behavior.

**Status:** Phase 1 Complete (15%)

**Path:** `path:cooperative-technology`

---

## Overview

The Observability module provides real-time visibility into TogetherOS production systems through:

1. **Error Tracking** - Capture and analyze runtime errors (Sentry)
2. **Health Monitoring** - System status checks (database, memory, uptime)
3. **Uptime Monitoring** - External availability checks (UptimeRobot)
4. **Performance Monitoring** - APM for response times and bottlenecks (Phase 3)
5. **Synthetic Monitoring** - Automated user journey testing (Phase 3)

### Non-Goals
- User behavior analytics (separate Analytics module)
- Business metrics (separate Metrics module)
- Application logs aggregation (deferred to Phase 4)

---

## Implementation Phases

### Phase 1: Critical Monitoring (✅ Complete - 15%)

**Implemented:**
- ✅ Sentry error tracking (client + server + edge)
- ✅ Health endpoint (`/api/health`)
- ✅ Post-deploy health verification
- ✅ Auto-rollback on deployment failures
- ✅ Test page (`/test/monitoring`)
- ✅ UptimeRobot setup documentation

**Key Files:**
- `apps/web/app/api/health/route.ts` - Health check endpoint
- `sentry.*.config.ts` - Sentry configuration
- `apps/web/app/test/monitoring/page.tsx` - Monitoring test UI
- `.github/workflows/auto-deploy-production.yml` - Auto-rollback logic
- `docs/ops/MONITORING.md` - Setup guide
- `docs/ERROR_CATCHING.md` - Error detection overview

**Metrics:**
- Error tracking: ✅ Configured (5K errors/month free tier)
- Health endpoint: ✅ Implemented
- Auto-rollback: ✅ Enabled (<60s recovery)
- Uptime monitoring: 📋 Documentation ready (manual setup required)

### Phase 2: Enhanced Testing (🔜 Next - Weeks 2-6)

**Planned:**
- [ ] Expand test coverage to 80%+ (unit + integration + E2E)
- [ ] Property-based testing (fast-check)
- [ ] Mutation testing (Stryker) - validate test quality
- [ ] Synthetic monitoring setup (Checkly or Playwright)

**Target Metrics:**
- Test coverage: 80%+
- Mutation score: >80%
- Synthetic tests: 5 critical user journeys

### Phase 3: Advanced Monitoring (📅 Weeks 7-10)

**Planned:**
- [ ] APM integration (Vercel Analytics or New Relic)
- [ ] Performance regression detection
- [ ] Contract testing (Pact) for API stability
- [ ] Custom dashboards (error rates, latency p95, uptime)

**Target Metrics:**
- p95 latency: <500ms
- Error rate: <10 errors/hour
- Uptime: 99.9%

### Phase 4: Gradual Rollout (📅 Weeks 11-14)

**Planned:**
- [ ] Canary deployment (10%→50%→100%)
- [ ] Feature flags (LaunchDarkly or custom)
- [ ] Error rate monitoring with auto-rollback
- [ ] Blue-green deployment option

**Target Metrics:**
- Deployment success rate: >95%
- Rollback time: <30s (currently <60s)
- Blast radius: <10% users before auto-rollback

---

## Architecture

### Error Tracking (Sentry)

**Flow:**
```
Client/Server Error → Sentry SDK → PII Redaction → Sentry.io → Alerts
```

**Configuration:**
- **Privacy-first:** Email/IP redaction, no sensitive headers
- **Integrations:** Session replay (error cases only), source maps (hidden in prod)
- **Alerts:** Error spikes, new issue types, unhandled exceptions
- **Free tier:** 5,000 errors/month

**Example:**
```typescript
// Client-side error captured automatically
throw new Error('User action failed');

// Server-side manual capture
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### Health Endpoint

**Endpoint:** `GET /api/health`

**Response:**
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

**Status Codes:**
- `200` - Healthy (`ok` or `degraded`)
- `503` - Unhealthy (database down, memory critical)

**Health States:**
- **ok** - All checks passing
- **degraded** - Minor issues (memory >80%, slow queries)
- **unhealthy** - Critical failures (database down, memory >90%)

**Used By:**
- Post-deploy verification (auto-rollback if unhealthy)
- UptimeRobot monitoring (keyword: "ok")
- Manual health checks via test page

### Uptime Monitoring (UptimeRobot)

**Monitors:**
1. Health endpoint (keyword: "ok")
2. Homepage (HTTP 200)
3. Signup page (HTTP 200)
4. Login page (HTTP 200)

**Configuration:**
- Interval: 5 minutes
- Alert threshold: 2 consecutive failures
- Alert channels: Slack webhook + email

**Free tier:** 50 monitors, 5-min interval

---

## Deployment Verification

### Post-Deploy Health Checks

After every deployment, GitHub Actions verifies:

**Step 1: PM2 Status**
```bash
pm2 status togetheros | grep online
```
- Ensures process running
- Rollback if stopped/errored

**Step 2: Health Endpoint**
```bash
curl https://coopeverything.org/api/health | jq -r '.status'
```
- Checks database + memory
- Rollback if unhealthy

**Step 3: Critical Pages**
```bash
curl -f https://coopeverything.org/
curl -f https://coopeverything.org/signup
curl -f https://coopeverything.org/login
```
- Verifies pages load
- Rollback if any fail

### Auto-Rollback Process

If any check fails:
1. SSH to VPS
2. `git reset --hard HEAD~1`
3. `npm run build:packages && npm run build`
4. `pm2 restart togetheros`
5. Verify health recovers
6. Exit with failure

**Recovery time:** <60 seconds

---

## Testing

### Test Page

**URL:** https://coopeverything.org/test/monitoring

**Features:**
- View real-time health status
- Trigger Sentry test errors
- Auto-refresh health checks (5s interval)
- Inspect raw JSON responses
- Memory usage visualization

### Manual Testing

**Health Endpoint:**
```bash
curl https://coopeverything.org/api/health | jq
```

**Trigger Test Error:**
```bash
# Visit test page, click "Test Sentry (Caught)"
# Check Sentry dashboard for error
```

**Simulate Downtime:**
```bash
ssh root@72.60.27.167
pm2 stop togetheros
# Wait 10 minutes for UptimeRobot alert
pm2 start togetheros
```

---

## Metrics & Targets

### Current Metrics (Phase 1)

| Metric | Current | Target (Phase 4) |
|--------|---------|------------------|
| Error tracking | Configured | <10 errors/hour |
| Uptime | Not tracked | 99.9% |
| Deployment success | Not tracked | >95% |
| Rollback time | <60s | <30s |
| Health check latency | ~50ms | <30ms |
| Test coverage | ~5% | 80%+ |

### Monitoring Dashboards

**Sentry Dashboard:**
- Real-time error stream
- Error frequency trends
- User impact (affected users)
- Stack traces + breadcrumbs

**UptimeRobot Dashboard:**
- Uptime percentage (daily/weekly/monthly)
- Response time trends
- Incident history
- Public status page

**Custom Dashboard (Phase 3):**
- Error rate over time
- p95/p99 latency
- Memory usage trends
- Database query performance

---

## Privacy & Security

### PII Redaction

**Sentry Configuration:**
```typescript
beforeSend(event) {
  // Remove sensitive headers
  delete event.request?.headers?.['authorization'];
  delete event.request?.headers?.['cookie'];

  // Redact emails
  event.message = event.message?.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    '[EMAIL_REDACTED]'
  );

  // Redact IPs
  event.message = event.message?.replace(
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    '[IP_REDACTED]'
  );

  return event;
}
```

### Data Retention

- **Sentry:** 90 days (free tier)
- **UptimeRobot:** Unlimited history (free tier)
- **Health endpoint logs:** Not persisted (real-time only)

### Compliance

- No raw user data in error messages
- IP addresses hashed in logs
- GDPR-compliant data deletion available

---

## Cost Breakdown

| Service | Free Tier | Paid Tier | Upgrade Trigger |
|---------|-----------|-----------|-----------------|
| Sentry | 5K errors/month | $26/month (50K errors) | 1K+ DAU |
| UptimeRobot | 50 monitors, 5-min | $7/month (1-min) | Need faster checks |
| Vercel Analytics | Unlimited (on Vercel) | Free | N/A |
| New Relic | 100GB/month | $99/month | Need advanced APM |

**Current total:** $0/month

**Estimated upgrade trigger:** 1,000+ daily active users

---

## Runbooks

### "Site Down" Runbook

1. Check UptimeRobot - false positive?
2. Check Sentry - error spike?
3. SSH to VPS: `ssh root@72.60.27.167`
4. Check PM2: `pm2 status togetheros`
5. Check logs: `pm2 logs togetheros --lines 50`
6. Check health: `curl localhost:3000/api/health`
7. Restart if needed: `pm2 restart togetheros`
8. Verify: `curl https://coopeverything.org/api/health`

**Full runbooks:** See `docs/ops/MONITORING.md`

---

## Related Documentation

- [Error Catching Overview](../ERROR_CATCHING.md) - Complete error detection strategy
- [Monitoring Setup](../ops/MONITORING.md) - Sentry, UptimeRobot, runbooks
- [Manual Setup Guide](../ops/MANUAL_SETUP.md) - Step-by-step configuration
- [Security Module](./security.md) - CodeQL, Dependabot, privacy
- [CI/CD Discipline](../../.claude/knowledge/ci-cd-discipline.md) - Deployment workflow

---

## Next Steps

### Manual Setup Required

1. **Configure Sentry** (5 minutes)
   - Create account at https://sentry.io
   - Create "togetheros" project
   - Add DSN to `.env.local`

2. **Setup UptimeRobot** (10 minutes)
   - Create account at https://uptimerobot.com
   - Add 4 monitors (health, home, signup, login)
   - Configure Slack webhook

3. **Test Everything**
   - Visit `/test/monitoring`
   - Trigger Sentry errors
   - Verify UptimeRobot alerts

**Detailed instructions:** See `docs/ops/MANUAL_SETUP.md`

### Phase 2 Implementation

- Expand test coverage (unit + integration + E2E)
- Add property-based testing
- Setup synthetic monitoring
- Add mutation testing

**Timeline:** Weeks 2-6

---

## Progress: 15%

<!-- progress:observability=15 -->

**Phase 1:** ✅ Complete (error tracking, health checks, auto-rollback)
**Phase 2:** 📋 Planned (test coverage, synthetic monitoring)
**Phase 3:** 📋 Planned (APM, performance monitoring)
**Phase 4:** 📋 Planned (canary deployment, feature flags)
