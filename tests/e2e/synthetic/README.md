# Synthetic Monitoring

**Purpose:** Automated E2E tests that verify critical user journeys work correctly in production.

## Overview

Synthetic monitoring uses Playwright to run automated browser tests against production (or local) environments. These tests verify that critical paths through the application are functioning correctly from an end-user perspective.

## Tests Included

### Critical User Paths
1. **Homepage loads** - Verify homepage renders without errors
2. **Signup page** - Check signup form is accessible and functional
3. **Login page** - Verify login form renders correctly
4. **Health endpoint** - API health check returns healthy status
5. **Metrics endpoint** - System metrics API returns valid data
6. **Test pages** - Monitoring and logs dashboards are accessible

### Performance Checks
1. **Homepage load time** - Page loads within 5 seconds
2. **API response time** - Health endpoint responds within 1 second

## Running Tests

### Local Development

```bash
# Run all synthetic tests (requires local dev server running)
npm run test:e2e:synthetic

# Run with browser visible (for debugging)
npm run test:e2e:headed

# Open Playwright UI for interactive testing
npm run test:e2e:ui
```

### Against Production

```bash
# Set BASE_URL environment variable
BASE_URL=https://coopeverything.org npm run test:e2e:synthetic
```

### Via Cron (Production Monitoring)

```bash
# Run every 15 minutes
*/15 * * * * cd /var/www/togetheros && BASE_URL=https://coopeverything.org ./scripts/synthetic-monitoring.sh
```

## Configuration

### playwright.config.ts

Key settings:
- **testDir**: `./tests/e2e` - Where test files are located
- **baseURL**: `process.env.BASE_URL || 'http://localhost:3000'` - Target environment
- **reporter**: `json` on CI, `html` locally
- **retries**: 2 retries on CI to handle flakiness
- **projects**: Currently only Chromium (can add Firefox, WebKit, mobile)

### Environment Variables

- `BASE_URL` - Target environment (default: `http://localhost:3000`)
- `CI` - Set on CI to enable JSON reporter and retries
- `ALERT_DISCORD_WEBHOOK` - Discord webhook for failure alerts (optional)
- `ALERT_SLACK_WEBHOOK` - Slack webhook for failure alerts (optional)

## Alerts

The `scripts/synthetic-monitoring.sh` script sends alerts to Discord/Slack when tests fail:

**Alert includes:**
- Severity (🔴 critical)
- Test name that failed
- Timestamp
- Link to detailed results (if available)

## Adding New Tests

Create new test files in this directory:

```typescript
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://coopeverything.org';

test.describe('My Feature', () => {
  test('should load feature page', async ({ page }) => {
    await page.goto(`${BASE_URL}/my-feature`);
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

**Best practices:**
- Test critical user journeys only (avoid over-testing)
- Use descriptive test names
- Check for visual elements, not implementation details
- Set reasonable timeouts (avoid flakiness)
- Test performance where critical (load times, API response times)

## Debugging Failed Tests

### 1. Run locally with headed mode

```bash
npm run test:e2e:headed
```

### 2. Check Playwright report

```bash
# After test run
npx playwright show-report
```

### 3. View screenshots

Failed tests automatically capture screenshots in `test-results/`

### 4. Use trace viewer

```bash
# Enable trace collection in playwright.config.ts
# Then view traces
npx playwright show-trace test-results/trace.zip
```

## CI Integration

Synthetic tests run automatically:
- **On PR:** Against preview deployment (if available)
- **On merge to yolo:** Against production after deployment
- **Scheduled:** Every 15 minutes via cron (production monitoring)

## Cost & Performance

**Resource usage:**
- Browser: ~200MB RAM per test worker
- Execution time: ~10-30 seconds per test file
- Network: Minimal (tests against local/production endpoints)

**Scaling considerations:**
- Run 1 worker on CI (sequential) to avoid resource exhaustion
- Run parallel locally (faster feedback)
- Limit to critical paths only (avoid test bloat)

## Related Documentation

- [Observability Module](../../../docs/modules/observability.md) - Full observability stack
- [Playwright Docs](https://playwright.dev) - Official Playwright documentation
- [Monitoring Setup](../../../docs/ops/MONITORING.md) - Production monitoring guide
