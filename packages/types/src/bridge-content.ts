// packages/types/src/bridge-content.ts
// TogetherOS Bridge Content Index - Types for trust-weighted content retrieval

/**
 * Content types that can be indexed for Bridge
 */
export type IndexableContentType =
  | 'forum_post'
  | 'forum_topic'
  | 'article'
  | 'proposal'
  | 'wiki'
  | 'event'

/**
 * Trust tiers based on community validation
 * Bridge uses different language based on trust level
 */
export type TrustTier =
  | 'unvalidated'  // New, no community feedback yet
  | 'low'          // Some engagement but limited validation
  | 'medium'       // Positive engagement, some support
  | 'high'         // Strong community support
  | 'consensus'    // Overwhelming agreement from many participants

/**
 * Trust tier configuration thresholds
 * Adjustable via admin panel
 */
export interface TrustThresholds {
  /** Hours before content is no longer considered "new" */
  newContentHours: number

  /** Minimum votes + SP for "low" tier */
  low: {
    minVotes: number
    minReplies: number
  }

  /** Minimum votes + SP for "medium" tier */
  medium: {
    minVotes: number
    minReplies: number
    minSP: number
  }

  /** Minimum votes + SP for "high" tier */
  high: {
    minVotes: number
    minReplies: number
    minSP: number
  }

  /** Minimum votes + SP + participants for "consensus" tier */
  consensus: {
    minVotes: number
    minParticipants: number
    minSP: number
  }
}

/**
 * Default trust thresholds
 */
export const DEFAULT_TRUST_THRESHOLDS: TrustThresholds = {
  newContentHours: 24,
  low: {
    minVotes: 1,
    minReplies: 1,
  },
  medium: {
    minVotes: 3,
    minReplies: 3,
    minSP: 5,
  },
  high: {
    minVotes: 10,
    minReplies: 5,
    minSP: 20,
  },
  consensus: {
    minVotes: 20,
    minParticipants: 10,
    minSP: 50,
  },
}

/**
 * Engagement metrics for a piece of content
 */
export interface ContentEngagement {
  /** Net vote score (upvotes - downvotes) */
  voteScore: number

  /** Average rating if applicable (0-5) */
  ratingAvg: number | null

  /** Number of direct replies */
  replyCount: number

  /** Number of unique participants engaged */
  participantCount: number

  /** Total Support Points allocated to this content */
  totalSP: number

  /** Number of members who allocated SP */
  spAllocatorCount: number
}

/**
 * Indexed content record stored in database
 */
export interface IndexedContent {
  id: string
  contentType: IndexableContentType
  contentId: string
  url: string

  // Searchable content
  title: string
  summary: string | null
  keywords: string[]
  fullText: string | null

  // Trust signals
  voteScore: number
  ratingAvg: number | null
  replyCount: number
  participantCount: number
  totalSP: number
  spAllocatorCount: number
  trustTier: TrustTier

  // Metadata
  authorId: string | null
  createdAt: Date
  indexedAt: Date
}

/**
 * Input for indexing new content
 */
export interface IndexContentInput {
  contentType: IndexableContentType
  contentId: string
  url: string
  title: string
  body: string
  authorId?: string
  createdAt: Date
}

/**
 * Content search options
 */
export interface ContentSearchOptions {
  /** Filter by content types */
  types?: IndexableContentType[]

  /** Minimum trust tier */
  minTrust?: TrustTier

  /** Maximum results to return */
  limit?: number

  /** Offset for pagination */
  offset?: number
}

/**
 * Content search result with relevance rank
 */
export interface ContentSearchResult extends IndexedContent {
  /** Search relevance score */
  rank: number
}

/**
 * Trust tier display phrases for Bridge prompts
 */
export const TRUST_TIER_PHRASES: Record<TrustTier, string> = {
  unvalidated: '(Unvalidated - new post, no community feedback yet)',
  low: '(Limited community validation)',
  medium: '(Some community support)',
  high: '(Strong community support)',
  consensus: '(Community consensus)',
}

/**
 * Bridge language guidance for each trust tier
 */
export const TRUST_TIER_LANGUAGE: Record<TrustTier, { prefix: string; examples: string[] }> = {
  unvalidated: {
    prefix: 'Frame as individual opinion',
    examples: [
      'One member shared their view that...',
      'A recent post suggests...',
      'Someone recently mentioned...',
    ],
  },
  low: {
    prefix: 'Frame as limited perspective',
    examples: [
      'Some members think...',
      'There\'s a perspective that...',
      'A few people have mentioned...',
    ],
  },
  medium: {
    prefix: 'Frame as growing support',
    examples: [
      'Several members support the idea that...',
      'There\'s growing interest in...',
      'Multiple people have expressed...',
    ],
  },
  high: {
    prefix: 'Frame as strong support',
    examples: [
      'There\'s strong community support for...',
      'The community generally agrees that...',
      'Many members have backed...',
    ],
  },
  consensus: {
    prefix: 'Frame as community consensus',
    examples: [
      'The community has reached consensus that...',
      'There\'s overwhelming agreement on...',
      'The community strongly believes...',
    ],
  },
}
