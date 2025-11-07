// packages/validators/src/feed.ts
// Zod validators for Feed module

import { z } from 'zod'

/**
 * Post type validation
 */
export const postTypeSchema = z.enum([
  'native',
  'instagram',
  'tiktok',
  'twitter',
  'facebook',
  'other',
])

/**
 * Reaction type validation
 */
export const reactionTypeSchema = z.enum([
  'care',
  'insightful',
  'agree',
  'disagree',
  'act',
  'question',
])

/**
 * Post status validation
 */
export const postStatusSchema = z.enum([
  'active',
  'archived',
  'flagged',
  'hidden',
])

/**
 * Create native post schema
 */
export const createNativePostSchema = z.object({
  title: z.string().min(10).max(200).optional(),
  content: z.string().min(1).max(5000),
  topics: z.array(z.string().min(1).max(100)).min(1).max(5),
  groupId: z.string().uuid().optional(),
})

/**
 * Create import post schema
 */
export const createImportPostSchema = z.object({
  sourceUrl: z.string().url(),
  topics: z.array(z.string().min(1).max(100)).min(1).max(5),
  groupId: z.string().uuid().optional(),
})

/**
 * Media preview schema
 */
export const mediaPreviewSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  authorName: z.string().optional(),
  platform: z.string(),
  embedHtml: z.string().optional(),
  fetchedAt: z.date(),
})

/**
 * Embedded URL schema (social media URLs detected in content)
 */
export const embeddedUrlSchema = z.object({
  url: z.string().url(),
  preview: mediaPreviewSchema,
  position: z.number().int().min(0),
})

/**
 * Full post schema
 */
export const postSchema = z.object({
  id: z.string().uuid(),
  type: postTypeSchema,
  authorId: z.string().uuid(),
  groupId: z.string().uuid().optional(),

  // Native post fields
  title: z.string().min(10).max(200).optional(),
  content: z.string().min(1).max(5000).optional(),
  embeddedUrls: z.array(embeddedUrlSchema).optional(),

  // Import fields
  sourceUrl: z.string().url().optional(),
  sourcePreview: mediaPreviewSchema.optional(),

  // Shared fields
  topics: z.array(z.string()),
  status: postStatusSchema,
  discussionThreadId: z.string().uuid().optional(),
  discussionCount: z.number().int().min(0),

  createdAt: z.date(),
  updatedAt: z.date(),
})

/**
 * Create reaction schema
 */
export const createReactionSchema = z.object({
  postId: z.string().uuid(),
  type: reactionTypeSchema,
})

/**
 * Reaction schema
 */
export const reactionSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  userId: z.string().uuid(),
  type: reactionTypeSchema,
  createdAt: z.date(),
})

/**
 * Create discussion thread schema
 */
export const createThreadSchema = z.object({
  postId: z.string().uuid(),
  title: z.string().min(3).max(200).optional(),
})

/**
 * Discussion thread schema
 */
export const discussionThreadSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  title: z.string(),
  topic: z.string(),
  participantCount: z.number().int().min(0),
  postCount: z.number().int().min(0),
  createdAt: z.date(),
  lastActivityAt: z.date(),
})

/**
 * Create thread post schema
 */
export const createThreadPostSchema = z.object({
  threadId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  parentId: z.string().uuid().optional(),
})

/**
 * Thread post schema
 */
export const threadPostSchema = z.object({
  id: z.string().uuid(),
  threadId: z.string().uuid(),
  authorId: z.string().uuid(),
  content: z.string(),
  parentId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

/**
 * Create post rating schema
 */
export const createRatingSchema = z.object({
  postId: z.string().uuid(),
  language: z.number().int().min(1).max(5),
  originality: z.number().int().min(1).max(5),
  tone: z.number().int().min(1).max(5),
  argument: z.number().int().min(1).max(5),
})

/**
 * Post rating schema
 */
export const postRatingSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  raterId: z.string().uuid(),
  language: z.number().int().min(1).max(5),
  originality: z.number().int().min(1).max(5),
  tone: z.number().int().min(1).max(5),
  argument: z.number().int().min(1).max(5),
  createdAt: z.date(),
})

/**
 * Upsert priority schema
 */
export const upsertPrioritySchema = z.object({
  topic: z.string().min(1).max(100),
  rank: z.number().int().min(1),
  weight: z.number().int().min(1).max(10),
})

/**
 * Priority schema
 */
export const prioritySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  topic: z.string(),
  rank: z.number().int().min(1),
  weight: z.number().int().min(1).max(10),
  updatedAt: z.date(),
})

/**
 * Evidence schema
 */
export const evidenceSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  url: z.string().url(),
  title: z.string(),
  snippet: z.string().optional(),
  viewpoint: z.enum(['support', 'oppose', 'neutral']),
  verified: z.boolean(),
  addedBy: z.string().uuid(),
  createdAt: z.date(),
})

/**
 * Create evidence schema
 */
export const createEvidenceSchema = z.object({
  postId: z.string().uuid(),
  url: z.string().url(),
  title: z.string().min(1).max(200),
  snippet: z.string().max(500).optional(),
  viewpoint: z.enum(['support', 'oppose', 'neutral']),
})

/**
 * Topic filter schema
 */
export const topicFilterSchema = z.object({
  topic: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

/**
 * Feed badge type schema
 */
export const feedBadgeTypeSchema = z.enum([
  'insightful-contributor',
  'bridge-builder',
  'original-thinker',
  'active-participant',
  'evidence-supporter',
  'consensus-finder',
])

/**
 * Feed badge schema
 */
export const feedBadgeSchema = z.object({
  id: z.string(),
  type: feedBadgeTypeSchema,
  earnedAt: z.date(),
})
