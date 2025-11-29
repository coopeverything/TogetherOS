# Social Economy

**Purpose:** Enable a fair cooperative economy that redirects surplus back to communities through mutual aid, time-banking, collective purchasing, and transparent value exchange.

**Status:** 0% — Specification Complete

---

## Overview

The Social Economy module provides cooperative economic tools:

1. **Support Points (SP)** — Signal community priorities (governance)
2. **Mutual Aid** — Request and offer help with verified completion
3. **Time-Banking** — Fair exchange of services (1 hour = 1 credit)
4. **Collective Purchasing** — Group buying power for better prices
5. **Investment Pools** — Community-funded projects
6. **Emergency Relief** — Safety net for urgent needs

### Design Principles

- **Anti-whale:** Prevent large holders from dominating
- **Pro-contribution:** Reward steady, long-term participation
- **Transparent flows:** All transactions visible (privacy-aware)
- **Local value retention:** Keep wealth in communities

---

## Our Values in Action

### Transparency

Economic activity is visible:

- **Public allocation history:** See where Support Points go
- **Transaction dashboards:** Track mutual aid, timebank, purchases
- **Treasury flows:** Community funds are fully transparent
- **Local value metrics:** Know how much stays in your community

### Open Source

The economic system is fully open:

- **Inspect the code:** See how points and credits work
- **Review fair-exchange algorithms:** Understand anti-exploitation measures
- **Audit treasury logic:** All investment decisions documented

### Community Governance

**This module is subject to change by the community through proposal and voting.** Coop-everything means what it says:

- **Point allocations:** Community sets SP caps and earning rates
- **Exchange rates:** Members vote on timebank policies
- **Treasury investments:** Democratic decisions on fund allocation
- **Your voice matters:** From mutual aid categories to relief fund limits, members decide

---

## Support Points (SP)

### What They're For

SP lets you signal which proposals matter most to you:

- Every member starts with **100 SP**
- Allocate **max 10 SP** per proposal (anti-whale)
- Non-transferable (cannot buy or sell)
- Reclaim SP when proposals close

### How It Works

```
You have 100 SP
  → Allocate 10 SP to "Community Garden"
  → Allocate 5 SP to "Farmers Market"
  → Allocate 8 SP to "Repair Cafe"
  → Remaining: 77 SP

When "Community Garden" reaches 150 SP total → prioritized
Your 10 SP locked until delivery or cancellation
```

### Why This Matters

- Prevents wealthy members from buying influence
- Ensures everyone's voice has equal weight
- Creates true signal of community priorities

---

## Mutual Aid

### How It Works

1. **Request:** "Need help moving on Saturday"
2. **Offers:** "I can help 2-4pm"
3. **Accept:** Choose an offer
4. **Confirm:** Both parties verify completion
5. **Reputation:** Both get positive history

### Categories

- **Material:** Food, supplies, equipment
- **Time/Labor:** Moving, childcare, repairs
- **Skills:** Tutoring, consulting, mentoring
- **Space:** Temporary housing, workspace

### Safeguards

- Both parties must confirm completion
- Abuse reports go to moderators
- Fair-exchange index tracks imbalances
- Visible reputation on profiles

---

## Time-Banking

### The Principle

**1 hour = 1 credit, regardless of service type**

A plumber's hour equals a tutor's hour equals a gardener's hour. All time is valued equally.

### Example

```
Bob provides 3 hours of car repair → Earns 3 credits
Bob uses 2 credits for tutoring → Balance: 1 credit
```

### Fair Exchange Index

Tracks whether members take more than they give:

- Target: Roughly balanced over 6 months
- Warnings if ratio exceeds 2:1 (taking twice as much)
- Encourages reciprocity without punishment

---

## Collective Purchasing

### Group Buying Power

1. Member proposes: "100 lbs organic flour"
2. Others commit: "I'll take 10 lbs"
3. Threshold met → Purchase made
4. Savings shared among participants

### Features

- **Transparent bidding:** Suppliers compete openly
- **Solidarity pricing:** Those who can afford more subsidize others
- **Recurring essentials:** Monthly staples (rice, beans, etc.)

### Benefits

- Lower prices through volume
- Support local/ethical producers
- Reduce packaging waste
- Build community connections

---

## Investment Pools & Relief Funds

### Community Investment

- Members contribute to shared fund
- Projects apply for funding
- Governance votes on allocation
- Returns flow to public goods

### Emergency Relief

- Pre-funded safety net
- Fast approval for urgent needs (medical, housing)
- Risk limits (max per person)
- Transparent beneficiary disclosure

---

## Privacy & Metrics

### What's Public

- Aggregate economic activity
- Community-wide trends
- Anonymous transaction patterns

### What's Private

- Individual transaction details (opt-in to share)
- Personal balances (you control visibility)
- Specific requests/offers (group members only)

### Success Metrics

- Support Points allocation trends
- Mutual aid completion rates
- Timebank balance distribution
- Local value retained percentage

---

## Technical Implementation

For developers interested in the data models, API endpoints, wallet schemas, and implementation details:

[View on GitHub](https://github.com/coopeverything/TogetherOS/blob/yolo/docs/dev/modules/social-economy-technical.md)

---

## Related Modules

- [Support Points](./support-points-ui.md) — SP/RP wallet interfaces
- [Governance](./governance.md) — SP allocation to proposals
- [Rewards](./rewards.md) — RP earning system
- [Gamification](./gamification.md) — Contribution paths and badges

---

<!-- progress:social-economy=0 -->
