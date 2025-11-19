// packages/validators/src/forum.ts
// TogetherOS Forum Module - Zod Validation Schemas

import { z } from 'zod'
import type {
  TopicCategory,
  TopicStatus,
  ReactionType,
  FlagReason,
  FlagStatus,
} from '@togetheros/types/forum'

/**
 * Topic category enum schema
 */
export const topicCategorySchema = z.enum([
  'general',
  'proposal',
  'question',
  'deliberation',
  'announcement',
])

/**
 * Topic status enum schema
 */
export const topicStatusSchema = z.enum([
  'open',
  'resolved',
  'archived',
  'locked',
])

/**
 * Reaction type enum schema
 */
export const reactionTypeSchema = z.enum([
  'agree',
  'disagree',
  'insightful',
  'empathy',
  'question',
  'concern',
])

/**
 * Flag reason enum schema
 */
export const flagReasonSchema = z.enum([
  'spam',
  'harassment',
  'misinformation',
  'off-topic',
  'harmful',
])

/**
 * Flag status enum schema
 */
export const flagStatusSchema = z.enum([
  'pending',
  'dismissed',
  'action-taken',
])

/**
 * Create topic input schema
 */
export const createTopicSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),

  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),

  authorId: z.string().uuid('Invalid author ID'),

  groupId: z.string().uuid('Invalid group ID').optional(),

  category: topicCategorySchema,

  tags: z.array(z.string().min(1).max(50)).default([]),
})

/**
 * Type inference from schema
 */
export type CreateTopicInput = z.infer<typeof createTopicSchema>

/**
 * Update topic input schema
 */
export const updateTopicSchema = z.object({
  title: z.string()
    .min(3)
    .max(200)
    .optional(),

  description: z.string()
    .min(10)
    .max(2000)
    .optional(),

  category: topicCategorySchema.optional(),

  tags: z.array(z.string().min(1).max(50)).optional(),

  status: topicStatusSchema.optional(),

  isPinned: z.boolean().optional(),

  isLocked: z.boolean().optional(),
})

/**
 * Type inference from schema
 */
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>

/**
 * List topics filters schema
 */
export const listTopicsFiltersSchema = z.object({
  category: topicCategorySchema.optional(),

  status: topicStatusSchema.optional(),

  authorId: z.string().uuid().optional(),

  groupId: z.string().uuid().optional(),

  tags: z.array(z.string()).optional(),

  isPinned: z.boolean().optional(),

  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50),

  offset: z.number()
    .int()
    .min(0)
    .default(0),
})

/**
 * Type inference from schema
 */
export type ListTopicsFilters = z.infer<typeof listTopicsFiltersSchema>

/**
 * Post position schema (for deliberation)
 */
export const postPositionSchema = z.object({
  stance: z.enum(['support', 'oppose', 'neutral', 'question']),

  reasoning: z.string()
    .min(10, 'Reasoning must be at least 10 characters')
    .max(1000, 'Reasoning cannot exceed 1000 characters'),

  tradeoffs: z.array(z.string().min(1).max(500))
    .default([]),

  alternatives: z.array(z.string().min(1).max(500))
    .optional(),
})

/**
 * Create post input schema
 */
export const createPostSchema = z.object({
  topicId: z.string().uuid('Invalid topic ID'),

  authorId: z.string().uuid('Invalid author ID'),

  content: z.string()
    .min(1, 'Content must be at least 1 character')
    .max(5000, 'Content cannot exceed 5000 characters'),

  position: postPositionSchema.optional(),
})

/**
 * Type inference from schema
 */
export type CreatePostInput = z.infer<typeof createPostSchema>

/**
 * Update post input schema
 */
export const updatePostSchema = z.object({
  content: z.string()
    .min(1, 'Content must be at least 1 character')
    .max(5000, 'Content cannot exceed 5000 characters')
    .optional(),

  position: postPositionSchema.optional(),
})

/**
 * Type inference from schema
 */
export type UpdatePostInput = z.infer<typeof updatePostSchema>

/**
 * Create reply input schema
 */
export const createReplySchema = z.object({
  postId: z.string().uuid('Invalid post ID'),

  authorId: z.string().uuid('Invalid author ID'),

  content: z.string()
    .min(1, 'Content must be at least 1 character')
    .max(2000, 'Content cannot exceed 2000 characters'),
})

/**
 * Type inference from schema
 */
export type CreateReplyInput = z.infer<typeof createReplySchema>

/**
 * Create reaction input schema
 */
export const createReactionSchema = z.object({
  contentId: z.string().uuid('Invalid content ID'),

  contentType: z.enum(['post', 'reply']),

  userId: z.string().uuid('Invalid user ID'),

  type: reactionTypeSchema,
})

/**
 * Type inference from schema
 */
export type CreateReactionInput = z.infer<typeof createReactionSchema>

/**
 * Create flag input schema
 */
export const createFlagSchema = z.object({
  contentId: z.string().uuid('Invalid content ID'),

  contentType: z.enum(['post', 'reply']),

  flaggerId: z.string().uuid('Invalid flagger ID'),

  reason: flagReasonSchema,

  details: z.string()
    .max(500, 'Details cannot exceed 500 characters')
    .optional(),
})

/**
 * Type inference from schema
 */
export type CreateFlagInput = z.infer<typeof createFlagSchema>
