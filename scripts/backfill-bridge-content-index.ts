#!/usr/bin/env npx ts-node
/**
 * Backfill Bridge Content Index
 *
 * Indexes all existing forum topics, posts, proposals, and articles
 * into the bridge_content_index table for Bridge RAG.
 *
 * Usage:
 *   npx ts-node scripts/backfill-bridge-content-index.ts
 *
 * Or on production server:
 *   cd /var/www/togetheros
 *   DATABASE_URL=... npx ts-node scripts/backfill-bridge-content-index.ts
 */

import { query, close } from '@togetheros/db';

interface ForumTopic {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  author_id: string;
  created_at: Date;
  post_count: number;
  participant_count: number;
}

interface ForumPost {
  id: string;
  topic_id: string;
  topic_slug: string;
  content: string;
  author_id: string;
  created_at: Date;
  reply_count: number;
}

interface Proposal {
  id: string;
  title: string;
  summary: string;
  description: string | null;
  author_id: string;
  created_at: Date;
}

async function backfillForumTopics(): Promise<number> {
  console.log('📋 Indexing forum topics...');

  const result = await query<ForumTopic>(`
    SELECT
      t.id,
      t.title,
      t.description,
      t.slug,
      t.author_id,
      t.created_at,
      t.post_count,
      t.participant_count
    FROM forum_topics t
    WHERE t.deleted_at IS NULL
  `);

  let count = 0;
  for (const topic of result.rows) {
    // Get SP stats
    const spResult = await query<{ total_sp: string; allocator_count: string }>(`
      SELECT
        COALESCE(SUM(amount), 0) as total_sp,
        COUNT(DISTINCT member_id) as allocator_count
      FROM support_points_allocations
      WHERE target_type = 'forum_topic' AND target_id = $1 AND status = 'active'
    `, [topic.id]);

    const totalSP = parseInt(spResult.rows[0]?.total_sp || '0', 10);
    const spAllocatorCount = parseInt(spResult.rows[0]?.allocator_count || '0', 10);

    // Calculate trust tier
    const trustTier = calculateTrustTier(
      0, // voteScore - forum topics don't have votes yet
      topic.post_count,
      topic.participant_count,
      totalSP,
      topic.created_at
    );

    await query(`
      INSERT INTO bridge_content_index (
        content_type, content_id, url, title, summary, full_text,
        vote_score, reply_count, participant_count, total_sp, sp_allocator_count,
        trust_tier, author_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (content_type, content_id) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        reply_count = EXCLUDED.reply_count,
        participant_count = EXCLUDED.participant_count,
        total_sp = EXCLUDED.total_sp,
        sp_allocator_count = EXCLUDED.sp_allocator_count,
        trust_tier = EXCLUDED.trust_tier,
        updated_at = NOW()
    `, [
      'forum_topic',
      topic.id,
      `/forum/topics/${topic.slug}`,
      topic.title,
      topic.description?.slice(0, 500) || null,
      topic.description,
      0,
      topic.post_count,
      topic.participant_count,
      totalSP,
      spAllocatorCount,
      trustTier,
      topic.author_id,
      topic.created_at,
    ]);

    count++;
  }

  console.log(`  ✅ Indexed ${count} forum topics`);
  return count;
}

async function backfillForumPosts(): Promise<number> {
  console.log('💬 Indexing forum posts...');

  const result = await query<ForumPost>(`
    SELECT
      p.id,
      p.topic_id,
      t.slug as topic_slug,
      p.content,
      p.author_id,
      p.created_at,
      p.reply_count
    FROM forum_posts p
    JOIN forum_topics t ON t.id = p.topic_id
    WHERE p.deleted_at IS NULL
  `);

  let count = 0;
  for (const post of result.rows) {
    // Get SP stats
    const spResult = await query<{ total_sp: string; allocator_count: string }>(`
      SELECT
        COALESCE(SUM(amount), 0) as total_sp,
        COUNT(DISTINCT member_id) as allocator_count
      FROM support_points_allocations
      WHERE target_type = 'forum_post' AND target_id = $1 AND status = 'active'
    `, [post.id]);

    const totalSP = parseInt(spResult.rows[0]?.total_sp || '0', 10);
    const spAllocatorCount = parseInt(spResult.rows[0]?.allocator_count || '0', 10);

    // Calculate trust tier
    const trustTier = calculateTrustTier(
      0,
      post.reply_count,
      0,
      totalSP,
      post.created_at
    );

    // Extract title from first sentence
    const firstSentence = post.content.split(/[.!?]/)[0]?.trim() || 'Forum Post';
    const title = firstSentence.length > 100 ? firstSentence.slice(0, 100) + '...' : firstSentence;

    await query(`
      INSERT INTO bridge_content_index (
        content_type, content_id, url, title, summary, full_text,
        vote_score, reply_count, total_sp, sp_allocator_count,
        trust_tier, author_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (content_type, content_id) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        reply_count = EXCLUDED.reply_count,
        total_sp = EXCLUDED.total_sp,
        sp_allocator_count = EXCLUDED.sp_allocator_count,
        trust_tier = EXCLUDED.trust_tier,
        updated_at = NOW()
    `, [
      'forum_post',
      post.id,
      `/forum/topics/${post.topic_slug}#post-${post.id}`,
      title,
      post.content.slice(0, 500),
      post.content,
      0,
      post.reply_count,
      totalSP,
      spAllocatorCount,
      trustTier,
      post.author_id,
      post.created_at,
    ]);

    count++;
  }

  console.log(`  ✅ Indexed ${count} forum posts`);
  return count;
}

async function backfillProposals(): Promise<number> {
  console.log('📜 Indexing proposals...');

  const result = await query<Proposal>(`
    SELECT
      p.id,
      p.title,
      p.summary,
      p.description,
      p.author_id,
      p.created_at
    FROM proposals p
    WHERE p.deleted_at IS NULL
  `);

  let count = 0;
  for (const proposal of result.rows) {
    // Get SP stats
    const spResult = await query<{ total_sp: string; allocator_count: string }>(`
      SELECT
        COALESCE(SUM(amount), 0) as total_sp,
        COUNT(DISTINCT member_id) as allocator_count
      FROM support_points_allocations
      WHERE target_type = 'proposal' AND target_id = $1 AND status = 'active'
    `, [proposal.id]);

    const totalSP = parseInt(spResult.rows[0]?.total_sp || '0', 10);
    const spAllocatorCount = parseInt(spResult.rows[0]?.allocator_count || '0', 10);

    // Get vote stats
    const voteResult = await query<{ vote_count: string; avg_rating: string }>(`
      SELECT
        COUNT(*) as vote_count,
        AVG(rating) as avg_rating
      FROM proposal_votes
      WHERE proposal_id = $1
    `, [proposal.id]);

    const participantCount = parseInt(voteResult.rows[0]?.vote_count || '0', 10);
    const ratingAvg = parseFloat(voteResult.rows[0]?.avg_rating || '0') || null;

    // Calculate trust tier
    const trustTier = calculateTrustTier(
      0,
      0,
      participantCount,
      totalSP,
      proposal.created_at
    );

    await query(`
      INSERT INTO bridge_content_index (
        content_type, content_id, url, title, summary, full_text,
        rating_avg, participant_count, total_sp, sp_allocator_count,
        trust_tier, author_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (content_type, content_id) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        rating_avg = EXCLUDED.rating_avg,
        participant_count = EXCLUDED.participant_count,
        total_sp = EXCLUDED.total_sp,
        sp_allocator_count = EXCLUDED.sp_allocator_count,
        trust_tier = EXCLUDED.trust_tier,
        updated_at = NOW()
    `, [
      'proposal',
      proposal.id,
      `/governance/${proposal.id}`,
      proposal.title,
      proposal.summary,
      proposal.description || proposal.summary,
      ratingAvg,
      participantCount,
      totalSP,
      spAllocatorCount,
      trustTier,
      proposal.author_id,
      proposal.created_at,
    ]);

    count++;
  }

  console.log(`  ✅ Indexed ${count} proposals`);
  return count;
}

/**
 * Simple trust tier calculation for backfill
 */
function calculateTrustTier(
  voteScore: number,
  replyCount: number,
  participantCount: number,
  totalSP: number,
  createdAt: Date
): string {
  const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const isNew = ageHours < 24;

  const effectiveVotes = voteScore + (totalSP * 2);
  const effectiveParticipants = participantCount;

  // Consensus
  if (effectiveVotes >= 20 && effectiveParticipants >= 10 && totalSP >= 50) {
    return 'consensus';
  }

  // High
  if (totalSP >= 20 || (effectiveVotes >= 10 && replyCount >= 5)) {
    return 'high';
  }

  // Medium
  if (totalSP >= 5 || effectiveVotes >= 3 || replyCount >= 3) {
    return 'medium';
  }

  // Low
  if (voteScore >= 1 || replyCount >= 1 || totalSP > 0) {
    return 'low';
  }

  // Unvalidated
  return 'unvalidated';
}

async function main() {
  console.log('🚀 Starting Bridge Content Index Backfill\n');

  try {
    const topicCount = await backfillForumTopics();
    const postCount = await backfillForumPosts();
    const proposalCount = await backfillProposals();

    const total = topicCount + postCount + proposalCount;

    console.log('\n✅ Backfill complete!');
    console.log(`   Total indexed: ${total} items`);
    console.log(`   - Forum topics: ${topicCount}`);
    console.log(`   - Forum posts: ${postCount}`);
    console.log(`   - Proposals: ${proposalCount}`);
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  } finally {
    await close();
  }
}

main();
