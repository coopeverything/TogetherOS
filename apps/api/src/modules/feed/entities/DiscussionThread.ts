// apps/api/src/modules/feed/entities/DiscussionThread.ts
// Discussion thread entity (forum thread opened from feed post)

import { v4 as uuidv4 } from 'uuid'
import { discussionThreadSchema } from '@togetheros/validators'
import type { DiscussionThread as DiscussionThreadType } from '@togetheros/types'

export class DiscussionThread {
  private data: DiscussionThreadType

  private constructor(data: DiscussionThreadType) {
    this.data = discussionThreadSchema.parse(data)
  }

  /**
   * Create a new discussion thread from a feed post
   */
  static create(input: {
    postId: string
    title: string
    topic: string
  }): DiscussionThread {
    const now = new Date()

    return new DiscussionThread({
      id: uuidv4(),
      postId: input.postId,
      title: input.title,
      topic: input.topic,
      participantCount: 0,
      postCount: 0,
      createdAt: now,
      lastActivityAt: now,
    })
  }

  /**
   * Load from database/storage
   */
  static fromData(data: DiscussionThreadType): DiscussionThread {
    return new DiscussionThread(data)
  }

  /**
   * Increment post count when new ThreadPost added
   */
  incrementPostCount(): DiscussionThread {
    return new DiscussionThread({
      ...this.data,
      postCount: this.data.postCount + 1,
      lastActivityAt: new Date(),
    })
  }

  /**
   * Update participant count
   */
  updateParticipantCount(count: number): DiscussionThread {
    return new DiscussionThread({
      ...this.data,
      participantCount: count,
      lastActivityAt: new Date(),
    })
  }

  /**
   * Serialize to JSON
   */
  toJSON(): DiscussionThreadType {
    return { ...this.data }
  }

  // Getters
  get id(): string {
    return this.data.id
  }

  get postId(): string {
    return this.data.postId
  }

  get title(): string {
    return this.data.title
  }

  get topic(): string {
    return this.data.topic
  }

  get participantCount(): number {
    return this.data.participantCount
  }

  get postCount(): number {
    return this.data.postCount
  }

  get createdAt(): Date {
    return this.data.createdAt
  }

  get lastActivityAt(): Date {
    return this.data.lastActivityAt
  }
}
