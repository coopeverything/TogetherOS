# Execution & Accountability

**Purpose:** Ensure decisions made by the community actually get implemented, with transparent tracking from proposal to completion and democratic oversight of those who execute.

**Status:** 0% — Specification Complete

---

## Overview

The Execution & Accountability module bridges the gap between democratic decisions and real-world action:

1. **Initiative Tracking** — Convert approved proposals into trackable tasks
2. **Admin Implementation Queue** — Admins see what they need to do
3. **Public Accountability Dashboard** — Everyone sees what's been done
4. **Settings Management** — Two-tier system (community votes vs admin discretion)
5. **Recall Mechanism** — Remove underperforming admins democratically

### Design Principles

- **Executors, not rulers:** Admins implement community decisions, not their own agenda
- **Rotating and recallable:** Admin terms have limits, and groups can vote to remove
- **Audit everything:** Every admin action logged with authorization source
- **Transparent by default:** Public dashboard shows pending and completed work

---

## Our Values in Action

### Transparency

Everything admins do is visible:

- **Public initiative tracking:** See what decisions are being implemented
- **Delivery reports:** Admins prove completion with evidence
- **Performance metrics:** Track on-time completion rates
- **Audit logs:** Every action recorded with who, what, when, and why

### Open Source

The accountability system is fully open:

- **Inspect the code:** See exactly how admin actions are tracked
- **NDJSON audit trails:** Machine-readable logs with integrity checks
- **Review the algorithms:** Priority calculation and workload balancing are documented

### Community Governance

**This module is subject to change by the community through proposal and voting.** Coop-everything means what it says:

- **Admin term limits:** Community decides how long admins serve
- **Recall thresholds:** Members set criteria for removing underperformers
- **Settings classification:** Vote on which settings require assembly approval
- **Your voice matters:** From deadlines to performance metrics, members decide

---

## What Makes Admins Different Here

Traditional platforms give admins centralized, unchecked power. TogetherOS redefines admins as:

- **Rotating:** Terms have expiration dates (configurable per group)
- **Recallable:** Groups can vote to remove admins before term ends
- **Executors:** They implement decisions made through proposals
- **Accountable:** Every action logged with authorizing decision ID
- **Transparent:** Public dashboard shows pending and completed work

---

## How Implementation Works

### Decision → Initiative → Delivery

1. **Proposal Approved** — Community votes on a change
2. **Initiative Created** — System converts decision into trackable tasks
3. **Admin Assigned** — Tasks go to admin queue based on workload
4. **Work Completed** — Admin marks tasks done with proof
5. **Delivery Report** — Admin submits evidence of completion
6. **Community Verifies** — Members confirm the work was done correctly

### Two-Tier Settings

Not all changes require a full vote:

**Requires Community Vote:**
- Financial decisions
- Governance rules
- Membership criteria
- Resource allocation
- Federation policies

**Admin Discretion (with justification):**
- Technical configurations
- Routine maintenance
- Emergency fixes

All changes—whether voted or discretionary—are logged with authorization source.

---

## Recall: Democratic Removal

When admins underperform, the community can act:

### Automatic Warnings

System flags admins when:
- 3+ initiatives past deadline
- Average completion time >2x group average
- 2+ delivery reports rejected
- Negative feedback from 5+ members

### Recall Process

1. Member initiates recall proposal with evidence
2. Community deliberates (7 days)
3. Vote conducted (simple majority)
4. If approved: Admin role revoked, tasks reassigned
5. Cooldown: Cannot reapply for same role for 6 months

---

## Privacy Protections

### Members See

- Initiative titles and status
- Admin performance metrics (pseudonymized by default)
- Delivery reports (after submission)
- Aggregate accountability stats

### Admins See

- Detailed audit logs
- Assignment history
- Internal deliberation on recalls

### Protected

- IP addresses hashed in logs
- PII redacted from metadata
- Real names optional (can use pseudonyms)

---

## Technical Implementation

For developers interested in the entity schemas, API endpoints, audit log format, and implementation details:

[View on GitHub](https://github.com/coopeverything/TogetherOS/blob/yolo/docs/dev/modules/admin-accountability-technical.md)

---

## Related Modules

- [Governance](./governance.md) — Proposals that create initiatives
- [Moderation Transparency](./moderation-transparency.md) — Parallel accountability for moderators
- [Metrics](./metrics.md) — Success tracking for initiatives
- [Groups](./groups.md) — Group-level admin roles

---

<!-- progress:admin-accountability=0 -->
