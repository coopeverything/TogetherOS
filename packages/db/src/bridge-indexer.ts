/**
 * Bridge Content Indexer
 *
 * Populates and maintains the bridge_content_index table
 * for Bridge RAG with trust-weighted content.
 */

import { query, getClient } from './index';
import type { TrustTier, ContentEngagement } from '@togetheros/types';

/**
 * Calculate trust tier based on engagement
 */
function calculateTrustTier(engagement: ContentEngagement): TrustTier {
  const { voteScore, replyCount, totalSP, spAllocatorCount, participantCount } = engagement;

  // Effective metrics (SP counts double)
  const effectiveVotes = voteScore + (totalSP * 2);
  const effectiveParticipants = (participantCount || 0) + (spAllocatorCount || 0);

  // CONSENSUS: Overwhelming support
  if (effectiveVotes >= 20 && effectiveParticipants >= 10 && totalSP >= 50) {
    return 'consensus';
  }

  // HIGH: Strong engagement OR significant SP
  if (totalSP >= 20 || (effectiveVotes >= 10 && replyCount >= 5)) {
    return 'high';
  }

  // MEDIUM: Positive engagement
  if (totalSP >= 5 || effectiveVotes >= 3 || replyCount >= 3) {
    return 'medium';
  }

  // LOW: Some engagement
  if (voteScore >= 1 || replyCount >= 1 || totalSP > 0) {
    return 'low';
  }

  return 'unvalidated';
}

/**
 * Index all forum topics
 */
export async function indexForumTopics(): Promise<number> {
  const result = await query<{
    id: string;
    title: string;
    description: string;
    category: string;
    author_id: string;
    created_at: Date;
    vote_score: string;
    reply_count: string;
    participant_count: string;
    total_sp: string;
    sp_allocator_count: string;
  }>(`
    SELECT
      t.id,
      t.title,
      t.description,
      t.category,
      t.author_id,
      t.created_at,
      COALESCE(SUM(CASE WHEN r.reaction_type = 'upvote' THEN 1 WHEN r.reaction_type = 'downvote' THEN -1 ELSE 0 END), 0) as vote_score,
      COUNT(DISTINCT p.id) as reply_count,
      COUNT(DISTINCT p.author_id) as participant_count,
      COALESCE((SELECT SUM(amount) FROM support_points_allocations WHERE target_type = 'forum_topic' AND target_id = t.id::text AND status = 'active'), 0) as total_sp,
      COALESCE((SELECT COUNT(DISTINCT member_id) FROM support_points_allocations WHERE target_type = 'forum_topic' AND target_id = t.id::text AND status = 'active'), 0) as sp_allocator_count
    FROM topics t
    LEFT JOIN forum_topic_reactions r ON r.topic_id = t.id
    LEFT JOIN forum_posts p ON p.topic_id = t.id AND p.deleted_at IS NULL
    WHERE t.deleted_at IS NULL
    GROUP BY t.id
  `);

  let indexed = 0;
  for (const row of result.rows) {
    const engagement: ContentEngagement = {
      voteScore: parseInt(row.vote_score, 10),
      ratingAvg: 0, // Topics don't have ratings
      replyCount: parseInt(row.reply_count, 10),
      participantCount: parseInt(row.participant_count, 10),
      totalSP: parseInt(row.total_sp, 10),
      spAllocatorCount: parseInt(row.sp_allocator_count, 10),
    };

    const trustTier = calculateTrustTier(engagement);

    await query(`
      INSERT INTO bridge_content_index (
        content_type, content_id, url, title, summary, keywords, full_text,
        vote_score, reply_count, participant_count, total_sp, sp_allocator_count,
        trust_tier, author_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (content_type, content_id) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        vote_score = EXCLUDED.vote_score,
        reply_count = EXCLUDED.reply_count,
        participant_count = EXCLUDED.participant_count,
        total_sp = EXCLUDED.total_sp,
        sp_allocator_count = EXCLUDED.sp_allocator_count,
        trust_tier = EXCLUDED.trust_tier,
        updated_at = NOW()
    `, [
      'forum_topic',
      row.id,
      `/forum/topic/${row.id}`,
      row.title,
      row.description || null,
      row.category ? [row.category] : [],
      row.description || null,
      engagement.voteScore,
      engagement.replyCount,
      engagement.participantCount,
      engagement.totalSP,
      engagement.spAllocatorCount,
      trustTier,
      row.author_id,
      row.created_at,
    ]);
    indexed++;
  }

  return indexed;
}

/**
 * Index all forum posts
 */
export async function indexForumPosts(): Promise<number> {
  const result = await query<{
    id: string;
    topic_id: string;
    topic_title: string;
    content: string;
    author_id: string;
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
      p.content,
      p.author_id,
      p.created_at,
      COALESCE(SUM(CASE WHEN r.reaction_type = 'upvote' THEN 1 WHEN r.reaction_type = 'downvote' THEN -1 ELSE 0 END), 0) as vote_score,
      p.reply_count,
      COALESCE((SELECT SUM(amount) FROM support_points_allocations WHERE target_type = 'forum_post' AND target_id = p.id::text AND status = 'active'), 0) as total_sp,
      COALESCE((SELECT COUNT(DISTINCT member_id) FROM support_points_allocations WHERE target_type = 'forum_post' AND target_id = p.id::text AND status = 'active'), 0) as sp_allocator_count
    FROM forum_posts p
    JOIN topics t ON t.id = p.topic_id
    LEFT JOIN forum_post_reactions r ON r.post_id = p.id
    WHERE p.deleted_at IS NULL AND t.deleted_at IS NULL
    GROUP BY p.id, t.title
  `);

  let indexed = 0;
  for (const row of result.rows) {
    const engagement: ContentEngagement = {
      voteScore: parseInt(row.vote_score, 10),
      ratingAvg: 0, // Posts don't have ratings
      replyCount: parseInt(row.reply_count, 10),
      participantCount: 0,
      totalSP: parseInt(row.total_sp, 10),
      spAllocatorCount: parseInt(row.sp_allocator_count, 10),
    };

    const trustTier = calculateTrustTier(engagement);

    // Create summary from first 300 chars
    const summary = row.content.length > 300
      ? row.content.substring(0, 300) + '...'
      : row.content;

    await query(`
      INSERT INTO bridge_content_index (
        content_type, content_id, url, title, summary, full_text,
        vote_score, reply_count, participant_count, total_sp, sp_allocator_count,
        trust_tier, author_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (content_type, content_id) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        full_text = EXCLUDED.full_text,
        vote_score = EXCLUDED.vote_score,
        reply_count = EXCLUDED.reply_count,
        total_sp = EXCLUDED.total_sp,
        sp_allocator_count = EXCLUDED.sp_allocator_count,
        trust_tier = EXCLUDED.trust_tier,
        updated_at = NOW()
    `, [
      'forum_post',
      row.id,
      `/forum/topic/${row.topic_id}#post-${row.id}`,
      `Post in: ${row.topic_title}`,
      summary,
      row.content,
      engagement.voteScore,
      engagement.replyCount,
      engagement.participantCount,
      engagement.totalSP,
      engagement.spAllocatorCount,
      trustTier,
      row.author_id,
      row.created_at,
    ]);
    indexed++;
  }

  return indexed;
}

/**
 * Index all proposals
 */
export async function indexProposals(): Promise<number> {
  const result = await query<{
    id: string;
    title: string;
    description: string;
    author_id: string;
    created_at: Date;
    vote_count: string;
    total_sp: string;
    sp_allocator_count: string;
  }>(`
    SELECT
      p.id,
      p.title,
      p.description,
      p.author_id,
      p.created_at,
      COALESCE((SELECT COUNT(*) FROM proposal_votes WHERE proposal_id = p.id), 0) as vote_count,
      COALESCE((SELECT SUM(amount) FROM support_points_allocations WHERE target_type = 'proposal' AND target_id = p.id::text AND status = 'active'), 0) as total_sp,
      COALESCE((SELECT COUNT(DISTINCT member_id) FROM support_points_allocations WHERE target_type = 'proposal' AND target_id = p.id::text AND status = 'active'), 0) as sp_allocator_count
    FROM proposals p
    WHERE p.deleted_at IS NULL
  `);

  let indexed = 0;
  for (const row of result.rows) {
    const engagement: ContentEngagement = {
      voteScore: parseInt(row.vote_count, 10),
      ratingAvg: 0, // Proposals don't have ratings in this context
      replyCount: 0,
      participantCount: parseInt(row.vote_count, 10),
      totalSP: parseInt(row.total_sp, 10),
      spAllocatorCount: parseInt(row.sp_allocator_count, 10),
    };

    const trustTier = calculateTrustTier(engagement);

    const summary = row.description.length > 300
      ? row.description.substring(0, 300) + '...'
      : row.description;

    await query(`
      INSERT INTO bridge_content_index (
        content_type, content_id, url, title, summary, full_text,
        vote_score, participant_count, total_sp, sp_allocator_count,
        trust_tier, author_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (content_type, content_id) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        full_text = EXCLUDED.full_text,
        vote_score = EXCLUDED.vote_score,
        participant_count = EXCLUDED.participant_count,
        total_sp = EXCLUDED.total_sp,
        sp_allocator_count = EXCLUDED.sp_allocator_count,
        trust_tier = EXCLUDED.trust_tier,
        updated_at = NOW()
    `, [
      'proposal',
      row.id,
      `/governance/proposal/${row.id}`,
      row.title,
      summary,
      row.description,
      engagement.voteScore,
      engagement.participantCount,
      engagement.totalSP,
      engagement.spAllocatorCount,
      trustTier,
      row.author_id,
      row.created_at,
    ]);
    indexed++;
  }

  return indexed;
}

/**
 * Run full reindex of all content
 */
export async function reindexAll(): Promise<{
  topics: number;
  posts: number;
  proposals: number;
  total: number;
}> {
  const topics = await indexForumTopics();
  const posts = await indexForumPosts();
  const proposals = await indexProposals();

  return {
    topics,
    posts,
    proposals,
    total: topics + posts + proposals,
  };
}

/**
 * Index a single forum post (for use in triggers/hooks)
 */
export async function indexSinglePost(postId: string): Promise<void> {
  const result = await query<{
    id: string;
    topic_id: string;
    topic_title: string;
    content: string;
    author_id: string;
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
      p.content,
      p.author_id,
      p.created_at,
      COALESCE(SUM(CASE WHEN r.reaction_type = 'upvote' THEN 1 WHEN r.reaction_type = 'downvote' THEN -1 ELSE 0 END), 0) as vote_score,
      p.reply_count,
      COALESCE((SELECT SUM(amount) FROM support_points_allocations WHERE target_type = 'forum_post' AND target_id = p.id::text AND status = 'active'), 0) as total_sp,
      COALESCE((SELECT COUNT(DISTINCT member_id) FROM support_points_allocations WHERE target_type = 'forum_post' AND target_id = p.id::text AND status = 'active'), 0) as sp_allocator_count
    FROM forum_posts p
    JOIN topics t ON t.id = p.topic_id
    LEFT JOIN forum_post_reactions r ON r.post_id = p.id
    WHERE p.id = $1 AND p.deleted_at IS NULL
    GROUP BY p.id, t.title
  `, [postId]);

  if (result.rows.length === 0) return;

  const row = result.rows[0];
  const engagement: ContentEngagement = {
    voteScore: parseInt(row.vote_score, 10),
    ratingAvg: 0, // Posts don't have ratings
    replyCount: parseInt(row.reply_count, 10),
    participantCount: 0,
    totalSP: parseInt(row.total_sp, 10),
    spAllocatorCount: parseInt(row.sp_allocator_count, 10),
  };

  const trustTier = calculateTrustTier(engagement);
  const summary = row.content.length > 300
    ? row.content.substring(0, 300) + '...'
    : row.content;

  await query(`
    INSERT INTO bridge_content_index (
      content_type, content_id, url, title, summary, full_text,
      vote_score, reply_count, participant_count, total_sp, sp_allocator_count,
      trust_tier, author_id, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    ON CONFLICT (content_type, content_id) DO UPDATE SET
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      full_text = EXCLUDED.full_text,
      vote_score = EXCLUDED.vote_score,
      reply_count = EXCLUDED.reply_count,
      total_sp = EXCLUDED.total_sp,
      sp_allocator_count = EXCLUDED.sp_allocator_count,
      trust_tier = EXCLUDED.trust_tier,
      updated_at = NOW()
  `, [
    'forum_post',
    row.id,
    `/forum/topic/${row.topic_id}#post-${row.id}`,
    `Post in: ${row.topic_title}`,
    summary,
    row.content,
    engagement.voteScore,
    engagement.replyCount,
    engagement.participantCount,
    engagement.totalSP,
    engagement.spAllocatorCount,
    trustTier,
    row.author_id,
    row.created_at,
  ]);
}

// Note: removeFromIndex is already exported from bridge-content.ts
