# 8 Cooperation Paths — Taxonomy

## Overview

TogetherOS organizes all activities around **8 Cooperation Paths** — the foundational categories for resilience and prosperity. Every issue, PR, proposal, and initiative must be labeled with one primary path.

**Source:** `docs/cooperation-paths.md`

---

## 1. Collaborative Education

**Mission:** Empower communities through shared learning and skill-building

### Subcategories
- **Local organizing** — Community coordination, facilitation skills
- **Project management** — Planning, execution, delivery tracking
- **Caring for the elderly** — Elder care, intergenerational learning
- **Repairing electronics** — Right-to-repair, fix-it skills
- **Sustainable design** — Regenerative systems, circular economy principles
- **Peaceful conflict resolution** — Mediation, restorative justice
- **Mentorship & peer learning** — Skill exchanges, cohort learning

### Examples
- Civic reasoning studios (claims → evidence → tradeoffs)
- Skill trees and badges anchored to real initiatives
- Co-teaching cohorts on governance, tech, sustainability
- Project-tethered learning (immediately useful)
- Global repository of best practices

### Tech Features (Planned)
- Cohort management
- Skill trees with progression
- Lesson runner (scenario-based micro-challenges)
- Badge system tied to verified contributions
- Peer review and feedback loops

---

## 2. Social Economy

**Mission:** Build cooperative enterprises and mutual support systems

### Subcategories
- **Cooperatives** — Worker/consumer co-ops, producer associations
- **Timebank exchange** — Hour-for-hour service trading
- **Repair & reuse** — Fix-it cafes, tool libraries
- **Upcycling** — Transform waste into value
- **Mutual aid** — Request/offer boards, emergency relief
- **Donations & meaningful investment** — Cooperative treasury, impact investing

### Examples
- Timebanking with fair-exchange index
- Collective purchasing (bulk buys, transparent bids)
- CSAs (Community Supported Agriculture)
- Repair/reuse networks
- Community investment pools
- Member-owned credit unions
- Circular economy practices
- Social Horizon currency (equitable wealth distribution)

### Tech Features (Planned)
- Mutual aid request/offer boards
- Timebank ledger with balance tracking
- Fair-exchange index (prevent exploitation)
- Collective purchase coordination
- Support Points allocation
- Social Horizon wallet (mock → testnet → real)

---

## 3. Common Wellbeing

**Mission:** Ensure health, nutrition, and care for all community members

### Subcategories
- **Preventative care** — Wellness programs, health education
- **Public health** — Disease prevention, vaccination drives
- **Nutrition** — Food security, healthy eating education
- **Mental health first aid** — Peer support, crisis intervention
- **Community clinics** — Local health services, integrative care
- **Movement & recovery** — Exercise groups, physical therapy

### Examples
- Peer support circles
- Mental-health crisis response
- Community clinics (sliding scale)
- Integrative care networks
- Food-security ladders (gardens, pantries, meal programs)
- Emergency relief protocols

### Tech Features (Planned)
- Peer support board templates
- Resource directory (clinics, counselors, food banks)
- Event coordination (wellness workshops, support groups)
- Privacy-preserving check-ins

---

## 4. Cooperative Technology

**Mission:** Build open, auditable, privacy-preserving digital infrastructure

### Subcategories
- **Open hardware** — Repairable, modular devices
- **Open source software** — Community-auditable code
- **Privacy & security** — Encryption, zero-knowledge proofs
- **Community networks** — Mesh networks, local ISPs
- **Federated services** — Decentralized platforms with local autonomy
- **Human-centered AI** — Assist-not-adjudicate AI like Bridge

### Examples
- TogetherOS platform itself
- Open-source modules for governance, mutual aid
- Privacy-preserving identity (pseudonymous by default)
- Federated protocols (inter-group coordination)
- Bridge AI assistant (grounded, cited, transparent)
- Modular tools communities can fork and deploy

### Tech Features
- Monorepo with Next.js 14, TypeScript, Tailwind
- tRPC for typed APIs
- NDJSON audit logs
- Federation gateway (planned)
- Zero-knowledge attestations (exploratory)

---

## 5. Collective Governance

**Mission:** Enable transparent, consent-based decision-making

### Subcategories
- **Direct legislation** — Community-written laws and policies
- **Deliberation & discourse** — Structured discussions, evidence-based
- **Empathic moderation** — De-escalation, fairness, rotating roles
- **Consensus tools** — Approval, ranked choice, consent voting
- **Participatory budgeting** — Community allocates funds
- **Conflict resolution** — Civic jury, minority reports, appeals

### Examples
- Proposal pipeline (Present → Research → Deliberate → Vote → Act → Review)
- Support Points for prioritization
- Minority report preservation
- Cooling-off periods, challenge windows
- Civic jury for disputes
- Rotating, recallable moderators
- Post-decision reviews

### Tech Features (Planned)
- Proposals & Decisions module (MVP: create/list/view)
- Voting methods (approval, ranked, consent)
- Evidence bundles, option trees, trade-off matrices
- Position recording (including minority)
- Delivery reports tied to proposals
- Audit logs and public dashboards

---

## 6. Community Connection

**Mission:** Foster relationships, events, and local coordination

### Subcategories
- **Local hubs** — Physical/virtual gathering spaces
- **Mutual aid boards** — Help requests and offers
- **Timebanking** — Service exchange tracking
- **Events & meetups** — Community gatherings, celebrations
- **Volunteer matching** — Connect helpers with needs
- **Skill exchanges** — Trade expertise and knowledge

### Examples
- Directory of local/thematic groups
- Event calendar with RSVP tracking
- Mutual aid classifieds
- Volunteer opportunity board
- Skill exchange coordination
- Mobility/couch-surfing network
- Social feed (community activity)

### Tech Features (Planned)
- Group directory with federation handles
- Event management (create, RSVP, reminders)
- Mutual aid boards (already covered in Social Economy)
- Social feed with Path filtering
- Geo-mapping of projects and needs
- Member profiles with skills/interests

---

## 7. Collaborative Media & Culture

**Mission:** Create positive narratives and preserve cooperative achievements

### Subcategories
- **Storytelling** — Member-made films, podcasts, articles
- **Open archives** — Living history of movements
- **Community radio** — Local broadcasting
- **Documentaries** — Visual storytelling of projects
- **Commons media** — Shared creative resources
- **Cultural restoration** — Revive traditions, languages, practices

### Examples
- Member-made films, music, writing
- Documentation of cooperative projects
- Positive narratives (counter to extractive media)
- Living archive of achievements
- Cultural celebrations and festivals
- Oral history projects

### Tech Features (Planned)
- Media posts and showcases
- Gallery component for visual content
- Video/audio embedding
- Tagging by Path and theme
- Creative Commons licensing support

---

## 8. Common Planet

**Mission:** Regenerate ecosystems and build climate resilience

### Subcategories
- **Regeneration** — Soil health, ecosystem restoration
- **Conservation** — Protect biodiversity, natural habitats
- **Local agriculture** — Urban farms, community gardens
- **Circular materials** — Zero waste, composting, recycling
- **Right-to-repair** — Fix products, reduce e-waste
- **Climate resilience** — Adaptation strategies, disaster prep

### Examples
- Regenerative agriculture projects
- Energy cooperatives
- Circular material flows
- Modular sustainable tech
- Resilience networks (climate adaptation)
- Seed banks and local food systems
- Conservation initiatives

### Tech Features (Planned)
- Project cards with impact metrics
- Resource tracking (carbon, waste, energy)
- Map of ecological projects
- Metric stubs for environmental impact
- Supply chain transparency

---

## Path Labels (GitHub/Issues/PRs)

### Required Format
```
path:collaborative-education
path:social-economy
path:common-wellbeing
path:cooperative-technology
path:collective-governance
path:community-connection
path:collaborative-media-culture
path:common-planet
```

### Usage Rules
1. **Every issue/PR must have exactly one Path label**
2. **Use kebab-case** (lowercase with hyphens)
3. **No shortcuts** — Use full canonical names from taxonomy
4. **Update taxonomy if new keywords needed** — Add to `docs/cooperation-paths.md` with rationale

---

## Keyword Palette

### From CATEGORY_TREE.json
```json
{
  "Collaborative": ["education", "art", "design", "innovation", "culture"],
  "Social": ["economy", "justice", "inclusion", "care"],
  "Common": ["wellbeing", "environment", "shared resources"],
  "Cooperative": ["technology", "organization", "governance"],
  "Collective": ["action", "legislation", "transformation"]
}
```

### How to Use
- **Issues:** Add Path label + specific keywords in description
- **PRs:** Path label required; keywords in commit messages
- **Proposals:** Tagged with primary Path + secondary themes
- **Codex notes:** Stored in `codex/notes/{path}/`

---

## Archetype Paths (Member Journeys)

These are **member archetypes**, not Cooperation Paths (but often aligned):

1. **Builder** — Aligned with Cooperative Technology
2. **Community Heart** — Aligned with Community Connection, Common Wellbeing
3. **Guided Contributor** — Follows structured tasks across all paths
4. **Steady Cultivator** — Long-term support across all paths

Members can blend archetypes and contribute to multiple Cooperation Paths.

---

## How Paths Drive Prioritization

### Support Points Allocation
- Members allocate SP to proposals tagged with Paths
- High-SP proposals in a Path → that Path gets prioritized
- Transparent portfolios show community values

### Contributor Interest
- **Discussions #88:** Contributors declare Path interest
- Module work mapped to Paths
- Interest raises priority for that Path's modules

### Balanced Growth
- Aim for progress across all 8 Paths (not just tech)
- Monthly reviews: Are any Paths neglected?
- Adjust outreach and recruitment accordingly

---

## Metrics per Path (Future)

### Collaborative Education
- Cohorts launched
- Skills taught/learned
- Badges earned
- Completion rates

### Social Economy
- Mutual aid transactions
- Timebank hours exchanged
- Collective purchase savings
- Support Points allocated

### Common Wellbeing
- Support groups active
- Members served
- Resources distributed
- Crisis interventions

### Cooperative Technology
- Modules shipped
- PRs merged
- Contributors onboarded
- Infrastructure uptime

### Collective Governance
- Proposals submitted/decided
- Voter participation %
- Delivery reports published
- Minority reports preserved

### Community Connection
- Events held
- Attendance rates
- New groups formed
- Member connections made

### Collaborative Media & Culture
- Media pieces created
- Reach/views
- Cultural events held
- Archives populated

### Common Planet
- Projects launched
- Carbon impact (reduced)
- Ecosystems restored
- Resilience plans active

---

## Related KB Files

- [Main KB](togetheros-kb.md) — Core principles, workflow
- [Social Economy](modules/social-economy.md) — Support Points, mutual aid, timebanking
- [Governance Module](modules/governance.md) — Proposals and decisions
- [Architecture](architecture.md) — How Paths map to code structure
