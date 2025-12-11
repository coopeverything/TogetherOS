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
    description: 'A discussion about various cooperative housing models and their viability in our community.',
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
    content: 'I think we should explore limited equity cooperatives as a starting point.',
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
    content: 'That sounds like a good approach. Do you have any examples we could look at?',
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
    snippet: 'Limited equity cooperatives maintain long-term affordability...',
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
      expect(topic.slug).toBe('discussing-cooperative-housing-options');
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
        linkedProposalId: undefined,
        promotionStatus: undefined,
        supporterCount: undefined,
        deletedAt: undefined,
      });

      expect(minimalTopic.description).toBeUndefined();
      expect(minimalTopic.groupId).toBeUndefined();
      expect(minimalTopic.linkedProposalId).toBeUndefined();
    });

    it('should track pinned and locked states', () => {
      const pinnedTopic = createMockTopic({ isPinned: true });
      const lockedTopic = createMockTopic({ isLocked: true });

      expect(pinnedTopic.isPinned).toBe(true);
      expect(pinnedTopic.isLocked).toBe(false);
      expect(lockedTopic.isLocked).toBe(true);
    });

    it('should track promotion status', () => {
      const eligibleTopic = createMockTopic({ promotionStatus: 'eligible', supporterCount: 5 });
      const promotedTopic = createMockTopic({ promotionStatus: 'promoted', linkedProposalId: 'proposal-123' });

      expect(eligibleTopic.promotionStatus).toBe('eligible');
      expect(eligibleTopic.supporterCount).toBe(5);
      expect(promotedTopic.promotionStatus).toBe('promoted');
      expect(promotedTopic.linkedProposalId).toBe('proposal-123');
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
      expect(post.content).toBeDefined();
      expect(post.replyCount).toBe(2);
    });

    it('should support position for deliberation topics', () => {
      const position: PostPosition = {
        stance: 'support',
        reasoning: 'This approach aligns with our cooperative values.',
        tradeoffs: ['Higher initial cost', 'Requires more coordination'],
        alternatives: ['Traditional rental', 'Community land trust'],
      };

      const post = createMockPost({ position });

      expect(post.position).toBeDefined();
      expect(post.position!.stance).toBe('support');
      expect(post.position!.tradeoffs).toHaveLength(2);
      expect(post.position!.alternatives).toHaveLength(2);
    });

    it('should support all position stances', () => {
      const stances: Array<'support' | 'oppose' | 'neutral' | 'question'> = ['support', 'oppose', 'neutral', 'question'];

      for (const stance of stances) {
        const position: PostPosition = {
          stance,
          reasoning: `Testing ${stance} stance`,
          tradeoffs: [],
        };
        const post = createMockPost({ position });
        expect(post.position!.stance).toBe(stance);
      }
    });

    it('should include citations', () => {
      const citations = [
        createMockCitation({ title: 'Source 1' }),
        createMockCitation({ title: 'Source 2' }),
      ];

      const post = createMockPost({ citations });

      expect(post.citations).toHaveLength(2);
      expect(post.citations[0].title).toBe('Source 1');
    });

    it('should include reactions', () => {
      const reactions = [
        createMockReaction({ type: 'agree' }),
        createMockReaction({ type: 'insightful' }),
      ];

      const post = createMockPost({ reactions });

      expect(post.reactions).toHaveLength(2);
    });

    it('should track edit history', () => {
      const editHistory = [
        createMockEdit({ editReason: 'Fixed typo' }),
        createMockEdit({ editReason: 'Added clarification' }),
      ];

      const post = createMockPost({ editHistory });

      expect(post.editHistory).toHaveLength(2);
      expect(post.editHistory[0].editReason).toBe('Fixed typo');
    });

    it('should track moderation flags', () => {
      const flags = [createMockFlag({ reason: 'off-topic' })];
      const post = createMockPost({ flags });

      expect(post.flags).toHaveLength(1);
      expect(post.flags[0].reason).toBe('off-topic');
    });
  });

  describe('Reply', () => {
    it('should create a valid reply', () => {
      const reply = createMockReply();

      expect(reply.id).toBe('reply-abc');
      expect(reply.postId).toBe('post-789');
      expect(reply.authorId).toBe('user-789');
      expect(reply.content).toBeDefined();
    });

    it('should include nested reactions', () => {
      const reactions = [createMockReaction({ type: 'empathy' })];
      const reply = createMockReply({ reactions });

      expect(reply.reactions).toHaveLength(1);
      expect(reply.reactions[0].type).toBe('empathy');
    });
  });

  describe('Citation', () => {
    it('should create a valid citation', () => {
      const citation = createMockCitation();

      expect(citation.id).toBe('citation-1');
      expect(citation.title).toBe('NAHC Cooperative Housing Guide');
      expect(citation.url).toBeDefined();
      expect(citation.verified).toBe(false);
    });

    it('should handle optional fields', () => {
      const minimalCitation = createMockCitation({
        url: undefined,
        snippet: undefined,
        source: undefined,
      });

      expect(minimalCitation.url).toBeUndefined();
      expect(minimalCitation.snippet).toBeUndefined();
      expect(minimalCitation.source).toBeUndefined();
    });

    it('should track verification status', () => {
      const verifiedCitation = createMockCitation({ verified: true });
      const unverifiedCitation = createMockCitation({ verified: false });

      expect(verifiedCitation.verified).toBe(true);
      expect(unverifiedCitation.verified).toBe(false);
    });
  });

  describe('Reaction', () => {
    it('should create a valid reaction', () => {
      const reaction = createMockReaction();

      expect(reaction.id).toBe('reaction-1');
      expect(reaction.userId).toBe('user-abc');
      expect(reaction.type).toBe('agree');
      expect(reaction.createdAt).toBeInstanceOf(Date);
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
      expect(flag.contentId).toBe('post-789');
      expect(flag.contentType).toBe('post');
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
      const reviewedFlag = createMockFlag({
        status: 'dismissed',
        reviewedBy: 'moderator-1',
        reviewedAt: new Date(),
        details: 'Content is relevant to the discussion',
      });

      expect(reviewedFlag.reviewedBy).toBe('moderator-1');
      expect(reviewedFlag.reviewedAt).toBeInstanceOf(Date);
      expect(reviewedFlag.details).toBeDefined();
    });
  });

  describe('Edit', () => {
    it('should create a valid edit', () => {
      const edit = createMockEdit();

      expect(edit.id).toBe('edit-1');
      expect(edit.editedBy).toBe('user-456');
      expect(edit.previousContent).toBe('Original content before edit');
      expect(edit.editReason).toBe('Fixed typo');
      expect(edit.editedAt).toBeInstanceOf(Date);
    });

    it('should handle optional edit reason', () => {
      const editWithoutReason = createMockEdit({ editReason: undefined });
      expect(editWithoutReason.editReason).toBeUndefined();
    });
  });

  describe('PostPosition', () => {
    it('should create valid position with required fields', () => {
      const position: PostPosition = {
        stance: 'support',
        reasoning: 'This aligns with our values.',
        tradeoffs: ['Cost', 'Time'],
      };

      expect(position.stance).toBe('support');
      expect(position.reasoning).toBeDefined();
      expect(position.tradeoffs).toHaveLength(2);
      expect(position.alternatives).toBeUndefined();
    });

    it('should support all stances', () => {
      const stances: Array<PostPosition['stance']> = ['support', 'oppose', 'neutral', 'question'];

      for (const stance of stances) {
        const position: PostPosition = {
          stance,
          reasoning: 'Test reasoning',
          tradeoffs: [],
        };
        expect(position.stance).toBe(stance);
      }
    });
  });

  describe('Type Compatibility', () => {
    it('should allow extending topic with cooperation path', () => {
      const topicWithPath = createMockTopic({
        cooperationPath: 'social-economy',
        tags: ['housing', 'cooperative', 'economy'],
      });

      expect(topicWithPath.cooperationPath).toBe('social-economy');
      expect(topicWithPath.tags).toContain('economy');
    });

    it('should support soft delete patterns', () => {
      const deletedTopic = createMockTopic({ deletedAt: new Date() });
      const deletedPost = createMockPost({ deletedAt: new Date() });
      const deletedReply = createMockReply({ deletedAt: new Date() });

      expect(deletedTopic.deletedAt).toBeInstanceOf(Date);
      expect(deletedPost.deletedAt).toBeInstanceOf(Date);
      expect(deletedReply.deletedAt).toBeInstanceOf(Date);
    });
  });
});
