# Observability Module

**Purpose:** Monitor system health, track errors, measure performance, and provide visibility into how TogetherOS runs.

**Status:** 100% — Production Ready

---

## Overview

The Observability module keeps TogetherOS reliable and transparent:

1. **Error Tracking** — Catch and report problems automatically
2. **Health Monitoring** — Real-time system status checks
3. **Performance Monitoring** — Track response times and resource usage
4. **Uptime Monitoring** — Know immediately when something goes down
5. **Synthetic Testing** — Automated tests verify critical user journeys

### Design Principles

- **Privacy-first:** No user data in error reports
- **Self-hosted first:** Own our monitoring infrastructure
- **Transparent operations:** Public status page planned
- **Cost-efficient:** Free and open-source tools

---

## Our Values in Action

### Transparency

Operations are visible to the community:

- **Public health status:** Anyone can check system health
- **Incident reports:** Document what went wrong and why
- **Performance metrics:** See how fast the platform responds
- **Planned status page:** Community can see uptime history

### Open Source

Our monitoring stack is fully open:

- **Inspect the code:** See how we detect and respond to errors
- **Self-hosted tools:** Prometheus, Grafana, Loki, Uptime Kuma
- **No vendor lock-in:** All data stays on our infrastructure

### Community Governance

**This module is subject to change by the community through proposal and voting.** Coop-everything means what it says:

- **Uptime targets:** Community sets SLA expectations
- **Alerting rules:** Members decide what triggers alerts
- **Data retention:** Vote on how long to keep logs
- **Privacy policies:** Community controls what's tracked

---

## What We Monitor

### System Health

Real-time checks on critical components:

- **Database:** Connection status and query latency
- **Memory:** Usage and availability
- **Uptime:** How long since last restart
- **API responses:** Critical endpoints responding correctly

### Error Tracking

Automatic detection and reporting:

- **Privacy protection:** Email and IP addresses redacted
- **Context capture:** What happened before the error
- **Grouping:** Similar errors clustered together
- **Alerting:** Team notified of new issues

### Performance

Track how fast things run:

- **Response times:** p50, p95, p99 latency
- **Resource usage:** CPU, memory, disk
- **Query performance:** Database query times
- **Load patterns:** Traffic trends

---

## Privacy Protections

### PII Redaction

Sensitive data is automatically removed:

- **Emails** → `[EMAIL_REDACTED]`
- **IP addresses** → `[IP_REDACTED]`
- **Auth headers** → Removed completely
- **Cookies** → Never captured

### Data Retention

- **Error logs:** 90 days
- **Performance metrics:** 30 days
- **Health checks:** Real-time only (not persisted)

### GDPR Compliance

- No raw user data in error messages
- IP addresses hashed in logs
- Data deletion available on request

---

## Auto-Rollback

When deployments fail, we recover automatically:

1. **Deploy:** New code pushed to production
2. **Verify:** Health checks run automatically
3. **Detect:** If any check fails, rollback triggers
4. **Recover:** Previous version restored in <60 seconds
5. **Alert:** Team notified of the rollback

---

## Related Modules

- [Security](./security.md) — Security scanning and privacy protections
- [Bridge](./bridge.md) — Privacy in AI interactions

---

## Technical Implementation

For developers interested in the architecture, Docker stack, alerting configuration, and implementation details:

[View on GitHub](https://github.com/coopeverything/TogetherOS/blob/yolo/docs/dev/modules/observability-technical.md)

---

<!-- progress:observability=100 -->
