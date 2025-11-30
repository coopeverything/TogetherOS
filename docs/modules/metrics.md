# Metrics & Review

**Purpose:** Track whether decisions actually achieve their goals, trigger re-evaluation when they don't, and create a feedback loop for continuous improvement.

**Status:** 0% — Specification Complete

---

## Overview

The Metrics module ensures decisions are evaluated against stated goals:

1. **Success Metrics Definition** — Specify measurable outcomes for initiatives
2. **Evaluation Scheduling** — Automatic check-ins at key milestones
3. **Re-evaluation Triggers** — Flag underperforming initiatives automatically
4. **Minority Report Validation** — Check if dissenting predictions came true
5. **Feedback Loop** — Auto-generate improvement proposals when things fail

### Design Principles

- **Meaningful outcomes:** Measure impact, not just output
- **Learn from failure:** Every failed initiative teaches something
- **Minority voices matter:** Validated dissent informs future decisions
- **Continuous improvement:** Cycle from decision → result → refinement

---

## Our Values in Action

### Transparency

All metrics are visible:

- **Public success rates:** See which types of initiatives succeed
- **Failure patterns:** Learn from what hasn't worked
- **Minority validation:** Track how often dissenters were right
- **No hidden algorithms:** All calculations documented

### Open Source

The metrics system is fully open:

- **Inspect the code:** See how success is calculated
- **Review evaluation logic:** Understand trigger conditions
- **Audit improvement proposals:** See what the system recommends

### Community Governance

**This module is subject to change by the community through proposal and voting.** Coop-everything means what it says:

- **Success thresholds:** Community decides what counts as success
- **Evaluation timelines:** Members set when to measure outcomes
- **Failure responses:** Vote on how to handle underperforming initiatives
- **Your voice matters:** From metric weights to re-evaluation triggers, members decide

---

## Good Metrics vs Bad Metrics

### What Makes a Good Metric?

- **Specific:** Clear definition, no ambiguity
- **Measurable:** Quantifiable or verifiable
- **Relevant:** Directly related to proposal goals
- **Time-bound:** Evaluation timeline specified
- **Attributable:** Can link outcome to initiative

### Examples

| Good Metric | Bad Metric |
|-------------|------------|
| "50 members actively using community garden" | "Garden built" |
| "80% satisfaction rating in post-survey" | "People are happy" |
| "Response time under 24 hours" | "Fast responses" |
| "30% cost reduction vs previous quarter" | "Save money" |

---

## How Evaluation Works

### The Cycle

1. **Initiative Delivered** — Admin submits completion
2. **Evaluation Scheduled** — System sets measurement date (30 days, 90 days, 1 year)
3. **Measurement Time** — Community enters actual outcomes
4. **Compare Results** — System calculates: target vs actual
5. **Determine Outcome:**
   - **Succeeded:** Actual ≥ target for all metrics
   - **Mixed:** Some succeeded, some failed
   - **Failed:** Actual < target for majority

### When Initiatives Fail

1. System creates draft improvement proposal
2. Pre-fills with:
   - Link to original decision
   - Failed metrics (evidence)
   - Minority report excerpts (if applicable)
   - Lessons from delivery report
3. Member reviews and submits as amendment
4. Governance processes the improvement
5. New initiative → New metrics → Better results

---

## Minority Report Validation

One of the most powerful features: checking if dissenters were right.

### Why This Matters

- Minority reports capture concerns the majority dismissed
- When initiatives fail, minority concerns often prove valid
- This creates accountability for majority decisions
- Over time, communities learn to take dissent seriously

### How It Works

1. When metrics fail, system checks minority reports
2. Compares concerns raised vs actual outcomes
3. If concerns validated → Quoted in improvement proposal
4. Tracks validation rate over time

---

## Metric Templates

Common initiative types have pre-built metrics:

### Community Projects
- Active participation rate
- Member satisfaction score
- Resource utilization efficiency

### Platform Features
- User adoption percentage
- Bug count in first 30 days
- Net Promoter Score (NPS)

### Events
- Attendance vs target
- Post-event feedback rating
- Follow-up engagement rate

---

## Related Modules

- [Execution & Accountability](./admin-accountability.md) — Initiative tracking
- [Governance](./governance.md) — Amendment proposals from failures
- [Gamification](./gamification.md) — Community milestone tracking
- [Events](./events.md) — Evaluation reminder scheduling

---

## Technical Implementation

For developers interested in the entity schemas, API endpoints, evaluation algorithms, and implementation details:

[View on GitHub](https://github.com/coopeverything/TogetherOS/blob/yolo/docs/dev/modules/metrics-technical.md)

---

<!-- progress:metrics=0 -->
