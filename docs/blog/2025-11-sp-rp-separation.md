# Support Points (SP) vs Reward Points (RP): Clarifying the Separation

**Date:** November 18, 2025
**Author:** TogetherOS Development Team
**Category:** Social Economy, Collective Governance

## TL;DR

We've clarified a fundamental principle in our 4-ledger economic system: **Support Points (SP) are exclusively political/governance**, while **Reward Points (RP) are economic/engagement**. This separation is a core anti-plutocracy safeguard that prevents money from buying governance influence.

## The Problem We Fixed

Earlier documentation incorrectly stated that code contributions earned Support Points. This violated our core invariant: **Money/RP can NEVER become SP.**

### What Was Wrong

- ❌ Documentation claimed: "SP earned from code contributions (PRs, docs, reviews, bug fixes)"
- ❌ This would allow wealth to convert to governance power
- ❌ Violated the anti-plutocracy principle

### What's Correct Now

- ✅ **SP (Political/Governance Only)**: proposals, moderation quality, facilitation, deliberation
- ✅ **RP (Economic/Engagement)**: code, profile completion, microlessons, forum posts, research, monthly dues, donations
- ✅ **Moderation earns both**: performing moderation action → RP (labor), community quality ratings → SP (political recognition)

## Why This Matters

### Anti-Plutocracy Safeguard

In traditional systems, those with money can buy influence through:
- Campaign donations
- Lobbying
- Hiring staff to amplify their voice
- Purchasing media coverage

TogetherOS prevents this by creating **two separate ledgers**:

1. **Support Points (SP)** - Governance power for agenda-setting
   - Determines what gets prioritized
   - Allocated to proposals to signal importance
   - **Can ONLY be earned through governance participation**
   - **Never from money, code, or RP**

2. **Reward Points (RP)** - Economic claims on the commons
   - Tracks contribution value
   - Can be exchanged for goods/services
   - Earned through code, engagement, financial support
   - **Cannot be converted to governance power**

### The Invariant

```
Money/RP → SP = FORBIDDEN
```

This ensures that:
- A wealthy member can donate money → earns RP (economic claims)
- But their governance influence (SP) only grows through *actual governance participation*
- Code contributors are economically rewarded (RP) but don't automatically get political power (SP)

## SP Sources (Political/Governance Activities)

Support Points come ONLY from activities that improve political dialog and decision-making:

| Activity | SP Earned | Why Political |
|----------|-----------|---------------|
| Proposal creation | 10 SP | Agenda-setting |
| Quality ratings on proposals | 5 SP | Deliberation |
| Moderation quality (high) | 15 SP | Community health |
| Facilitation | 12 SP | Consensus building |
| Consensus achieved | 20 SP | Effective governance |
| Minority report | 12 SP | Dissent protection |

**Not from:** Code, money, donations, RP, profile completion

## RP Sources (Economic/Engagement Activities)

Reward Points recognize all forms of contribution:

### Code Contributions
- PR merged (medium): +50 RP
- Documentation: +30 RP
- Code review: +20 RP
- Bug fix: +40 RP

**Note:** Code earns **0 SP** - coding is economic labor, not political participation

### Engagement Activities
- Profile completion: +50 RP
- Microlesson completed: +10 RP
- Forum quality post: +20 RP
- Research contribution: +30 RP
- Social import (verified): +15 RP

### Financial Support
- Monthly dues: +100 RP/month
- Donations (min $20): +200 RP
- Timebank credit exchange: variable RP

### Moderation Labor
- Performing moderation action: +10 RP
- This is separate from quality ratings earning SP

## Moderation: The Dual-Earning Exception

Moderation is unique because it has both economic and political dimensions:

```
Moderation Action → RP (labor compensation)
  +
Quality Rating → SP (political recognition)
```

**Example:**
1. Alice flags a post for review → earns 10 RP (labor)
2. Community rates Alice's moderation as high quality → earns 15 SP (political trust)

This recognizes that:
- Moderation is **labor** (RP)
- Good moderation builds **political trust** (SP)

## Implementation Changes

### Files Updated

1. **docs/guides/4-ledger-system.md**
   - Rewrote SP sources to show political activities only
   - Updated RP sources to include code + engagement + financial
   - Changed example flow from PR merge to proposal creation

2. **docs/modules/rewards.md**
   - Updated SP_WEIGHTS example with governance activities
   - Added detailed RP sources breakdown
   - Made anti-plutocracy invariant explicit

3. **docs/modules/support-points-ui.md**
   - Fixed mechanics description
   - Clarified SP never from code

4. **apps/web/app/economy/support-points/SPWalletClient.tsx**
   - Updated "Fair Distribution" help text
   - Shows governance activities only

5. **apps/web/app/economy/EconomyClient.tsx**
   - Fixed SP sources panel (political only)
   - Fixed RP sources panel (code + engagement + financial)

6. **apps/web/app/modules/page.tsx**
   - Updated Support Points & Reputation module description
   - Updated Support Points UI module description
   - Both now emphasize anti-plutocracy safeguard

### Visual Changes

**Before (Incorrect):**
```
SP Panel: "Earned from code contributions"
```

**After (Correct):**
```
SP Panel:
- Initial grant: 100 SP
- Governance: Proposals, moderation quality, facilitation, deliberation
- Never from code, money, or RP
```

## For Members: What This Means

### If You Contribute Code
- ✅ You earn RP (economic claims on the commons)
- ❌ You don't automatically get SP (governance power)
- 💡 To gain governance influence: participate in proposals, moderation, facilitation

### If You Donate Money
- ✅ You earn RP (recognition of financial support)
- ❌ Money cannot buy governance power
- 💡 To influence priorities: engage in governance activities

### If You Want to Prioritize Proposals
- ✅ Allocate your SP to signal which proposals matter most
- ✅ Earn more SP through quality governance participation
- ❌ Cannot purchase SP with money or RP

## Example Scenarios

### Scenario 1: The Wealthy Donor

**Alice donates $1,000 to the commons.**

- ✅ Earns 5,000 RP (economic recognition)
- ❌ Earns 0 SP (money can't buy governance power)
- ✅ Can use RP for timebank exchanges, goods, services
- ❌ Cannot convert RP to SP to influence which proposals get prioritized

**To gain governance influence:**
- Alice must participate in proposals, moderation, facilitation
- Her wealth gives her economic claims, not political power

### Scenario 2: The Developer

**Bob merges 10 high-quality PRs.**

- ✅ Earns 500 RP (economic reward for code labor)
- ❌ Earns 0 SP (code is not political participation)
- ✅ Can exchange RP for goods/services
- ❌ Has same governance power as a non-coder who participates in governance

**To gain governance influence:**
- Bob must engage in deliberation, create proposals, moderate discussions
- His coding skill gives him economic claims, not automatic political power

### Scenario 3: The Facilitator

**Carol facilitates 5 productive deliberations.**

- ✅ Earns 60 SP (political recognition for consensus building)
- ✅ Earns 0 RP (pure governance activity, not economic labor)
- ✅ Can allocate SP to prioritize proposals
- ❌ Doesn't earn economic claims unless she also codes, moderates, or donates

**To gain economic claims:**
- Carol could contribute code, complete microlessons, or moderate
- Her governance skills give her political power, separate from economic claims

## Next Steps

1. **Review the docs** at:
   - [4-Ledger System Guide](/docs/guides/4-ledger-system.md)
   - [Rewards Module](/docs/modules/rewards.md)
   - [Support Points UI](/docs/modules/support-points-ui.md)

2. **Check your SP balance** at: [/economy/support-points](/economy/support-points)

3. **Explore the economy dashboard** at: [/economy](/economy)

4. **Join the discussion** at: [Community Forum](/forum)

## Questions?

**Q: Why separate SP and RP at all?**
A: To prevent plutocracy. If money or code could buy governance power, wealthy members would control the commons.

**Q: Can I ever convert RP to SP?**
A: No. This is a core invariant. Political power only comes from governance participation.

**Q: What if I want to support proposals financially?**
A: You can donate (earns RP), but to *prioritize* proposals you must earn SP through governance activities.

**Q: Is moderation the only dual-earning activity?**
A: Yes. Moderation labor earns RP, while moderation quality earns SP. This recognizes both its economic and political value.

---

**Status:** ✅ All documentation updated, deployed to production
**Related PRs:** #314 (SP Wallet), #315 (SP/RP Separation)
**Live Pages:** [Economy Dashboard](/economy), [SP Wallet](/economy/support-points), [Modules Hub](/modules)
