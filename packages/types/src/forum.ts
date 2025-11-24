// packages/types/src/forum.ts
// TogetherOS Forum Module - Core Entity Definitions

import type { CooperationPathSlug } from './search'

/**
 * Topic category types
 */
export type TopicCategory =
  | 'general'         // Open discussion
  | 'proposal'        // Pre-proposal exploration
  | 'question'        // Q&A style
  | 'deliberation'    // Structured consensus-building
  | 'announcement'    // One-way info sharing

/**
 * Topic lifecycle states
 */
export type TopicStatus =
  | 'open'            // Active discussion
  | 'resolved'        // Consensus reached or question answered
  | 'archived'        // Moved to archive
  | 'locked'          // No new activity allowed

/**
 * Reaction types (empathy-focused)
 */
export type ReactionType =
  | 'agree'           // I agree with this
  | 'disagree'        // I respectfully disagree
  | 'insightful'      // This changed my perspective
  | 'empathy'         // I understand this feeling
  | 'question'        // I have a clarifying question
  | 'concern'         // I see a potential issue

/**
 * Moderation flag reasons
 */
export type FlagReason =
  | 'spam'
  | 'harassment'
  | 'misinformation'
  | 'off-topic'
  | 'harmful'

/**
 * Flag review status
 */
export type FlagStatus =
  | 'pending'         // Awaiting review
  | 'dismissed'       // No action needed
  | 'action-taken'    // Content hidden/removed

/**
 * Core Topic entity
 * Represents a discussion thread
 */
export interface Topic {
  /** Unique identifier (UUID v4) */
  id: string

  /** Topic title (3-200 chars) */
  title: string

  /** URL-friendly slug (auto-generated from title) */
  slug: string

  /** Optional intro description (10-2000 chars) */
  description?: string

  /** Author ID (member UUID) */
  authorId: string

  /** Optional: scope to group */
  groupId?: string

  /** Type of discussion */
  category: TopicCategory

  /** Cooperation path classification (one of 8 canonical paths) */
  cooperationPath?: CooperationPathSlug

  /** Cooperation Path keywords */
  tags: string[]

  /** Lifecycle state */
  status: TopicStatus

  /** Sticky at top of list */
  isPinned: boolean

  /** No new posts allowed */
  isLocked: boolean

  /** Cached post count */
  postCount: number

  /** Unique participants count */
  participantCount: number

  /** Last post/reply timestamp */
  lastActivityAt: Date

  /** Creation timestamp */
  createdAt: Date

  /** Last modification timestamp */
  updatedAt: Date

  /** Soft delete timestamp */
  deletedAt?: Date
}

/**
 * Post Position (for structured deliberation)
 */
export interface PostPosition {
  /** Position stance */
  stance: 'support' | 'oppose' | 'neutral' | 'question'

  /** Why this stance */
  reasoning: string

  /** Acknowledged downsides */
  tradeoffs: string[]

  /** Other options considered */
  alternatives?: string[]
}

/**
 * Post entity
 * Top-level response to a topic
 */
export interface Post {
  /** Unique identifier (UUID v4) */
  id: string

  /** Parent topic ID */
  topicId: string

  /** Author ID (member UUID) */
  authorId: string

  /** Markdown content (1-5000 chars) */
  content: string

  /** Optional: for deliberation topics */
  position?: PostPosition

  /** Evidence/references */
  citations: Citation[]

  /** Cached reply count */
  replyCount: number

  /** Empathy reactions */
  reactions: Reaction[]

  /** Append-only edit log */
  editHistory: Edit[]

  /** Moderation flags */
  flags: Flag[]

  /** Creation timestamp */
  createdAt: Date

  /** Last modification timestamp */
  updatedAt: Date

  /** Soft delete timestamp */
  deletedAt?: Date
}

/**
 * Reply entity
 * Nested response to a post
 */
export interface Reply {
  /** Unique identifier (UUID v4) */
  id: string

  /** Parent post ID */
  postId: string

  /** Author ID (member UUID) */
  authorId: string

  /** Markdown content (1-2000 chars) */
  content: string

  /** Evidence/references */
  citations: Citation[]

  /** Empathy reactions */
  reactions: Reaction[]

  /** Append-only edit log */
  editHistory: Edit[]

  /** Moderation flags */
  flags: Flag[]

  /** Creation timestamp */
  createdAt: Date

  /** Last modification timestamp */
  updatedAt: Date

  /** Soft delete timestamp */
  deletedAt?: Date
}

/**
 * Citation entity
 * Evidence or reference attached to post/reply
 */
export interface Citation {
  /** Unique identifier (UUID v4) */
  id: string

  /** External link (optional) */
  url?: string

  /** Readable title */
  title: string

  /** Key excerpt */
  snippet?: string

  /** Source description */
  source?: string

  /** Auto-verified if internal */
  verified: boolean
}

/**
 * Reaction entity
 * Empathy-focused reactions (not just upvotes)
 */
export interface Reaction {
  /** Unique identifier (UUID v4) */
  id: string

  /** Member who reacted */
  userId: string

  /** Reaction type */
  type: ReactionType

  /** Reaction timestamp */
  createdAt: Date
}

/**
 * Flag entity
 * Moderation flag for community review
 */
export interface Flag {
  /** Unique identifier (UUID v4) */
  id: string

  /** Content ID (post or reply) */
  contentId: string

  /** Content type */
  contentType: 'post' | 'reply'

  /** Member who flagged */
  flaggerId: string

  /** Flag reason */
  reason: FlagReason

  /** Additional context */
  details?: string

  /** Flag status */
  status: FlagStatus

  /** Moderator who reviewed */
  reviewedBy?: string

  /** Review timestamp */
  reviewedAt?: Date

  /** Flag creation timestamp */
  createdAt: Date
}

/**
 * Edit entity
 * Append-only edit history for transparency
 */
export interface Edit {
  /** Unique identifier (UUID v4) */
  id: string

  /** Member who edited (usually author) */
  editedBy: string

  /** Content before edit */
  previousContent: string

  /** Optional explanation */
  editReason?: string

  /** Edit timestamp */
  editedAt: Date
}
