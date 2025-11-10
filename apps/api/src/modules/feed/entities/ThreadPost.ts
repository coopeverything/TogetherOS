// apps/api/src/modules/feed/entities/ThreadPost.ts
// Individual post within a discussion thread

import { v4 as uuidv4 } from 'uuid'
import { threadPostSchema } from '@togetheros/validators'
import type { ThreadPost as ThreadPostType } from '@togetheros/types'

export class ThreadPost {
  private data: ThreadPostType

  private constructor(data: ThreadPostType) {
    this.data = threadPostSchema.parse(data)
  }

  /**
   * Create a new thread post
   */
  static create(input: {
    threadId: string
    authorId: string
    content: string
    parentId?: string
  }): ThreadPost {
    if (input.content.length < 1 || input.content.length > 5000) {
      throw new Error('Content must be 1-5000 characters')
    }

    const now = new Date()

    return new ThreadPost({
      id: uuidv4(),
      threadId: input.threadId,
      authorId: input.authorId,
      content: input.content,
      parentId: input.parentId,
      createdAt: now,
      updatedAt: now,
    })
  }

  /**
   * Load from database/storage
   */
  static fromData(data: ThreadPostType): ThreadPost {
    return new ThreadPost(data)
  }

  /**
   * Update post content
   */
  updateContent(content: string): ThreadPost {
    if (content.length < 1 || content.length > 5000) {
      throw new Error('Content must be 1-5000 characters')
    }

    return new ThreadPost({
      ...this.data,
      content,
      updatedAt: new Date(),
    })
  }

  /**
   * Serialize to JSON
   */
  toJSON(): ThreadPostType {
    return { ...this.data }
  }

  // Getters
  get id(): string {
    return this.data.id
  }

  get threadId(): string {
    return this.data.threadId
  }

  get authorId(): string {
    return this.data.authorId
  }

  get content(): string {
    return this.data.content
  }

  get parentId(): string | undefined {
    return this.data.parentId
  }

  get createdAt(): Date {
    return this.data.createdAt
  }

  get updatedAt(): Date {
    return this.data.updatedAt
  }
}
