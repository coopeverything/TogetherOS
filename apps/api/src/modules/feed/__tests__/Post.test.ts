// apps/api/src/modules/feed/__tests__/Post.test.ts
// Test suite for Post entity

import { describe, it, expect } from 'vitest'
import { Post } from '../entities/Post'

describe('Post Entity', () => {
  // Use valid UUID v4 format (version 4 = digit 4 in position 13, variant 8-b in position 17)
  const testAuthorId = 'a0000000-0000-4000-a000-000000000001'

  describe('createNative', () => {
    it('creates a native post with correct defaults', () => {
      const post = Post.createNative({
        authorId: testAuthorId,
        content: 'This is test content for my post',
        title: 'Test Title for Post',
        topics: ['general'],
      })

      expect(post.id).toBeDefined()
      expect(post.type).toBe('native')
      expect(post.authorId).toBe(testAuthorId)
      expect(post.content).toBe('This is test content for my post')
      expect(post.title).toBe('Test Title for Post')
      expect(post.topics).toContain('general')
      expect(post.status).toBe('active')
      expect(post.discussionCount).toBe(0)
      expect(post.discussionThreadId).toBeUndefined()
      expect(post.createdAt).toBeInstanceOf(Date)
    })

    it('creates a native post with group', () => {
      const groupId = 'b0000000-0000-4000-b000-000000000001'
      const post = Post.createNative({
        authorId: testAuthorId,
        content: 'Group post content here',
        topics: ['discussion'],
        groupId,
      })

      expect(post.groupId).toBe(groupId)
    })

    it('creates a native post with multiple topics', () => {
      const post = Post.createNative({
        authorId: testAuthorId,
        content: 'Multi-topic post content',
        topics: ['general', 'help', 'community'],
      })

      expect(post.topics).toHaveLength(3)
      expect(post.topics).toContain('general')
      expect(post.topics).toContain('help')
    })

    it('throws error when topics is empty', () => {
      expect(() =>
        Post.createNative({
          authorId: testAuthorId,
          content: 'No topics content',
          topics: [],
        })
      ).toThrow('Post must have 1-5 topics')
    })

    it('throws error when topics exceed 5', () => {
      expect(() =>
        Post.createNative({
          authorId: testAuthorId,
          content: 'Too many topics',
          topics: ['t1', 't2', 't3', 't4', 't5', 't6'],
        })
      ).toThrow('Post must have 1-5 topics')
    })
  })

  describe('createImport', () => {
    it('creates an import post from Instagram', () => {
      const post = Post.createImport({
        authorId: testAuthorId,
        sourceUrl: 'https://instagram.com/p/abc123',
        preview: {
          title: 'Instagram Post',
          description: 'A great post',
          platform: 'instagram',
          fetchedAt: new Date(),
        },
        topics: ['social'],
      })

      expect(post.type).toBe('instagram')
      expect(post.sourceUrl).toBe('https://instagram.com/p/abc123')
      expect(post.isImport).toBe(true)
      expect(post.isNative).toBe(false)
    })

    it('creates an import post from Twitter', () => {
      const post = Post.createImport({
        authorId: testAuthorId,
        sourceUrl: 'https://twitter.com/user/status/123',
        preview: {
          title: 'Tweet',
          description: 'A tweet',
          platform: 'twitter',
          fetchedAt: new Date(),
        },
        topics: ['news'],
      })

      expect(post.type).toBe('twitter')
    })

    it('creates an import post from X.com', () => {
      const post = Post.createImport({
        authorId: testAuthorId,
        sourceUrl: 'https://x.com/user/status/123',
        preview: {
          title: 'Post',
          description: 'A post',
          platform: 'twitter',
          fetchedAt: new Date(),
        },
        topics: ['news'],
      })

      expect(post.type).toBe('twitter')
    })

    it('creates an import post from TikTok', () => {
      const post = Post.createImport({
        authorId: testAuthorId,
        sourceUrl: 'https://tiktok.com/@user/video/123',
        preview: {
          title: 'TikTok Video',
          platform: 'tiktok',
          fetchedAt: new Date(),
        },
        topics: ['entertainment'],
      })

      expect(post.type).toBe('tiktok')
    })

    it('creates an import post from unknown source as other', () => {
      const post = Post.createImport({
        authorId: testAuthorId,
        sourceUrl: 'https://example.com/article',
        preview: {
          title: 'Article',
          platform: 'other',
          fetchedAt: new Date(),
        },
        topics: ['reading'],
      })

      expect(post.type).toBe('other')
    })
  })

  describe('fromData', () => {
    it('reconstitutes post from storage data', () => {
      const testPostId = 'd0000000-0000-4000-9000-000000000123'
      const data = {
        id: testPostId,
        type: 'native' as const,
        authorId: testAuthorId,
        content: 'Stored content',
        topics: ['general'],
        status: 'active' as const,
        discussionCount: 5,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      }

      const post = Post.fromData(data)

      expect(post.id).toBe(testPostId)
      expect(post.content).toBe('Stored content')
      expect(post.discussionCount).toBe(5)
    })
  })

  describe('openDiscussion', () => {
    it('opens a discussion thread', () => {
      const post = Post.createNative({
        authorId: testAuthorId,
        content: 'Discussion content',
        topics: ['discuss'],
      })

      const threadId = 'thread-123'
      const updated = post.openDiscussion(threadId)

      expect(updated.discussionThreadId).toBe(threadId)
      expect(updated.hasDiscussion).toBe(true)
    })

    it('throws error when discussion already exists', () => {
      const post = Post.createNative({
        authorId: testAuthorId,
        content: 'Discussion content',
        topics: ['discuss'],
      })

      const withDiscussion = post.openDiscussion('thread-1')

      expect(() => withDiscussion.openDiscussion('thread-2')).toThrow(
        'Post already has a discussion thread'
      )
    })
  })

  describe('incrementDiscussionCount', () => {
    it('increments discussion count', () => {
      const post = Post.createNative({
        authorId: testAuthorId,
        content: 'Content',
        topics: ['general'],
      })

      expect(post.discussionCount).toBe(0)

      const updated = post.incrementDiscussionCount()
      expect(updated.discussionCount).toBe(1)

      const updated2 = updated.incrementDiscussionCount()
      expect(updated2.discussionCount).toBe(2)
    })
  })

  describe('archive', () => {
    it('archives a post', () => {
      const post = Post.createNative({
        authorId: testAuthorId,
        content: 'To archive',
        topics: ['general'],
      })

      const archived = post.archive()

      expect(archived.status).toBe('archived')
    })
  })

  describe('flag', () => {
    it('flags a post for moderation', () => {
      const post = Post.createNative({
        authorId: testAuthorId,
        content: 'To flag',
        topics: ['general'],
      })

      const flagged = post.flag()

      expect(flagged.status).toBe('flagged')
    })
  })

  describe('helper methods', () => {
    it('isNative returns true for native posts', () => {
      const post = Post.createNative({
        authorId: testAuthorId,
        content: 'Native',
        topics: ['general'],
      })

      expect(post.isNative).toBe(true)
      expect(post.isImport).toBe(false)
    })

    it('isImport returns true for imported posts', () => {
      const post = Post.createImport({
        authorId: testAuthorId,
        sourceUrl: 'https://instagram.com/p/123',
        preview: { title: 'Test Import', platform: 'instagram', fetchedAt: new Date() },
        topics: ['social'],
      })

      expect(post.isImport).toBe(true)
      expect(post.isNative).toBe(false)
    })

    it('hasDiscussion returns true when thread exists', () => {
      const post = Post.createNative({
        authorId: testAuthorId,
        content: 'Content',
        topics: ['general'],
      })

      expect(post.hasDiscussion).toBe(false)

      const withThread = post.openDiscussion('thread-123')
      expect(withThread.hasDiscussion).toBe(true)
    })

    it('matchesTopic returns true for matching topic', () => {
      const post = Post.createNative({
        authorId: testAuthorId,
        content: 'Content',
        topics: ['General', 'Help'],
      })

      expect(post.matchesTopic('general')).toBe(true) // case insensitive
      expect(post.matchesTopic('help')).toBe(true)
      expect(post.matchesTopic('other')).toBe(false)
    })

    it('matchesAnyTopic returns true if any topic matches', () => {
      const post = Post.createNative({
        authorId: testAuthorId,
        content: 'Content',
        topics: ['general'],
      })

      expect(post.matchesAnyTopic(['general', 'help'])).toBe(true)
      expect(post.matchesAnyTopic(['other', 'random'])).toBe(false)
    })
  })

  describe('toJSON', () => {
    it('converts post to plain object', () => {
      const post = Post.createNative({
        authorId: testAuthorId,
        content: 'JSON test content',
        title: 'Test Title Here',
        topics: ['general', 'test'],
      })

      const json = post.toJSON()

      expect(json.id).toBe(post.id)
      expect(json.type).toBe('native')
      expect(json.content).toBe('JSON test content')
      expect(json.topics).toEqual(['general', 'test'])
      expect(json.createdAt).toBeInstanceOf(Date)
    })
  })
})
