# TogetherOS 4-Ledger Economic System

**Version:** 2.0 (Aligned with Rewards System Spec v2)
**Status:** Canonical Reference
**Last Updated:** 2025-11-15

---

## Overview

TogetherOS implements a **4-ledger economic system** designed to prevent plutocracy while enabling real-world benefits for contributors. This system maintains strict separation between governance power (Support Points) and economic claims (Reward Points, Timebank Credits, Social Horizon).

### The Four Ledgers

1. **Support Points (SP)** - Governance energy for prioritizing proposals
2. **Reward Points (RP)** - Claims from contributions/dues/donations
3. **Timebank Credits (TBC)** - Time-based service exchange currency
4. **Social Horizon (SH)** - Long-term cooperative asset shares

---

## Core Invariants (Non-Negotiable)

These principles are **hard-coded** into the system and cannot be bypassed:

### Invariant 1: Money and Reward Points Are Never Support Points
- **SP comes ONLY from non-monetary contribution events**
- Membership fees → RP (not SP)
- Donations → RP (not SP)
- RP cannot be converted to SP
- **Why:** Prevents buying governance influence

### Invariant 2: One Person, One Vote
- **Binding decisions use equal-weight votes**
- SP controls agenda-setting (what gets voted on), not vote weight
- RP/TBC/SH do not affect voting power
- **Why:** Democratic equality in final decisions

### Invariant 3: Support Is Not Reward
- **SP** = what you want to see prioritized (governance)
- **RP/TBC/SH** = what you've earned and can use (economy)
- These ledgers never intermix
- **Why:** Separates political power from economic benefit

### Invariant 4: No Direct "Buying Big"
- Donations do not automatically grant SP or SH
- SH acquisition via money/RP is only through special, capped events
- Per-person and per-cycle caps prevent whales
- **Why:** Long-term power tied to ongoing contribution, not one-time payment

### Invariant 5: Real-World Benefit Without Plutocracy
- Dues and donations DO grant RP (tangible benefit)
- RP can be converted to TBC (at least 1 TBC guaranteed)
- Long-term wealth (SH) and governance (SP) remain tied to participation
- **Why:** Members feel valued for financial support without buying power

---

## Ledger 1: Support Points (SP)

### Purpose
**Governance energy** - determines which proposals reach the decision pipeline and with what priority.

### Sources (Political/Governance Activities Only)
- Proposal creation and quality ratings
- Moderation quality scores (community feedback)
- Deliberation facilitation
- Consensus building activities
- Verified political dialog improvement
- **NEVER from code contributions, money, fees, donations, or RP**

### Uses
- Allocate SP to proposals (including your own)
- Each proposal has a **per-member cap** (e.g., max 10 SP per proposal)
- Global SP score (sum from all members) determines priority
- Proposals must meet **agenda thresholds** to advance to binding vote:
  - Minimum number of distinct supporters (breadth)
  - Minimum global SP score (depth)

### Properties
- **Non-transferable** between members
- **Allocated SP are locked** while proposal is open
- **SP returned** when proposal closes (up to member's current max budget)
- **Decay on inactivity** - if no contribution for 90 days:
  - `support_budget_max` decays by factor (e.g., 0.9 per month)
  - `support_budget_available` capped at new max
- **Base floor** ensures occasional users never completely voiceless

### Database Fields
- `support_budget_max` - Ceiling based on lifetime contribution
- `support_budget_available` - What can be allocated right now
- `allocated` - Currently locked on active proposals

### Example Flow
1. Alice creates a governance proposal → earns 10 SP
2. Alice allocates 10 SP to Proposal #42 (locks SP)
3. Proposal #42 closes → Alice's 10 SP returns to available budget
4. Alice can now allocate those SP elsewhere

---

## Ledger 2: Reward Points (RP)

### Purpose
**The commons owes you something** - real-world claims from contributions and financial support.

### Sources
1. **Code contributions** (PRs merged, documentation, reviews, bug fixes)
   - Example: PR merged → 50 RP (grants 0 SP - code is not political)
2. **Engagement activities** (profile completion, microlessons, forum participation, research)
   - Profile completion → 50 RP
   - Microlesson completed → 10 RP
   - Forum quality post → 20 RP
   - Research contribution → 30 RP
3. **Moderation labor** (performing moderation earns RP)
   - Moderation action → 10 RP (labor compensation)
   - Note: Community quality ratings earn SP (political), not RP
4. **Membership dues** (fixed RP per paid month)
   - Example: Monthly fee → 100 RP
5. **One-off donations** (RP amount sufficient for at least 1 TBC)
   - Minimum donation grants enough RP to redeem 1 Timebank Credit
   - Larger donations grant proportionally more RP

### Uses
1. **Convert to Timebank Credits (TBC)** - Primary use
   - Monthly conversion limit (e.g., 100 RP → 1 TBC per month)
   - Throttled to keep timebank grounded in real service
2. **Participate in Social Horizon (SH) purchase events**
   - Occasional, tightly controlled events
   - Strict per-person and global caps
   - RP spent on SH is **burned** (cannot also convert to TBC)
3. **Unlock perks and benefits**
   - Priority event seats
   - Raffles for collective items
   - First pick at retreat slots

### Properties
- **Single RP ledger** - no distinction by origin (contribution vs dues vs donation)
- **Never becomes SP** - RP does not grant governance power
- **Never directly grants voting power** - one person, one vote remains absolute
- **Permanently earned** - RP balance only decreases when spent

### Conversion Rules: RP → TBC
- **Rate:** Stable and universal (e.g., 100 RP = 1 TBC)
- **Throttling:** Once per month, up to defined RP amount
- **Global cap:** Per-member monthly limit ensures TBC issuance tied to real capacity
- **One-way:** RP → TBC; TBC never converts back to RP

### Example Flow
1. Bob completes 5 verified tasks → earns 250 RP
2. Bob pays monthly dues ($10) → earns 100 RP
3. Bob converts 100 RP → 1 TBC (monthly limit)
4. Bob uses 1 TBC to request massage service from Carol

---

## Ledger 3: Timebank Credits (TBC)

### Purpose
**Time-based service exchange** - enables peer-to-peer mutual aid with flexible specialist pricing.

### Unit Definition
- **1 TBC = 1 hour of standard service** (default reference)
- Specialists can value services at **1, 2, or 3 TBC per hour**
- Flexibility allows specialists to participate without devaluing expertise

### Pricing Examples
| Service | TBC per Hour | Justification |
|---------|--------------|---------------|
| Basic task (tutoring, errands) | 1 TBC | Standard rate |
| Skilled service (massage, repair) | 2 TBC | Specialized training |
| Professional service (doctor, therapist) | 3 TBC | Advanced expertise |

### Sources
1. **Direct timebank exchange**
   - Member provides service, sets agreed TBC cost
   - Receiver confirms transaction
2. **RP conversion** (see Ledger 2)
   - Monthly conversion limit (e.g., 1 TBC per month)
3. **Donations** (indirect)
   - Donation grants RP → member redeems RP for TBC

### Uses
- **Request services** from other members
- Pay agreed TBC price (1-3 TBC per hour depending on service)
- Examples: massage, tutoring, medical consult, child care, transport, mentoring

### Properties
- **Transferable via service exchange** (not direct P2P transfer)
- **Conversion rate RP→TBC is fixed** (stable, universal)
- **Service pricing is flexible** (1-3 TBC per unit)
- **Conversion throttled** (monthly limit) to prevent point farming

### Example Flow
1. Carol offers massage services at **2 TBC per hour**
2. Bob requests 1-hour massage (costs 2 TBC)
3. Carol provides service, Bob confirms
4. 2 TBC transfer from Bob → Carol
5. Carol can now use her 2 TBC to request other services

---

## Ledger 4: Social Horizon (SH) Fractions

### Purpose
**Long-term cooperative asset** - share in the commons' future surplus and collective wealth.

### Sources
1. **Periodic issuance cycles** (primary distribution)
   - Allocates new SH based on:
     - Contribution history
     - Timebank activity
     - Platform-defined formulas
   - Regular (e.g., quarterly) scheduled issuance
2. **Controlled RP-based purchase events** (rare, capped)
   - Occasional events where members use RP to buy limited SH
   - Strict anti-whale rules (see below)
3. **Controlled money-based campaigns** (very rare, governed)
   - Donation campaigns that allocate small SH portion to donors
   - Explicit proposal-driven, time-bound, transparently reported

### Uses
- **Receive dividends** from cooperative treasury
- **Share in social economy profits** (when surplus exists)
- **Long-term wealth accumulation** tied to sustained contribution

### Anti-Whale Safeguards

#### Rule 1: Fiscal Regularity Requirement
- **Only members with dues up-to-date** can participate in SH purchase events
- Prevents one-time speculators from buying in

#### Rule 2: Per-Person Caps
- **Maximum SH per person per event** (e.g., no more than 5 SH or 2% of cycle issuance)
- Prevents any individual from acquiring outsized share

#### Rule 3: Global Caps per Event
- **Maximum total SH distributed via RP/money** (e.g., 10-20% of cycle issuance)
- Majority of SH always goes to contribution-based allocation

#### Rule 4: RP Burning
- **RP spent on SH is burned** (removed from circulation)
- Cannot convert same RP to both TBC and SH

#### Rule 5: Velocity Dampers
- **Limits on how quickly SH can be acquired or transferred**
- Prevents rapid speculation accumulation

### Properties
- **Cannot be bought directly** through regular donations/fees
- **Issuance rules designed to avoid concentration** ("no bulls, no whales")
- **Not tradable** on speculation markets (by design)
- **Dividends/benefits** from cooperative treasury over time

### Example Flow
1. **Issuance Cycle Q1 2025**
   - 1000 SH created for distribution
   - 80% (800 SH) allocated based on contribution scores
   - 20% (200 SH) available for RP purchase event
2. **RP Purchase Event**
   - Event open for 7 days
   - Per-person cap: 5 SH max
   - Global cap: 200 SH total
   - David uses 500 RP to purchase 5 SH (hits personal cap)
   - 500 RP burned (removed from circulation)
3. **Dividend Distribution**
   - Cooperative treasury has $10,000 surplus
   - Distributed to all SH holders proportionally
   - David's 5 SH (out of 10,000 total) → $5 dividend

---

## Governance Logic

### Support Points and Agenda-Setting

**While proposal is open:**
- SP allocated to proposal are **locked** (unavailable for other proposals)

**When proposal closes:**
- All SP allocated to it are **returned** to each supporter's available budget (up to their `support_budget_max`)

**Agenda thresholds (proposal advancement):**
- **Minimum supporters** (breadth) - e.g., at least 10 distinct members
- **Minimum SP score** (depth) - e.g., at least 100 total SP
- Only proposals meeting both thresholds advance to binding vote

### One Person, One Vote (Binding Decisions)

**Voting rule:**
- Each eligible member has **exactly one vote** per proposal
- SP/RP/TBC/SH **do not weight** the final yes/no/option tally
- Vote counts: 1 person = 1 vote (absolute equality)

**Optional governance links:**
- Certain advanced roles (moderators, stewards, large-budget proposers) **may require minimum SP histories**
- This gates **who can propose**, not vote weight
- Votes remain one-person-one-vote regardless of role

---

## Rewards Logic (RP → TBC → SH)

### Earning Reward Points

**Contribution events:**
- Every verified action generates RP according to weight function
- Examples: code, UX, community care, organizing, documentation, moderation
- Weight determined by event type and scope

**Membership dues:**
- Each paid month grants fixed RP (e.g., `DUES_RP_PER_MONTH = 100`)
- Reflects ongoing commitment to funding the commons

**Donations:**
- Each donation grants RP via donation-to-RP function
- **Explicit design goal:** Amount enough to enable at least 1 TBC redemption
- Example: $20 donation → 100 RP → 1 TBC conversion
- Minimum donation: $20

### Converting RP to Timebank Credits (TBC)

**Global rule:**
- **Once per month**, up to defined RP amount can be converted
- Example: 100 RP → 1 TBC (monthly cap)
- **One-way:** RP → TBC; TBC never converts back to RP

**Service pricing in TBC:**
- Members and groups set their own TBC prices
- Range: 1-3 TBC per hour for most services
- System keeps RP→TBC rate fixed; service pricing flexible by agreement

**Why monthly throttling:**
- Keeps TBC issuance tied to real service capacity
- Prevents pure point farming without contribution

### RP and Social Horizon (SH) Events

**Normal rule:**
- SH allocated in periodic issuance cycles (formulas based on contribution, timebank activity)

**Special RP-based events (occasional):**
- Platform opens controlled events where members use RP to purchase SH
- **Eligibility:** Only fiscally regular members (dues up-to-date)
- **Per-person cap:** e.g., no more than 5 SH or 2% of cycle issuance
- **Global cap:** e.g., no more than 10-20% of cycle issuance via RP
- **RP burned:** RP spent cannot also convert to TBC

**Separate money-based campaigns (rare):**
- Community decides to allocate small, capped SH portion to donors
- Only fiscally regular members eligible
- Strict per-person and global caps
- Explicitly time-bound and governed like proposals
- Transparently published anti-concentration safeguards

---

## Financial Flows: Membership Fees & Donations

### Membership Fees

**Payment:**
- Paid in fiat or digital currency (depending on local capacities)

**Purpose:**
- Infrastructure (servers, tools, security)
- Core team and contributor stipends
- Legal, research, communications, external services
- Bootstrap new cities and local groups

**Budget allocation (configurable via governance):**
- **Global infrastructure fund** (% of each fee)
- **Local city fund** (% attributed to member's home city)
- **Solidarity fund** (% for bootstrap grants and crisis support)

**Effects on ledgers:**
- Increase global and city budgets
- Grant member fixed RP each paid month
- **No SP** and **no direct SH** from fees

### Donations

**Payment:**
- One-off or campaign-based contributions (fiat or digital currency)

**Budget allocation:**
- Similar split to fees (global/local/solidarity)
- Potentially different ratios (governance-controlled)

**Donor recognition:**
- **Badge with tiers** (Bronze, Silver, Gold, Platinum) based on total donated
- **Member chooses:**
  - Whether to display badge at all
  - Whether to reveal tier or show generic "Donor" badge

**Ledger effects:**
- Donation grants RP (minimum: enough for 1 TBC redemption)
- **No SP** and **no automatic SH** directly from donations

**Optional SH incentives (rare, governed):**
- In time-limited donation campaigns, small fraction of new SH can be allocated to donors
- **Strict caps:** Fiscally regular members only, per-person and per-campaign caps
- **Public, proposal-driven, transparently reported**

---

## Global vs Local Budgets

### Global Budget

**Funds:**
- `infra_fund` - Servers, dev, security, core tools
- `legal_fund` - Lawyers, investigators, compliance
- `platform_team_fund` - Core contributors' stipends
- `solidarity_fund` - Bootstrap and crisis support for cities/projects

**Uses:**
- Keep platform running and secure
- Support early social economy development
- Provide grants to new or struggling cities

### Local City Budgets

**Funds:**
- `local_fund` - Recurring costs, meetups, room rentals, local outreach
- `event_fund` - Specific events and campaigns

**Global-to-local relationship:**
- **Coopeverything supports** each new city at start (bootstrap period)
- **Once city reaches thresholds** (members, dues, income stability):
  - Expected to cover own local expenses from local fees/donations
  - Becomes self-sustaining

### Allocation Decisions

**Governance-controlled:**
- Allocation percentages (how much of each fee/donation goes where)
- Thresholds (when a city is "self-sustaining")
- Decided through proposal and voting system:
  - **SP for agenda** (which allocation proposals to prioritize)
  - **One-person-one-vote for binding changes** (what percentages to adopt)

---

## Implementation Notes

### Database Schema Requirements

**Separate tables for each ledger:**
- `support_points_balances` (SP)
- `reward_points_balances` (RP)
- `timebank_accounts` (TBC)
- `social_horizon_wallets` (SH)

**Transaction logging:**
- `support_points_transactions`
- `reward_points_transactions`
- `timebank_transactions`
- `sh_transactions`

**Conversion tracking:**
- `rp_to_tbc_conversions` (monthly throttling enforcement)
- `rp_to_sh_purchases` (event-based, cap enforcement)

### Domain Layer Guardrails

**Enforce invariants at service layer:**
- **Never allow money or RP to mutate SP fields** (database constraints + business logic)
- **Validate monthly RP→TBC conversion caps** before processing
- **Validate SH purchase event caps** (per-person and global) before allowing purchase
- **Verify fiscal regularity** (dues up-to-date) before allowing SH event participation

### Configurable Parameters (Governance-Owned)

**Not hard-coded constants:**
- SP decay factors (inactivity decay rate)
- RP→TBC conversion rate
- Monthly TBC conversion cap
- SH purchase event caps (per-person, global)
- Budget allocation splits (global/city/solidarity percentages)
- Membership fee RP grant amount
- Donation tier thresholds

**How to update:**
- Submit proposal to change parameter
- SP agenda-setting determines priority
- One-person-one-vote binding decision
- Parameter update applied via migration/config change

---

## Examples

### Example 1: New Member Journey

**Alice joins TogetherOS:**

1. **Pays first monthly dues ($10)**
   - Budget allocation: $5 global, $3 local city, $2 solidarity
   - Ledger effect: +100 RP
   - Governance effect: 0 SP (must contribute first)

2. **Submits first PR (documentation)**
   - Contribution verified
   - Ledger effects: +8 SP, +50 RP
   - Alice now has: 8 SP available, 150 RP total

3. **Converts RP to TBC**
   - Uses 100 RP → 1 TBC (monthly limit)
   - Alice now has: 8 SP, 50 RP, 1 TBC

4. **Requests massage from Carol**
   - Carol's rate: 2 TBC per hour
   - Alice doesn't have enough TBC yet
   - Alice waits for next contribution or next month's conversion

5. **Merges another PR (code)**
   - Contribution verified
   - Ledger effects: +10 SP, +75 RP
   - Alice now has: 18 SP, 125 RP, 1 TBC

6. **Next month: Converts RP → TBC**
   - Uses 100 RP → 1 TBC
   - Alice now has: 18 SP, 25 RP, 2 TBC

7. **Requests massage from Carol**
   - Pays 2 TBC for 1-hour massage
   - Alice now has: 18 SP, 25 RP, 0 TBC
   - Carol now has: +2 TBC

### Example 2: Governance Participation

**Bob wants to prioritize a proposal:**

1. **Checks SP balance:** 50 SP available

2. **Allocates SP to Proposal #42**
   - Allocates 10 SP (max per proposal)
   - SP locked while proposal is open
   - Bob now has: 40 SP available, 10 SP allocated

3. **Proposal #42 reaches agenda threshold**
   - Minimum supporters: 15 members (✓ 18 supporters)
   - Minimum SP: 100 total (✓ 127 SP allocated)
   - Proposal advances to binding vote

4. **Binding vote opens**
   - Bob casts **one vote** (equal to every other member)
   - SP does not weight his vote

5. **Proposal #42 closes (approved)**
   - Bob's 10 SP **returned** to available budget
   - Bob now has: 50 SP available, 0 SP allocated

### Example 3: Social Horizon Issuance Cycle

**Q1 2025 Issuance:**

1. **Platform creates 1000 SH for distribution**
   - 80% (800 SH) for contribution-based allocation
   - 20% (200 SH) for RP purchase event

2. **Contribution-based allocation (800 SH):**
   - Formula considers:
     - Total SP earned in Q1
     - Timebank transactions completed
     - Moderation quality scores
   - Alice: 25 SP earned → 2 SH allocated
   - Bob: 50 SP earned → 4 SH allocated
   - Carol: 75 SP earned → 6 SH allocated
   - (... 797 other members receive proportional SH)

3. **RP purchase event (200 SH available):**
   - Event open for 7 days
   - Eligibility: Dues up-to-date (fiscally regular)
   - Per-person cap: 5 SH max
   - Global cap: 200 SH total
   - Rate: 100 RP per 1 SH

4. **David participates:**
   - Has 500 RP available
   - Fiscal status: Regular (dues paid)
   - Purchases 5 SH for 500 RP (hits personal cap)
   - RP burned (removed from circulation)
   - David cannot convert those 500 RP to TBC

5. **Event closes:**
   - 200 SH distributed to 40 members (5 SH each)
   - 60 members hit personal cap
   - Global cap reached

6. **Dividend distribution (later):**
   - Cooperative treasury has $10,000 surplus
   - Total SH in circulation: 10,000 SH
   - David's 5 SH → $5 dividend

---

## Related Documentation

- **Module Spec:** `docs/modules/social-economy.md`
- **Rewards Module:** `docs/modules/rewards.md`
- **Support Points UI:** `docs/modules/support-points-ui.md`
- **Governance Module:** `docs/modules/governance.md`
- **Cooperation Paths:** `docs/cooperation-paths.md`
- **Tech Debt:** `docs/dev/tech-debt.md`

---

## Changelog

- **2025-11-15:** Created comprehensive 4-ledger guide aligned with Rewards System Spec v2
