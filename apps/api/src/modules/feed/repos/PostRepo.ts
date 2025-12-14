// apps/api/src/modules/feed/repos/PostRepo.ts
// Repository interface for Post entity

import type { Post as PostType } from '@togetheros/types'

export interface PostFilters {
  topic?: string
  authorId?: string
  groupId?: string
  status?: 'active' | 'archived' | 'flagged' | 'hidden'
  type?: 'native' | 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'other'
  limit?: number
  offset?: number
}

export interface CreateNativePostInput {
  authorId: string
  content: string
  title?: string
  topics: string[]
  groupId?: string
  embeddedUrls?: { url: string; preview: any; position: number }[]
  mediaUrls?: string[]
}

export interface CreateImportPostInput {
  authorId: string
  sourceUrl: string
  preview: {
    title: string
    description?: string
    thumbnailUrl?: string
    authorName?: string
    platform: string
    embedHtml?: string
    fetchedAt: Date
  }
  topics: string[]
  groupId?: string
}

/**
 * Post repository interface
 * Defines contract for data access
 */
export interface PostRepo {
  /**
   * Create a new native post
   */
  createNative(input: CreateNativePostInput): Promise<PostType>

  /**
   * Create a new import post
   */
  createImport(input: CreateImportPostInput): Promise<PostType>

  /**
   * Find post by ID
   */
  findById(id: string): Promise<PostType | null>

  /**
   * List posts with filters
   */
  list(filters?: PostFilters): Promise<PostType[]>

  /**
   * Count posts (for pagination)
   */
  count(filters?: PostFilters): Promise<number>

  /**
   * Open discussion on post
   */
  openDiscussion(postId: string, threadId: string): Promise<void>

  /**
   * Increment discussion count
   */
  incrementDiscussionCount(postId: string): Promise<void>

  /**
   * Archive post
   */
  archive(postId: string): Promise<void>

  /**
   * Flag post
   */
  flag(postId: string): Promise<void>

  /**
   * Delete post
   */
  delete(id: string): Promise<void>

  /**
   * Get all unique topics
   */
  getTopics(): Promise<string[]>
}
