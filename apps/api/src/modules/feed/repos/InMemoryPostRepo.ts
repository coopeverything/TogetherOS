// apps/api/src/modules/feed/repos/InMemoryPostRepo.ts
// In-memory implementation of PostRepo for testing and fixtures

import type { PostRepo, PostFilters, CreateNativePostInput, CreateImportPostInput } from './PostRepo'
import type { Post as PostType } from '@togetheros/types'
import { Post } from '../entities/Post'

/**
 * In-memory post repository
 * Stores posts in memory (non-persistent)
 */
export class InMemoryPostRepo implements PostRepo {
  private posts: Map<string, Post>

  constructor(initialPosts: PostType[] = []) {
    this.posts = new Map()

    // Load initial data
    initialPosts.forEach((data) => {
      const post = Post.fromData(data)
      this.posts.set(post.id, post)
    })
  }

  async createNative(input: CreateNativePostInput): Promise<PostType> {
    const post = Post.createNative(input)
    this.posts.set(post.id, post)
    return post.toJSON()
  }

  async createImport(input: CreateImportPostInput): Promise<PostType> {
    const post = Post.createImport(input)
    this.posts.set(post.id, post)
    return post.toJSON()
  }

  async findById(id: string): Promise<PostType | null> {
    const post = this.posts.get(id)
    return post ? post.toJSON() : null
  }

  async list(filters: PostFilters = {}): Promise<PostType[]> {
    let posts = Array.from(this.posts.values())

    // Apply topic filter
    if (filters.topic) {
      posts = posts.filter((p) => p.matchesTopic(filters.topic!))
    }

    // Apply author filter
    if (filters.authorId) {
      posts = posts.filter((p) => p.authorId === filters.authorId)
    }

    // Apply group filter
    if (filters.groupId) {
      posts = posts.filter((p) => p.groupId === filters.groupId)
    }

    // Apply status filter
    if (filters.status) {
      posts = posts.filter((p) => p.status === filters.status)
    }

    // Apply type filter
    if (filters.type) {
      posts = posts.filter((p) => p.type === filters.type)
    }

    // Sort by newest first
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // Apply pagination
    const offset = filters.offset ?? 0
    const limit = filters.limit ?? 20

    return posts.slice(offset, offset + limit).map((p) => p.toJSON())
  }

  async count(filters: PostFilters = {}): Promise<number> {
    let posts = Array.from(this.posts.values())

    // Apply same filters as list
    if (filters.topic) {
      posts = posts.filter((p) => p.matchesTopic(filters.topic!))
    }
    if (filters.authorId) {
      posts = posts.filter((p) => p.authorId === filters.authorId)
    }
    if (filters.groupId) {
      posts = posts.filter((p) => p.groupId === filters.groupId)
    }
    if (filters.status) {
      posts = posts.filter((p) => p.status === filters.status)
    }
    if (filters.type) {
      posts = posts.filter((p) => p.type === filters.type)
    }

    return posts.length
  }

  async openDiscussion(postId: string, threadId: string): Promise<void> {
    const post = this.posts.get(postId)
    if (!post) {
      throw new Error(`Post ${postId} not found`)
    }

    const updated = post.openDiscussion(threadId)
    this.posts.set(postId, updated)
  }

  async incrementDiscussionCount(postId: string): Promise<void> {
    const post = this.posts.get(postId)
    if (!post) {
      throw new Error(`Post ${postId} not found`)
    }

    const updated = post.incrementDiscussionCount()
    this.posts.set(postId, updated)
  }

  async archive(postId: string): Promise<void> {
    const post = this.posts.get(postId)
    if (!post) {
      throw new Error(`Post ${postId} not found`)
    }

    const updated = post.archive()
    this.posts.set(postId, updated)
  }

  async flag(postId: string): Promise<void> {
    const post = this.posts.get(postId)
    if (!post) {
      throw new Error(`Post ${postId} not found`)
    }

    const updated = post.flag()
    this.posts.set(postId, updated)
  }

  async delete(id: string): Promise<void> {
    this.posts.delete(id)
  }

  async getTopics(): Promise<string[]> {
    const topicsSet = new Set<string>()

    for (const post of this.posts.values()) {
      post.topics.forEach((topic) => topicsSet.add(topic))
    }

    return Array.from(topicsSet).sort()
  }
}
