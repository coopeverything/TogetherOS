// apps/api/src/modules/feed/__tests__/InMemoryPostRepo.test.ts
// Test suite for InMemoryPostRepo

import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryPostRepo } from '../repos/InMemoryPostRepo'

describe('InMemoryPostRepo', () => {
  let repo: InMemoryPostRepo

  // Use valid UUID v4 format (version 4 = digit 4 in position 13, variant 8-b in position 17)
  const testAuthorId = 'a0000000-0000-4000-a000-000000000001'
  const testGroupId = 'b0000000-0000-4000-b000-000000000001'

  beforeEach(() => {
    repo = new InMemoryPostRepo()
  })

  describe('createNative', () => {
    it('creates a native post', async () => {
      const post = await repo.createNative({
        authorId: testAuthorId,
        content: 'Test post content',
        topics: ['general'],
      })

      expect(post.id).toBeDefined()
      expect(post.type).toBe('native')
      expect(post.content).toBe('Test post content')
      expect(post.status).toBe('active')
    })

    it('creates a native post with group', async () => {
      const post = await repo.createNative({
        authorId: testAuthorId,
        content: 'Group post',
        topics: ['discussion'],
        groupId: testGroupId,
      })

      expect(post.groupId).toBe(testGroupId)
    })
  })

  describe('createImport', () => {
    it('creates an import post', async () => {
      const post = await repo.createImport({
        authorId: testAuthorId,
        sourceUrl: 'https://instagram.com/p/abc123',
        preview: {
          title: 'Instagram Post',
          platform: 'instagram',
          fetchedAt: new Date(),
        },
        topics: ['social'],
      })

      expect(post.id).toBeDefined()
      expect(post.type).toBe('instagram')
      expect(post.sourceUrl).toBe('https://instagram.com/p/abc123')
    })
  })

  describe('findById', () => {
    it('returns post when found', async () => {
      const created = await repo.createNative({
        authorId: testAuthorId,
        content: 'Find me',
        topics: ['general'],
      })

      const found = await repo.findById(created.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
    })

    it('returns null for non-existent post', async () => {
      const found = await repo.findById('non-existent-id')
      expect(found).toBeNull()
    })
  })

  describe('list', () => {
    beforeEach(async () => {
      // Seed test data
      await repo.createNative({
        authorId: testAuthorId,
        content: 'Post 1',
        topics: ['general'],
      })

      await repo.createNative({
        authorId: testAuthorId,
        content: 'Post 2',
        topics: ['help'],
        groupId: testGroupId,
      })

      await repo.createNative({
        authorId: 'c0000000-0000-4000-8000-000000000002',
        content: 'Post 3',
        topics: ['general', 'discussion'],
      })

      await repo.createImport({
        authorId: testAuthorId,
        sourceUrl: 'https://instagram.com/p/123',
        preview: { title: 'Test Import', platform: 'instagram', fetchedAt: new Date() },
        topics: ['social'],
      })
    })

    it('returns all posts without filters', async () => {
      const posts = await repo.list()
      expect(posts.length).toBe(4)
    })

    it('filters by topic', async () => {
      const generalPosts = await repo.list({ topic: 'general' })
      expect(generalPosts.length).toBe(2)
    })

    it('filters by authorId', async () => {
      const authorPosts = await repo.list({ authorId: testAuthorId })
      expect(authorPosts.length).toBe(3)
    })

    it('filters by groupId', async () => {
      const groupPosts = await repo.list({ groupId: testGroupId })
      expect(groupPosts.length).toBe(1)
    })

    it('filters by type', async () => {
      const nativePosts = await repo.list({ type: 'native' })
      expect(nativePosts.length).toBe(3)

      const instagramPosts = await repo.list({ type: 'instagram' })
      expect(instagramPosts.length).toBe(1)
    })

    it('applies pagination', async () => {
      const page1 = await repo.list({ limit: 2, offset: 0 })
      expect(page1.length).toBe(2)

      const page2 = await repo.list({ limit: 2, offset: 2 })
      expect(page2.length).toBe(2)
    })

    it('sorts by newest first', async () => {
      const posts = await repo.list()
      for (let i = 0; i < posts.length - 1; i++) {
        expect(posts[i].createdAt.getTime()).toBeGreaterThanOrEqual(
          posts[i + 1].createdAt.getTime()
        )
      }
    })
  })

  describe('count', () => {
    beforeEach(async () => {
      for (let i = 0; i < 5; i++) {
        await repo.createNative({
          authorId: testAuthorId,
          content: `Post ${i}`,
          topics: i % 2 === 0 ? ['general'] : ['help'],
        })
      }
    })

    it('counts all posts', async () => {
      const count = await repo.count()
      expect(count).toBe(5)
    })

    it('counts with filters', async () => {
      const generalCount = await repo.count({ topic: 'general' })
      expect(generalCount).toBe(3)

      const helpCount = await repo.count({ topic: 'help' })
      expect(helpCount).toBe(2)
    })
  })

  describe('openDiscussion', () => {
    it('opens a discussion on a post', async () => {
      const created = await repo.createNative({
        authorId: testAuthorId,
        content: 'Discussion post',
        topics: ['general'],
      })

      await repo.openDiscussion(created.id, 'thread-123')

      const found = await repo.findById(created.id)
      expect(found?.discussionThreadId).toBe('thread-123')
    })

    it('throws error for non-existent post', async () => {
      await expect(
        repo.openDiscussion('non-existent', 'thread-123')
      ).rejects.toThrow('Post non-existent not found')
    })
  })

  describe('incrementDiscussionCount', () => {
    it('increments discussion count', async () => {
      const created = await repo.createNative({
        authorId: testAuthorId,
        content: 'Discussion post',
        topics: ['general'],
      })

      await repo.incrementDiscussionCount(created.id)

      const found = await repo.findById(created.id)
      expect(found?.discussionCount).toBe(1)
    })

    it('throws error for non-existent post', async () => {
      await expect(
        repo.incrementDiscussionCount('non-existent')
      ).rejects.toThrow('Post non-existent not found')
    })
  })

  describe('archive', () => {
    it('archives a post', async () => {
      const created = await repo.createNative({
        authorId: testAuthorId,
        content: 'To archive',
        topics: ['general'],
      })

      await repo.archive(created.id)

      const found = await repo.findById(created.id)
      expect(found?.status).toBe('archived')
    })

    it('throws error for non-existent post', async () => {
      await expect(repo.archive('non-existent')).rejects.toThrow(
        'Post non-existent not found'
      )
    })
  })

  describe('flag', () => {
    it('flags a post', async () => {
      const created = await repo.createNative({
        authorId: testAuthorId,
        content: 'To flag',
        topics: ['general'],
      })

      await repo.flag(created.id)

      const found = await repo.findById(created.id)
      expect(found?.status).toBe('flagged')
    })

    it('throws error for non-existent post', async () => {
      await expect(repo.flag('non-existent')).rejects.toThrow(
        'Post non-existent not found'
      )
    })
  })

  describe('delete', () => {
    it('deletes a post', async () => {
      const created = await repo.createNative({
        authorId: testAuthorId,
        content: 'To delete',
        topics: ['general'],
      })

      await repo.delete(created.id)

      const found = await repo.findById(created.id)
      expect(found).toBeNull()
    })
  })

  describe('getTopics', () => {
    it('returns all unique topics', async () => {
      await repo.createNative({
        authorId: testAuthorId,
        content: 'Post 1',
        topics: ['general', 'help'],
      })

      await repo.createNative({
        authorId: testAuthorId,
        content: 'Post 2',
        topics: ['general', 'discussion'],
      })

      const topics = await repo.getTopics()

      expect(topics).toContain('general')
      expect(topics).toContain('help')
      expect(topics).toContain('discussion')
      expect(topics.length).toBe(3) // No duplicates
    })

    it('returns sorted topics', async () => {
      await repo.createNative({
        authorId: testAuthorId,
        content: 'Post',
        topics: ['zebra', 'apple', 'mango'],
      })

      const topics = await repo.getTopics()

      expect(topics[0]).toBe('apple')
      expect(topics[1]).toBe('mango')
      expect(topics[2]).toBe('zebra')
    })
  })
})
