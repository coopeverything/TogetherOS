# Error Catching Process

## Overview

TogetherOS uses a **defense-in-depth** approach to error catching for fully automated vibe coding deployments:

1. **Pre-Merge:** Bot review + tests + security scanning
2. **Post-Merge:** Build verification + health checks
3. **Post-Deploy:** Health verification + auto-rollback + monitoring
4. **Continuous:** Error tracking + uptime monitoring + alerting

---

## Defense Layers

### Layer 1: Pre-Merge (Prevent Bugs from Entering Codebase)

#### Dual-Bot Code Review
- **Codex (chatgpt-codex-connector)** - PRIMARY
  - Security vulnerabilities
  - Type safety
  - Code quality
  - P1 issues BLOCK merge
- **Copilot (copilot-pull-request-reviewer)** - SECONDARY
  - Performance issues
  - Best practices
  - CHANGES_REQUESTED blocks merge

#### GitHub Advanced Security
- **CodeQL** - Semantic code analysis
  - Security vulnerabilities
  - Logic bugs
  - Type errors
  - Runs on every PR + weekly schedule
- **Dependabot** - Dependency scanning
  - CVE detection
  - Auto-update PRs
  - Weekly checks
- **Secret Scanning** - Credential detection
  - API keys
  - Tokens
  - Passwords

#### Automated Tests
- **Unit tests** - `npm test` (Vitest)
  - Required to pass before merge
  - Target: 80% coverage (currently 3 test files)
- **Type checking** - TypeScript compilation
  - `tsc --build`
  - `tsc --noEmit`
- **Linting** - YAML, Markdown validation
  - yamllint
  - actionlint
  - markdownlint

**Outcome:** 70%+ of bugs caught before merge

---

### Layer 2: Post-Merge (Catch Build Issues)

#### Preflight Checks (auto-deploy-production.yml)
1. `npm ci` - Dependency installation
2. `tsc --build` - TypeScript compilation
3. `tsc --noEmit` - Type checking
4. `npm run build` - Next.js build

If any check fails, deployment is aborted (no code deployed).

**Outcome:** Build-time errors never reach production

---

### Layer 3: Post-Deploy (Catch Runtime Issues)

#### Automated Health Verification

After deployment, GitHub Actions verifies:

**PM2 Status Check**
```bash
pm2 status togetheros | grep online
```
- Ensures process is running
- Auto-rollback if stopped/errored

**Health Endpoint Check**
```bash
curl https://coopeverything.org/api/health
```
- Database connectivity
- Memory usage
- System status
- Auto-rollback if unhealthy

**Critical Endpoint Checks**
```bash
curl -f https://coopeverything.org/
curl -f https://coopeverything.org/signup
curl -f https://coopeverything.org/login
```
- Verifies pages load
- Auto-rollback if any 404/500 errors

#### Auto-Rollback Process

If any health check fails:
1. SSH to VPS
2. `git reset --hard HEAD~1` (previous commit)
3. `npm run build:packages && npm run build`
4. `pm2 restart togetheros`
5. Verify health endpoint recovers
6. Exit deployment with failure status

**Time to Rollback:** <60 seconds

**Outcome:** Bad deployments auto-revert, previous version restored

---

### Layer 4: Continuous Monitoring (Catch Production Issues)

#### Sentry Error Tracking

**What it catches:**
- Unhandled exceptions
- Promise rejections
- Client-side errors
- Server-side errors

**Configuration:**
- Free tier: 5,000 errors/month
- PII redaction enabled
- Email/IP scrubbing
- Session replay on errors

**Setup:** See `docs/ops/MONITORING.md`

#### UptimeRobot Monitoring

**What it checks:**
- Health endpoint (every 5 minutes)
- Homepage availability
- Signup/login pages
- SSL certificate expiry

**Configuration:**
- Free tier: 50 monitors
- 5-minute interval
- 2 consecutive failures trigger alert

**Setup:** See `docs/ops/MONITORING.md`

#### Health Endpoint (`/api/health`)

**Checks:**
- Database connectivity + latency
- Memory usage (used/total/percentage)
- Process uptime

**Status codes:**
- `200` - Healthy (`ok` or `degraded`)
- `503` - Unhealthy (database down, memory critical)

**Test:** Visit https://coopeverything.org/admin/monitoring

**Outcome:** 24/7 monitoring, immediate alerts on downtime

---

## Current vs. Target State

### Current State (Phase 1: Implemented)

✅ **Pre-Merge:**
- Dual-bot review (Codex + Copilot)
- CodeQL security scanning
- Dependabot dependency scanning
- Secret scanning
- Basic test suite (3 test files)
- Type checking
- YAML/Markdown linting

✅ **Post-Merge:**
- TypeScript compilation checks
- Next.js build verification

✅ **Post-Deploy:**
- PM2 status verification
- Health endpoint checks
- Critical page checks
- Auto-rollback on failure

✅ **Continuous:**
- Sentry error tracking
- UptimeRobot uptime monitoring
- Health endpoint monitoring

### Target State (Phase 2-4)

**Phase 2: Enhanced Testing (Weeks 2-6)**
- [ ] 80%+ unit test coverage
- [ ] Integration tests (API + database)
- [ ] E2E tests (signup, login, dashboard)
- [ ] Property-based testing (fast-check)
- [ ] Mutation testing (Stryker)

**Phase 3: Advanced Detection (Weeks 7-10)**
- [ ] Synthetic monitoring (Checkly or Playwright)
- [ ] APM (Vercel Analytics or New Relic)
- [ ] Contract testing (Pact)
- [ ] Performance regression detection

**Phase 4: Gradual Rollout (Weeks 11-14)**
- [ ] Canary deployment (10%→50%→100%)
- [ ] Error rate monitoring with auto-rollback
- [ ] Feature flags
- [ ] Blue-green deployment option

---

## Gap Analysis (What Still Slips Through)

### Known Gaps

**Runtime Errors Not Caught Pre-Deploy:**
- Race conditions under load
- Environment-specific bugs
- Database migration issues
- Third-party API failures
- Memory leaks (detected over time)

**Mitigation:** Sentry + UptimeRobot detect these in production

**Integration Bugs:**
- Frontend/backend contract mismatches
- Multi-step flow failures

**Mitigation:** Phase 2 E2E tests + Phase 3 contract testing

**Performance Regressions:**
- Slow queries
- N+1 problems
- Large bundle sizes

**Mitigation:** Phase 3 APM + performance budgets

**Edge Cases:**
- Rare input combinations
- Boundary conditions

**Mitigation:** Phase 2 property-based testing

---

## Testing the Error Catching System

### Manual Tests

**Test 1: Syntax Error**
```bash
# Introduce syntax error
echo "const broken = {" >> lib/test-error.ts

# Commit + push
git add lib/test-error.ts
git commit -m "test: syntax error"
git push origin yolo

# Expected: Preflight build fails, deployment aborted
```

**Test 2: Runtime Error**
```typescript
// In an API route
export async function GET() {
  throw new Error('Test runtime error');
}
```
```bash
# Commit + push
# Expected: Deploys, Sentry catches error, health check may pass
```

**Test 3: Database Failure**
```bash
# On VPS
ssh root@72.60.27.167
systemctl stop postgresql

# Expected: Health check fails, deployment rolls back
```

**Test 4: Health Endpoint Test**
Visit https://coopeverything.org/admin/monitoring
- Check health status
- Trigger Sentry test errors
- Monitor auto-refresh

### Automated Tests

**Via GitHub Actions:**
1. Open PR to yolo
2. Verify CodeQL runs
3. Verify tests run
4. Merge PR
5. Watch deployment workflow
6. Verify health checks pass
7. Check UptimeRobot for uptime
8. Check Sentry for any errors

---

## Alerting Strategy

### Critical Alerts (Immediate Response)

**Slack Webhook**
- Site down (2+ consecutive UptimeRobot failures)
- Deployment rollback triggered
- >100 errors in 5 minutes (Sentry)
- Database connection lost

### Warning Alerts (1-Hour Response)

**Email**
- Memory >90%
- Health endpoint degraded
- >50 errors in 5 minutes
- SSL certificate expires in 7 days

### Info Alerts (Monitor)

**Sentry Dashboard**
- New error types
- First occurrence of issues
- Performance regressions

---

## Runbooks

### "Deployment Failed" Runbook

1. Check GitHub Actions logs
2. Identify failing check (preflight vs health)
3. If preflight: Fix build error, re-push
4. If health check: Check Sentry/logs, may be transient
5. Verify auto-rollback succeeded
6. Fix issue, re-deploy

### "Site Down" Runbook

See `docs/ops/MONITORING.md` - Section 8: Runbooks

### "Error Spike" Runbook

See `docs/ops/MONITORING.md` - Section 8: Runbooks

---

## Cost Summary

| Layer | Tool | Cost |
|-------|------|------|
| Pre-Merge | GitHub Advanced Security | FREE (public repos) |
| Pre-Merge | Dual-bot review | FREE |
| Pre-Merge | GitHub Actions | FREE (2,000 min/month) |
| Post-Deploy | Health checks | FREE |
| Continuous | Sentry | FREE (5K errors/month) |
| Continuous | UptimeRobot | FREE (50 monitors) |

**Total: $0/month**

**Estimated upgrade trigger:** 1,000+ daily active users

---

## Success Metrics

### Deployment Success Rate
- **Current:** Not tracked
- **Target:** >95% (deployments don't trigger rollback)

### Error Detection Time
- **Current:** <60s (post-deploy health checks)
- **Target:** <30s (with APM + synthetic monitoring)

### Rollback Time
- **Current:** <60s (automated)
- **Target:** <30s (with canary deployment)

### Production Error Rate
- **Current:** Not tracked
- **Target:** <10 errors/hour

### Uptime
- **Current:** Not tracked
- **Target:** 99.9% (43 min downtime/month)

---

## Related Documentation

- [Monitoring Setup](./ops/MONITORING.md) - UptimeRobot, Sentry, health checks
- [CI/CD Discipline](https://github.com/coopeverything/TogetherOS/blob/main/.claude/knowledge/ci-cd-discipline.md) - Proof lines, workflows
- [Security Policy](https://github.com/coopeverything/TogetherOS/blob/main/SECURITY.md) - Vulnerability reporting
- [Operations Playbook](./OPERATIONS.md) - Contributor workflow

---

## Questions?

- Discuss in [GitHub Discussions #88](https://github.com/coopeverything/TogetherOS/discussions/88)
- Report bugs via GitHub Issues
- Security issues: security@coopeverything.org
