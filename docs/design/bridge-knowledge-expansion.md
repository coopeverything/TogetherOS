# Bridge Knowledge Expansion Design

## Overview

Bridge's knowledge should be ever-expanding, not restricted to the manifesto and existing knowledge base. This document describes how Bridge learns from multiple sources with consent-based trust weighting.

## Core Principle

**Members should never have to state their intention.** Bridge analyzes the message and responds appropriately, whether the member is:
- Looking up information
- Brainstorming an idea
- Trying to articulate something they've been thinking
- Just chatting

## Knowledge Sources (Tiered Trust)

### Tier 1: Core (Highest Authority)
- **Manifesto** - Foundational principles, non-negotiable
- **Governance docs** - Official rules and processes
- **Design specs** - Technical architecture decisions
- **Trust weight**: 1.0 (always cited, never contradicted)

### Tier 2: Curated (High Trust)
- **Wiki articles** - Community-vetted knowledge
- **Reviewed training examples** - Admin-approved Bridge responses
- **Trust weight**: 0.8-0.95 (based on review status)

### Tier 3: Community (Consensus-Based Trust)
- **Forum discussions** with high consent
- **Proposals** that reached quorum
- **Trust weight**: Calculated from ratings (see below)

### Tier 4: Emerging (Low Trust, High Curiosity)
- **New forum posts** - Fresh ideas, unvalidated
- **Pending proposals** - Under discussion
- **Trust weight**: 0.1-0.3 (Bridge presents as "one perspective")

## Consent-Based Trust Calculation

### For Forum Posts/Opinions

```
consent_score = (upvotes - downvotes) / total_votes
engagement_factor = log(total_votes + 1) / log(100)
recency_factor = 1 / (1 + days_since_post / 30)

trust_weight = base_tier_weight * consent_score * engagement_factor * recency_factor
```

### Trust Weight Ranges

| Consent Score | Engagement | Bridge Says |
|---------------|------------|-------------|
| > 0.8 | High (50+) | "The community strongly agrees..." |
| 0.6-0.8 | Medium | "Most members think..." |
| 0.4-0.6 | Any | "There are different views on this..." |
| < 0.4 | Any | "Some have suggested..." or omit |

### Rating Sources

1. **Upvotes/Downvotes** on forum posts
2. **"This helped me"** explicit markers
3. **Reply engagement** - Discussion depth
4. **Cross-references** - How often other posts cite this one
5. **Author reputation** - Track record of helpful contributions

## Automatic Intent Detection

Bridge analyzes messages to detect intent without asking:

### Information Intent
- **Signals**: Questions with "what", "how", "where", "when", "why"
- **Contains**: References to docs, policies, processes
- **Example**: "How do support points work?"
- **Response mode**: Cite sources, be factual, structured

### Brainstorm Intent
- **Signals**: "What if...", "Could we...", "I'm thinking about..."
- **Contains**: Ideas, possibilities, hypotheticals
- **Example**: "What if we started a tool library?"
- **Response mode**: Build on ideas, suggest variations, connect to existing initiatives

### Articulation Intent
- **Signals**: "I feel like...", "Something about...", "I can't put my finger on..."
- **Contains**: Emotional language, uncertainty, searching for words
- **Example**: "There's something about how we vote that bothers me"
- **Response mode**: Reflect back, ask clarifying questions, help name the feeling

### Exploration Intent
- **Signals**: Open-ended questions, curiosity markers
- **Contains**: "Tell me about...", "What's going on with..."
- **Example**: "What's happening in the community?"
- **Response mode**: Share updates, highlight interesting discussions, invite participation

### Action Intent
- **Signals**: "I want to...", "How do I...", "Can I..."
- **Contains**: Verbs, goals, next steps
- **Example**: "I want to start a local group"
- **Response mode**: Provide steps, link to resources, offer to help

## Knowledge Ingestion Pipeline

### 1. Wiki Integration
```
Every wiki article:
1. Parsed and chunked for RAG
2. Indexed with metadata (author, last edit, references)
3. Trust weight = 0.85 (curated content)
4. Re-indexed on edit
```

### 2. Forum Integration
```
New forum post:
1. Initial trust weight = 0.2 (emerging)
2. After 24h: recalculate based on votes
3. After 7d: stable trust weight assigned
4. High-consent posts (>0.8) promoted to knowledge base
```

### 3. Training Example Flow
```
Bridge answer rated poorly:
1. Answer flagged for review
2. Admin provides ideal response
3. Ideal response becomes training example
4. Trust weight = 0.9 (admin-reviewed)
5. Similar future questions use this pattern
```

## Bridge Response Structure

### For High-Consensus Knowledge
```
"Support Points are [description from docs].

The community has developed a shared understanding that [forum-derived insight].

Sources:
- docs/guides/support-points.md
- Forum: "SP best practices" (87% agreement, 45 votes)
```

### For Mixed-Consensus Topics
```
"There are different perspectives on [topic]:

**View A** (supported by 62% of responses):
[Summary]

**View B** (raised by experienced members):
[Summary]

The official documentation says [core docs stance].
```

### For Emerging Ideas
```
"This is an interesting question that's being discussed.

[Member name] recently proposed [idea] in the forum. It hasn't reached consensus yet, but you might want to join the discussion.

Link: [forum thread]
```

## Database Schema Additions

### bridge_knowledge_sources
```sql
CREATE TABLE bridge_knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(20) NOT NULL
    CHECK (source_type IN ('core', 'wiki', 'forum', 'proposal', 'training')),
  source_id VARCHAR(255) NOT NULL,  -- Reference to original content
  content TEXT NOT NULL,
  content_embedding VECTOR(1536),   -- For semantic search
  trust_weight DECIMAL(3,2) NOT NULL DEFAULT 0.5,
  consent_score DECIMAL(3,2),       -- Null for non-votable content
  total_votes INT DEFAULT 0,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  helpful_marks INT DEFAULT 0,
  last_recalculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for semantic similarity search
CREATE INDEX idx_knowledge_embedding
  ON bridge_knowledge_sources
  USING ivfflat (content_embedding vector_cosine_ops);

-- Index for trust-based filtering
CREATE INDEX idx_knowledge_trust
  ON bridge_knowledge_sources(source_type, trust_weight DESC);
```

### bridge_knowledge_ratings
```sql
CREATE TABLE bridge_knowledge_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES bridge_knowledge_sources(id),
  user_id UUID REFERENCES users(id),
  rating_type VARCHAR(20) NOT NULL
    CHECK (rating_type IN ('upvote', 'downvote', 'helpful', 'outdated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_id, user_id, rating_type)
);
```

## Implementation Phases

### Phase 1: Intent Detection (1-2 days)
- Add intent classifier to `/api/bridge/ask`
- Log detected intents for analysis
- No user-facing changes (invisible improvement)

### Phase 2: Wiki Integration (2-3 days)
- Index wiki content for RAG
- Add to knowledge sources table
- Weight wiki higher than base docs

### Phase 3: Forum Consent Tracking (3-5 days)
- Add vote tracking to forum posts
- Calculate consent scores
- Promote high-consent content to knowledge base

### Phase 4: Dynamic Trust Weighting (2-3 days)
- Implement trust recalculation job
- Add consent-based response generation
- Bridge cites sources with trust context

## Success Metrics

1. **Answer Quality**
   - User satisfaction rating improves
   - "Helpful" marks on Bridge answers

2. **Knowledge Freshness**
   - Average age of cited sources decreases
   - New forum content appears in answers within 24h

3. **Consent Accuracy**
   - High-consent content used more often
   - Low-consent content rarely cited (as appropriate)

4. **Intent Detection**
   - Users don't report "Bridge didn't understand me"
   - Response mode matches detected intent 90%+

## Related Documents

- [Bridge Teaching Sessions](./bridge-teaching-sessions.md)
- [Forum Module Spec](../modules/forum.md)
- [Knowledge Base Architecture](./knowledge-base-arch.md)
