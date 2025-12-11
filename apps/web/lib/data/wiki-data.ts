/**
 * Wiki Knowledge Base - Single source of truth for wiki articles and glossary terms.
 *
 * Used by:
 * - /wiki (public wiki listing)
 * - /wiki/[slug] (article detail)
 * - /glossary (term listing)
 * - /glossary/[term] (term detail)
 * - Term component (hover popups)
 *
 * Content is migrated from our core documentation and discussions.
 * Wiki articles are community-owned and subject to deliberation.
 */

import type { WikiArticle, GlossaryTerm } from '@togetheros/types'

export const GITHUB_BASE = 'https://github.com/coopeverything/TogetherOS/blob/yolo'

/**
 * Wiki Articles - Community-owned knowledge
 */
export const wikiArticles: WikiArticle[] = [
  {
    id: 'wiki-coordinator',
    slug: 'coordinator',
    title: 'Coordinator',
    summary:
      'In TogetherOS, a coordinator is a role that implements collective decisions. Unlike traditional leaders, coordinators execute the will of the community.',
    content: `# Coordinator

In TogetherOS, a **coordinator** is a role that implements collective decisions. Unlike traditional "leaders," coordinators don't hold power — they execute the will of the community.

## Key Principles

- **Executors, not rulers:** Coordinators implement decisions made through governance processes
- **Recallable:** Can be removed by group decision at any time
- **Elected or hired:** Both pathways are valid depending on the role
- **Transparent:** All actions logged with accountability

## Why This Term?

The word "leader" carries ideological weight. It often implies:

- Surrendering personal governing responsibility
- Expecting someone else to solve problems
- Hero worship and dependency

We use "coordinator" to emphasize that this role is about **coordination and execution**, not about holding power over others.

## How Coordinators Work

1. **The collective makes decisions** through proposals and voting
2. **Coordinators execute** those decisions as project managers
3. **Accountability is transparent** — all actions are logged
4. **Recall is always possible** — underperforming coordinators can be removed

## Corruption-Proof by Design

Because coordinators hold no independent power, corrupting them gains nothing. A corrupted coordinator can be recalled. A removed coordinator is simply replaced. The collective's decisions remain unchanged.

This means external entities trying to corrupt or remove coordinators come away empty-handed. The power stays with the people.

## Related Concepts

- Consent-Based Decision Making
- Recall Mechanism
- Functional Coordination vs Power Hierarchy`,
    status: 'stable',
    tags: ['governance', 'roles', 'accountability', 'leadership'],
    cooperationPaths: ['Collective Governance'],
    relatedArticles: [
      'consent-based-decisions',
      'recall-mechanism',
      'power-hierarchy',
    ],
    terms: ['coordinator', 'consent-based', 'recall'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 3,
  },
  {
    id: 'wiki-consent-based-decisions',
    slug: 'consent-based-decisions',
    title: 'Consent-Based Decision Making',
    summary:
      'Decisions pass when no one has fundamental objections, not when everyone agrees. This protects minority voices while enabling action.',
    content: `# Consent-Based Decision Making

In TogetherOS, **consent-based decision making** means decisions pass when no one has fundamental objections, not when everyone agrees.

## Consent vs Consensus

| Aspect | Consensus | Consent |
|--------|-----------|---------|
| Goal | Everyone agrees | No one fundamentally objects |
| Speed | Slow | Faster |
| Minority voice | Can be lost in compromise | Preserved as minority reports |
| Result | Watered-down decisions | Clear decisions with documented concerns |

## How It Works

1. **Proposal submitted** with evidence and trade-offs
2. **Discussion period** where members ask questions
3. **Voting** with four options:
   - **Support** — You consent to moving forward
   - **Oppose** — You have concerns but won't block
   - **Abstain** — You choose not to participate
   - **Block** — You have fundamental objections that must be addressed
4. **If blocked** — Objections must be addressed through amendment

## Minority Reports

When members oppose or block a proposal, their concerns are:

- **Documented formally** — Not just a comment, but a structured report
- **Displayed prominently** — Shown alongside the majority decision
- **Reviewed over time** — If predictions prove correct, proposals can be amended

## Why Consent Over Consensus?

Consensus sounds democratic but often leads to:

- Endless deliberation without action
- Lowest-common-denominator decisions
- Minority voices drowned out in compromise

Consent allows communities to move forward while preserving dissenting views for future reference.`,
    status: 'stable',
    tags: ['governance', 'decisions', 'voting', 'consent'],
    cooperationPaths: ['Collective Governance'],
    relatedArticles: ['coordinator', 'minority-reports', 'governance-process'],
    terms: ['consent-based', 'minority-report', 'block'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 4,
  },
  {
    id: 'wiki-mental-flexibility',
    slug: 'mental-flexibility',
    title: 'Mental Flexibility',
    summary:
      'The ability to hold multiple perspectives and question automatic responses. Essential for unlearning division and learning coordination.',
    content: `# Mental Flexibility

**Mental flexibility** is the ability to hold multiple perspectives, question automatic responses, and consider alternatives to ingrained patterns of thinking.

## Why It Matters

Many words and concepts are **ideologically charged**. When people hear certain terms, they have automatic reactions:

- "Leader" → "Someone I should follow" OR "Hierarchy is bad"
- "Economy" → "Capitalism" OR "Markets are evil"
- "Governance" → "Boring bureaucracy" OR "Necessary structure"

Both polarized responses are **single-minded**. Mental flexibility allows us to:

1. Recognize our automatic patterns
2. Consider alternative framings
3. Choose responses based on context, not conditioning

## TogetherOS Approach

We don't dictate definitions. We invite exploration:

- **Acknowledge** that language is contested
- **Invite** exploration instead of asserting definitions
- **Challenge gently** — with curiosity, not confrontation
- **Use humor** — reduces defensiveness, opens minds
- **Link to discussion** — the definition is never final

## Practical Application

Throughout TogetherOS, you'll find terms with dotted underlines. Hovering reveals:

- A brief definition
- An invitation to learn more
- A link to discuss the concept

This turns every term into an opportunity for reflection, not a dictated meaning.

## The Goal

TogetherOS helps people "unlearn division and learn coordination." Mental flexibility is essential to this process. We meet people where they are and invite them to expand their perspective — never forcing, always inviting.`,
    status: 'stable',
    tags: ['learning', 'psychology', 'communication', 'language'],
    cooperationPaths: ['Collaborative Education'],
    relatedArticles: ['ideological-language', 'coordinator'],
    terms: ['mental-flexibility'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 3,
  },
  {
    id: 'wiki-support-points',
    slug: 'support-points',
    title: 'Support Points (SP)',
    summary:
      'Governance power earned through contributions, not money. SP can NEVER be bought — ensuring that wealth cannot purchase political influence.',
    content: `# Support Points (SP)

**Support Points** are the governance currency of TogetherOS. They represent your voice in collective decisions.

## Core Principle

> Money can NEVER become Support Points.

This is a fundamental safeguard against plutocracy. In TogetherOS:

- **SP can only be earned** through contributions
- **SP cannot be bought, sold, or traded**
- **SP represents governance power** — your say in decisions

## How You Earn SP

- Completing onboarding challenges
- Contributing to proposals
- Participating in discussions
- Helping other members
- Attending events
- Completing microlessons

## How SP Works

Each member starts with **100 SP** after onboarding. You can allocate up to **10 SP per proposal** to signal priority.

- **Higher SP allocation** → Higher visibility for the proposal
- **Your SP regenerates** over time (you don't lose it permanently)
- **SP allocation history** is transparent

## SP vs Reward Points (RP)

| Aspect | Support Points (SP) | Reward Points (RP) |
|--------|--------------------|--------------------|
| Purpose | Governance power | Economic claims |
| Earned by | Contributions | Contributions |
| Buyable | NEVER | Never |
| Transferable | No | Future: Maybe |
| Convertible | Cannot become RP | Cannot become SP |

## Why This Matters

Traditional platforms allow money to buy influence. TogetherOS creates a firewall:

- Rich members can't buy more votes
- Governance power reflects contribution, not wealth
- Everyone's voice matters equally

This is how we ensure **coop-everything** — real cooperation where power flows from participation, not capital.`,
    status: 'stable',
    tags: ['economy', 'governance', 'anti-plutocracy', 'SP'],
    cooperationPaths: ['Social Economy', 'Collective Governance'],
    relatedArticles: ['reward-points', 'four-ledger-system'],
    terms: ['support-points', 'reward-points', 'anti-plutocracy'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 4,
  },
  {
    id: 'wiki-power-hierarchy',
    slug: 'power-hierarchy',
    title: 'Functional Coordination vs Power Hierarchy',
    summary:
      'TogetherOS has functional coordination (someone manages tasks) but not power hierarchy (someone rules over others).',
    content: `# Functional Coordination vs Power Hierarchy

TogetherOS makes a crucial distinction between two types of organization:

## Power Hierarchy (Traditional)

In traditional organizations, power flows DOWN:

\`\`\`
Leader (decides)
   ↓
Managers (implement leader's vision)
   ↓
Workers (follow orders)
\`\`\`

- Decisions made at the top
- Power concentrated in few hands
- Followers surrender governing responsibility
- Leaders can be corrupted, captured, or co-opted

## Functional Coordination (TogetherOS)

In TogetherOS, mandates flow UP:

\`\`\`
Collective (decides through proposals)
   ↑
Coordinators (execute collective will)
   ↑
All Members (propose, vote, participate)
\`\`\`

- Decisions made collectively
- Power distributed among all members
- Coordinators are tools for execution
- Corruption of coordinators gains nothing

## Why This Matters

"Hierarchy" often means positions of power. In TogetherOS:

- The power is with the people
- The "average person position" holds the power
- Coordinators have function (coordination) but not power (decision-making)

## Exceptional People

We value exceptional people. They receive admiration and recognition for their contributions. But:

- Being great at something ≠ ruling over everything
- Expertise informs decisions, doesn't replace collective choice
- No one person becomes indispensable

## The Result

- **Corruption-proof:** Corrupting a coordinator gains nothing
- **Resilient:** Removing a coordinator changes nothing (another takes their place)
- **Democratic:** Real power stays with the collective`,
    status: 'stable',
    tags: ['governance', 'power', 'hierarchy', 'organization'],
    cooperationPaths: ['Collective Governance'],
    relatedArticles: ['coordinator', 'recall-mechanism'],
    terms: ['coordinator', 'functional-coordination', 'power-hierarchy'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 4,
  },
  {
    id: 'wiki-recall-mechanism',
    slug: 'recall-mechanism',
    title: 'Recall Mechanism',
    summary:
      'Any coordinator can be recalled (removed) by the community at any time. This ensures accountability and prevents entrenchment.',
    content: `# Recall Mechanism

In TogetherOS, any coordinator can be **recalled** (removed from their role) by the community at any time.

## Why Recall Matters

Traditional organizations make it hard to remove leaders:

- Long terms with no exit
- Complex procedures that favor incumbents
- Social pressure against "rocking the boat"

TogetherOS flips this: recall is a **normal, expected mechanism**, not a crisis.

## How Recall Works

### Automatic Warnings

The system flags coordinators when:

- 3+ initiatives past deadline
- Average completion time >2x group average
- 2+ delivery reports rejected
- Negative feedback from 5+ members

### Recall Process

1. **Any member can initiate** recall with evidence
2. **Community deliberates** (7-day discussion period)
3. **Vote conducted** (simple majority)
4. **If approved:** Role revoked, tasks reassigned
5. **Cooldown:** Cannot reapply for same role for 6 months

## Not Punishment, but Accountability

Recall isn't about punishment. It's about:

- Ensuring roles are filled by people who can fulfill them
- Preventing entrenchment
- Maintaining community trust
- Allowing graceful transitions

A recalled coordinator can continue contributing in other ways. They just step back from that particular coordination role.

## Corruption-Proof

Because recall is easy:

- Corrupted coordinators are quickly removed
- Threats against coordinators are meaningless (another takes their place)
- External entities can't "capture" leadership

This is why TogetherOS is **corruption-proof by design**.`,
    status: 'stable',
    tags: ['governance', 'accountability', 'recall', 'roles'],
    cooperationPaths: ['Collective Governance'],
    relatedArticles: ['coordinator', 'power-hierarchy', 'admin-accountability'],
    terms: ['recall', 'coordinator', 'accountability'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 3,
  },
  {
    id: 'wiki-cooperation-paths',
    slug: 'cooperation-paths',
    title: '8 Cooperation Paths',
    summary:
      'The foundational categories organizing all TogetherOS activities: Education, Economy, Wellbeing, Technology, Governance, Connection, Media, and Planet.',
    content: `# 8 Cooperation Paths

TogetherOS organizes all activities around **8 Cooperation Paths** — the foundational categories for resilience and prosperity.

## The Paths

### 1. Collaborative Education
Learning, co-teaching, peer mentorship, skill documentation. Project-tethered learning that's immediately useful.

### 2. Social Economy
Cooperatives, timebanking, mutual aid, repair/reuse networks. Keeping value local and building alternatives to extraction.

### 3. Common Wellbeing
Health, nutrition, mental health, community clinics, care networks. Meeting human needs collectively.

### 4. Cooperative Technology
Open-source software, privacy tools, federated services, human-centered AI. Building infrastructure we can trust.

### 5. Collective Governance
Direct legislation, deliberation, empathic moderation, consensus tools. Deciding together how we live together.

### 6. Community Connection
Local hubs, events, volunteer matching, skill exchanges. Building relationships that sustain cooperation.

### 7. Collaborative Media & Culture
Storytelling, documentaries, cultural restoration, commons media. Telling our own stories.

### 8. Common Planet
Regeneration, local agriculture, circular materials, climate resilience. Caring for our shared home.

## How Paths Are Used

- **Every proposal** is tagged with a primary path
- **Every forum topic** is categorized by path
- **Every module** maps to one or more paths
- **Members choose** paths that interest them

## Balanced Growth

We track progress across all 8 paths to ensure balanced development. A thriving community needs all paths healthy — not just the ones that are easiest or most popular.

## Your Path

You can focus on paths that match your interests and skills, or explore paths that challenge you. There's no hierarchy among paths — each is essential.`,
    status: 'stable',
    tags: ['organization', 'taxonomy', 'paths', 'categories'],
    cooperationPaths: [
      'Collaborative Education',
      'Social Economy',
      'Common Wellbeing',
      'Cooperative Technology',
      'Collective Governance',
      'Community Connection',
      'Collaborative Media & Culture',
      'Common Planet',
    ],
    relatedArticles: ['support-points', 'governance-process'],
    terms: ['cooperation-paths'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 4,
  },
  {
    id: 'wiki-the-problem',
    slug: 'the-problem',
    title: 'The Problem We Face',
    summary:
      'Power concentrated in a few hands routes wealth upward and pain downward. This produces struggle, poverty, exploitation, ecological breakdown, and social disconnection.',
    content: `# The Problem We Face

TogetherOS exists because humanity faces a structural problem that no individual effort can solve.

## The Core Issue

**Power concentrated in a few hands routes wealth and political power upward and pain downward.**

This isn't about bad people — it's about bad systems. When power concentrates, it produces predictable outcomes:

- **Economic extraction** — Surplus flows to owners, not workers
- **Political capture** — Decisions favor those who fund campaigns
- **Ecological destruction** — Short-term profit beats long-term survival
- **Social isolation** — Competition replaces cooperation

## The Lived Experience

What does this mean in daily life?

- **Struggle and poverty** — Working harder doesn't guarantee security
- **Exploitation** — Labor is commodified, people become "resources"
- **Anxiety and isolation** — We're told to compete, not connect
- **Disconnection** — From each other, from nature, from meaning

## Why Individual Solutions Fail

You can't solve structural problems with individual choices:

- Recycling won't stop industrial pollution
- Buying local won't reverse global supply chains
- Personal resilience won't compensate for broken systems
- Individual enlightenment won't change who holds power

## The Pattern Across Systems

This same pattern repeats everywhere:

| Domain | Power Concentration | Result |
|--------|-------------------|--------|
| Economy | Wealth → few owners | Extraction, poverty |
| Politics | Influence → wealthy donors | Policy capture |
| Media | Narrative → few platforms | Information control |
| Technology | Data → tech giants | Surveillance, manipulation |

## Not Pessimism — Analysis

Seeing this clearly isn't pessimism. It's the necessary first step toward change. You can't fix what you can't name.

The question isn't "is this true?" — most people feel it in their lives. The question is: "what do we do about it?"

That's where TogetherOS begins.`,
    status: 'stable',
    tags: ['vision', 'problem', 'analysis', 'systems'],
    cooperationPaths: ['Collective Governance'],
    relatedArticles: ['the-solution', 'cooperation-paths'],
    terms: ['power-hierarchy'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 4,
  },
  {
    id: 'wiki-the-solution',
    slug: 'the-solution',
    title: 'The Solution: Unlearn Division, Learn Coordination',
    summary:
      'TogetherOS helps communities self-organize through shared decisions, cooperative economics, and tiny verifiable steps. The key insight: the default assumptions holding us back can be changed.',
    content: `# The Solution: Unlearn Division, Learn Coordination

## The Opening

Here's the good news: **the defaults holding us back are not fixed.**

Individualism, zero-sum thinking, waiting for leaders — these aren't human nature. They're learned behaviors. And what's learned can be unlearned.

## What TogetherOS Does

TogetherOS helps people **unlearn division and learn coordination** through:

### 1. Shared Decisions, Shared Power

Instead of voting for representatives who decide for us:

- **Direct participation** — Members propose and vote on actual decisions
- **Transparent processes** — Everyone can see how decisions are made
- **Rotating roles** — No permanent positions of power
- **Recallable coordinators** — Anyone executing decisions can be removed

### 2. Cooperative Economics

Instead of wealth extracting upward:

- **Support Points** — Governance power earned through contribution, never bought
- **Reward Points** — Economic claims that recognize value created
- **Timebanking** — Exchange labor directly, outside money systems
- **Cooperative Treasury** — Surplus stays in the community

### 3. Tiny, Verifiable Steps

Instead of grand plans that never materialize:

- **Minimal shippable increments** — Small changes that actually ship
- **Public proofs** — Every step documented and verifiable
- **Continuous delivery** — Progress you can see and feel
- **Rapid iteration** — Learn and adjust quickly

## The Default Reset

TogetherOS aims to reset default assumptions:

| Old Default | New Default |
|-------------|-------------|
| Wait for leaders | Participate directly |
| Compete for scarcity | Coordinate for abundance |
| Delegate responsibility | Share responsibility |
| Consume passively | Create actively |
| Trust authority | Verify everything |

## Why "OS"?

TogetherOS is an Operating System — a foundation layer that other applications run on top of.

Just as your computer's OS provides:
- File management (data)
- Process scheduling (coordination)
- User permissions (governance)
- Networking (connection)

TogetherOS provides:
- Knowledge management (wiki, articles, glossary)
- Decision coordination (proposals, voting, consent)
- Role management (coordinators, recall, accountability)
- Community connection (groups, forums, events)

## Not a Utopia

TogetherOS doesn't promise utopia. It provides tools for communities to experiment with different ways of organizing. Some experiments will fail. That's the point — fail fast, learn, adjust.

The goal isn't perfection. It's **practice** — practicing coordination until it becomes natural.`,
    status: 'stable',
    tags: ['vision', 'solution', 'cooperation', 'systems'],
    cooperationPaths: ['Collective Governance', 'Social Economy'],
    relatedArticles: ['the-problem', 'cooperation-paths', 'support-points'],
    terms: ['coordinator', 'support-points'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 5,
  },
  {
    id: 'wiki-behavior-change',
    slug: 'behavior-change',
    title: 'Behavior Change: From Habits to Culture',
    summary:
      'TogetherOS uses gamification, micro-lessons, and public rituals to shift behavior from individual competition to collective coordination. Change happens through practice, not preaching.',
    content: `# Behavior Change: From Habits to Culture

## The Challenge

Knowing cooperation is good isn't enough. We've been conditioned for competition. Changing behavior requires more than information — it requires **practice**.

## How TogetherOS Changes Behavior

### 1. Gamification (Without Manipulation)

- **Support Points** reward contribution, not consumption
- **Badges** recognize skills developed, not status achieved
- **Progress tracking** makes growth visible
- **Leaderboards** (optional) celebrate contribution, not extraction

**Key difference from exploitative gamification:** You can always see how the system works. No dark patterns. No manipulation for engagement metrics.

### 2. Micro-Lessons at Point of Need

Instead of courses you take once and forget:

- **Just-in-time learning** — Lessons appear when relevant
- **Bite-sized content** — 2-5 minutes, not hours
- **Immediate application** — Learn, then do
- **Spaced repetition** — Concepts reinforced over time

### 3. Public Rituals

Shared practices that build culture:

- **Weekly standups** — What are we working on? What's blocked?
- **Monthly retrospectives** — What worked? What didn't?
- **Quarterly planning** — Where are we going together?
- **Annual celebrations** — Recognizing contribution and growth

### 4. Social Proof

When you see others cooperating, it normalizes cooperation:

- **Activity feeds** — See what others are doing
- **Testimonials** — Hear how cooperation helped
- **Case studies** — Learn from successful experiments
- **Mentorship** — Direct connection with experienced practitioners

## The Habit Loop

TogetherOS is designed around the habit loop:

1. **Cue** — Notification, ritual, or context trigger
2. **Routine** — The cooperative action (propose, vote, contribute)
3. **Reward** — SP, recognition, visible progress, sense of belonging

Over time, cooperative behaviors become automatic.

## Cultural Transmission

Individual habit change isn't enough. TogetherOS aims for **cultural change**:

- New members learn from existing culture
- Norms are explicit and discussable
- Stories of cooperation spread
- Cooperation becomes "how we do things here"

## Patience Required

This takes time. Default assumptions don't change overnight. But with consistent practice, new defaults emerge.

We're not trying to convince people cooperation is good. We're building systems where cooperation is **easy, natural, and rewarded**.`,
    status: 'evolving',
    tags: ['behavior', 'gamification', 'culture', 'habits', 'learning'],
    cooperationPaths: ['Collaborative Education', 'Community Connection'],
    relatedArticles: ['support-points', 'mental-flexibility'],
    terms: ['support-points', 'mental-flexibility'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 5,
  },
  {
    id: 'wiki-governance-process',
    slug: 'governance-process',
    title: 'The Governance Process',
    summary:
      'How proposals move from idea to implementation: submission, deliberation, voting, and execution. Every step transparent, every decision traceable.',
    content: `# The Governance Process

## Overview

TogetherOS governance follows a clear process:

**Proposal → Deliberation → Voting → Execution → Review**

Every step is transparent. Every decision is traceable.

## Step 1: Proposal Submission

Anyone can propose. A proposal includes:

- **Title** — Clear, descriptive name
- **Summary** — What you're proposing in 2-3 sentences
- **Rationale** — Why this matters
- **Evidence** — Data, examples, reasoning
- **Trade-offs** — What we gain, what we lose
- **Implementation plan** — How it would be executed

**Quality matters.** Poorly written proposals waste everyone's time. The system encourages thoughtful preparation.

## Step 2: Deliberation

Before voting, the community discusses:

- **Clarifying questions** — What exactly do you mean?
- **Concerns** — What could go wrong?
- **Amendments** — Can we improve this?
- **Alternative approaches** — Is there a better way?

**Discussion periods vary** by proposal impact:
- Minor changes: 3 days
- Standard proposals: 7 days
- Major changes: 14-30 days

## Step 3: Voting

Four voting options:

| Vote | Meaning |
|------|---------|
| **Support** | I consent to this moving forward |
| **Oppose** | I have concerns but won't block |
| **Abstain** | I choose not to participate in this decision |
| **Block** | I have fundamental objections that must be addressed |

**Consent threshold:** Proposals pass when no one blocks and support exceeds opposition.

## Step 4: Execution

Passed proposals need execution:

- **Coordinator assigned** — Someone takes responsibility
- **Timeline set** — When will it be done?
- **Resources allocated** — What's needed?
- **Progress tracked** — Visible milestones

## Step 5: Review

After execution, review:

- **Delivery report** — What was actually done?
- **Impact assessment** — Did it achieve the goal?
- **Lessons learned** — What would we do differently?
- **Minority report accuracy** — Were concerns validated?

## Minority Reports

When proposals pass despite opposition:

- **Concerns documented** — Not just dismissed
- **Predictions recorded** — What opponents expect to happen
- **Reviewed later** — If predictions prove correct, proposal can be amended

This protects minority voices and creates accountability for decisions.

## SP Allocation

Members allocate Support Points to signal priority:

- Each member can allocate up to 10 SP per proposal
- Higher SP = higher visibility
- SP regenerates over time
- SP cannot be bought

This creates a market for attention without creating a plutocracy.

## Emergency Decisions

Some decisions can't wait for normal process:

- **Emergency proposals** — Shorter deliberation period
- **Higher thresholds** — Requires more support to pass quickly
- **Automatic review** — Emergency decisions reviewed after crisis passes

## Amending Proposals

If a proposal is blocked:

1. Proposer can withdraw
2. Proposer can amend to address concerns
3. Amended proposal goes through shortened deliberation
4. If concerns addressed, blocking members may change vote

The goal is finding solutions that work for everyone, not forcing decisions through.`,
    status: 'stable',
    tags: ['governance', 'process', 'proposals', 'voting', 'deliberation'],
    cooperationPaths: ['Collective Governance'],
    relatedArticles: ['consent-based-decisions', 'coordinator', 'support-points'],
    terms: ['consent-based', 'minority-report', 'support-points', 'coordinator'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 6,
  },
  {
    id: 'wiki-four-ledger-system',
    slug: 'four-ledger-system',
    title: 'The Four Ledger System',
    summary:
      'TogetherOS tracks four separate types of value: Support Points (governance), Reward Points (economic claims), Timebank Hours (labor exchange), and Cooperative Treasury (collective resources).',
    content: `# The Four Ledger System

## Why Four Ledgers?

Traditional systems conflate different types of value. Money buys goods, services, influence, and power. TogetherOS separates these concerns:

## Ledger 1: Support Points (SP)

**Purpose:** Governance power

- Earned through contributions
- **Cannot be bought, sold, or traded**
- Used to vote on proposals and signal priority
- Regenerates over time

**Why separate?** Governance power should reflect contribution, not wealth. Rich people shouldn't get more votes.

## Ledger 2: Reward Points (RP)

**Purpose:** Economic claims

- Earned through contributions
- Potentially tradeable (future feature)
- Redeemable for goods/services in cooperative economy
- Represents value created

**Why separate from SP?** You might want to trade economic value but shouldn't be able to trade political power.

## Ledger 3: Timebank Hours

**Purpose:** Direct labor exchange

- 1 hour = 1 hour, regardless of task
- No money involved
- Tracked between individuals or in a pool
- Alternative to wage labor

**Example:** I help you fix your bike (1 hour). You owe me 1 hour of help with whatever I need.

**Why include this?** Not everything needs to be monetized. Direct exchange builds relationships.

## Ledger 4: Cooperative Treasury

**Purpose:** Collective resources

- Fiat currency held in common
- Funded by: grants, donations, cooperative enterprises
- Used for: shared expenses, hired coordinators, infrastructure
- Governed by proposals

**Why include this?** Communities need collective resources. This provides transparent management.

## How They Interact

| Transaction | Ledger Used |
|-------------|-------------|
| Vote on proposal | SP |
| Signal proposal priority | SP |
| Earn recognition for work | SP + RP |
| Exchange labor directly | Timebank |
| Buy supplies for group | Treasury |
| Hire a coordinator | Treasury |

## The Firewall

**Critical rule:** Money (Treasury) can NEVER become SP.

You can donate to the treasury. You can earn RP for contributions. But you cannot buy governance power.

This firewall prevents plutocracy.

## Transparency

All four ledgers are transparent:

- Balances visible (privacy-respecting)
- Transactions traceable
- Rules explicit
- Changes require proposals

## Future Development

The four-ledger system may evolve:

- **Social Horizon Currency** — Local currency for the cooperative economy
- **Inter-community exchange** — Trading between communities
- **Universal Basic Income** — Automatic distribution from treasury

These are possibilities, not promises. Development depends on community deliberation.`,
    status: 'evolving',
    tags: ['economy', 'ledgers', 'SP', 'RP', 'timebank', 'treasury'],
    cooperationPaths: ['Social Economy'],
    relatedArticles: ['support-points', 'mutual-aid'],
    terms: ['support-points', 'reward-points', 'anti-plutocracy'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 5,
  },
  {
    id: 'wiki-mutual-aid',
    slug: 'mutual-aid',
    title: 'Mutual Aid Networks',
    summary:
      'Mutual aid is reciprocal support — not charity (top-down) but solidarity (side-by-side). TogetherOS provides tools for organizing and tracking mutual aid.',
    content: `# Mutual Aid Networks

## What Is Mutual Aid?

**Mutual aid** is reciprocal support between community members. It differs from:

| Model | Direction | Relationship |
|-------|-----------|--------------|
| Charity | Top-down | Donor → recipient |
| Welfare | Top-down | State → citizen |
| Mutual Aid | Horizontal | Neighbor ↔ neighbor |

In mutual aid, everyone is both giver and receiver. Today I help you, tomorrow you help me, next week we both help someone else.

## Why Mutual Aid Matters

When people help each other directly:

- **Relationships form** — You know your neighbors
- **Skills transfer** — Teaching happens naturally
- **Resilience builds** — Community can handle crises
- **Systems are bypassed** — Don't need corporations or government

## TogetherOS Mutual Aid Tools

### Request Board

- Post what you need: "Need help moving furniture Saturday"
- Post what you offer: "Can teach basic coding, 1 hour/week"
- Matching happens in the community

### Skills Directory

- Members list skills they can offer
- Searchable by category
- Includes availability and preferences

### Timebanking

- Track hours given and received
- 1 hour = 1 hour (no skill hierarchy)
- Build community credit

### Group Coordination

- Create mutual aid groups by topic or geography
- Coordinate regular support (childcare circles, tool libraries)
- Plan for emergencies

## Examples

**Skill Shares:**
- Bike repair workshop
- Language exchange
- Coding help sessions
- Gardening advice

**Material Sharing:**
- Tool library
- Seed swap
- Clothing exchange
- Food rescue distribution

**Care Networks:**
- Childcare circles
- Elder check-ins
- Pet sitting rotation
- Meal trains for sick members

## The Economic Logic

Traditional economics assumes scarcity and competition. Mutual aid assumes abundance and cooperation:

- **Your skills don't deplete** when you share them
- **Your relationships strengthen** when you help
- **Community capacity grows** as everyone contributes
- **Money becomes less necessary** as direct exchange increases

## Getting Started

1. **Identify your skills** — What can you offer?
2. **Identify your needs** — What could you use help with?
3. **Start small** — One exchange builds to many
4. **Pay it forward** — Help someone new when you can

## Not Charity

Important distinction: mutual aid isn't about "helping the less fortunate." It's about building networks where everyone has something to give and receive.

The person who receives help today may offer help tomorrow. Everyone has value. Everyone belongs.`,
    status: 'stable',
    tags: ['economy', 'mutual-aid', 'community', 'solidarity'],
    cooperationPaths: ['Social Economy', 'Community Connection'],
    relatedArticles: ['four-ledger-system', 'cooperation-paths'],
    terms: ['social-economy', 'mutual-aid'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 5,
  },
  {
    id: 'wiki-threat-model',
    slug: 'threat-model',
    title: 'Threat Model: What Could Go Wrong',
    summary:
      'TogetherOS is designed to resist specific threats: plutocracy, populist capture, coordinator corruption, sybil attacks, and burnout. Understanding threats helps us build defenses.',
    content: `# Threat Model: What Could Go Wrong

## Why Think About Threats?

Every system has vulnerabilities. Pretending otherwise leads to failure. TogetherOS explicitly names threats so we can build defenses.

## Threat 1: Plutocracy (Money Buys Power)

**Attack:** Wealthy members try to buy influence over decisions.

**Defense:** Support Points cannot be purchased. Ever. The firewall between money and governance power is absolute.

**Remaining risk:** Wealthy members could donate time to earn SP. This is acceptable — time investment shows genuine commitment.

## Threat 2: Populist Capture

**Attack:** Charismatic individual manipulates community into following them.

**Defense:**
- No permanent leadership positions
- All roles recallable
- Minority reports preserve dissent
- Mental flexibility as cultural value

**Remaining risk:** Charisma is hard to defend against. Culture of questioning helps.

## Threat 3: Coordinator Corruption

**Attack:** External entity bribes or threatens coordinators.

**Defense:**
- Coordinators have no independent power
- Can be recalled at any time
- Corrupting a coordinator gains nothing
- Another coordinator takes their place

**Remaining risk:** Minimal. The design makes corruption unprofitable.

## Threat 4: Sybil Attack (Fake Accounts)

**Attack:** Someone creates many fake accounts to gain voting power.

**Defense:**
- Onboarding process requires real engagement
- SP earned through contribution (can't fake contribution at scale)
- Verification options for high-stakes decisions
- Community moderation catches suspicious activity

**Remaining risk:** Small-scale sybil attacks possible but not profitable.

## Threat 5: Burnout

**Attack:** Active members exhaust themselves, system collapses.

**Defense:**
- Task distribution algorithms prevent overload
- Recognition systems acknowledge contribution
- Role rotation prevents entrenchment
- Culture of sustainable pace

**Remaining risk:** Burnout is always possible. Systems help but can't fully prevent.

## Threat 6: External Pressure

**Attack:** Powerful external entities (governments, corporations) pressure the community.

**Defense:**
- No single point of failure (distributed leadership)
- Transparent decision-making hard to secretly influence
- Legal structure designed for resilience
- Multiple instances can exist independently

**Remaining risk:** Determined attackers with resources are hard to stop. But distributed systems are harder to kill.

## Threat 7: Apathy

**Attack:** Members stop participating. Decisions made by tiny minority.

**Defense:**
- Gamification rewards participation
- Regular communication about impact
- Low-barrier participation options
- Notification of important decisions

**Remaining risk:** Apathy is always possible. Can't force engagement.

## Living Document

This threat model will evolve. As we learn about new vulnerabilities, we'll add defenses. Security is a process, not a destination.`,
    status: 'evolving',
    tags: ['security', 'threats', 'safeguards', 'governance'],
    cooperationPaths: ['Collective Governance', 'Cooperative Technology'],
    relatedArticles: ['coordinator', 'recall-mechanism', 'support-points'],
    terms: ['anti-plutocracy', 'coordinator', 'recall'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 5,
  },
  {
    id: 'wiki-privacy-data',
    slug: 'privacy-and-data',
    title: 'Privacy and Data Protection',
    summary:
      'TogetherOS practices privacy by design: minimal data collection, user control over personal information, transparency about what we store, and the right to be forgotten.',
    content: `# Privacy and Data Protection

## Guiding Principle

**Privacy by design:** We collect the minimum necessary, protect what we collect, and give users control.

## What We Collect

### Necessary Data

| Data | Why | Retention |
|------|-----|-----------|
| Email | Account recovery, notifications | Until account deletion |
| Username | Identity in community | Until account deletion |
| Password hash | Authentication | Until account deletion |
| Contribution history | SP/RP calculation | Aggregated after 2 years |
| Vote history | Governance transparency | Permanent (public) |

### Optional Data

- Profile information (bio, location, skills) — You choose what to share
- Activity preferences — For personalization
- Communication preferences — For notifications

### What We Don't Collect

- Browsing history outside TogetherOS
- Location tracking
- Payment information (handled by third parties)
- Personal messages content (end-to-end encrypted where possible)

## Transparency Features

### Public by Design

Some things are intentionally public:

- How you voted on proposals (accountability)
- Your SP balance (governance legitimacy)
- Your contributions (recognition)

### Aggregate vs Individual

Many statistics are shared only in aggregate:

- Total participation (not who participated)
- Voting patterns (not individual votes on private matters)
- Demographics (not individual attributes)

## User Controls

You can always:

- **Export your data** — Get a copy of everything we have
- **Delete your account** — Remove personal data (votes remain for integrity)
- **Modify your profile** — Change what you share
- **Opt out of optional collection** — Reduce data footprint

## Data Security

- **Encryption at rest** — Data encrypted when stored
- **Encryption in transit** — HTTPS everywhere
- **Access controls** — Role-based access to sensitive data
- **Audit logs** — Track who accessed what

## The Right to Be Forgotten

If you delete your account:

- Personal data is removed
- Contributions are anonymized (attributed to "deleted user")
- Vote history remains for governance integrity
- You can request additional removal if legally required

## Governance of Privacy

Privacy policies are subject to community governance. Changes require proposals and consent-based decision making.

## No Selling of Data

We do not sell, rent, or trade personal data. Ever. This is non-negotiable.

## Questions?

Contact the community about privacy concerns. Transparency includes explaining how we protect your information.`,
    status: 'stable',
    tags: ['privacy', 'data', 'security', 'rights'],
    cooperationPaths: ['Cooperative Technology'],
    relatedArticles: ['threat-model', 'governance-process'],
    terms: ['privacy'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 5,
  },
  {
    id: 'wiki-minority-reports',
    slug: 'minority-reports',
    title: 'Minority Reports',
    summary:
      'When decisions pass despite objections, dissenting views are formally preserved alongside the majority decision. This ensures minority voices are heard, documented, and can inform future amendments.',
    content: `# Minority Reports

## What Is a Minority Report?

A **minority report** is a formal documentation of dissenting views when a proposal passes despite objections. Instead of dismissing opposition, TogetherOS preserves it — creating accountability and enabling course correction.

## Why Minority Reports Matter

In traditional voting systems, once a decision passes, opposition is forgotten:

- Losers are expected to "get with the program"
- Concerns are dismissed as sour grapes
- History is written by winners
- When predictions come true, no one remembers who warned them

TogetherOS does it differently. Minority reports:

- **Preserve dissent** — Your concerns are formally recorded
- **Create accountability** — If your predictions come true, the record shows it
- **Enable learning** — Communities can learn from validated minority concerns
- **Protect minorities** — Your voice matters even when outvoted

## How Minority Reports Work

### When You Oppose or Block

When you vote "Oppose" or "Block" on a proposal, you're invited to document your concerns:

1. **State your objection** — What specifically concerns you?
2. **Make predictions** — What do you expect will happen if this passes?
3. **Suggest alternatives** — Is there a better approach?
4. **Document evidence** — What informs your view?

### After the Vote

If the proposal passes despite your objection:

- Your minority report is **attached to the decision record**
- It's **displayed publicly** alongside the majority decision
- It's **tagged for review** at future evaluation points

### Validation Over Time

When initiatives are evaluated:

1. System checks if minority concerns were validated
2. If predictions proved correct → Quoted in improvement proposals
3. Validation rate tracked over time
4. Communities learn to take dissent more seriously

## Examples

### Example 1: Budget Allocation

**Proposal:** Allocate 50% of budget to marketing
**Minority Report:** "This overinvests in growth before we have product-market fit. I predict low conversion rates and wasted resources."
**6 months later:** Conversion rates are indeed low. Minority report is validated. Amendment proposed to rebalance budget.

### Example 2: Platform Feature

**Proposal:** Add gamification badges
**Minority Report:** "This could incentivize shallow engagement over meaningful contribution."
**3 months later:** Metrics show engagement up but quality contributions down. Minority concern validated. Feature refined.

## Cultural Impact

Over time, minority reports change how communities make decisions:

- **Majority becomes more careful** — Knowing dissent is preserved
- **Minorities feel heard** — Even when losing, their voice matters
- **Predictions create accountability** — Can't pretend no one warned you
- **Collective intelligence improves** — Learning from validated concerns

## Not a Veto

Important: minority reports don't prevent decisions. They preserve dissent for future reference. The community can still move forward while respecting that some members disagree.

This balance allows:
- Action (don't get stuck in endless deliberation)
- Accountability (preserve the record for learning)
- Minority protection (dissent isn't silenced)

## Related Concepts

- Consent-Based Decision Making — The voting system that generates minority reports
- Block — A vote indicating fundamental objections
- Governance Process — How proposals move through the system`,
    status: 'stable',
    tags: ['governance', 'decisions', 'dissent', 'accountability'],
    cooperationPaths: ['Collective Governance'],
    relatedArticles: ['consent-based-decisions', 'governance-process', 'recall-mechanism'],
    terms: ['minority-report', 'consent-based', 'block'],
    contributorCount: 1,
    lastEditedAt: '2025-12-09T00:00:00Z',
    createdAt: '2025-12-09T00:00:00Z',
    readTimeMinutes: 4,
  },
  {
    id: 'wiki-elected-hired',
    slug: 'elected-vs-hired',
    title: 'Elected vs Hired Roles',
    summary:
      'Coordinator roles can be filled through election OR hiring. Both pathways are valid depending on the nature of the role.',
    content: `# Elected vs Hired Roles

Coordinator roles in TogetherOS can be filled through two pathways:

## Elected Roles

**Best for:** Roles with high community visibility and trust requirements

**Examples:**
- Proposal stewards
- Rotating moderators
- Community representatives
- Governance coordinators

**Process:**
1. Nominations open to all members
2. Candidates present their qualifications
3. Community votes (consent-based)
4. Winner serves a defined term
5. Subject to recall at any time

## Hired Roles

**Best for:** Technical or operational roles requiring specific skills

**Examples:**
- System administrators
- Project coordinators
- Technical leads
- Operational managers

**Process:**
1. Role requirements defined by community
2. Admin committee reviews candidates
3. Hiring decision made transparently
4. Contract terms are public
5. Subject to recall at any time

## Key Similarities

Both types of coordinators:

- **Execute collective will** — they don't make policy
- **Are accountable** — all actions logged
- **Are recallable** — can be removed by community
- **Are transparent** — role, term, and performance are public

## When to Use Which

The community decides for each role. General guidelines:

| Role Type | Pathway | Reasoning |
|-----------|---------|-----------|
| High-trust, community-facing | Elected | Trust must be earned through vote |
| Technical, skill-specific | Hired | Technical skills can be evaluated |
| Emergency/temporary | Hired | Speed matters |
| Long-term, visible | Elected | Ongoing legitimacy needed |

## Social Economy Integration

Hired roles are part of our social economy. Compensation comes from the cooperative treasury, with terms decided collectively. This creates meaningful work within the cooperative system.`,
    status: 'evolving',
    tags: ['governance', 'roles', 'hiring', 'elections'],
    cooperationPaths: ['Collective Governance', 'Social Economy'],
    relatedArticles: ['coordinator', 'recall-mechanism', 'support-points'],
    terms: ['coordinator', 'recall', 'social-economy'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 4,
  },
  {
    id: 'wiki-coopeverything',
    slug: 'coopeverything',
    title: 'CoopEverything',
    summary:
      'CoopEverything is a global initiative to make cooperation the default way humans organize — in communities, workplaces, and societies.',
    content: `# CoopEverything

**CoopEverything** is a global initiative to make cooperation the default way humans organize — in communities, workplaces, and societies.

## The Name

"Coop Everything" — cooperate in everything. Not just buying clubs or housing co-ops, but *everything*: decisions, work, care, learning, economy, media, and our relationship with the planet.

## What CoopEverything Does

CoopEverything:
- **Connects** people who want to cooperate
- **Educates** through challenges, micro-lessons, and real projects
- **Organizes** communities to solve problems together
- **Builds** the tools and systems that make cooperation easy

## The Platform

The website **coopeverything.org** is where members:
- Learn cooperative skills
- Join or create local groups
- Propose and deliberate on ideas
- Track contributions and build reputation
- Access mutual aid and shared resources

## Powered by TogetherOS

CoopEverything runs on **[TogetherOS](/wiki/togetheros)** — the operating system for cooperation. TogetherOS provides the governance, economy, and coordination tools that make CoopEverything work.

Think of it this way:
- **CoopEverything** = the movement, the people, the mission
- **TogetherOS** = the system, the rules, the technology

## Join Us

CoopEverything welcomes anyone ready to unlearn division and learn coordination. Start by exploring what matters to you, complete your first challenge, and connect with others.`,
    status: 'stable',
    tags: ['foundation', 'organization', 'mission', 'platform'],
    cooperationPaths: [
      'Collaborative Education',
      'Social Economy',
      'Common Wellbeing',
      'Cooperative Technology',
      'Collective Governance',
      'Community Connection',
      'Collaborative Media & Culture',
      'Common Planet',
    ],
    relatedArticles: ['togetheros', 'cooperation-paths', 'the-solution'],
    terms: ['coopeverything', 'togetheros'],
    contributorCount: 1,
    lastEditedAt: '2025-12-11T00:00:00Z',
    createdAt: '2025-12-11T00:00:00Z',
    readTimeMinutes: 2,
  },
  {
    id: 'wiki-togetheros',
    slug: 'togetheros',
    title: 'TogetherOS',
    summary:
      'TogetherOS is a cooperation operating system — a complete social and technological stack for communities to govern themselves, share resources, and deliver results.',
    content: `# TogetherOS

**TogetherOS** is a cooperation operating system — a complete social and technological stack for communities to govern themselves, share resources, and deliver results.

## Why "Operating System"?

Just as your phone's OS (iOS, Android) provides the foundation for apps to run, TogetherOS provides the foundation for cooperation to happen:

- **Governance layer** — How decisions get made
- **Economy layer** — How value flows and gets shared
- **Coordination layer** — How work gets organized and tracked
- **Learning layer** — How people develop cooperative skills

## Core Mechanics

### Solving Differences
When people disagree, TogetherOS provides structured paths to resolution — not by forcing agreement, but by documenting positions, finding common ground, and preserving minority views.

### Deliberating
Before decisions, members explore options together. TogetherOS templates guide discussions through research → options → trade-offs → deliberation, keeping conversations productive.

### Deciding
Decisions use **consent-based** processes: proposals pass when no one has fundamental objections, not when everyone agrees. This protects minority voices while enabling action.

### Organizing
Every initiative breaks into tiny, verifiable steps. Coordinators (elected or hired) execute the collective will. All actions are logged. Anyone can be recalled.

## Key Features

- **Support Points (SP)** — Governance power earned through contribution, never bought
- **Reward Points (RP)** — Economic claims for contributions
- **Minority Reports** — Dissenting views preserved alongside decisions
- **Recall Mechanism** — Any coordinator can be removed by the community
- **8 Cooperation Paths** — Categories organizing all activities

## For Humanity

TogetherOS isn't owned by [CoopEverything](/wiki/coopeverything) — it's designed to be adopted, forked, and improved by any community. The code is open. The patterns are documented. The goal: make cooperation inevitable, everywhere.`,
    status: 'stable',
    tags: ['foundation', 'technology', 'governance', 'system'],
    cooperationPaths: ['Cooperative Technology', 'Collective Governance'],
    relatedArticles: [
      'coopeverything',
      'consent-based-decisions',
      'coordinator',
      'support-points',
      'cooperation-paths',
    ],
    terms: ['togetheros', 'coopeverything', 'consent-based', 'coordinator', 'support-points'],
    contributorCount: 1,
    lastEditedAt: '2025-12-11T00:00:00Z',
    createdAt: '2025-12-11T00:00:00Z',
    readTimeMinutes: 3,
  },
]

/**
 * Glossary Terms - Brief definitions with links to deeper content
 */
export const glossaryTerms: GlossaryTerm[] = [
  {
    id: 'term-coopeverything',
    word: 'CoopEverything',
    slug: 'coopeverything',
    shortDefinition:
      'A global initiative to make cooperation the default — the movement, the people, the mission.',
    wikiArticleSlug: 'coopeverything',
    relatedTerms: ['togetheros'],
    cooperationPath: 'Cooperative Technology',
  },
  {
    id: 'term-togetheros',
    word: 'TogetherOS',
    slug: 'togetheros',
    shortDefinition:
      'The cooperation operating system — governance, economy, coordination, and learning tools that power CoopEverything.',
    wikiArticleSlug: 'togetheros',
    relatedTerms: ['coopeverything', 'consent-based', 'coordinator'],
    cooperationPath: 'Cooperative Technology',
  },
  {
    id: 'term-coordinator',
    word: 'Coordinator',
    slug: 'coordinator',
    shortDefinition:
      'Implements collective decisions. Doesn\'t hold power — executes the will of the community.',
    wikiArticleSlug: 'coordinator',
    relatedTerms: ['recall', 'functional-coordination'],
    cooperationPath: 'Collective Governance',
  },
  {
    id: 'term-consent-based',
    word: 'Consent-Based',
    slug: 'consent-based',
    shortDefinition:
      'Decisions pass when no one has fundamental objections, not when everyone agrees.',
    wikiArticleSlug: 'consent-based-decisions',
    relatedTerms: ['block', 'minority-report'],
    cooperationPath: 'Collective Governance',
  },
  {
    id: 'term-support-points',
    word: 'Support Points (SP)',
    slug: 'support-points',
    shortDefinition:
      'Governance power earned through contributions. Can NEVER be bought with money.',
    wikiArticleSlug: 'support-points',
    relatedTerms: ['reward-points', 'anti-plutocracy'],
    cooperationPath: 'Social Economy',
  },
  {
    id: 'term-reward-points',
    word: 'Reward Points (RP)',
    slug: 'reward-points',
    shortDefinition:
      'Economic claims earned through contributions. Separate from governance power (SP).',
    wikiArticleSlug: 'support-points',
    relatedTerms: ['support-points'],
    cooperationPath: 'Social Economy',
  },
  {
    id: 'term-recall',
    word: 'Recall',
    slug: 'recall',
    shortDefinition:
      'The ability for the community to remove any coordinator at any time through voting.',
    wikiArticleSlug: 'recall-mechanism',
    relatedTerms: ['coordinator', 'accountability'],
    cooperationPath: 'Collective Governance',
  },
  {
    id: 'term-minority-report',
    word: 'Minority Report',
    slug: 'minority-report',
    shortDefinition:
      'Formal documentation of dissenting views, preserved alongside majority decisions.',
    wikiArticleSlug: 'minority-reports',
    relatedTerms: ['consent-based', 'block'],
    cooperationPath: 'Collective Governance',
  },
  {
    id: 'term-block',
    word: 'Block',
    slug: 'block',
    shortDefinition:
      'A vote indicating fundamental objections that must be addressed before proceeding.',
    wikiArticleSlug: 'consent-based-decisions',
    relatedTerms: ['consent-based', 'minority-report'],
    cooperationPath: 'Collective Governance',
  },
  {
    id: 'term-cooperation-paths',
    word: 'Cooperation Paths',
    slug: 'cooperation-paths',
    shortDefinition:
      'The 8 foundational categories organizing all TogetherOS activities.',
    wikiArticleSlug: 'cooperation-paths',
    cooperationPath: 'Collective Governance',
  },
  {
    id: 'term-mental-flexibility',
    word: 'Mental Flexibility',
    slug: 'mental-flexibility',
    shortDefinition:
      'The ability to hold multiple perspectives and question automatic responses.',
    wikiArticleSlug: 'mental-flexibility',
    cooperationPath: 'Collaborative Education',
  },
  {
    id: 'term-functional-coordination',
    word: 'Functional Coordination',
    slug: 'functional-coordination',
    shortDefinition:
      'Organization where someone coordinates tasks, but doesn\'t hold power over others.',
    wikiArticleSlug: 'power-hierarchy',
    relatedTerms: ['power-hierarchy', 'coordinator'],
    cooperationPath: 'Collective Governance',
  },
  {
    id: 'term-power-hierarchy',
    word: 'Power Hierarchy',
    slug: 'power-hierarchy',
    shortDefinition:
      'Traditional organization where decisions flow from top to bottom. TogetherOS rejects this.',
    wikiArticleSlug: 'power-hierarchy',
    relatedTerms: ['functional-coordination', 'coordinator'],
    cooperationPath: 'Collective Governance',
  },
  {
    id: 'term-anti-plutocracy',
    word: 'Anti-Plutocracy',
    slug: 'anti-plutocracy',
    shortDefinition:
      'Design principle ensuring money can never buy governance power. SP can only be earned.',
    wikiArticleSlug: 'support-points',
    relatedTerms: ['support-points'],
    cooperationPath: 'Social Economy',
  },
  {
    id: 'term-manifesto',
    word: 'Manifesto',
    slug: 'manifesto',
    shortDefinition:
      'The foundational document explaining WHY TogetherOS exists — our values and vision.',
    wikiArticleSlug: 'the-solution',
    relatedTerms: ['whitepaper'],
    cooperationPath: 'Cooperative Technology',
  },
  {
    id: 'term-whitepaper',
    word: 'White Paper',
    slug: 'whitepaper',
    shortDefinition:
      'The technical document explaining HOW TogetherOS works — architecture and mechanics.',
    wikiArticleSlug: 'governance-process',
    relatedTerms: ['manifesto'],
    cooperationPath: 'Cooperative Technology',
  },
  {
    id: 'term-social-economy',
    word: 'Social Economy',
    slug: 'social-economy',
    shortDefinition:
      'Economic practices that keep value local: cooperatives, timebanking, mutual aid, repair networks.',
    wikiArticleSlug: 'cooperation-paths',
    relatedTerms: ['support-points', 'reward-points'],
    cooperationPath: 'Social Economy',
  },
  {
    id: 'term-mutual-aid',
    word: 'Mutual Aid',
    slug: 'mutual-aid',
    shortDefinition:
      'Reciprocal support between community members — not charity (top-down) but solidarity (side-by-side).',
    wikiArticleSlug: 'mutual-aid',
    relatedTerms: ['social-economy', 'timebank'],
    cooperationPath: 'Social Economy',
  },
  {
    id: 'term-timebank',
    word: 'Timebank',
    slug: 'timebank',
    shortDefinition:
      'Direct labor exchange where 1 hour = 1 hour, regardless of task. No money involved.',
    wikiArticleSlug: 'four-ledger-system',
    relatedTerms: ['mutual-aid', 'social-economy'],
    cooperationPath: 'Social Economy',
  },
  {
    id: 'term-treasury',
    word: 'Cooperative Treasury',
    slug: 'treasury',
    shortDefinition:
      'Collective resources held in common, funded by grants and donations, governed by proposals.',
    wikiArticleSlug: 'four-ledger-system',
    relatedTerms: ['support-points', 'reward-points'],
    cooperationPath: 'Social Economy',
  },
  {
    id: 'term-privacy',
    word: 'Privacy by Design',
    slug: 'privacy',
    shortDefinition:
      'Collect minimum necessary, protect what we collect, give users control. Never sell data.',
    wikiArticleSlug: 'privacy-and-data',
    cooperationPath: 'Cooperative Technology',
  },
  {
    id: 'term-behavior-change',
    word: 'Behavior Change',
    slug: 'behavior-change',
    shortDefinition:
      'Shifting from competition to cooperation through practice: gamification, micro-lessons, public rituals.',
    wikiArticleSlug: 'behavior-change',
    relatedTerms: ['mental-flexibility'],
    cooperationPath: 'Collaborative Education',
  },
  {
    id: 'term-threat-model',
    word: 'Threat Model',
    slug: 'threat-model',
    shortDefinition:
      'Explicit analysis of what could go wrong: plutocracy, populist capture, corruption, sybil attacks.',
    wikiArticleSlug: 'threat-model',
    relatedTerms: ['anti-plutocracy', 'coordinator'],
    cooperationPath: 'Cooperative Technology',
  },
]

// Helper functions
export const getWikiArticleBySlug = (slug: string): WikiArticle | undefined =>
  wikiArticles.find((a) => a.slug === slug)

export const getGlossaryTermBySlug = (slug: string): GlossaryTerm | undefined =>
  glossaryTerms.find((t) => t.slug === slug)

export const getWikiArticlesByTag = (tag: string): WikiArticle[] =>
  wikiArticles.filter((a) => a.tags.includes(tag))

export const getWikiArticlesByPath = (path: string): WikiArticle[] =>
  wikiArticles.filter((a) => a.cooperationPaths?.includes(path))

export const getRelatedArticles = (article: WikiArticle): WikiArticle[] =>
  (article.relatedArticles || [])
    .map((slug) => getWikiArticleBySlug(slug))
    .filter((a): a is WikiArticle => a !== undefined)

export const getRelatedTerms = (term: GlossaryTerm): GlossaryTerm[] =>
  (term.relatedTerms || [])
    .map((slug) => getGlossaryTermBySlug(slug))
    .filter((t): t is GlossaryTerm => t !== undefined)

export const getAllTags = (): string[] =>
  [...new Set(wikiArticles.flatMap((a) => a.tags))].sort()

export const getAllCooperationPaths = (): string[] =>
  [...new Set(wikiArticles.flatMap((a) => a.cooperationPaths || []))].sort()
