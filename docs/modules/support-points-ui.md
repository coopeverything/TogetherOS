# Support Points & Rewards

**Purpose:** Enable members to signal priorities on proposals and earn recognition for contributions through the dual points system.

**Status:** 100% — Production Ready

---

## Overview

TogetherOS uses two separate point systems for different purposes:

1. **Support Points (SP)** — Governance energy for prioritizing proposals
2. **Reward Points (RP)** — Recognition for community contributions

### Why Two Systems?

**TogetherOS prevents plutocracy by design.** We strictly separate governance power from economic benefits:

- **Support Points** come ONLY from governance activities (proposals, moderation, facilitation)
- **Reward Points** come from contributions (code, content, engagement, financial support)
- **They never intermix** — you cannot buy governance influence with money or donations

---

## Our Values in Action

### Transparency

Both point systems are fully visible:

- **See your balances:** View SP and RP in your wallet
- **Track history:** Every transaction is recorded
- **Understand calculations:** All formulas are documented
- **Verify fairly:** No hidden bonuses or special treatment

### Open Source

The points systems are fully open:

- **Inspect the code:** See exactly how points are calculated
- **Audit allocations:** All SP allocations are public
- **Verify anti-plutocracy:** The separation is enforced in code

### Community Governance

**This module is subject to change by the community through proposal and voting.** Coop-everything means what it says:

- **SP earning rules:** Community decides what activities earn SP
- **RP conversion rates:** Members vote on exchange parameters
- **Point values:** Propose changes to reward weights
- **Your voice matters:** From allocation limits to badge criteria, members decide

---

## Support Points (SP)

### What Are Support Points?

SP is your governance energy — it determines which proposals get prioritized:

- **Allocation:** Signal which proposals matter most to you (max 10 SP per proposal)
- **Reclaim:** Get your SP back when proposals close
- **Earn:** Through governance activities only (proposals, moderation, facilitation)

### How to Use SP

1. Navigate to any proposal at `/governance/proposals/[id]`
2. See your available SP balance
3. Use the slider to allocate 1-10 SP
4. Submit — your SP is now locked to that proposal
5. When the proposal closes, your SP returns to your wallet

### What SP Does

- **Prioritizes proposals:** High-SP proposals get more visibility
- **Signals community interest:** See what members care about
- **Controls agenda:** Determines which issues get addressed first

---

## Reward Points (RP)

### What Are Reward Points?

RP is recognition for your contributions — it acknowledges your efforts:

- **Earned permanently:** Unlike SP, RP doesn't get reclaimed
- **Multiple sources:** Code, content, engagement, financial support
- **Unlock badges:** Track your progress and milestones
- **Real benefits:** Convert to Timebank Credits (TBC) or participate in SH events

### How to Earn RP

| Activity | RP Reward |
|----------|-----------|
| Invitation sent | +25 RP |
| Invitee joins | +50 RP |
| Profile completion | +50 RP |
| Quality forum post | +20 RP |
| Organize meetup | +100 RP |
| Launch working group | +150 RP |
| Monthly dues paid | +100 RP |

---

## Anti-Plutocracy Design

### The Strict Separation

| Aspect | Support Points (SP) | Reward Points (RP) |
|--------|---------------------|-------------------|
| **Purpose** | Governance (prioritize proposals) | Recognition (real-world benefits) |
| **Sources** | ONLY governance activities | Contributions + dues + donations |
| **How Used** | Allocate to proposals | Convert to TBC, perks, badges |
| **Reclaimed?** | Yes (when proposals close) | No (permanently earned) |
| **Governance Power** | Controls agenda | NEVER grants voting power |

### Why This Matters

- **Money cannot buy influence:** Donations earn RP, never SP
- **Voting stays equal:** One person = one vote, regardless of RP
- **Governance is earned:** SP comes from participation, not purchases

---

## Your Wallets

### SP Wallet (`/economy/support-points`)

- **Total earned:** All-time SP earned
- **Available:** SP you can allocate now
- **Allocated:** SP currently locked in proposals
- **History:** Your allocation timeline

### RP Wallet (`/economy/reward-points`)

- **Current balance:** Your available RP
- **Total earned:** All-time RP earned
- **Recent earnings:** Your recent activity
- **Badges unlocked:** Your achievement progress

---

## Related Modules

- [Governance](./governance.md) — Allocate SP to proposals
- [Gamification](./gamification.md) — Badge and milestone systems
- [Rewards](./rewards.md) — Full recognition system
- [Social Economy](./social-economy.md) — Complete economic model

---

## Technical Implementation

For developers interested in the database schemas, API endpoints, TypeScript interfaces, and implementation details:

[View on GitHub](https://github.com/coopeverything/TogetherOS/blob/yolo/docs/dev/modules/support-points-technical.md)

---

<!-- progress:support-points-ui=100 -->
