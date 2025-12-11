/**
 * Forum Types Tests
 *
 * Tests for Forum module type definitions
 */

import { describe, it, expect } from 'vitest';
import type {
  Topic,
  TopicCategory,
  TopicStatus,
  Post,
  PostPosition,
  Reply,
  Citation,
  Reaction,
  ReactionType,
  Flag,
  FlagReason,
  FlagStatus,
  Edit,
} from '@togetheros/types';

// Helper factories
function createMockTopic(overrides: Partial<Topic> = {}): Topic {
  const now = new Date();
  return {
    id: 'topic-123',
    title: 'Discussing Cooperative Housing Options',
    slug: 'discussing-cooperative-housing-options',
    description: 'A discussion about various cooperative housing models.',
    authorId: 'user-456',
    category: 'general',
    tags: ['housing', 'cooperative', 'community'],
    status: 'open',
    isPinned: false,
    isLocked: false,
    postCount: 5,
    participantCount: 3,
    lastActivityAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function createMockPost(overrides: Partial<Post> = {}): Post {
  const now = new Date();
  return {
    id: 'post-789',
    topicId: 'topic-123',
    authorId: 'user-456',
    content: 'I think we should explore limited equity cooperatives.',
    citations: [],
    replyCount: 2,
    reactions: [],
    editHistory: [],
    flags: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function createMockReply(overrides: Partial<Reply> = {}): Reply {
  const now = new Date();
  return {
    id: 'reply-abc',
    postId: 'post-789',
    authorId: 'user-789',
    content: 'That sounds like a good approach.',
    citations: [],
    reactions: [],
    editHistory: [],
    flags: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function createMockCitation(overrides: Partial<Citation> = {}): Citation {
  return {
    id: 'citation-1',
    title: 'NAHC Cooperative Housing Guide',
    url: 'https://nahc.coop/resources',
    snippet: 'Limited equity cooperatives maintain affordability...',
    source: 'National Association of Housing Cooperatives',
    verified: false,
    ...overrides,
  };
}

function createMockReaction(overrides: Partial<Reaction> = {}): Reaction {
  return {
    id: 'reaction-1',
    userId: 'user-abc',
    type: 'agree',
    createdAt: new Date(),
    ...overrides,
  };
}

function createMockFlag(overrides: Partial<Flag> = {}): Flag {
  return {
    id: 'flag-1',
    contentId: 'post-789',
    contentType: 'post',
    flaggerId: 'user-xyz',
    reason: 'off-topic',
    status: 'pending',
    createdAt: new Date(),
    ...overrides,
  };
}

function createMockEdit(overrides: Partial<Edit> = {}): Edit {
  return {
    id: 'edit-1',
    editedBy: 'user-456',
    previousContent: 'Original content before edit',
    editReason: 'Fixed typo',
    editedAt: new Date(),
    ...overrides,
  };
}

describe('Forum Types', () => {
  describe('Topic', () => {
    it('should create a valid topic', () => {
      const topic = createMockTopic();
      expect(topic.id).toBe('topic-123');
      expect(topic.title).toBe('Discussing Cooperative Housing Options');
      expect(topic.category).toBe('general');
      expect(topic.status).toBe('open');
    });

    it('should support all topic categories', () => {
      const categories: TopicCategory[] = ['general', 'proposal', 'question', 'deliberation', 'announcement'];
      for (const category of categories) {
        const topic = createMockTopic({ category });
        expect(topic.category).toBe(category);
      }
    });

    it('should support all topic statuses', () => {
      const statuses: TopicStatus[] = ['open', 'resolved', 'archived', 'locked'];
      for (const status of statuses) {
        const topic = createMockTopic({ status });
        expect(topic.status).toBe(status);
      }
    });

    it('should handle optional fields', () => {
      const minimalTopic = createMockTopic({
        description: undefined,
        groupId: undefined,
        cooperationPath: undefined,
      });
      expect(minimalTopic.description).toBeUndefined();
      expect(minimalTopic.groupId).toBeUndefined();
    });

    it('should track pinned and locked states', () => {
      const pinnedTopic = createMockTopic({ isPinned: true });
      const lockedTopic = createMockTopic({ isLocked: true });
      expect(pinnedTopic.isPinned).toBe(true);
      expect(lockedTopic.isLocked).toBe(true);
    });

    it('should track promotion status', () => {
      const eligibleTopic = createMockTopic({ promotionStatus: 'eligible', supporterCount: 5 });
      expect(eligibleTopic.promotionStatus).toBe('eligible');
      expect(eligibleTopic.supporterCount).toBe(5);
    });

    it('should track cooperation path', () => {
      const topic = createMockTopic({ cooperationPath: 'cooperative-technology' });
      expect(topic.cooperationPath).toBe('cooperative-technology');
    });
  });

  describe('Post', () => {
    it('should create a valid post', () => {
      const post = createMockPost();
      expect(post.id).toBe('post-789');
      expect(post.topicId).toBe('topic-123');
      expect(post.authorId).toBe('user-456');
      expect(post.replyCount).toBe(2);
    });

    it('should support position for deliberation topics', () => {
      const position: PostPosition = {
        stance: 'support',
        reasoning: 'This approach aligns with our values.',
        tradeoffs: ['Higher cost', 'More coordination'],
        alternatives: ['Traditional rental'],
      };
      const post = createMockPost({ position });
      expect(post.position).toBeDefined();
      expect(post.position!.stance).toBe('support');
      expect(post.position!.tradeoffs).toHaveLength(2);
    });

    it('should support all position stances', () => {
      const stances: Array<'support' | 'oppose' | 'neutral' | 'question'> = ['support', 'oppose', 'neutral', 'question'];
      for (const stance of stances) {
        const position: PostPosition = { stance, reasoning: `Testing ${stance}`, tradeoffs: [] };
        const post = createMockPost({ position });
        expect(post.position!.stance).toBe(stance);
      }
    });

    it('should include citations', () => {
      const citations = [createMockCitation({ title: 'Source 1' }), createMockCitation({ title: 'Source 2' })];
      const post = createMockPost({ citations });
      expect(post.citations).toHaveLength(2);
    });

    it('should include reactions', () => {
      const reactions = [createMockReaction({ type: 'agree' }), createMockReaction({ type: 'insightful' })];
      const post = createMockPost({ reactions });
      expect(post.reactions).toHaveLength(2);
    });

    it('should track edit history', () => {
      const editHistory = [createMockEdit({ editReason: 'Fixed typo' })];
      const post = createMockPost({ editHistory });
      expect(post.editHistory).toHaveLength(1);
    });

    it('should track moderation flags', () => {
      const flags = [createMockFlag({ reason: 'off-topic' })];
      const post = createMockPost({ flags });
      expect(post.flags).toHaveLength(1);
    });
  });

  describe('Reply', () => {
    it('should create a valid reply', () => {
      const reply = createMockReply();
      expect(reply.id).toBe('reply-abc');
      expect(reply.postId).toBe('post-789');
      expect(reply.authorId).toBe('user-789');
    });

    it('should include nested reactions', () => {
      const reactions = [createMockReaction({ type: 'empathy' })];
      const reply = createMockReply({ reactions });
      expect(reply.reactions).toHaveLength(1);
    });
  });

  describe('Citation', () => {
    it('should create a valid citation', () => {
      const citation = createMockCitation();
      expect(citation.id).toBe('citation-1');
      expect(citation.title).toBe('NAHC Cooperative Housing Guide');
      expect(citation.verified).toBe(false);
    });

    it('should handle optional fields', () => {
      const minimalCitation = createMockCitation({ url: undefined, snippet: undefined, source: undefined });
      expect(minimalCitation.url).toBeUndefined();
    });

    it('should track verification status', () => {
      const verifiedCitation = createMockCitation({ verified: true });
      expect(verifiedCitation.verified).toBe(true);
    });
  });

  describe('Reaction', () => {
    it('should create a valid reaction', () => {
      const reaction = createMockReaction();
      expect(reaction.id).toBe('reaction-1');
      expect(reaction.type).toBe('agree');
    });

    it('should support all reaction types', () => {
      const reactionTypes: ReactionType[] = ['agree', 'disagree', 'insightful', 'empathy', 'question', 'concern'];
      for (const type of reactionTypes) {
        const reaction = createMockReaction({ type });
        expect(reaction.type).toBe(type);
      }
    });
  });

  describe('Flag', () => {
    it('should create a valid flag', () => {
      const flag = createMockFlag();
      expect(flag.id).toBe('flag-1');
      expect(flag.reason).toBe('off-topic');
      expect(flag.status).toBe('pending');
    });

    it('should support all flag reasons', () => {
      const reasons: FlagReason[] = ['spam', 'harassment', 'misinformation', 'off-topic', 'harmful'];
      for (const reason of reasons) {
        const flag = createMockFlag({ reason });
        expect(flag.reason).toBe(reason);
      }
    });

    it('should support all flag statuses', () => {
      const statuses: FlagStatus[] = ['pending', 'dismissed', 'action-taken'];
      for (const status of statuses) {
        const flag = createMockFlag({ status });
        expect(flag.status).toBe(status);
      }
    });

    it('should support both content types', () => {
      const postFlag = createMockFlag({ contentType: 'post' });
      const replyFlag = createMockFlag({ contentType: 'reply' });
      expect(postFlag.contentType).toBe('post');
      expect(replyFlag.contentType).toBe('reply');
    });

    it('should track review information', () => {
      const reviewedFlag = createMockFlag({ status: 'dismissed', reviewedBy: 'moderator-1', reviewedAt: new Date() });
      expect(reviewedFlag.reviewedBy).toBe('moderator-1');
      expect(reviewedFlag.reviewedAt).toBeInstanceOf(Date);
    });
  });

  describe('Edit', () => {
    it('should create a valid edit', () => {
      const edit = createMockEdit();
      expect(edit.id).toBe('edit-1');
      expect(edit.editedBy).toBe('user-456');
      expect(edit.editReason).toBe('Fixed typo');
    });

    it('should handle optional edit reason', () => {
      const editWithoutReason = createMockEdit({ editReason: undefined });
      expect(editWithoutReason.editReason).toBeUndefined();
    });
  });

  describe('PostPosition', () => {
    it('should create valid position with required fields', () => {
      const position: PostPosition = { stance: 'support', reasoning: 'This aligns.', tradeoffs: ['Cost'] };
      expect(position.stance).toBe('support');
      expect(position.tradeoffs).toHaveLength(1);
    });

    it('should support all stances', () => {
      const stances: Array<PostPosition['stance']> = ['support', 'oppose', 'neutral', 'question'];
      for (const stance of stances) {
        const position: PostPosition = { stance, reasoning: 'Test', tradeoffs: [] };
        expect(position.stance).toBe(stance);
      }
    });
  });

  describe('Type Compatibility', () => {
    it('should allow extending topic with cooperation path', () => {
      const topicWithPath = createMockTopic({ cooperationPath: 'social-economy' });
      expect(topicWithPath.cooperationPath).toBe('social-economy');
    });

    it('should support soft delete patterns', () => {
      const deletedTopic = createMockTopic({ deletedAt: new Date() });
      const deletedPost = createMockPost({ deletedAt: new Date() });
      expect(deletedTopic.deletedAt).toBeInstanceOf(Date);
      expect(deletedPost.deletedAt).toBeInstanceOf(Date);
    });
  });
});
