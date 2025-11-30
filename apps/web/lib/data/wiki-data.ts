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
    id: 'wiki-manifesto-whitepaper',
    slug: 'manifesto-vs-whitepaper',
    title: 'Vision and Architecture: Manifesto & White Paper',
    summary:
      'The Manifesto explains WHY (values, vision). The White Paper explains HOW (architecture, mechanics). Different entry points for different people.',
    content: `# Vision and Architecture: Manifesto & White Paper

TogetherOS has two foundational documents:

## The Manifesto

**What it is:** The WHY — values, vision, problems we're solving, what we believe

**Audience:** Everyone — activists, skeptics, the curious, potential members

**Tone:** Inspiring, emotional, urgent

**Question it answers:** "Why should I care?"

**Read it when:** You want to understand the purpose and passion behind TogetherOS

## The White Paper

**What it is:** The HOW — architecture, mechanics, protocols, safeguards

**Audience:** Builders, researchers, skeptics who want proof

**Tone:** Technical, precise, credible

**Question it answers:** "How does this actually work?"

**Read it when:** You want to understand implementation details

## Why Both?

Different people need different entry points:

- **Emotional buy-in first:** Some people need to feel the vision before caring about implementation. They read Manifesto → then White Paper.

- **Intellectual proof first:** Some people need to see concrete plans before trusting the vision. They read White Paper → then Manifesto.

Neither is "better." Both are necessary.

## Where to Find Them

- **Manifesto:** /manifesto (user-friendly) or docs/Manifesto.md (GitHub)
- **White Paper:** docs/TogetherOS_WhitePaper.md (GitHub)

## Living Documents

Both documents are subject to community deliberation. They represent our current best understanding, not final truths. As we learn and grow, they evolve.`,
    status: 'stable',
    tags: ['documentation', 'vision', 'architecture', 'onboarding'],
    cooperationPaths: ['Cooperative Technology'],
    relatedArticles: ['cooperation-paths', 'governance-process'],
    terms: ['manifesto', 'whitepaper'],
    contributorCount: 1,
    lastEditedAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-11-30T00:00:00Z',
    readTimeMinutes: 3,
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
]

/**
 * Glossary Terms - Brief definitions with links to deeper content
 */
export const glossaryTerms: GlossaryTerm[] = [
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
    wikiArticleSlug: 'consent-based-decisions',
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
    wikiArticleSlug: 'manifesto-vs-whitepaper',
    relatedTerms: ['whitepaper'],
    cooperationPath: 'Cooperative Technology',
  },
  {
    id: 'term-whitepaper',
    word: 'White Paper',
    slug: 'whitepaper',
    shortDefinition:
      'The technical document explaining HOW TogetherOS works — architecture and mechanics.',
    wikiArticleSlug: 'manifesto-vs-whitepaper',
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
