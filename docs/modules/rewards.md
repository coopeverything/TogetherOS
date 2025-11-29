# Recognition & Reputation

**Purpose:** Make cooperation visible and rewarding by recording contributions and converting participation into recognition through Support Points, badges, and community standing.

**Status:** 100% — Production Ready

---

## Overview

The Recognition system ensures contributions don't go unnoticed:

1. **Event Tracking** — Every contribution generates a verifiable record
2. **Support Points (SP)** — Quantify contribution across all domains
3. **Reward Points (RP)** — Economic claims from contributions
4. **Badges** — Tell the story of what each person has done
5. **Portable Reputation** — Your record travels with you

### Why Recognition Exists

- Contributions go unrecognized → people disengage
- No visible path from participation to impact
- Trust and reputation built on word-of-mouth only
- Early contributors deserve credit for building the foundation

---

## Our Values in Action

### Transparency

Recognition is open and verifiable:

- **Every reward is recorded:** Contributions generate permanent events
- **Public calculations:** All SP/RP weights are documented
- **Versioned rules:** Changes tracked with rationale
- **Monthly audits:** Distribution reports published

### Open Source

The recognition system is fully open:

- **Inspect the code:** See exactly how points are calculated
- **YAML configuration:** Badge rules are human-readable
- **GitHub integration:** Code contributions automatically tracked

### Community Governance

**This module is subject to change by the community through proposal and voting.** Coop-everything means what it says:

- **Point weights:** Community decides contribution values
- **Badge criteria:** Members vote on achievement requirements
- **Anti-gaming rules:** Community sets safeguards against exploitation
- **Your voice matters:** From recognition thresholds to leaderboard rules, members decide

---

## Core Principles

1. **Recognition is nourishment** — Humans thrive when peers acknowledge contributions
2. **Transparency and fairness** — Every reward derives from recorded, verifiable action
3. **Scalable cooperation** — Same logic applies across all participation domains
4. **Proof of cooperation** — Actions, not titles, define contribution

---

## Domains of Contribution

All types of work generate recognition:

| Domain | Examples |
|--------|----------|
| **Technology** | Code, docs, automation, systems design |
| **Governance** | Facilitating, drafting proposals, mediation |
| **Education** | Teaching, translating, mentoring |
| **Social Economy** | Launching co-ops, mutual aid |
| **Community Care** | Emotional support, accessibility work |
| **Culture & Media** | Art, music, writing that uplifts cooperation |
| **Environment** | Regenerative projects, ecological restoration |
| **Design** | Usability, accessibility, aesthetics |

---

## How It Works

### Support Points (SP)

Earned through governance activities only:

- **Proposal created:** +10 SP
- **Moderation quality (high):** +15 SP
- **Deliberation facilitated:** +12 SP
- **Consensus achieved:** +20 SP
- **Minority report authored:** +12 SP

### Reward Points (RP)

Earned through contributions and engagement:

- **PR merged (medium):** +50 RP
- **Profile completion:** +50 RP
- **Quality forum post:** +20 RP
- **Monthly dues paid:** +100 RP
- **Moderation action:** +10 RP

### Badges

Represent milestones in contribution or mastery:

- 🔧 **First PR** — Merged your first contribution
- 🏗️ **Foundation Builder** — 10+ PRs in pre-MVP phase
- 📚 **Documentation Champion** — 5+ doc improvements
- 🐛 **Bug Hunter** — Fixed 5+ critical bugs
- 🎨 **UI Craftsperson** — 3+ UI/UX improvements
- 🚀 **Module Launcher** — Shipped a complete module

---

## Anti-Gaming Safeguards

### Cooldowns

- Same event type: 1 hour minimum between similar actions
- PR spam: Max 5 PRs per day counted
- Review spam: Max 10 reviews per day

### Diversity Checks

- Bonus for contributing across multiple domains
- Penalty for only single-type contributions

### Multi-Review Validation

- Large SP awards (>50) require admin approval
- Suspicious patterns flagged for review
- Appeal process for rejected events

---

## Privacy & Consent

### Opt-In Leaderboards

- Public display requires your consent
- Anonymized aggregates protect privacy
- Export your complete history anytime
- Remove from public view anytime

### Fair Play

- Quality over quantity emphasized
- Collaboration bonuses reward helping others
- Care work valued equally
- Anti-whale protections prevent gaming

---

## Technical Implementation

For developers interested in the database schemas, API endpoints, GitHub integration, and implementation details:

[View on GitHub](https://github.com/coopeverything/TogetherOS/blob/yolo/docs/dev/modules/rewards-technical.md)

---

## Related Modules

- [Support Points](./support-points-ui.md) — SP/RP wallet interfaces
- [Gamification](./gamification.md) — Milestone tracking and celebrations
- [Governance](./governance.md) — SP allocation to proposals
- [Social Economy](./social-economy.md) — Full economic model

---

<!-- progress:rewards=100 -->
