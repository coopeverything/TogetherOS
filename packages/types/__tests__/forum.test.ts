/**
 * Tests for Forum types and entity creation
 * Tests type validation and entity construction patterns
 */

import { describe, it, expect } from 'vitest'
import type {
  Topic,
  Post,
  Reply,
  Citation,
  Reaction,
  Flag,
  Edit,
  TopicCategory,
  TopicStatus,
  ReactionType,
  FlagReason,
  FlagStatus,
  PostPosition,
} from '../src/forum'

describe('Forum Types', () => {
  // Test data factory functions
  const createTopic = (overrides: Partial<Topic> = {}): Topic => ({
    id: 'a0000000-0000-4000-a000-000000000001',
    title: 'How can we improve our community garden?',
    slug: 'how-can-we-improve-our-community-garden',
    description: 'Discussion about expanding and maintaining the community garden project.',
    authorId: 'user-001',
    category: 'general',
    tags: ['community', 'garden', 'sustainability'],
    status: 'open',
    isPinned: false,
    isLocked: false,
    postCount: 5,
    participantCount: 3,
    lastActivityAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

  const createPost = (overrides: Partial<Post> = {}): Post => ({
    id: 'post-001',
    topicId: 'topic-001',
    authorId: 'user-001',
    content: 'I think we should add more raised beds...',
    citations: [],
    replyCount: 2,
    reactions: [],
    editHistory: [],
    flags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

  const createReply = (overrides: Partial<Reply> = {}): Reply => ({
    id: 'reply-001',
    postId: 'post-001',
    authorId: 'user-002',
    content: 'I agree, raised beds would be great!',
    citations: [],
    reactions: [],
    editHistory: [],
    flags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

  describe('Topic', () => {
    it('should create a valid topic with required fields', () => {
      const topic = createTopic()

      expect(topic.id).toBeDefined()
      expect(topic.title).toBe('How can we improve our community garden?')
      expect(topic.slug).toBe('how-can-we-improve-our-community-garden')
      expect(topic.authorId).toBe('user-001')
      expect(topic.category).toBe('general')
      expect(topic.status).toBe('open')
    })

    it('should support all topic categories', () => {
      const categories: TopicCategory[] = ['general', 'proposal', 'question', 'deliberation', 'announcement']

      categories.forEach(category => {
        const topic = createTopic({ category })
        expect(topic.category).toBe(category)
      })
    })

    it('should support all topic statuses', () => {
      const statuses: TopicStatus[] = ['open', 'resolved', 'archived', 'locked']

      statuses.forEach(status => {
        const topic = createTopic({ status })
        expect(topic.status).toBe(status)
      })
    })

    it('should support proposal promotion', () => {
      const topic = createTopic({
        category: 'proposal',
        promotionStatus: 'eligible',
        supporterCount: 10,
        linkedProposalId: undefined,
      })

      expect(topic.promotionStatus).toBe('eligible')
      expect(topic.supporterCount).toBe(10)
    })

    it('should support pinned topics', () => {
      const topic = createTopic({ isPinned: true })
      expect(topic.isPinned).toBe(true)
    })

    it('should support locked topics', () => {
      const topic = createTopic({ isLocked: true })
      expect(topic.isLocked).toBe(true)
    })

    it('should support group-scoped topics', () => {
      const topic = createTopic({ groupId: 'group-001' })
      expect(topic.groupId).toBe('group-001')
    })

    it('should support cooperation path classification', () => {
      const topic = createTopic({
        cooperationPath: 'social-economy',
        tags: ['timebanking', 'mutual-aid'],
      })

      expect(topic.cooperationPath).toBe('social-economy')
      expect(topic.tags).toContain('timebanking')
    })

    it('should support soft delete', () => {
      const topic = createTopic({ deletedAt: new Date() })
      expect(topic.deletedAt).toBeInstanceOf(Date)
    })
  })

  describe('Post', () => {
    it('should create a valid post with required fields', () => {
      const post = createPost()

      expect(post.id).toBeDefined()
      expect(post.topicId).toBe('topic-001')
      expect(post.authorId).toBe('user-001')
      expect(post.content.length).toBeGreaterThan(0)
    })

    it('should support posts with positions (deliberation)', () => {
      const position: PostPosition = {
        stance: 'support',
        reasoning: 'I believe this will benefit the community because...',
        tradeoffs: ['Initial cost', 'Maintenance burden'],
        alternatives: ['Option A', 'Option B'],
      }

      const post = createPost({ position })

      expect(post.position?.stance).toBe('support')
      expect(post.position?.tradeoffs).toHaveLength(2)
      expect(post.position?.alternatives).toHaveLength(2)
    })

    it('should support all position stances', () => {
      const stances: PostPosition['stance'][] = ['support', 'oppose', 'neutral', 'question']

      stances.forEach(stance => {
        const post = createPost({
          position: {
            stance,
            reasoning: 'Test reasoning',
            tradeoffs: [],
          },
        })
        expect(post.position?.stance).toBe(stance)
      })
    })

    it('should support citations', () => {
      const citation: Citation = {
        id: 'citation-001',
        title: 'Community Garden Best Practices',
        url: 'https://example.com/garden-guide',
        snippet: 'Key excerpt from the source...',
        source: 'National Gardening Association',
        verified: true,
      }

      const post = createPost({ citations: [citation] })

      expect(post.citations).toHaveLength(1)
      expect(post.citations[0].verified).toBe(true)
    })

    it('should support reactions', () => {
      const reaction: Reaction = {
        id: 'reaction-001',
        userId: 'user-002',
        type: 'agree',
        createdAt: new Date(),
      }

      const post = createPost({ reactions: [reaction] })

      expect(post.reactions).toHaveLength(1)
      expect(post.reactions[0].type).toBe('agree')
    })

    it('should support edit history', () => {
      const edit: Edit = {
        id: 'edit-001',
        editedBy: 'user-001',
        previousContent: 'Original content',
        editReason: 'Fixed typo',
        editedAt: new Date(),
      }

      const post = createPost({ editHistory: [edit] })

      expect(post.editHistory).toHaveLength(1)
      expect(post.editHistory[0].editReason).toBe('Fixed typo')
    })

    it('should support flags', () => {
      const flag: Flag = {
        id: 'flag-001',
        contentId: 'post-001',
        contentType: 'post',
        flaggerId: 'user-003',
        reason: 'off-topic',
        details: 'This post does not relate to the topic',
        status: 'pending',
        createdAt: new Date(),
      }

      const post = createPost({ flags: [flag] })

      expect(post.flags).toHaveLength(1)
      expect(post.flags[0].reason).toBe('off-topic')
    })
  })

  describe('Reply', () => {
    it('should create a valid reply with required fields', () => {
      const reply = createReply()

      expect(reply.id).toBeDefined()
      expect(reply.postId).toBe('post-001')
      expect(reply.authorId).toBe('user-002')
      expect(reply.content.length).toBeGreaterThan(0)
    })

    it('should support reactions on replies', () => {
      const reply = createReply({
        reactions: [{
          id: 'reaction-001',
          userId: 'user-001',
          type: 'empathy',
          createdAt: new Date(),
        }],
      })

      expect(reply.reactions).toHaveLength(1)
      expect(reply.reactions[0].type).toBe('empathy')
    })
  })

  describe('Reaction types', () => {
    it('should support all reaction types', () => {
      const types: ReactionType[] = ['agree', 'disagree', 'insightful', 'empathy', 'question', 'concern']

      types.forEach(type => {
        const reaction: Reaction = {
          id: 'reaction-001',
          userId: 'user-001',
          type,
          createdAt: new Date(),
        }
        expect(reaction.type).toBe(type)
      })
    })
  })

  describe('Flag', () => {
    it('should support all flag reasons', () => {
      const reasons: FlagReason[] = ['spam', 'harassment', 'misinformation', 'off-topic', 'harmful']

      reasons.forEach(reason => {
        const flag: Flag = {
          id: 'flag-001',
          contentId: 'post-001',
          contentType: 'post',
          flaggerId: 'user-001',
          reason,
          status: 'pending',
          createdAt: new Date(),
        }
        expect(flag.reason).toBe(reason)
      })
    })

    it('should support all flag statuses', () => {
      const statuses: FlagStatus[] = ['pending', 'dismissed', 'action-taken']

      statuses.forEach(status => {
        const flag: Flag = {
          id: 'flag-001',
          contentId: 'post-001',
          contentType: 'post',
          flaggerId: 'user-001',
          reason: 'spam',
          status,
          createdAt: new Date(),
        }
        expect(flag.status).toBe(status)
      })
    })

    it('should support reviewed flags', () => {
      const flag: Flag = {
        id: 'flag-001',
        contentId: 'post-001',
        contentType: 'post',
        flaggerId: 'user-001',
        reason: 'spam',
        status: 'action-taken',
        reviewedBy: 'moderator-001',
        reviewedAt: new Date(),
        createdAt: new Date(),
      }

      expect(flag.reviewedBy).toBe('moderator-001')
      expect(flag.reviewedAt).toBeInstanceOf(Date)
    })

    it('should support flagging both posts and replies', () => {
      const postFlag: Flag = {
        id: 'flag-001',
        contentId: 'post-001',
        contentType: 'post',
        flaggerId: 'user-001',
        reason: 'spam',
        status: 'pending',
        createdAt: new Date(),
      }

      const replyFlag: Flag = {
        id: 'flag-002',
        contentId: 'reply-001',
        contentType: 'reply',
        flaggerId: 'user-001',
        reason: 'spam',
        status: 'pending',
        createdAt: new Date(),
      }

      expect(postFlag.contentType).toBe('post')
      expect(replyFlag.contentType).toBe('reply')
    })
  })

  describe('Citation', () => {
    it('should create a citation with all fields', () => {
      const citation: Citation = {
        id: 'citation-001',
        url: 'https://example.com/source',
        title: 'Source Title',
        snippet: 'Key excerpt from the source',
        source: 'Academic Journal',
        verified: true,
      }

      expect(citation.id).toBeDefined()
      expect(citation.url).toBe('https://example.com/source')
      expect(citation.verified).toBe(true)
    })

    it('should support citations without URL (internal reference)', () => {
      const citation: Citation = {
        id: 'citation-001',
        title: 'Previous Community Discussion',
        snippet: 'Referenced content',
        verified: true,
      }

      expect(citation.url).toBeUndefined()
      expect(citation.verified).toBe(true)
    })
  })

  describe('Edit', () => {
    it('should track edit history', () => {
      const edit: Edit = {
        id: 'edit-001',
        editedBy: 'user-001',
        previousContent: 'Original content before edit',
        editReason: 'Corrected spelling',
        editedAt: new Date(),
      }

      expect(edit.previousContent).toBe('Original content before edit')
      expect(edit.editReason).toBe('Corrected spelling')
    })

    it('should support edits without reason', () => {
      const edit: Edit = {
        id: 'edit-001',
        editedBy: 'user-001',
        previousContent: 'Original content',
        editedAt: new Date(),
      }

      expect(edit.editReason).toBeUndefined()
    })
  })

  describe('Type composition', () => {
    it('should compose a complete topic with posts, replies, and reactions', () => {
      const topic = createTopic({
        postCount: 2,
        participantCount: 4,
      })

      const post1 = createPost({
        topicId: topic.id,
        reactions: [
          { id: 'r1', userId: 'u2', type: 'agree', createdAt: new Date() },
          { id: 'r2', userId: 'u3', type: 'insightful', createdAt: new Date() },
        ],
      })

      const reply1 = createReply({
        postId: post1.id,
        reactions: [
          { id: 'r3', userId: 'u1', type: 'empathy', createdAt: new Date() },
        ],
      })

      // Verify the structure
      expect(topic.id).toBeDefined()
      expect(post1.topicId).toBe(topic.id)
      expect(reply1.postId).toBe(post1.id)
      expect(post1.reactions.length).toBe(2)
      expect(reply1.reactions.length).toBe(1)
    })
  })
})
