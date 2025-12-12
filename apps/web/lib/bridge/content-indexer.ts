/**
 * Bridge Content Indexer Service
 *
 * High-level API for indexing site content for Bridge RAG.
 * Call these functions when content is created/updated to keep the index fresh.
 */

import {
  indexContent as dbIndexContent,
  updateContentEngagement as dbUpdateEngagement,
  removeFromIndex as dbRemoveFromIndex,
  getContentSPStats,
  getTrustThresholds,
} from '@togetheros/db';
import type {
  IndexableContentType,
  ContentEngagement,
  TrustThresholds,
} from '@togetheros/types';
import { calculateTrustTier } from './trust-calculator';

/**
 * Index a forum topic
 */
export async function indexForumTopic(
  topicId: string,
  data: {
    title: string;
    description?: string;
    authorId: string;
    createdAt: Date;
    slug: string;
  },
  engagement: {
    voteScore?: number;
    replyCount?: number;
    participantCount?: number;
  } = {}
): Promise<void> {
  const thresholds = await getTrustThresholds();
  const spStats = await getContentSPStats('forum_topic', topicId);

  const fullEngagement: ContentEngagement = {
    voteScore: engagement.voteScore || 0,
    ratingAvg: null,
    replyCount: engagement.replyCount || 0,
    participantCount: engagement.participantCount || 0,
    totalSP: spStats.totalSP,
    spAllocatorCount: spStats.allocatorCount,
  };

  const trustTier = calculateTrustTier(fullEngagement, data.createdAt, thresholds);

  await dbIndexContent(
    'forum_topic',
    topicId,
    {
      url: `/forum/topics/${data.slug}`,
      title: data.title,
      summary: data.description?.slice(0, 500),
      fullText: data.description,
      authorId: data.authorId,
      createdAt: data.createdAt,
    },
    fullEngagement,
    trustTier
  );
}

/**
 * Index a forum post (reply to a topic)
 */
export async function indexForumPost(
  postId: string,
  data: {
    topicId: string;
    topicSlug: string;
    content: string;
    authorId: string;
    createdAt: Date;
  },
  engagement: {
    voteScore?: number;
    replyCount?: number;
  } = {}
): Promise<void> {
  const thresholds = await getTrustThresholds();
  const spStats = await getContentSPStats('forum_post', postId);

  const fullEngagement: ContentEngagement = {
    voteScore: engagement.voteScore || 0,
    ratingAvg: null,
    replyCount: engagement.replyCount || 0,
    participantCount: 0,
    totalSP: spStats.totalSP,
    spAllocatorCount: spStats.allocatorCount,
  };

  const trustTier = calculateTrustTier(fullEngagement, data.createdAt, thresholds);

  // Extract first sentence as title, rest as summary
  const firstSentence = data.content.split(/[.!?]/)[0]?.trim() || 'Forum Post';
  const title = firstSentence.length > 100 ? firstSentence.slice(0, 100) + '...' : firstSentence;

  await dbIndexContent(
    'forum_post',
    postId,
    {
      url: `/forum/topics/${data.topicSlug}#post-${postId}`,
      title,
      summary: data.content.slice(0, 500),
      fullText: data.content,
      authorId: data.authorId,
      createdAt: data.createdAt,
    },
    fullEngagement,
    trustTier
  );
}

/**
 * Index a proposal
 */
export async function indexProposal(
  proposalId: string,
  data: {
    title: string;
    summary: string;
    description?: string;
    authorId: string;
    createdAt: Date;
  },
  engagement: {
    voteScore?: number;
    ratingAvg?: number;
    participantCount?: number;
  } = {}
): Promise<void> {
  const thresholds = await getTrustThresholds();
  const spStats = await getContentSPStats('proposal', proposalId);

  const fullEngagement: ContentEngagement = {
    voteScore: engagement.voteScore || 0,
    ratingAvg: engagement.ratingAvg || null,
    replyCount: 0,
    participantCount: engagement.participantCount || 0,
    totalSP: spStats.totalSP,
    spAllocatorCount: spStats.allocatorCount,
  };

  const trustTier = calculateTrustTier(fullEngagement, data.createdAt, thresholds);

  await dbIndexContent(
    'proposal',
    proposalId,
    {
      url: `/governance/${proposalId}`,
      title: data.title,
      summary: data.summary,
      fullText: data.description || data.summary,
      authorId: data.authorId,
      createdAt: data.createdAt,
    },
    fullEngagement,
    trustTier
  );
}

/**
 * Index an article
 */
export async function indexArticle(
  articleId: string,
  data: {
    title: string;
    excerpt?: string;
    content: string;
    slug: string;
    authorId: string;
    createdAt: Date;
  },
  engagement: {
    voteScore?: number;
    replyCount?: number;
  } = {}
): Promise<void> {
  const thresholds = await getTrustThresholds();
  const spStats = await getContentSPStats('article', articleId);

  const fullEngagement: ContentEngagement = {
    voteScore: engagement.voteScore || 0,
    ratingAvg: null,
    replyCount: engagement.replyCount || 0,
    participantCount: 0,
    totalSP: spStats.totalSP,
    spAllocatorCount: spStats.allocatorCount,
  };

  const trustTier = calculateTrustTier(fullEngagement, data.createdAt, thresholds);

  await dbIndexContent(
    'article',
    articleId,
    {
      url: `/articles/${data.slug}`,
      title: data.title,
      summary: data.excerpt || data.content.slice(0, 500),
      fullText: data.content,
      authorId: data.authorId,
      createdAt: data.createdAt,
    },
    fullEngagement,
    trustTier
  );
}

/**
 * Update engagement metrics for any content type
 * Call this when votes, replies, or SP allocations change
 */
export async function updateEngagement(
  contentType: IndexableContentType,
  contentId: string,
  engagement: Partial<ContentEngagement>,
  createdAt: Date
): Promise<void> {
  const thresholds = await getTrustThresholds();
  const spStats = await getContentSPStats(contentType, contentId);

  const fullEngagement: ContentEngagement = {
    voteScore: engagement.voteScore || 0,
    ratingAvg: engagement.ratingAvg || null,
    replyCount: engagement.replyCount || 0,
    participantCount: engagement.participantCount || 0,
    totalSP: spStats.totalSP,
    spAllocatorCount: spStats.allocatorCount,
  };

  const trustTier = calculateTrustTier(fullEngagement, createdAt, thresholds);

  await dbUpdateEngagement(contentType, contentId, fullEngagement, trustTier);
}

/**
 * Remove content from the index (when deleted)
 */
export async function removeFromIndex(
  contentType: IndexableContentType,
  contentId: string
): Promise<void> {
  await dbRemoveFromIndex(contentType, contentId);
}
