// apps/api/src/modules/feed/repos/ThreadRepo.ts
// Repository interface for discussion threads

import type { DiscussionThread as DiscussionThreadType, ThreadPost as ThreadPostType } from '@togetheros/types'

export interface ThreadRepo {
  // Thread operations
  createThread(input: {
    postId: string
    title: string
    topic: string
  }): Promise<DiscussionThreadType>

  findThreadById(id: string): Promise<DiscussionThreadType | null>
  findThreadByPostId(postId: string): Promise<DiscussionThreadType | null>
  listThreads(filters?: {
    topic?: string
    limit?: number
    offset?: number
  }): Promise<DiscussionThreadType[]>
  deleteThread(id: string): Promise<void>

  // Thread post operations
  createPost(input: {
    threadId: string
    authorId: string
    content: string
    parentId?: string
  }): Promise<ThreadPostType>

  findPostById(id: string): Promise<ThreadPostType | null>
  listPosts(threadId: string): Promise<ThreadPostType[]>
  updatePost(id: string, content: string): Promise<ThreadPostType>
  deletePost(id: string): Promise<void>

  // Statistics
  getThreadStats(threadId: string): Promise<{
    postCount: number
    participantCount: number
  }>
}
