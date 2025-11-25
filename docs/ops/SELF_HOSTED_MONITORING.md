# Self-Hosted Observability Setup

Complete guide for running TogetherOS observability stack without external service signups.

---

## Overview

This stack provides:
- **Error tracking** - Custom NDJSON logger (Sentry replacement)
- **Uptime monitoring** - Uptime Kuma (UptimeRobot replacement)
- **Metrics collection** - Prometheus (APM replacement)
- **Log aggregation** - Loki (Elasticsearch/Splunk replacement)
- **Visualization** - Grafana dashboards
- **Alerting** - Discord/Slack webhooks (no signup required)
- **Synthetic monitoring** - Playwright E2E tests via cron

**Total cost:** $0/month (self-hosted on your VPS)

---

## Current Deployment Status

### ✅ Active Now (Lightweight - No Manual Setup Required)

These components are **already deployed and running** with the application:

**Code-level monitoring:**
- Error logger (`lib/observability/error-logger.ts`) - Writes NDJSON logs when errors occur
- Performance logger (`lib/observability/perf-logger.ts`) - Tracks request timing
- Alert manager (`lib/observability/alert-manager.ts`) - Sends alerts when called
- Request middleware (`apps/web/middleware.ts`) - Adds timing headers

**API Endpoints:**
- `/api/metrics` - Prometheus-format metrics (only responds when scraped)
- `/api/metrics/system` - JSON system metrics (only responds when requested)

**UI Pages:**
- `/admin/logs` - System metrics dashboard (only loads when visited)
- `/admin/monitoring` - Health check UI (only loads when visited)

**Resource usage:** Negligible (~0 MB RAM, <1% CPU) - these only activate when used

### ⚠️ Inactive (Ready But Not Started)

These components are **configured and ready** but **NOT running** to conserve resources:

**Docker Stack (~700 MB RAM, ~30% CPU when running):**
- ❌ Uptime Kuma (port 3001) - Not started
- ❌ Prometheus (port 9090) - Not started
- ❌ Grafana (port 3002) - Not started
- ❌ Loki (port 3100) - Not started
- ❌ Promtail - Not started

**Cron Jobs:**
- ❌ Health check script (`scripts/health-check.sh`) - Not in crontab
- ❌ Synthetic monitoring (`scripts/synthetic-monitoring.sh`) - Not in crontab

**All configuration files exist and are production-ready. Start them when you need them.**

### When to Activate What

**Activate when you get 100+ daily users:**
- Start Prometheus (metrics collection)
- Start health check cron (alerts on downtime)
- Configure Discord/Slack webhooks for alerts

**Activate when you get 1,000+ daily users:**
- Start full Docker stack (Grafana, Loki, Uptime Kuma)
- Start synthetic monitoring cron
- Setup log aggregation and dashboards

**For now:** The lightweight code-level monitoring (error/perf logs, metrics endpoints) is sufficient.

---

## Quick Start (Manual Activation)

### 1. Start Observability Stack

```bash
# Start all services
docker-compose -f docker-compose.observability.yml up -d

# Check status
docker-compose -f docker-compose.observability.yml ps
```

**Services started:**
- Uptime Kuma: http://localhost:3001
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3002 (admin/admin)
- Loki: http://localhost:3100

### 2. Configure Environment Variables

Add to `.env.local`:

```bash
# Alerting (optional - get webhook URLs from Discord/Slack)
ALERT_DISCORD_WEBHOOK=https://discord.com/api/webhooks/YOUR_WEBHOOK
ALERT_SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
ALERT_MIN_SEVERITY=medium  # low|medium|high|critical

# Logging
ERROR_IP_SALT=your-random-salt-here
BRIDGE_IP_SALT=your-random-salt-here

# Health check
HEALTH_CHECK_URL=https://coopeverything.org/api/health
```

### 3. Setup Cron Jobs

```bash
# Edit crontab
crontab -e

# Add these lines:
# Health check every 5 minutes
*/5 * * * * /path/to/TogetherOS/scripts/health-check.sh

# Synthetic monitoring every 15 minutes
*/15 * * * * /path/to/TogetherOS/scripts/synthetic-monitoring.sh
```

### 4. Access Dashboards

- **Uptime Kuma:** http://localhost:3001 (setup wizard on first visit)
- **Grafana:** http://localhost:3002 (login: admin/admin)
- **Prometheus:** http://localhost:9090
- **System Metrics:** https://coopeverything.org/admin/logs
- **Monitoring Test:** https://coopeverything.org/admin/monitoring

---

## Component Details

### Error Logger

**Location:** `lib/observability/error-logger.ts`

**Features:**
- NDJSON append-only logs
- PII redaction (emails, IPs, tokens)
- Serverless-aware (console logging in serverless environments)
- Severity levels: critical, error, warning

**Usage:**
```typescript
import { logError, createErrorContext } from '@/lib/observability/error-logger';

try {
  await riskyOperation();
} catch (error) {
  logError({
    error,
    severity: 'critical',
    context: createErrorContext(request),
  });
}
```

**Logs to:** `logs/errors/errors-YYYY-MM-DD.ndjson`

### Performance Logger

**Location:** `lib/observability/perf-logger.ts`

**Features:**
- Request timing tracking
- NDJSON format
- Automatic middleware integration

**Logs to:** `logs/perf/requests-YYYY-MM-DD.ndjson`

**Middleware:** `apps/web/middleware.ts` (auto-logs all requests)

### Alert Manager

**Location:** `lib/observability/alert-manager.ts`

**Supported channels:**
- Discord webhooks
- Slack webhooks
- Custom webhooks (generic JSON POST)

**Usage:**
```typescript
import { sendAlert, alerts } from '@/lib/observability/alert-manager';

// Pre-defined alerts
await alerts.healthCheckFailed('Database connection timeout');
await alerts.errorSpike(50, '5 minutes');
await alerts.memoryWarning(85);

// Custom alerts
await sendAlert({
  severity: 'high',
  title: 'Custom Alert',
  message: 'Something needs attention',
  metadata: { key: 'value' },
});
```

### Prometheus Metrics

**Endpoint:** `/api/metrics` (Prometheus format)

**Metrics exposed:**
- `http_requests_total` - Total HTTP requests (labeled by method, route, status)
- `http_request_duration_seconds` - Request duration histogram
- `application_errors_total` - Error count (labeled by severity, code)
- `active_connections` - Current active connections
- `process_cpu_seconds_total` - CPU usage
- `process_resident_memory_bytes` - Memory usage
- `nodejs_heap_size_used_bytes` - Heap memory

**Scrape config:** `config/prometheus/prometheus.yml`

### System Metrics

**Endpoint:** `/api/metrics/system` (JSON format)

**Data returned:**
- Process uptime, memory (RSS, heap used/total)
- System CPU count, load average (1/5/15 min)
- System memory (total, free, used, percentage)
- Status classification (ok, warning, critical)

**Dashboard:** https://coopeverything.org/admin/logs

### Uptime Kuma

**Port:** 3001

**Setup (first-time):**
1. Visit http://localhost:3001
2. Create admin account
3. Add monitors:
   - Health endpoint: https://coopeverything.org/api/health (keyword: "ok")
   - Homepage: https://coopeverything.org/
   - Signup page: https://coopeverything.org/signup
   - Login page: https://coopeverything.org/login
4. Configure notifications (Discord, Slack, email)

**Features:**
- Beautiful web UI
- Status pages
- Multiple notification channels
- SSL certificate monitoring

### Grafana Dashboards

**Port:** 3002
**Login:** admin/admin (change on first login)

**Pre-configured dashboards:**
- TogetherOS Overview (HTTP requests, latency, memory, errors)

**Datasources:**
- Prometheus (default)
- Loki (logs)

**Add custom dashboards:**
1. Go to http://localhost:3002
2. Create → Dashboard
3. Add panels with PromQL queries

**Example queries:**
```promql
# Request rate
rate(http_requests_total{job="togetheros-app"}[5m])

# p95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Memory usage
process_resident_memory_bytes{job="togetheros-app"}

# Error rate
rate(application_errors_total[5m])
```

### Loki Log Aggregation

**Port:** 3100

**Features:**
- Log aggregation from NDJSON files
- Query in Grafana
- Labels: job, severity, action, etc.

**Logs collected:**
- Bridge Q&A logs
- Error logs
- Performance logs
- Security logs

**Query in Grafana:**
```logql
# All bridge logs
{job="bridge"}

# Errors only
{job="errors"} |= "critical"

# Slow requests
{job="performance"} | json | latency_ms > 1000
```

### Health Check Cron

**Script:** `scripts/health-check.sh`

**Runs every:** 5 minutes (configurable)

**Checks:**
1. Health endpoint returns 200
2. Status is "ok" or "degraded"
3. Sends alert on "unhealthy" or connection failure

**Alerts sent to:**
- Discord webhook (if configured)
- Slack webhook (if configured)

### Synthetic Monitoring

**Script:** `scripts/synthetic-monitoring.sh`

**Runs every:** 15 minutes (configurable)

**Tests:** `tests/e2e/synthetic/critical-paths.spec.ts`

**User journeys tested:**
- Homepage loads
- Signup page accessible
- Login page accessible
- Health endpoint returns ok
- Metrics endpoint returns data
- Test pages accessible
- Performance thresholds met

**Alerts:** Sent on test failures

---

## Alerting Setup

### Discord Webhook

1. Open your Discord server
2. Server Settings → Integrations → Webhooks
3. Create webhook, copy URL
4. Add to `.env.local`:
   ```bash
   ALERT_DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
   ```

### Slack Webhook

1. Go to https://api.slack.com/messaging/webhooks
2. Create app, enable incoming webhooks
3. Add webhook to workspace, copy URL
4. Add to `.env.local`:
   ```bash
   ALERT_SLACK_WEBHOOK=https://hooks.slack.com/services/...
   ```

### Severity Levels

- **critical** - Immediate action required (site down, database failure)
- **high** - Action within 1 hour (degraded performance, error spike)
- **medium** - Action within 24 hours (memory warning, slow responses)
- **low** - Monitor (minor issues)

Set minimum severity:
```bash
ALERT_MIN_SEVERITY=medium  # Only send medium/high/critical
```

---

## Log Analysis

### View Recent Errors

```bash
# Last 10 errors
tail -n 10 logs/errors/errors-$(date +%Y-%m-%d).ndjson | jq

# Errors by severity
cat logs/errors/errors-*.ndjson | jq -r '.severity' | sort | uniq -c

# Errors in last hour
cat logs/errors/errors-$(date +%Y-%m-%d).ndjson | \
  jq --arg hour "$(date -u +%Y-%m-%dT%H)" 'select(.ts | startswith($hour))'
```

### View Performance Metrics

```bash
# Average latency today
cat logs/perf/requests-$(date +%Y-%m-%d).ndjson | \
  jq '.latency_ms' | \
  awk '{sum+=$1; count++} END {print sum/count " ms"}'

# Slowest requests
cat logs/perf/requests-*.ndjson | jq -c '. | select(.latency_ms > 1000)'

# Requests by status
cat logs/perf/requests-$(date +%Y-%m-%d).ndjson | \
  jq -r '.status' | sort | uniq -c
```

### View Bridge Logs

```bash
# Recent Q&A
tail -n 20 logs/bridge/actions-$(date +%Y-%m-%d).ndjson | jq

# Average response time
cat logs/bridge/actions-*.ndjson | jq '.latency_ms' | \
  awk '{sum+=$1; count++} END {print sum/count " ms"}'
```

---

## Maintenance

### Docker Cleanup

```bash
# Stop all services
docker-compose -f docker-compose.observability.yml down

# Remove volumes (deletes all data)
docker-compose -f docker-compose.observability.yml down -v

# Restart services
docker-compose -f docker-compose.observability.yml up -d
```

### Log Rotation

Logs older than 30 days are automatically deleted by Loki (configured in `loki-config.yml`).

For NDJSON files, add to cron:
```bash
# Clean logs older than 30 days (daily at 2am)
0 2 * * * find /path/to/TogetherOS/logs -name "*.ndjson" -mtime +30 -delete
```

### Backup Grafana Dashboards

```bash
# Export dashboards
docker exec togetheros-grafana grafana-cli admin export-dashboard > backup.json

# Import on restore
docker exec -i togetheros-grafana grafana-cli admin import-dashboard < backup.json
```

---

## Troubleshooting

### Services not starting

```bash
# Check logs
docker-compose -f docker-compose.observability.yml logs

# Check specific service
docker logs togetheros-prometheus
docker logs togetheros-grafana
```

### Prometheus not scraping

1. Check target in Prometheus: http://localhost:9090/targets
2. Ensure app is running and accessible
3. Update `config/prometheus/prometheus.yml` with correct host

### Grafana dashboard empty

1. Check Prometheus datasource: Configuration → Data Sources
2. Test connection (should be green)
3. Check if metrics are being generated: http://localhost:3000/api/metrics

### Loki not receiving logs

1. Check Promtail is running: `docker logs togetheros-promtail`
2. Ensure log files exist in `logs/` directory
3. Check file permissions (Promtail needs read access)

---

## Costs & Resources

### Resource Usage

| Service | CPU | Memory | Disk |
|---------|-----|--------|------|
| Uptime Kuma | ~5% | ~100 MB | ~50 MB |
| Prometheus | ~10% | ~200 MB | ~1 GB (30 days retention) |
| Grafana | ~5% | ~150 MB | ~100 MB |
| Loki | ~5% | ~200 MB | ~500 MB (30 days retention) |
| Promtail | ~2% | ~50 MB | Minimal |
| **Total** | **~30%** | **~700 MB** | **~2 GB** |

### Recommended VPS

- **Minimum:** 2 GB RAM, 2 CPU cores, 20 GB disk
- **Recommended:** 4 GB RAM, 2 CPU cores, 40 GB disk

### Monthly Cost

**Self-hosted:** $0 (uses existing VPS)
**External services (comparison):**
- Sentry: $26/month
- New Relic: $99/month
- Datadog: $15/month per host

**Savings:** $140/month

---

## Next Steps

1. Configure alerting webhooks
2. Setup cron jobs for health checks
3. Customize Grafana dashboards
4. Add monitors in Uptime Kuma
5. Review logs regularly

---

## Related Documentation

- [Observability Module Spec](../modules/observability.md)
- [Monitoring Setup Guide](./MONITORING.md)
- [Error Catching Overview](../ERROR_CATCHING.md)
