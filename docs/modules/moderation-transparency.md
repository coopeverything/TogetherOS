# Moderation Transparency

**Purpose:** Make moderation visible and accountable through public logs, member ratings, rotating terms, and democratic recall—while maintaining empathy-first practices.

**Status:** 0% — Specification Complete

---

## Overview

The Moderation Transparency module ensures fair, accountable content moderation:

1. **Public Moderation Log** — Members can see all moderation actions
2. **Quality Ratings** — Rate moderators on fairness, empathy, speed, communication
3. **RP Incentives** — Moderators earn Reward Points based on quality scores
4. **Rotating Terms** — 1-month terms prevent burnout and power concentration
5. **Appeal System** — Contest decisions with second-moderator review
6. **Democratic Recall** — Remove underperforming moderators by vote

### Design Principles

- **Empathy-first:** De-escalation and education over punishment
- **Accountability through transparency:** All actions visible to members
- **Quality incentives:** Good moderation earns better rewards
- **Short rotations:** 1-month terms distribute power widely
- **Privacy protected:** Flagger identity always hidden

---

## Our Values in Action

### Transparency

Moderation is visible:

- **Public log:** All actions viewable by members
- **Quality scores:** See how moderators perform
- **Decision rationale:** Every action includes justification
- **Statistics dashboard:** Community-wide moderation trends

### Open Source

The moderation system is fully open:

- **Inspect the code:** See how ratings calculate RP
- **Review de-escalation templates:** Understand our empathy approach
- **Audit the algorithms:** Performance metrics are documented

### Community Governance

**This module is subject to change by the community through proposal and voting.** Coop-everything means what it says:

- **Term lengths:** Community decides moderator rotation
- **Rating criteria:** Members vote on what makes good moderation
- **Recall thresholds:** Set standards for removing moderators
- **Your voice matters:** From templates to bonuses, members decide

---

## Empathy-First Moderation

TogetherOS prioritizes de-escalation over punishment:

### AI-Assisted Responses
- Bridge suggests context-aware responses before moderators act
- Helps identify patterns without snap judgments

### De-escalation Templates
Pre-written empathetic messages for common situations:
- Minor violations: Friendly reminder with education
- Repeated issues: Clear warning with consequences
- Serious violations: Firm action with appeal path

### Graduated Responses
1. **Education** — Explain the guideline
2. **Warning** — Document the concern
3. **Content action** — Hide if necessary
4. **Account action** — Only for persistent harm

---

## Quality-Driven Rewards

Moderators earn RP based on member ratings:

### Rating Criteria (1-5 stars each)

| Criterion | Question |
|-----------|----------|
| **Fairness** | Was the decision justified? |
| **Empathy** | Was the moderator respectful? |
| **Speed** | Was the response timely? |
| **Communication** | Was the explanation clear? |

### RP Earning

| Average Score | Multiplier | RP per Action |
|--------------|------------|---------------|
| 5 stars (exceptional) | 2.0x | +20 RP |
| 4 stars (good) | 1.5x | +15 RP |
| 3 stars (adequate) | 1.0x | +10 RP |
| 2 stars (poor) | 0.5x | +5 RP |
| 1 star (harmful) | 0x | +0 RP |

### Term Bonuses
- Complete term with ≥4.0 average: **+100 RP**
- Complete with 3.0-3.9 average: **+50 RP**
- Early recall (voted out): **-50 RP**

---

## Rotating Moderator System

### Why 1-Month Terms?

- **Prevent burnout:** Moderation is emotionally taxing
- **Broader participation:** More members experience the role
- **Faster feedback:** Poor performers removed quickly
- **Reduce power concentration:** No permanent moderator class

### Re-election Rules

- Must wait 1 month after term ends before reapplying
- Can serve unlimited terms (with breaks)
- Performance history visible to voters

---

## Appeal System

Members can contest moderation decisions:

### How Appeals Work

1. User receives action (content hidden, warning, ban)
2. Click "Appeal Decision" within 7 days
3. Submit reason and evidence
4. Different moderator reviews (not original)
5. Outcome: Upheld or Overturned
6. If overturned: Action reversed, metrics updated

### What Gets Tracked

- Appeal rate per moderator
- Overturn rate (indicates decision quality)
- Response time for appeals

---

## Democratic Recall

When moderators underperform, the community can act:

### Automatic Warnings

System flags moderators when:
- Average quality score <2.5 stars (after 10+ actions)
- >5 appeals upheld (high reversal rate)
- Average response time >48 hours

### Recall Process

1. Petition signed by 20+ members
2. Recall proposal created with evidence
3. Community deliberates (7 days)
4. Vote conducted (simple majority)
5. If approved: Role revoked, 50 RP penalty

---

## Privacy Protections

### Members See
- Moderation log (pseudonymized moderators)
- Aggregate statistics
- Quality scores (after 5+ ratings)

### Moderators See
- Full content for review
- Flagger details (for context)
- Their own performance metrics

### Always Protected
- Flagger identity (hidden from everyone except moderators)
- Rater identity (anonymous from rated moderator)
- Moderator real names (unless they opt-in)

---

## Technical Implementation

For developers interested in the entity schemas, API endpoints, rating calculations, and implementation details:

[View on GitHub](https://github.com/coopeverything/TogetherOS/blob/yolo/docs/dev/modules/moderation-transparency-technical.md)

---

## Related Modules

- [Forum](./forum.md) — Content that gets moderated
- [Gamification](./gamification.md) — RP earning system
- [Execution & Accountability](./admin-accountability.md) — Parallel accountability for admins
- [Bridge](./bridge.md) — AI-assisted moderation suggestions

---

<!-- progress:moderation-transparency=0 -->
