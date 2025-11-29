# Governance Module — Proposals & Decisions

**Purpose:** Complete governance pipeline from proposal creation through decision-making, implementation tracking, and iterative improvement.

**Status:** 100% — Production Ready

---

## Overview

The Governance module enables transparent, consent-based decision-making for communities:

1. **Create Proposals** — Turn ideas into formal proposals with evidence and trade-offs
2. **Gather Support** — Community members can allocate Support Points to prioritize proposals
3. **Deliberate Together** — Structured discussion with empathy rules and minority viewpoints preserved
4. **Make Decisions** — Consent-based voting (not majority-rule) with transparent outcomes
5. **Track Delivery** — Connect approved proposals to real-world initiatives and outcomes

### Key Features

- **Individual AND Group Proposals:** Create personal proposals or group-scoped proposals
- **Forum Integration:** Convert discussion threads into formal proposals
- **Support Points Integration:** Proposals earn reputation and accept SP allocations for prioritization
- **Consent-Based Decisions:** Minority reports are preserved, not silenced
- **Amendment Process:** Iterate and improve through community feedback

### Design Principles

- **Consent, not consensus:** Proposals pass when no one has fundamental objections, not when everyone agrees
- **Minority voices matter:** Dissenting views are codified and preserved
- **Transparent accountability:** Every decision is traceable to who proposed it and who voted
- **Iterative improvement:** Decisions can be amended as circumstances change

---

## Our Values in Action

### Transparency

Every governance action is visible and auditable:

- **Public proposals:** All proposals are visible to community members
- **Traceable decisions:** Every vote and decision is recorded with timestamps
- **Open deliberation:** Discussion threads are preserved as historical context
- **Audit trails:** From proposal to implementation, every step is documented

### Open Source

The governance system itself is open:

- **Inspect the code:** See exactly how votes are counted and decisions are made
- **Verify fairness:** Algorithms for ranking and prioritization are public
- **Contribute improvements:** Propose changes to the governance system itself

### Community Governance

**This module is subject to change by the community through proposal and voting.** Coop-everything means what it says:

- **Self-governing:** The community decides how governance works
- **No hidden rules:** All governance rules are documented and modifiable
- **Your voice matters:** From voting thresholds to decision timelines, members have the final say
- **Minority protection:** Dissenting views are codified, not dismissed

---

## How Governance Works

### The Proposal Journey

1. **Present** — Submit a proposal with supporting evidence
2. **Prioritize** — Community allocates Support Points to signal importance
3. **Research** — Stewards produce options and document trade-offs
4. **Deliberate** — Structured discussion with empathy guidelines
5. **Vote** — Consent-based decision (support, oppose, abstain, or block)
6. **Act** — Convert approved proposals into initiatives with owners
7. **Review** — Delivery reports with metrics and learnings
8. **Amend** — Revisit decisions through the feedback loop

### Minority Reports

When members oppose or block a proposal, their concerns are:

- **Documented formally:** Not just a comment, but a structured report
- **Displayed prominently:** Shown alongside the majority decision
- **Reviewed over time:** If predictions prove correct, proposals can be amended

### Amendment Process

Decisions are not permanent. The community can:

- **Identify issues:** During delivery phase or community feedback
- **Propose amendments:** Reference the original and explain changes
- **Lower thresholds:** Amendments often need less approval than new proposals
- **Preserve history:** All versions are kept for context

---

## How to Use

### Creating a Proposal

1. Navigate to `/governance` → "New Proposal"
2. Fill in title, summary, and supporting evidence
3. Choose scope: Individual (personal) or Group (community-wide)
4. Submit for community review

### Supporting Proposals

- **Allocate Support Points:** Signal which proposals matter most to you
- **Add evidence:** Contribute research, data, or expert opinions
- **Discuss trade-offs:** Help explore alternatives and consequences

### Voting on Proposals

- **Support:** You consent to this proposal moving forward
- **Oppose:** You have concerns but won't block progress
- **Abstain:** You choose not to participate in this decision
- **Block:** You have fundamental objections that must be addressed

---

## Technical Implementation

For developers interested in the database schemas, API endpoints, TypeScript interfaces, and implementation details:

[View on GitHub](https://github.com/coopeverything/TogetherOS/blob/yolo/docs/dev/modules/governance-technical.md)

---

## Related Modules

- [Forum](./forum.md) — Ideas start as discussions before becoming proposals
- [Support Points](./support-points-ui.md) — Allocate points to prioritize proposals
- [Groups](./groups.md) — Create group-scoped proposals
- [Search](./search.md) — Find proposals by topic or cooperation path

---

<!-- progress:governance=100 -->
