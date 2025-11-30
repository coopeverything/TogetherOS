# Bridge — AI Assistant

**Purpose:** Help people understand complex information quickly, structure deliberations, and improve discourse through AI-powered assistance.

**Status:** 40% — Landing Pilot Phase

---

## Overview

Bridge is TogetherOS's AI-powered cooperation amplifier that helps people:

1. **Understand Complex Information** — Get answers with citations from our documentation
2. **Structure Deliberations** — Summarize long threads into actionable formats
3. **Improve Discourse** — De-escalation suggestions when discussions heat up
4. **Find What Matters** — Navigate the platform and find relevant content

### The Problem We Solve

- Long documents and threads create friction — people react before understanding
- Circular debates waste energy — no clear next steps emerge
- Heated discussions escalate — people disengage

### How Bridge Helps

Bridge **assists, not adjudicates**:
- Converts docs and threads into concise, cited summaries
- Encourages calm language and trade-off thinking
- Suggests reframes when discussions heat up (never punitive)
- Keeps auditable logs for transparency

### Design Principles

- **Assist, not adjudicate:** Bridge suggests; humans decide
- **Cite & disclaim:** Every answer shows sources + "Bridge may be imperfect; verify important details"
- **Privacy first:** Only index public docs; no raw prompts stored
- **Auditability:** Append-only logs with timestamps and content hashes
- **Small, reversible steps:** Changes happen incrementally

---

## Our Values in Action

### Transparency

Everything Bridge does is visible and auditable:

- **All answers include sources:** See exactly where information comes from
- **Append-only logs:** Every interaction is recorded (anonymized)
- **Open algorithm:** How Bridge ranks and responds is documented
- **Disclaimer on all responses:** Users are reminded to verify important details

### Open Source

Bridge's implementation is fully open:

- **Inspect the code:** See exactly how Bridge processes questions
- **Knowledge base visible:** Our indexed documentation is public
- **Privacy-first design:** No raw prompts stored, IP addresses hashed

### Community Governance

**This module is subject to change by the community through proposal and voting.** Coop-everything means what it says:

- **Tone rules:** Community decides what de-escalation looks like
- **Ethics charter:** Bridge's behavior guidelines are community-governed
- **Appeals process:** Every Bridge suggestion can be challenged
- **Weekly oversight:** Bridge behavior is reviewed regularly

---

## What Bridge Can Do

### Q&A with Citations

Ask Bridge questions about TogetherOS and get grounded answers:

- "How do I create a proposal?"
- "What are Support Points?"
- "How does consent-based voting work?"

Every answer includes:
- Direct citations with file paths and line numbers
- A disclaimer: "Bridge may be imperfect; verify important details"

### Thread Tidy (Summaries)

Bridge can summarize long forum discussions into structured format:

- **Problem:** What issue is being discussed
- **Options:** Main proposals or perspectives
- **Trade-offs:** Acknowledged pros/cons
- **Open Questions:** What remains unclear
- **Next Steps:** Suggested actions

### Moderation Assist

When discussions get heated:

- Suggests de-escalation language (never punitive)
- Proposes label changes for better categorization
- Includes appeal link on every suggestion
- Humans make all final decisions

### Onboarding Nudge

For new members:

- "Ask Bridge" appears on first visit
- Suggests 2 small actions to get started
- Reduces time-to-first-contribution

---

## How to Use Bridge

### Ask a Question

1. Find the Bridge input on `/bridge` or in the header
2. Type your question naturally
3. Receive a streaming response with citations
4. Click citation links to verify sources

### Request a Thread Summary

1. Navigate to any forum topic
2. Click "Tidy with Bridge"
3. Receive structured summary
4. Use as starting point for deliberation

---

## Privacy & Safety

### What Gets Indexed

- Public repository documentation only
- Manifesto, operations guides, module specs
- Approved knowledge base exports

### What's NOT Stored

- Raw prompts (only hashes)
- Individual identifiable data
- Private messages or credentials

### Log Retention

- Anonymized logs kept for 90 days
- IP addresses are hashed, not stored raw
- Users can request data deletion

---

## Related Modules

- [Forum](./forum.md) — Thread tidy for discussions
- [Governance](./governance.md) — Proposal similarity detection
- [Search](./search.md) — Bridge helps with discovery
- [Onboarding](./onboarding.md) — New member guidance

---

## Technical Implementation

For developers interested in the API contracts, logging system, LLM integration, and implementation details:

[View on GitHub](https://github.com/coopeverything/TogetherOS/blob/yolo/docs/dev/modules/bridge-technical.md)

---

<!-- progress:bridge=40 -->
