/**
 * Articles Data
 *
 * Author-owned expert opinion articles. Unlike wiki articles which are
 * community-owned, these represent individual perspectives with clear authorship.
 */

import type { Article, ArticleListItem } from '@togetheros/types'

export const articles: Article[] = [
  {
    id: 'art-1',
    slug: 'why-coordinators-not-leaders',
    title: 'Why We Say "Coordinators" Not "Leaders"',
    summary:
      'Language shapes thought. The choice to call our roles "coordinators" rather than "leaders" reflects a fundamental shift in how we think about power and responsibility in cooperative organizations.',
    content: `# Why We Say "Coordinators" Not "Leaders"

When we use the word "leader," we unconsciously invoke centuries of hierarchical thinking. Leaders lead. Followers follow. The relationship is asymmetric by design.

## The Problem with "Leadership"

Traditional leadership models assume:
- **Decision authority** flows from position
- **Knowledge and wisdom** concentrate at the top
- **Accountability** is often vague or ceremonial
- **Replaceability** is difficult and disruptive

This model has served certain purposes, but it fundamentally conflicts with cooperative values.

## What "Coordination" Means

A coordinator doesn't lead—they *facilitate the collective leading itself*. This means:

- **Implementing decisions** that others make together
- **Organizing logistics** so collective action is possible
- **Maintaining transparency** so everyone can see what's happening
- **Being recallable** when the collective decides change is needed

## The Practical Difference

Consider a group deciding where to hold an event:

**Leader model:** The leader decides the venue, perhaps consulting key people.

**Coordinator model:** The group discusses options, reaches consent, and the coordinator books the venue and handles logistics.

The coordinator has responsibility without authority. They execute the group's will, not their own vision.

## Why This Matters

Language is not neutral. Every time we say "leader," we reinforce the neural pathways of hierarchy. Every time we say "coordinator," we practice equality.

This isn't about political correctness. It's about cognitive hygiene—choosing words that align with the reality we're building.

## Exceptions and Flexibility

Does this mean exceptional individuals have no place? Absolutely not. We *use* exceptional people—their skills, knowledge, and energy. But we don't *rely* on them to govern us.

A brilliant strategist can advise. A skilled facilitator can guide discussions. A technical expert can implement solutions. But the power to decide remains with the collective.

---

*This article represents the author's perspective. Discuss and debate in the forum.*

---

**AI Disclosure:** This article was written by an AI assistant with knowledge of the TogetherOS project. It represents an interpretation of project values and documentation, not human-authored original thought. Treat it as a starting point for discussion, not definitive truth.`,
    status: 'published',
    authorId: 'user-1',
    authorName: 'Collective Voice',
    authorBio: 'Exploring cooperative alternatives to hierarchical organization.',
    tags: ['governance', 'language', 'coordination', 'philosophy'],
    cooperationPaths: ['Collective Governance'],
    relatedWikiSlugs: ['coordinator', 'power-hierarchy'],
    createdAt: '2025-11-28T10:00:00Z',
    publishedAt: '2025-11-28T12:00:00Z',
    updatedAt: '2025-11-28T12:00:00Z',
    readTimeMinutes: 4,
    viewCount: 127,
    likeCount: 23,
  },
  {
    id: 'art-2',
    slug: 'mental-flexibility-practice',
    title: 'Mental Flexibility: A Daily Practice',
    summary:
      'Mental flexibility isn\'t just a nice idea—it\'s a skill that requires intentional practice. Here\'s how I\'ve learned to catch myself in ideological traps.',
    content: `# Mental Flexibility: A Daily Practice

I used to think I was open-minded because I held progressive views. Then I noticed how defensive I got when those views were questioned. That wasn't open-mindedness—it was a different flavor of rigidity.

## Recognizing the Trap

Ideological thinking has a signature feeling: *certainty*. When you're absolutely sure you're right, that's often a sign you've stopped thinking and started believing.

This applies equally to:
- Political positions
- Economic theories
- Organizational methods
- Even cooperative principles

Yes, even our commitment to cooperation can become dogmatic if we're not careful.

## The Practice

Here's what I do daily:

### 1. The Steel Man Exercise

Pick something you disagree with. Now try to argue *for* it as persuasively as possible. If you can't make a strong case for the opposing view, you don't actually understand it.

### 2. Source Diversity

Read one thing from outside your bubble every day. Not to hate-read it—to genuinely understand how intelligent people could hold different views.

### 3. Doubt Your Favorites

Your most cherished beliefs deserve the most scrutiny. They're the ones you're most likely to accept without examination.

### 4. Notice Your Body

Ideological triggering shows up physically. Tight chest, clenched jaw, heat in the face. When you notice these during a discussion, pause. Your nervous system is defending territory, not seeking truth.

## Why This Matters for Cooperation

Cooperation requires holding multiple perspectives simultaneously. If you can't genuinely entertain ideas you disagree with, you can't truly collaborate with people who hold them.

The goal isn't to become wishy-washy or "both sides" everything. It's to be firm in values while flexible in implementation. Clear about principles while curious about methods.

## A Warning

This practice will make you uncomfortable. You'll find yourself agreeing with people you used to dismiss. You'll question things you used to be certain about.

That discomfort is growth.

---

*This is my personal practice. Your path to mental flexibility may look different. Share yours in the forum.*

---

**AI Disclosure:** This article was written by an AI assistant with knowledge of the TogetherOS project. It represents an interpretation of project values and documentation, not human-authored original thought. Treat it as a starting point for discussion, not definitive truth.`,
    status: 'published',
    authorId: 'user-2',
    authorName: 'Mindful Skeptic',
    authorBio: 'Practicing uncertainty in an age of certainty.',
    tags: ['mental-flexibility', 'practice', 'personal-development', 'philosophy'],
    cooperationPaths: ['Collaborative Education'],
    relatedWikiSlugs: ['mental-flexibility'],
    createdAt: '2025-11-27T08:00:00Z',
    publishedAt: '2025-11-27T14:00:00Z',
    updatedAt: '2025-11-27T14:00:00Z',
    readTimeMinutes: 4,
    viewCount: 89,
    likeCount: 31,
  },
  {
    id: 'art-3',
    slug: 'support-points-not-power-points',
    title: 'Support Points: Why Governance Power Should Never Be Buyable',
    summary:
      'A deep dive into the design philosophy behind Support Points (SP) and why separating governance power from economic power is essential for genuine cooperation.',
    content: `# Support Points: Why Governance Power Should Never Be Buyable

In most systems, money talks. Those with more resources have more influence—through lobbying, advertising, or simply having time to participate while others work. TogetherOS takes a different approach.

## The Design Principle

Support Points (SP) represent governance power. They're earned through contribution, not purchased with currency. This isn't just an implementation detail—it's a core architectural decision.

**Why does this matter?**

In systems where governance power is buyable:
- Wealth concentrates political influence
- Early participants can "lock in" power
- New members face barriers to meaningful participation
- Decisions favor those who can afford to influence them

## How SP Works

You earn SP by:
- Contributing to the community (code, documentation, moderation)
- Participating in governance (thoughtful proposals, helpful feedback)
- Supporting others (mentorship, assistance, collaboration)

You cannot:
- Buy SP with money
- Transfer SP to others
- Inherit or be gifted SP

This creates a system where influence must be *earned* through action, not *bought* through accumulation.

## The Philosophical Foundation

This design reflects a belief: governance legitimacy comes from active contribution, not passive ownership.

Compare this to:
- **Shareholder voting:** One dollar, one vote (plutocracy)
- **Direct democracy:** One person, one vote (potentially disconnected from contribution)
- **SP-based:** Contribution-weighted participation (meritocracy of action)

## Common Objections

**"But I want to invest and have a say!"**

You can. Invest your time. Contribute your skills. The system rewards engagement, not capital.

**"What about people who can't contribute as much?"**

Base participation rights exist for all members. SP provides *additional* influence for *additional* contribution, not exclusive access to basic governance.

**"Won't this create a different kind of elite?"**

Potentially. But an elite of contributors is preferable to an elite of accumulators. And SP decay mechanisms prevent permanent power lock-in.

## The Bigger Picture

Separating economic and governance power is part of a larger project: demonstrating that alternatives to plutocracy are possible and practical.

We're not just building software. We're prototyping a different relationship between contribution, power, and participation.

---

*This represents one perspective on SP design philosophy. The system continues to evolve through community deliberation.*

---

**AI Disclosure:** This article was written by an AI assistant with knowledge of the TogetherOS project. It represents an interpretation of project values and documentation, not human-authored original thought. Treat it as a starting point for discussion, not definitive truth.`,
    status: 'published',
    authorId: 'user-1',
    authorName: 'Collective Voice',
    authorBio: 'Exploring cooperative alternatives to hierarchical organization.',
    tags: ['support-points', 'governance', 'economics', 'philosophy', 'anti-plutocracy'],
    cooperationPaths: ['Collective Governance', 'Social Economy'],
    relatedWikiSlugs: ['support-points'],
    createdAt: '2025-11-26T09:00:00Z',
    publishedAt: '2025-11-26T11:00:00Z',
    updatedAt: '2025-11-26T11:00:00Z',
    readTimeMinutes: 5,
    viewCount: 156,
    likeCount: 42,
  },
]

// Helper functions

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}

export function getPublishedArticles(): Article[] {
  return articles
    .filter((a) => a.status === 'published')
    .sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
    )
}

export function getArticlesByAuthor(authorId: string): Article[] {
  return articles
    .filter((a) => a.authorId === authorId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

export function getArticlesByTag(tag: string): Article[] {
  return articles
    .filter((a) => a.tags.includes(tag) && a.status === 'published')
    .sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
    )
}

export function getRelatedArticles(article: Article): Article[] {
  if (!article.relatedArticleSlugs || article.relatedArticleSlugs.length === 0) {
    // Find articles with overlapping tags
    return articles
      .filter(
        (a) =>
          a.id !== article.id &&
          a.status === 'published' &&
          a.tags.some((t) => article.tags.includes(t))
      )
      .slice(0, 3)
  }

  return article.relatedArticleSlugs
    .map((slug) => getArticleBySlug(slug))
    .filter((a): a is Article => a !== undefined && a.status === 'published')
}

export function toArticleListItem(article: Article): ArticleListItem {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    status: article.status,
    authorId: article.authorId,
    authorName: article.authorName,
    tags: article.tags,
    cooperationPaths: article.cooperationPaths,
    publishedAt: article.publishedAt,
    readTimeMinutes: article.readTimeMinutes,
    viewCount: article.viewCount,
    likeCount: article.likeCount,
  }
}
