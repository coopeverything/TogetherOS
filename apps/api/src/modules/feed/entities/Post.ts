// apps/api/src/modules/feed/entities/Post.ts
// Domain entity for Post - Pure business logic

import type { Post as PostType, PostType as PostTypeEnum, PostStatus, MediaPreview, EmbeddedUrl } from '@togetheros/types'
import { postSchema } from '@togetheros/validators'
import { v4 as uuidv4 } from 'uuid'

/**
 * Post entity
 * Represents a feed post (native or imported) with business logic
 */
export class Post {
  private constructor(
    public readonly id: string,
    public readonly type: PostTypeEnum,
    public readonly authorId: string,
    public readonly groupId: string | undefined,
    public readonly title: string | undefined,
    public readonly content: string | undefined,
    public readonly embeddedUrls: ReadonlyArray<EmbeddedUrl> | undefined,
    public readonly sourceUrl: string | undefined,
    public readonly sourcePreview: MediaPreview | undefined,
    public readonly topics: ReadonlyArray<string>,
    public readonly status: PostStatus,
    public readonly discussionThreadId: string | undefined,
    public readonly discussionCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Factory: Create new native post
   */
  static createNative(input: {
    authorId: string
    content: string
    title?: string
    topics: string[]
    groupId?: string
    embeddedUrls?: EmbeddedUrl[]
  }): Post {
    const now = new Date()

    // Validate topics
    if (input.topics.length === 0 || input.topics.length > 5) {
      throw new Error('Post must have 1-5 topics')
    }

    const validated = postSchema.parse({
      id: uuidv4(),
      type: 'native' as PostTypeEnum,
      authorId: input.authorId,
      groupId: input.groupId,
      title: input.title,
      content: input.content,
      embeddedUrls: input.embeddedUrls,
      sourceUrl: undefined,
      sourcePreview: undefined,
      topics: input.topics,
      status: 'active' as PostStatus,
      discussionThreadId: undefined,
      discussionCount: 0,
      createdAt: now,
      updatedAt: now,
    })

    return new Post(
      validated.id,
      validated.type,
      validated.authorId,
      validated.groupId,
      validated.title,
      validated.content,
      validated.embeddedUrls,
      validated.sourceUrl,
      validated.sourcePreview,
      validated.topics,
      validated.status,
      validated.discussionThreadId,
      validated.discussionCount,
      validated.createdAt,
      validated.updatedAt
    )
  }

  /**
   * Factory: Create new import post
   */
  static createImport(input: {
    authorId: string
    sourceUrl: string
    preview: MediaPreview
    topics: string[]
    groupId?: string
  }): Post {
    const now = new Date()

    // Validate topics
    if (input.topics.length === 0 || input.topics.length > 5) {
      throw new Error('Post must have 1-5 topics')
    }

    // Determine platform from URL or preview
    let type: PostTypeEnum = 'other'
    if (input.sourceUrl.includes('instagram.com')) type = 'instagram'
    else if (input.sourceUrl.includes('tiktok.com')) type = 'tiktok'
    else if (input.sourceUrl.includes('twitter.com') || input.sourceUrl.includes('x.com')) type = 'twitter'
    else if (input.sourceUrl.includes('facebook.com')) type = 'facebook'

    const validated = postSchema.parse({
      id: uuidv4(),
      type,
      authorId: input.authorId,
      groupId: input.groupId,
      title: undefined,
      content: undefined,
      embeddedUrls: undefined,
      sourceUrl: input.sourceUrl,
      sourcePreview: input.preview,
      topics: input.topics,
      status: 'active' as PostStatus,
      discussionThreadId: undefined,
      discussionCount: 0,
      createdAt: now,
      updatedAt: now,
    })

    return new Post(
      validated.id,
      validated.type,
      validated.authorId,
      validated.groupId,
      validated.title,
      validated.content,
      validated.embeddedUrls,
      validated.sourceUrl,
      validated.sourcePreview,
      validated.topics,
      validated.status,
      validated.discussionThreadId,
      validated.discussionCount,
      validated.createdAt,
      validated.updatedAt
    )
  }

  /**
   * Factory: Reconstitute from storage
   */
  static fromData(data: PostType): Post {
    const validated = postSchema.parse(data)

    return new Post(
      validated.id,
      validated.type,
      validated.authorId,
      validated.groupId,
      validated.title,
      validated.content,
      validated.embeddedUrls,
      validated.sourceUrl,
      validated.sourcePreview,
      validated.topics,
      validated.status,
      validated.discussionThreadId,
      validated.discussionCount,
      validated.createdAt,
      validated.updatedAt
    )
  }

  /**
   * Open discussion thread on this post
   */
  openDiscussion(threadId: string): Post {
    if (this.discussionThreadId) {
      throw new Error('Post already has a discussion thread')
    }

    return new Post(
      this.id,
      this.type,
      this.authorId,
      this.groupId,
      this.title,
      this.content,
      this.embeddedUrls,
      this.sourceUrl,
      this.sourcePreview,
      this.topics,
      this.status,
      threadId,
      this.discussionCount,
      this.createdAt,
      new Date()
    )
  }

  /**
   * Increment discussion participant count
   */
  incrementDiscussionCount(): Post {
    return new Post(
      this.id,
      this.type,
      this.authorId,
      this.groupId,
      this.title,
      this.content,
      this.embeddedUrls,
      this.sourceUrl,
      this.sourcePreview,
      this.topics,
      this.status,
      this.discussionThreadId,
      this.discussionCount + 1,
      this.createdAt,
      new Date()
    )
  }

  /**
   * Archive post
   */
  archive(): Post {
    return new Post(
      this.id,
      this.type,
      this.authorId,
      this.groupId,
      this.title,
      this.content,
      this.embeddedUrls,
      this.sourceUrl,
      this.sourcePreview,
      this.topics,
      'archived',
      this.discussionThreadId,
      this.discussionCount,
      this.createdAt,
      new Date()
    )
  }

  /**
   * Flag post for moderation
   */
  flag(): Post {
    return new Post(
      this.id,
      this.type,
      this.authorId,
      this.groupId,
      this.title,
      this.content,
      this.embeddedUrls,
      this.sourceUrl,
      this.sourcePreview,
      this.topics,
      'flagged',
      this.discussionThreadId,
      this.discussionCount,
      this.createdAt,
      new Date()
    )
  }

  /**
   * Check if post is native
   */
  get isNative(): boolean {
    return this.type === 'native'
  }

  /**
   * Check if post is imported
   */
  get isImport(): boolean {
    return this.type !== 'native'
  }

  /**
   * Check if post has discussion
   */
  get hasDiscussion(): boolean {
    return this.discussionThreadId !== undefined
  }

  /**
   * Check if post matches topic filter
   */
  matchesTopic(topic: string): boolean {
    return this.topics.some((t) => t.toLowerCase() === topic.toLowerCase())
  }

  /**
   * Check if post matches any of the given topics
   */
  matchesAnyTopic(topics: string[]): boolean {
    return topics.some((topic) => this.matchesTopic(topic))
  }

  /**
   * Serialize to plain object for storage
   */
  toJSON(): PostType {
    return {
      id: this.id,
      type: this.type,
      authorId: this.authorId,
      groupId: this.groupId,
      title: this.title,
      content: this.content,
      embeddedUrls: this.embeddedUrls ? [...this.embeddedUrls] : undefined,
      sourceUrl: this.sourceUrl,
      sourcePreview: this.sourcePreview,
      topics: [...this.topics],
      status: this.status,
      discussionThreadId: this.discussionThreadId,
      discussionCount: this.discussionCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
