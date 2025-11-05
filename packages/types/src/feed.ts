// packages/types/src/feed.ts
// Type definitions for Feed module (social + forum + intelligence)

/**
 * Post type classification
 */
export type PostType =
  | 'native'      // Created in TogetherOS
  | 'instagram'   // Imported from Instagram
  | 'tiktok'      // Imported from TikTok
  | 'twitter'     // Imported from X/Twitter
  | 'facebook'    // Imported from Facebook
  | 'other'       // Other social media

/**
 * Multi-dimensional reaction types (not just likes)
 */
export type ReactionType =
  | 'care'        // This matters to me
  | 'insightful'  // This changed my perspective
  | 'agree'       // I agree with this
  | 'disagree'    // I respectfully disagree
  | 'act'         // I want to take action on this
  | 'question'    // I have questions about this

/**
 * Post status in feed
 */
export type PostStatus =
  | 'active'      // Visible in feed
  | 'archived'    // Moved to archive
  | 'flagged'     // Under moderation review
  | 'hidden'      // Hidden by moderation

/**
 * Media preview metadata for imported posts
 */
export interface MediaPreview {
  title: string                 // Post title from source
  description?: string          // Post description
  thumbnailUrl?: string         // Preview image
  authorName?: string           // Original author (social media handle)
  platform: string              // 'instagram', 'tiktok', etc.
  embedHtml?: string            // Optional embed code
  fetchedAt: Date
}

/**
 * Primary content unit in the feed
 */
export interface Post {
  id: string                    // UUID
  type: PostType
  authorId: string              // Member UUID
  groupId?: string              // Optional: scope to group

  // Native post fields
  title?: string                // For native posts (10-200 chars)
  content?: string              // Markdown content (for native posts)

  // Import fields
  sourceUrl?: string            // Social media URL
  sourcePreview?: MediaPreview  // Fetched embed data

  // Shared fields
  topics: string[]              // User-tagged topics (Housing, Climate, etc.)
  status: PostStatus            // Post status
  discussionThreadId?: string   // If discussion opened
  discussionCount: number       // # of discussion participants

  createdAt: Date
  updatedAt: Date
}

/**
 * Reaction on a post
 */
export interface Reaction {
  id: string                    // UUID
  postId: string                // Can be Post or ThreadPost
  userId: string
  type: ReactionType
  createdAt: Date
}

/**
 * Reaction counts aggregated by type
 */
export interface ReactionCounts {
  care: number
  insightful: number
  agree: number
  disagree: number
  act: number
  question: number
  total: number
}

/**
 * Discussion thread opened from a feed post
 */
export interface DiscussionThread {
  id: string                    // UUID
  postId: string                // Original feed post
  title: string                 // Auto-generated or user-provided
  topic: string                 // Primary topic tag
  participantCount: number      // Unique participants
  postCount: number             // Total posts in thread
  createdAt: Date
  lastActivityAt: Date
}

/**
 * Individual post within a discussion thread
 */
export interface ThreadPost {
  id: string                    // UUID
  threadId: string
  authorId: string
  content: string               // Markdown, 1-5000 chars
  parentId?: string             // For nested replies (1 level deep)
  createdAt: Date
  updatedAt: Date
}

/**
 * Multi-dimensional quality rating of discussion posts
 */
export interface PostRating {
  id: string                    // UUID
  postId: string                // ThreadPost ID
  raterId: string               // User who rated
  language: number              // 1-5: Clarity, grammar
  originality: number           // 1-5: Novel perspective
  tone: number                  // 1-5: Cooperation-conducive
  argument: number              // 1-5: Logical strength
  createdAt: Date
}

/**
 * Aggregated ratings for a post
 */
export interface AggregatedRating {
  postId: string
  ratingCount: number
  averageLanguage: number
  averageOriginality: number
  averageTone: number
  averageArgument: number
  overallScore: number          // Weighted combination
}

/**
 * User's personal prioritization of topics
 */
export interface Priority {
  id: string                    // UUID
  userId: string
  topic: string                 // Topic name
  rank: number                  // User's ranking (1 = highest)
  weight: number                // 1-10: How much do you care
  updatedAt: Date
}

/**
 * Aggregated community sentiment on a topic
 */
export interface TopicSentiment {
  topic: string                 // Topic name
  postCount: number             // Total posts on topic
  participantCount: number      // Unique participants

  // Reaction aggregation
  reactions: ReactionCounts

  // Calculated metrics
  engagementScore: number       // Weighted reaction total
  consensusScore: number        // Agree / (Agree + Disagree)
  actionReadiness: number       // Act reactions / participants

  // Priority aggregation
  averagePriority: number       // Avg user priority rank
  averageWeight: number         // Avg user care weight

  lastUpdated: Date
}

/**
 * Supporting evidence attached to viewpoints in discussions
 */
export interface DiscussionEvidence {
  id: string                    // UUID
  postId: string                // ThreadPost ID
  url: string                   // External link
  title: string                 // Link title
  snippet?: string              // Key excerpt
  viewpoint: 'support' | 'oppose' | 'neutral'
  verified: boolean             // Checked by Bridge/moderators
  addedBy: string               // User ID
  createdAt: Date
}

/**
 * User reputation earned through contributions
 */
export interface UserReputation {
  userId: string

  // Aggregate scores
  totalPosts: number
  averageLanguageRating: number
  averageOriginalityRating: number
  averageToneRating: number
  averageArgumentRating: number

  // Overall reputation
  reputationScore: number       // Weighted combination

  // Badges earned
  badges: FeedBadge[]

  updatedAt: Date
}

/**
 * Recognition badge types for feed contributions
 */
export type FeedBadgeType =
  | 'insightful-contributor'    // High originality ratings
  | 'bridge-builder'            // High tone ratings
  | 'original-thinker'          // Unique perspectives
  | 'active-participant'        // High post count
  | 'evidence-supporter'        // Adds quality evidence
  | 'consensus-finder'          // Helps resolve disagreements

/**
 * Feed badge instance
 */
export interface FeedBadge {
  id: string
  type: FeedBadgeType
  earnedAt: Date
}

/**
 * User's interest profile (PRIVATE - view only)
 */
export interface InterestProfile {
  userId: string
  interests: TopicInterest[]    // Calculated percentages
  lastUpdated: Date
}

/**
 * Interest percentage per topic
 */
export interface TopicInterest {
  topic: string
  percentage: number            // Relative interest 0-100
  activityCount: number         // # of interactions
}

/**
 * Feed post with aggregated metadata for display
 */
export interface FeedPostWithMeta extends Post {
  author: {
    id: string
    name: string
    avatar?: string
  }
  reactions: ReactionCounts
  userReaction?: ReactionType   // Current user's reaction
  hasDiscussion: boolean
}

/**
 * Discussion thread with posts for display
 */
export interface ThreadWithPosts extends DiscussionThread {
  posts: ThreadPostWithMeta[]
}

/**
 * Thread post with metadata for display
 */
export interface ThreadPostWithMeta extends ThreadPost {
  author: {
    id: string
    name: string
    avatar?: string
  }
  reactions: ReactionCounts
  rating?: AggregatedRating
  replies?: ThreadPostWithMeta[]  // Nested replies (1 level)
}
