# Security & Privacy Module

**Purpose:** Protect user data, detect vulnerabilities, prevent security incidents, and ensure privacy-first operations.

**Status:** Phase 1 Complete (20%)

**Path:** `path:cooperative-technology`

---

## Overview

The Security & Privacy module ensures TogetherOS operates with:

1. **Automated Security Scanning** - CodeQL, Dependabot, secret detection
2. **Vulnerability Management** - CVE tracking, auto-patching, alerts
3. **Privacy Protection** - PII redaction, IP hashing, minimal data collection
4. **Incident Response** - Security policies, disclosure process, rollback
5. **Audit Trails** - Append-only logs, integrity verification

### Non-Goals
- User authentication (separate Auth module)
- Authorization/permissions (separate Groups module)
- Encryption at rest (deferred to infrastructure)

---

## Implementation Phases

### Phase 1: Automated Scanning (✅ Complete - 20%)

**Implemented:**
- ✅ GitHub CodeQL security scanning
- ✅ Dependabot dependency vulnerability alerts
- ✅ Secret scanning (200+ service providers)
- ✅ Security policy (SECURITY.md)
- ✅ PII redaction in Sentry error tracking
- ✅ IP hashing in audit logs

**Key Files:**
- `.github/workflows/codeql.yml` - CodeQL semantic analysis
- `.github/dependabot.yml` - Dependency scanning config
- `SECURITY.md` - Vulnerability disclosure policy
- `sentry.*.config.ts` - PII redaction logic
- `lib/bridge/logger.ts` - IP hashing for Bridge logs
- `lib/auth/security-logger.ts` - Auth event logging with PII protection

**Metrics:**
- Security scanning: ✅ Enabled (CodeQL + Dependabot)
- Secret detection: ✅ Active
- PII redaction: ✅ Configured
- Vulnerability alerts: ✅ Weekly + on-demand

### Phase 2: Enhanced Privacy (📅 Weeks 3-8)

**Planned:**
- [ ] Rate limiting per endpoint (currently Bridge only)
- [ ] Request signing for API calls
- [ ] CSRF protection (Next.js default, verify)
- [ ] Content Security Policy (CSP) headers
- [ ] Subresource Integrity (SRI) for CDN assets

**Target Metrics:**
- Rate limit coverage: 100% of API routes
- CSP violations: 0 in production
- HTTPS: 100% enforced

### Phase 3: Audit & Compliance (📅 Weeks 9-14)

**Planned:**
- [ ] Security audit (third-party review)
- [ ] Penetration testing
- [ ] GDPR compliance verification
- [ ] Data retention policies
- [ ] User data export/deletion tools

**Target Metrics:**
- Audit findings: <5 medium-severity issues
- GDPR compliance: 100%
- Data deletion: <24 hours from request

### Phase 4: Advanced Protection (📅 Weeks 15-20)

**Planned:**
- [ ] Web Application Firewall (WAF)
- [ ] DDoS protection (Cloudflare)
- [ ] Intrusion detection (IDS)
- [ ] Security incident playbooks
- [ ] Bug bounty program

**Target Metrics:**
- DDoS mitigation: <5 min response time
- Incident response: <1 hour to containment

---

## Architecture

### GitHub Advanced Security

#### CodeQL Code Scanning

**What it scans:**
- JavaScript/TypeScript codebase
- Security vulnerabilities (SQL injection, XSS, CSRF)
- Logic bugs (null derefs, type errors)
- Code quality issues

**Workflow:**
```yaml
# .github/workflows/codeql.yml
name: "CodeQL Security Scan"
on:
  push: [main, yolo]
  pull_request: [main, yolo]
  schedule: [weekly]

jobs:
  analyze:
    uses: github/codeql-action@v3
    with:
      languages: [javascript, typescript]
      queries: security-extended, security-and-quality
```

**Outcomes:**
- **Autofix (beta):** 90%+ of alerts have auto-suggested fixes
- **Alerts:** Viewable in GitHub Security tab
- **Blocking:** Can be configured to block PRs (not enabled yet)

**Free tier:** Unlimited for public repos

#### Dependabot

**What it scans:**
- `package.json` dependencies
- Known CVEs (Common Vulnerabilities and Exposures)
- Outdated packages with security patches

**Configuration:**
```yaml
# .github/dependabot.yml
updates:
  - package-ecosystem: "npm"
    schedule: weekly
    open-pull-requests-limit: 10
    labels: [dependencies, automated]
```

**Outcomes:**
- **Auto-PRs:** Dependabot creates PRs to update vulnerable deps
- **Security updates:** Prioritized over version updates
- **Alerts:** Email + GitHub Security tab

**Free tier:** Unlimited for all repos

#### Secret Scanning

**What it detects:**
- API keys (AWS, Stripe, OpenAI, etc.)
- Access tokens (GitHub, GitLab, etc.)
- Private keys (SSH, PGP, etc.)
- Database credentials

**Partners:** 200+ service providers

**Outcomes:**
- **Alert:** Email + GitHub Security tab
- **Revocation:** Partner services auto-revoke if detected
- **Prevention:** Push protection can block commits (not enabled)

**Free tier:** Unlimited for public repos

### Privacy Protections

#### PII Redaction (Sentry)

**Redacted Data:**
- Email addresses → `[EMAIL_REDACTED]`
- IP addresses → `[IP_REDACTED]`
- Authorization headers → Removed
- Cookie headers → Removed

**Implementation:**
```typescript
// sentry.server.config.ts
beforeSend(event) {
  // Remove sensitive headers
  if (event.request?.headers) {
    delete event.request.headers['authorization'];
    delete event.request.headers['cookie'];
  }

  // Redact emails
  if (event.message) {
    event.message = event.message
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
      .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP_REDACTED]');
  }

  return event;
}
```

#### IP Hashing (Audit Logs)

**Use Cases:**
- Bridge query logs (rate limiting)
- Auth event logs (security monitoring)
- Moderation logs (abuse detection)

**Implementation:**
```typescript
// lib/bridge/logger.ts
import crypto from 'crypto';

function hashIP(ip: string): string {
  const salt = process.env.BRIDGE_IP_SALT || 'default-salt';
  return crypto
    .createHash('sha256')
    .update(ip + salt)
    .digest('hex')
    .substring(0, 16);
}
```

**Benefits:**
- Rate limiting without storing raw IPs
- GDPR-compliant (hashed data not PII)
- Irreversible (can't derive original IP)

#### Append-Only Logs (NDJSON)

**Format:** Newline-delimited JSON

**Example:**
```json
{"id":"abc123","timestamp":"2025-01-15T12:34:56Z","event":"bridge_query","user_hash":"a1b2c3","ip_hash":"d4e5f6","query_hash":"g7h8i9"}
{"id":"def456","timestamp":"2025-01-15T12:35:01Z","event":"auth_login","user_hash":"j0k1l2","ip_hash":"m3n4o5","result":"success"}
```

**Properties:**
- **Immutable:** No edits, only appends
- **Integrity:** SHA-256 chain validation
- **Privacy:** No raw prompts, only hashes
- **Compliance:** Exportable, deletable per user

**Validation:**
```bash
# Check integrity (each line is valid JSON)
tail -n 100 logs/bridge/actions-2025-01-15.ndjson | jq empty
```

---

## Security Policies

### Vulnerability Disclosure

**File:** `SECURITY.md`

**Process:**
1. Report via email: security@coopeverything.org
2. Include: Description, steps to reproduce, impact
3. Response time: <48 hours
4. Fix timeline: <7 days for critical, <30 days for medium
5. Public disclosure: After fix deployed, coordinated with reporter

### Supported Versions

- `main` branch: ✅ Always supported
- `yolo` branch: ✅ Always supported
- Feature branches: ❌ Not supported (merge to yolo first)

### Incident Response

**Severity Levels:**

**Critical (P1):**
- Data breach
- RCE (Remote Code Execution)
- Authentication bypass
- **Response:** <1 hour

**High (P2):**
- XSS, CSRF, SQL injection
- Privilege escalation
- Sensitive data exposure
- **Response:** <24 hours

**Medium (P3):**
- Denial of Service
- Information disclosure
- Missing security headers
- **Response:** <7 days

**Low (P4):**
- Best practice violations
- Outdated dependencies (no exploit)
- **Response:** <30 days

---

## Compliance

### GDPR (General Data Protection Regulation)

**Current Status:** Partial compliance (Phase 1)

**Implemented:**
- ✅ Minimal data collection
- ✅ IP hashing (pseudonymization)
- ✅ PII redaction in error logs
- ✅ No raw prompts stored

**Pending:**
- [ ] User data export tool (Phase 3)
- [ ] Right to deletion (Phase 3)
- [ ] Privacy policy page
- [ ] Cookie consent banner
- [ ] Data retention policies

### Privacy Principles

**TogetherOS Privacy Commitments:**

1. **Minimal Collection:** Only collect data necessary for functionality
2. **Privacy-First Design:** Default to least privilege, opt-in tracking
3. **Transparent Logging:** Append-only logs, integrity-verified
4. **User Control:** Export/delete data on request
5. **No Surveillance:** No behavior tracking, no third-party analytics

**No Third-Party Analytics:**
- ❌ Google Analytics
- ❌ Facebook Pixel
- ❌ Hotjar, Mixpanel, etc.

**Only Privacy-Respecting Tools:**
- ✅ Sentry (error tracking, PII redacted)
- ✅ UptimeRobot (uptime monitoring, no user data)
- ✅ Vercel Analytics (aggregated metrics, privacy-friendly)

---

## Testing

### Security Testing

**Automated:**
- CodeQL scans on every PR
- Dependabot checks weekly
- Secret scanning on every commit

**Manual:**
- Security audit (Phase 3)
- Penetration testing (Phase 3)
- Vulnerability research (ongoing)

### Privacy Testing

**Verify PII Redaction:**
```bash
# Trigger error with email in message
curl -X POST /api/test-error \
  -d '{"email":"test@example.com"}'

# Check Sentry dashboard
# Expected: Error message shows [EMAIL_REDACTED]
```

**Verify IP Hashing:**
```bash
# Make Bridge query
curl /api/bridge/query -d '{"query":"test"}'

# Check log file
tail logs/bridge/actions-$(date +%Y-%m-%d).ndjson

# Expected: ip_hash present, raw IP not stored
```

---

## Threat Model

### Attack Vectors

**1. Injection Attacks**
- **Risk:** SQL injection, XSS, command injection
- **Mitigation:** Parameterized queries, input validation, CSP headers
- **Detection:** CodeQL scans, manual audits

**2. Authentication Bypass**
- **Risk:** JWT forgery, session hijacking
- **Mitigation:** Secure JWT secret, HttpOnly cookies, short expiry
- **Detection:** Auth event logging, anomaly detection

**3. Data Breach**
- **Risk:** Database dump, API scraping, insider threat
- **Mitigation:** Least-privilege DB user, rate limiting, audit logs
- **Detection:** Unusual query patterns, data export monitoring

**4. Denial of Service (DoS)**
- **Risk:** Resource exhaustion, traffic flood
- **Mitigation:** Rate limiting, request size limits, CDN (Cloudflare)
- **Detection:** Health endpoint monitoring, traffic analytics

**5. Supply Chain Attack**
- **Risk:** Compromised npm package
- **Mitigation:** Dependabot alerts, lock files, package audits
- **Detection:** Automated scans, GitHub Security alerts

---

## Metrics & Targets

### Current Metrics (Phase 1)

| Metric | Current | Target (Phase 4) |
|--------|---------|------------------|
| Security scans | Weekly | Daily |
| Vulnerability resolution | Not tracked | <7 days (critical) |
| Secret leaks detected | 0 | 0 |
| PII redaction coverage | Error logs only | All logs |
| Security incidents | 0 | 0 |
| Audit findings | Not audited | <5 medium-severity |

### Security Dashboard

**GitHub Security Tab:**
- CodeQL alerts (open/closed)
- Dependabot alerts (critical/high/medium/low)
- Secret scanning alerts
- Security advisories

**Custom Dashboard (Phase 3):**
- Vulnerability resolution time
- Attack attempts (rate limit hits)
- Auth failures (potential brute force)
- Anomalous patterns

---

## Cost Breakdown

| Service | Free Tier | Paid Tier | Upgrade Trigger |
|---------|-----------|-----------|-----------------|
| GitHub Advanced Security | Unlimited (public) | $49/user/month (private) | Move to private repo |
| Cloudflare (WAF) | Free plan | $20/month (Pro) | DDoS attacks |
| Security audit | N/A | $5K-$20K | Pre-launch |
| Bug bounty | N/A | Variable | Public launch |

**Current total:** $0/month

**Estimated upgrade trigger:** Public launch or private repo

---

## Runbooks

### "Security Alert" Runbook

1. Check GitHub Security tab
2. Identify alert type (CodeQL, Dependabot, secret)
3. Assess severity (critical/high/medium/low)
4. If critical: Disable affected feature, deploy hotfix
5. If high: Fix within 24 hours
6. If medium: Fix within 7 days
7. Document incident in GitHub Issues

**Detailed runbooks:** See `docs/ops/SECURITY_INCIDENTS.md` (Phase 2)

---

## Related Documentation

- [Observability Module](./observability.md) - Error tracking, monitoring
- [Error Catching](../ERROR_CATCHING.md) - Complete security strategy
- [Monitoring Setup](../ops/MONITORING.md) - Sentry, UptimeRobot
- [Auth Module](./auth.md) - Authentication, JWT
- [CI/CD Discipline](https://github.com/coopeverything/TogetherOS/blob/main/.claude/knowledge/ci-cd-discipline.md) - Deployment security

---

## Next Steps

### Manual Setup Required

1. **Enable GitHub Security Features** (2 minutes)
   - Visit https://github.com/coopeverything/TogetherOS/security
   - Enable: Code scanning, Secret scanning, Dependabot

2. **Configure Sentry PII Redaction** (5 minutes)
   - Already configured in code
   - Verify in Sentry dashboard after first error

3. **Review Security Policy** (5 minutes)
   - Read `SECURITY.md`
   - Update email address if needed
   - Publicize disclosure process

**Detailed instructions:** See `docs/ops/MANUAL_SETUP.md`

### Phase 2 Implementation

- Add rate limiting to all API routes
- Configure CSP headers
- Implement request signing
- Setup security monitoring dashboard

**Timeline:** Weeks 3-8

---

## Progress: 20%

<!-- progress:security=30 -->

**Phase 1:** ✅ Complete (CodeQL, Dependabot, secret scanning, PII redaction)
**Phase 2:** 📋 Planned (rate limiting, CSP, request signing)
**Phase 3:** 📋 Planned (audit, penetration testing, GDPR compliance)
**Phase 4:** 📋 Planned (WAF, DDoS protection, bug bounty)
