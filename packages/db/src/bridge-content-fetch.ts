/**
 * Bridge Content Fetch
 *
 * Fetches FULL content from database for Bridge to read directly.
 * Used when search returns few results - Bridge reads the actual posts.
 */

import { query } from './index';
import type { TrustTier } from '@togetheros/types';

/**
 * Full forum post with engagement metrics for Bridge
 */
export interface BridgeForumPost {
  id: string;
  topicId: string;
  topicTitle: string;
  topicCategory: string;
  content: string;
  authorName: string | null;
  createdAt: Date;
  url: string;
  // Engagement
  voteScore: number;
  replyCount: number;
  totalSP: number;
  spAllocatorCount: number;
  trustTier: TrustTier;
  // Replies preview
  topReplies: Array<{
    content: string;
    authorName: string | null;
    voteScore: number;
  }>;
}

/**
 * Full forum topic with engagement metrics for Bridge
 */
export interface BridgeForumTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  authorName: string | null;
  createdAt: Date;
  url: string;
  // Engagement
  voteScore: number;
  postCount: number;
  participantCount: number;
  totalSP: number;
  spAllocatorCount: number;
  trustTier: TrustTier;
  // Top posts in topic
  topPosts: Array<{
    id: string;
    content: string;
    authorName: string | null;
    voteScore: number;
    totalSP: number;
  }>;
}

/**
 * Calculate trust tier from engagement
 */
function calculateTrustTier(
  voteScore: number,
  replyCount: number,
  totalSP: number,
  spAllocatorCount: number,
  participantCount: number = 0
): TrustTier {
  const effectiveVotes = voteScore + (totalSP * 2);
  const effectiveParticipants = participantCount + spAllocatorCount;

  if (effectiveVotes >= 20 && effectiveParticipants >= 10 && totalSP >= 50) {
    return 'consensus';
  }
  if (totalSP >= 20 || (effectiveVotes >= 10 && replyCount >= 5)) {
    return 'high';
  }
  if (totalSP >= 5 || effectiveVotes >= 3 || replyCount >= 3) {
    return 'medium';
  }
  if (voteScore >= 1 || replyCount >= 1 || totalSP > 0) {
    return 'low';
  }
  return 'unvalidated';
}

/**
 * Search forum posts by keyword and return FULL content
 * Use when you need to read actual posts, not just summaries
 */
export async function searchForumPostsFull(
  searchQuery: string,
  limit: number = 10
): Promise<BridgeForumPost[]> {
  const result = await query<{
    id: string;
    topic_id: string;
    topic_title: string;
    topic_category: string;
    content: string;
    author_name: string | null;
    created_at: Date;
    vote_score: string;
    reply_count: string;
    total_sp: string;
    sp_allocator_count: string;
  }>(`
    SELECT
      p.id,
      p.topic_id,
      t.title as topic_title,
      t.category as topic_category,
      p.content,
      u.name as author_name,
      p.created_at,
      COALESCE(SUM(CASE WHEN r.type = 'agree' THEN 1 WHEN r.type = 'disagree' THEN -1 ELSE 0 END), 0) as vote_score,
      p.reply_count,
      COALESCE((SELECT SUM(amount) FROM support_points_allocations WHERE target_type = 'forum_post' AND target_id = p.id::text AND status = 'active'), 0) as total_sp,
      COALESCE((SELECT COUNT(DISTINCT member_id) FROM support_points_allocations WHERE target_type = 'forum_post' AND target_id = p.id::text AND status = 'active'), 0) as sp_allocator_count
    FROM forum_posts p
    JOIN topics t ON t.id = p.topic_id
    LEFT JOIN users u ON u.id = p.author_id
    LEFT JOIN forum_reactions r ON r.content_id = p.id AND r.content_type = 'post'
    WHERE p.deleted_at IS NULL
      AND t.deleted_at IS NULL
      AND (
        to_tsvector('english', p.content) @@ plainto_tsquery('english', $1)
        OR p.content ILIKE '%' || $1 || '%'
      )
    GROUP BY p.id, t.title, t.category, u.name
    ORDER BY
      COALESCE((SELECT SUM(amount) FROM support_points_allocations WHERE target_type = 'forum_post' AND target_id = p.id::text AND status = 'active'), 0) DESC,
      p.created_at DESC
    LIMIT $2
  `, [searchQuery, limit]);

  const posts: BridgeForumPost[] = [];

  for (const row of result.rows) {
    const voteScore = parseInt(row.vote_score, 10);
    const replyCount = parseInt(row.reply_count, 10);
    const totalSP = parseInt(row.total_sp, 10);
    const spAllocatorCount = parseInt(row.sp_allocator_count, 10);

    // Fetch top replies for this post
    const repliesResult = await query<{
      content: string;
      author_name: string | null;
      vote_score: string;
    }>(`
      SELECT
        r.content,
        u.name as author_name,
        COALESCE(SUM(CASE WHEN rr.type = 'agree' THEN 1 WHEN rr.type = 'disagree' THEN -1 ELSE 0 END), 0) as vote_score
      FROM forum_replies r
      LEFT JOIN users u ON u.id = r.author_id
      LEFT JOIN forum_reactions rr ON rr.content_id = r.id AND rr.content_type = 'reply'
      WHERE r.post_id = $1 AND r.deleted_at IS NULL
      GROUP BY r.id, u.name
      ORDER BY vote_score DESC
      LIMIT 3
    `, [row.id]);

    posts.push({
      id: row.id,
      topicId: row.topic_id,
      topicTitle: row.topic_title,
      topicCategory: row.topic_category,
      content: row.content,
      authorName: row.author_name,
      createdAt: row.created_at,
      url: `/forum/topic/${row.topic_id}#post-${row.id}`,
      voteScore,
      replyCount,
      totalSP,
      spAllocatorCount,
      trustTier: calculateTrustTier(voteScore, replyCount, totalSP, spAllocatorCount),
      topReplies: repliesResult.rows.map(r => ({
        content: r.content,
        authorName: r.author_name,
        voteScore: parseInt(r.vote_score, 10),
      })),
    });
  }

  return posts;
}

/**
 * Search forum topics by keyword and return FULL content
 */
export async function searchForumTopicsFull(
  searchQuery: string,
  limit: number = 10
): Promise<BridgeForumTopic[]> {
  const result = await query<{
    id: string;
    title: string;
    description: string;
    category: string;
    author_name: string | null;
    created_at: Date;
    vote_score: string;
    post_count: string;
    participant_count: string;
    total_sp: string;
    sp_allocator_count: string;
  }>(`
    SELECT
      t.id,
      t.title,
      t.description,
      t.category,
      u.name as author_name,
      t.created_at,
      0 as vote_score, -- Topics don't have reactions in current schema
      COUNT(DISTINCT p.id) as post_count,
      COUNT(DISTINCT p.author_id) as participant_count,
      COALESCE((SELECT SUM(amount) FROM support_points_allocations WHERE target_type = 'forum_topic' AND target_id = t.id::text AND status = 'active'), 0) as total_sp,
      COALESCE((SELECT COUNT(DISTINCT member_id) FROM support_points_allocations WHERE target_type = 'forum_topic' AND target_id = t.id::text AND status = 'active'), 0) as sp_allocator_count
    FROM topics t
    LEFT JOIN users u ON u.id = t.author_id
    -- Topics don't have reactions in current schema (only posts/replies do)
    LEFT JOIN forum_posts p ON p.topic_id = t.id AND p.deleted_at IS NULL
    WHERE t.deleted_at IS NULL
      AND (
        to_tsvector('english', t.title || ' ' || COALESCE(t.description, '')) @@ plainto_tsquery('english', $1)
        OR t.title ILIKE '%' || $1 || '%'
        OR t.description ILIKE '%' || $1 || '%'
      )
    GROUP BY t.id, u.name
    ORDER BY
      COALESCE((SELECT SUM(amount) FROM support_points_allocations WHERE target_type = 'forum_topic' AND target_id = t.id::text AND status = 'active'), 0) DESC,
      COUNT(DISTINCT p.id) DESC
    LIMIT $2
  `, [searchQuery, limit]);

  const topics: BridgeForumTopic[] = [];

  for (const row of result.rows) {
    const voteScore = parseInt(row.vote_score, 10);
    const postCount = parseInt(row.post_count, 10);
    const participantCount = parseInt(row.participant_count, 10);
    const totalSP = parseInt(row.total_sp, 10);
    const spAllocatorCount = parseInt(row.sp_allocator_count, 10);

    // Fetch top posts in this topic
    const postsResult = await query<{
      id: string;
      content: string;
      author_name: string | null;
      vote_score: string;
      total_sp: string;
    }>(`
      SELECT
        p.id,
        p.content,
        u.name as author_name,
        COALESCE(SUM(CASE WHEN r.type = 'agree' THEN 1 WHEN r.type = 'disagree' THEN -1 ELSE 0 END), 0) as vote_score,
        COALESCE((SELECT SUM(amount) FROM support_points_allocations WHERE target_type = 'forum_post' AND target_id = p.id::text AND status = 'active'), 0) as total_sp
      FROM forum_posts p
      LEFT JOIN users u ON u.id = p.author_id
      LEFT JOIN forum_reactions r ON r.content_id = p.id AND r.content_type = 'post'
      WHERE p.topic_id = $1 AND p.deleted_at IS NULL
      GROUP BY p.id, u.name
      ORDER BY total_sp DESC, vote_score DESC
      LIMIT 5
    `, [row.id]);

    topics.push({
      id: row.id,
      title: row.title,
      description: row.description || '',
      category: row.category,
      authorName: row.author_name,
      createdAt: row.created_at,
      url: `/forum/topic/${row.id}`,
      voteScore,
      postCount,
      participantCount,
      totalSP,
      spAllocatorCount,
      trustTier: calculateTrustTier(voteScore, postCount, totalSP, spAllocatorCount, participantCount),
      topPosts: postsResult.rows.map(p => ({
        id: p.id,
        content: p.content,
        authorName: p.author_name,
        voteScore: parseInt(p.vote_score, 10),
        totalSP: parseInt(p.total_sp, 10),
      })),
    });
  }

  return topics;
}

/**
 * Get recent forum activity for "what's new" queries
 */
export async function getRecentForumActivity(
  hours: number = 48,
  limit: number = 10
): Promise<BridgeForumPost[]> {
  const result = await query<{
    id: string;
    topic_id: string;
    topic_title: string;
    topic_category: string;
    content: string;
    author_name: string | null;
    created_at: Date;
    vote_score: string;
    reply_count: string;
    total_sp: string;
    sp_allocator_count: string;
  }>(`
    SELECT
      p.id,
      p.topic_id,
      t.title as topic_title,
      t.category as topic_category,
      p.content,
      u.name as author_name,
      p.created_at,
      COALESCE(SUM(CASE WHEN r.type = 'agree' THEN 1 WHEN r.type = 'disagree' THEN -1 ELSE 0 END), 0) as vote_score,
      p.reply_count,
      COALESCE((SELECT SUM(amount) FROM support_points_allocations WHERE target_type = 'forum_post' AND target_id = p.id::text AND status = 'active'), 0) as total_sp,
      COALESCE((SELECT COUNT(DISTINCT member_id) FROM support_points_allocations WHERE target_type = 'forum_post' AND target_id = p.id::text AND status = 'active'), 0) as sp_allocator_count
    FROM forum_posts p
    JOIN topics t ON t.id = p.topic_id
    LEFT JOIN users u ON u.id = p.author_id
    LEFT JOIN forum_reactions r ON r.content_id = p.id AND r.content_type = 'post'
    WHERE p.deleted_at IS NULL
      AND t.deleted_at IS NULL
      AND p.created_at >= NOW() - INTERVAL '1 hour' * $1
    GROUP BY p.id, t.title, t.category, u.name
    ORDER BY p.created_at DESC
    LIMIT $2
  `, [hours, limit]);

  return result.rows.map(row => {
    const voteScore = parseInt(row.vote_score, 10);
    const replyCount = parseInt(row.reply_count, 10);
    const totalSP = parseInt(row.total_sp, 10);
    const spAllocatorCount = parseInt(row.sp_allocator_count, 10);

    return {
      id: row.id,
      topicId: row.topic_id,
      topicTitle: row.topic_title,
      topicCategory: row.topic_category,
      content: row.content,
      authorName: row.author_name,
      createdAt: row.created_at,
      url: `/forum/topic/${row.topic_id}#post-${row.id}`,
      voteScore,
      replyCount,
      totalSP,
      spAllocatorCount,
      trustTier: calculateTrustTier(voteScore, replyCount, totalSP, spAllocatorCount),
      topReplies: [], // Not fetched for recent activity
    };
  });
}
