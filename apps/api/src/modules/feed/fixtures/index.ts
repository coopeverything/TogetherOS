// apps/api/src/modules/feed/fixtures/index.ts
// Sample feed posts for testing and demo

import type { Post } from '@togetheros/types'
import { v4 as uuidv4 } from 'uuid'

// Mock user IDs for authors (valid UUIDs)
const ALICE_ID = '00000000-0000-0000-0000-000000000001'
const BOB_ID = '00000000-0000-0000-0000-000000000002'
const CAROL_ID = '00000000-0000-0000-0000-000000000003'
const DAVE_ID = '00000000-0000-0000-0000-000000000004'

const now = new Date()
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
export const samplePosts: Post[] = [
  // Native posts
  {
    id: uuidv4(),
    type: 'native',
    authorId: ALICE_ID,
    groupId: undefined,
    title: 'Community Garden Initiative - Spring 2026',
    content: `I've been thinking about starting a community garden in our neighborhood. We have an unused lot on Oak Street that could be perfect for this.

**Benefits:**
- Fresh, local produce
- Brings neighbors together
- Educational opportunities for kids
- Reduces food costs for participants

**What we need:**
- 10-15 committed members
- Basic tools and seeds (I can help source these)
- Permission from the city (I'll handle paperwork)

Who's interested in joining? Let's discuss!`,
    sourceUrl: undefined,
    sourcePreview: undefined,
    topics: ['Community Connection', 'Common Planet', 'Social Economy'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 0,
    createdAt: oneHourAgo,
    updatedAt: oneHourAgo,
  },

  {
    id: uuidv4(),
    type: 'native',
    authorId: BOB_ID,
    groupId: undefined,
    title: undefined,
    content: `Just read an amazing article about worker cooperatives in Spain. The Mondragon Corporation has 80,000+ worker-owners and has been thriving for 70 years.

Why aren't we doing more of this here? Imagine if every company was owned by its workers. No exploitation, fair wages, democratic decision-making.

This is what cooperative economics looks like in practice.`,
    sourceUrl: undefined,
    sourcePreview: undefined,
    topics: ['Social Economy', 'Cooperative Technology'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 0,
    createdAt: twoHoursAgo,
    updatedAt: twoHoursAgo,
  },

  {
    id: uuidv4(),
    type: 'native',
    authorId: CAROL_ID,
    groupId: undefined,
    title: 'Free Skill-Share Workshop: Basic Home Repair',
    content: `Hey neighbors! I'm a carpenter and I want to teach a free workshop on basic home repairs.

**What you'll learn:**
- Fixing leaky faucets
- Patching drywall
- Replacing light fixtures
- Basic tool safety

**When:** Saturday, March 15, 2-5pm
**Where:** Community Center
**Bring:** Notebook, safety glasses (I'll provide tools)

This is about building self-reliance and sharing knowledge. No experience needed!`,
    sourceUrl: undefined,
    sourcePreview: undefined,
    topics: ['Collaborative Education', 'Community Connection'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 0,
    createdAt: oneDayAgo,
    updatedAt: oneDayAgo,
  },

  // Instagram import (mock)
  {
    id: uuidv4(),
    type: 'instagram',
    authorId: DAVE_ID,
    groupId: undefined,
    title: undefined,
    content: undefined,
    sourceUrl: 'https://instagram.com/p/example123',
    sourcePreview: {
      title: 'Beautiful urban garden transformation',
      description: 'What a parking lot became after community action. Swipe to see before/after!',
      thumbnailUrl: 'https://picsum.photos/seed/garden1/400/400',
      authorName: '@urbangardeners',
      platform: 'instagram',
      embedHtml: undefined,
      fetchedAt: oneDayAgo,
    },
    topics: ['Common Planet', 'Community Connection'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 0,
    createdAt: oneDayAgo,
    updatedAt: oneDayAgo,
  },

  // More native posts
  {
    id: uuidv4(),
    type: 'native',
    authorId: ALICE_ID,
    groupId: undefined,
    title: 'Mutual Aid Request: Help for Family in Need',
    content: `A family in our neighborhood just lost their home to a fire. Everyone is safe, but they lost everything.

**Immediate needs:**
- Clothing (2 adults, 3 kids ages 4, 7, 12)
- Temporary housing (looking into options)
- Household essentials
- Financial support

**How to help:**
- Donate items (drop-off at Community Center)
- Financial contributions (link in comments)
- Spread the word

Let's show what community means. Every little bit helps.`,
    sourceUrl: undefined,
    sourcePreview: undefined,
    topics: ['Community Connection', 'Social Economy'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 0,
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },

  {
    id: uuidv4(),
    type: 'native',
    authorId: BOB_ID,
    groupId: undefined,
    title: 'Proposal: Community Bulk Buying Club',
    content: `What if we pooled our purchasing power to buy groceries in bulk directly from farms and wholesalers?

**The idea:**
- 30-50 households commit to monthly orders
- We negotiate bulk prices (30-50% savings)
- Rotate volunteer coordinators
- Pick-up at central location

**Example savings:**
- Organic vegetables: $3/lb → $1.50/lb
- Local eggs: $6/dozen → $3/dozen
- Dry goods: 40% off retail

**Next steps:**
- Gauge interest (need 20 households minimum)
- Find coordinator volunteers
- Contact local farms

Comment if you're interested!`,
    sourceUrl: undefined,
    sourcePreview: undefined,
    topics: ['Social Economy', 'Common Planet'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 0,
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },

  // TikTok import (mock)
  {
    id: uuidv4(),
    type: 'tiktok',
    authorId: CAROL_ID,
    groupId: undefined,
    title: undefined,
    content: undefined,
    sourceUrl: 'https://tiktok.com/@example/video/123456',
    sourcePreview: {
      title: 'How to fix income inequality in 60 seconds',
      description: 'Worker cooperatives explained simply. Mind = blown 🤯',
      thumbnailUrl: 'https://picsum.photos/seed/coop1/400/400',
      authorName: '@cooperativeexplainer',
      platform: 'tiktok',
      embedHtml: undefined,
      fetchedAt: twoDaysAgo,
    },
    topics: ['Social Economy', 'Collaborative Education'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 0,
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },

  // Twitter/X import (mock)
  {
    id: uuidv4(),
    type: 'twitter',
    authorId: DAVE_ID,
    groupId: undefined,
    title: undefined,
    content: undefined,
    sourceUrl: 'https://x.com/example/status/123456',
    sourcePreview: {
      title: 'Thread on community land trusts',
      description: '🧵 How to permanently affordable housing: A community land trust owns the land, residents own the homes. Land never enters speculative market. Housing stays affordable forever. Here\'s how it works...',
      thumbnailUrl: undefined,
      authorName: '@housingjustice',
      platform: 'twitter',
      embedHtml: undefined,
      fetchedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    topics: ['Community Connection', 'Social Economy'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 0,
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
  },

  // More diverse native posts
  {
    id: uuidv4(),
    type: 'native',
    authorId: ALICE_ID,
    groupId: undefined,
    title: 'Climate Action Local Group - First Meeting',
    content: `Who wants to do something about climate change at the local level?

**Focus areas:**
- Renewable energy co-ops
- Community composting
- Bike infrastructure advocacy
- Tree planting initiatives

**First meeting:** Next Tuesday, 7pm at library
**Goal:** Create action plan, not just talk

We can't wait for governments. Let's build solutions ourselves.`,
    sourceUrl: undefined,
    sourcePreview: undefined,
    topics: ['Common Planet', 'Collective Governance'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 0,
    createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
  },

  {
    id: uuidv4(),
    type: 'native',
    authorId: BOB_ID,
    groupId: undefined,
    title: undefined,
    content: `Reminder: Our democracy shouldn't just be voting every 4 years.

Real democracy is:
- Participating in decisions that affect you
- Having power at work (worker co-ops)
- Community control of resources
- Transparent, accountable institutions

We're building that here, one small step at a time.`,
    sourceUrl: undefined,
    sourcePreview: undefined,
    topics: ['Collective Governance', 'Social Economy'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 0,
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
  },

  {
    id: uuidv4(),
    type: 'native',
    authorId: CAROL_ID,
    groupId: undefined,
    title: 'Tool Library Update: New Items Available!',
    content: `The community tool library just got donations of:

- Electric drill + bit set
- Circular saw
- Hedge trimmer
- Ladder (12ft)
- Lawn aerator

**Borrowing:**
- Free for members ($20/year membership)
- 3-day checkout period
- Return clean and in working condition

**Hours:** Tuesdays & Saturdays, 10am-2pm

Stop buying tools you'll use once! Share the love.`,
    sourceUrl: undefined,
    sourcePreview: undefined,
    topics: ['Community Connection', 'Social Economy'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 0,
    createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
  },

  // Facebook import (mock)
  {
    id: uuidv4(),
    type: 'facebook',
    authorId: DAVE_ID,
    groupId: undefined,
    title: undefined,
    content: undefined,
    sourceUrl: 'https://facebook.com/groups/example/posts/123',
    sourcePreview: {
      title: 'Success story: Our neighborhood solar co-op',
      description: '50 homes went solar together. Bulk pricing saved everyone $8,000 on average. Now generating 100% of our electricity from the sun. Here\'s how we did it and how you can too...',
      thumbnailUrl: 'https://picsum.photos/seed/solar1/400/400',
      authorName: 'Community Solar Network',
      platform: 'facebook',
      embedHtml: undefined,
      fetchedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
    topics: ['Common Planet', 'Social Economy'],
    status: 'active',
    discussionThreadId: undefined,
    discussionCount: 0,
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
  },
]

// Export thread fixtures
export { sampleThreads, sampleThreadPosts } from './threads'
