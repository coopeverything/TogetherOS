// apps/api/src/modules/feed/repos/InMemoryThreadRepo.ts
// In-memory implementation of ThreadRepo (for MVP/testing)

import { DiscussionThread, ThreadPost } from '../entities'
import type { ThreadRepo } from './ThreadRepo'
import type { DiscussionThread as DiscussionThreadType, ThreadPost as ThreadPostType } from '@togetheros/types'

export class InMemoryThreadRepo implements ThreadRepo {
  private threads: Map<string, DiscussionThread> = new Map()
  private posts: Map<string, ThreadPost> = new Map()

  constructor(initialThreads: DiscussionThreadType[] = [], initialPosts: ThreadPostType[] = []) {
    initialThreads.forEach(t => this.threads.set(t.id, DiscussionThread.fromData(t)))
    initialPosts.forEach(p => this.posts.set(p.id, ThreadPost.fromData(p)))
  }

  async createThread(input: { postId: string; title: string; topic: string }): Promise<DiscussionThreadType> {
    const thread = DiscussionThread.create(input)
    this.threads.set(thread.id, thread)
    return thread.toJSON()
  }

  async findThreadById(id: string): Promise<DiscussionThreadType | null> {
    const thread = this.threads.get(id)
    return thread ? thread.toJSON() : null
  }

  async findThreadByPostId(postId: string): Promise<DiscussionThreadType | null> {
    const thread = Array.from(this.threads.values()).find(t => t.postId === postId)
    return thread ? thread.toJSON() : null
  }

  async listThreads(filters?: { topic?: string; limit?: number; offset?: number }): Promise<DiscussionThreadType[]> {
    let threads = Array.from(this.threads.values())

    if (filters?.topic) {
      threads = threads.filter(t => t.topic === filters.topic)
    }

    // Sort by last activity
    threads.sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime())

    const offset = filters?.offset ?? 0
    const limit = filters?.limit ?? 20

    return threads.slice(offset, offset + limit).map(t => t.toJSON())
  }

  async deleteThread(id: string): Promise<void> {
    this.threads.delete(id)
    // Also delete all posts in thread
    Array.from(this.posts.values())
      .filter(p => p.threadId === id)
      .forEach(p => this.posts.delete(p.id))
  }

  async createPost(input: { threadId: string; authorId: string; content: string; parentId?: string }): Promise<ThreadPostType> {
    const post = ThreadPost.create(input)
    this.posts.set(post.id, post)

    // Update thread stats
    const thread = this.threads.get(input.threadId)
    if (thread) {
      const stats = await this.getThreadStats(input.threadId)
      const updated = thread
        .incrementPostCount()
        .updateParticipantCount(stats.participantCount)
      this.threads.set(thread.id, updated)
    }

    return post.toJSON()
  }

  async findPostById(id: string): Promise<ThreadPostType | null> {
    const post = this.posts.get(id)
    return post ? post.toJSON() : null
  }

  async listPosts(threadId: string): Promise<ThreadPostType[]> {
    const posts = Array.from(this.posts.values())
      .filter(p => p.threadId === threadId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    return posts.map(p => p.toJSON())
  }

  async updatePost(id: string, content: string): Promise<ThreadPostType> {
    const post = this.posts.get(id)
    if (!post) {
      throw new Error('Post not found')
    }
    const updated = post.updateContent(content)
    this.posts.set(id, updated)
    return updated.toJSON()
  }

  async deletePost(id: string): Promise<void> {
    this.posts.delete(id)
  }

  async getThreadStats(threadId: string): Promise<{ postCount: number; participantCount: number }> {
    const posts = Array.from(this.posts.values()).filter(p => p.threadId === threadId)
    const uniqueAuthors = new Set(posts.map(p => p.authorId))
    return {
      postCount: posts.length,
      participantCount: uniqueAuthors.size,
    }
  }
}
