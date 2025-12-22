/**
 * Forum Topic Promotion API
 * POST /api/forum/topics/[topicId]/promote
 *
 * Promotes a forum topic to a formal governance proposal
 * Requires authentication and authorization (topic author or admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClient } from '@togetheros/db';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * Zod schema for promote request body
 */
const promoteRequestSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  summary: z.string().min(10).max(2000).optional(),
  cooperationPath: z.string().max(100).optional(),
});

/**
 * POST /api/forum/topics/[topicId]/promote
 * Promote a forum topic to a governance proposal
 * Requires authentication - only topic author or admin can promote
 * Uses database transaction to prevent race conditions
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
): Promise<NextResponse> {
  // Get database client for transaction
  const client = await getClient();

  try {
    // 1. Require authentication
    const user = await requireAuth(request);

    const { topicId } = await params;
    const rawBody = await request.json().catch(() => ({}));

    // 2. Validate request body with Zod
    const body = promoteRequestSchema.parse(rawBody);

    // 3. Start transaction to prevent race conditions
    await client.query('BEGIN');

    // 4. Fetch the topic (with FOR UPDATE to lock the row)
    const topicResult = await client.query(
      `SELECT id, title, description, author_id, cooperation_path, supporter_count, linked_proposal_id
       FROM topics
       WHERE id = $1 AND deleted_at IS NULL
       FOR UPDATE`,
      [topicId]
    );

    if (topicResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    const topic = topicResult.rows[0];

    // 5. Authorization check - only topic author or admin can promote
    if (!user.is_admin && topic.author_id !== user.id) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Only the topic author or an admin can promote this topic' },
        { status: 403 }
      );
    }

    // 6. Check if already promoted (with lock held, prevents race condition)
    if (topic.linked_proposal_id) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Topic already promoted to a proposal', proposalId: topic.linked_proposal_id },
        { status: 400 }
      );
    }

    // 7. Create proposal from topic data
    const proposalTitle = body.title || topic.title;
    const proposalSummary = body.summary || topic.description || `Promoted from forum discussion: ${topic.title}`;
    const cooperationPath = body.cooperationPath || topic.cooperation_path;

    const proposalResult = await client.query(
      `INSERT INTO proposals (
        scope_type, scope_id, author_id, title, summary,
        cooperation_path, source_topic_id, source_type, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, title, summary, status, created_at`,
      [
        'individual',              // scope_type (default for topic-promoted)
        user.id,                   // scope_id (promoter's ID, not topic author)
        user.id,                   // author_id (promoter creates the proposal)
        proposalTitle,             // title
        proposalSummary,           // summary
        cooperationPath,           // cooperation_path
        topicId,                   // source_topic_id
        'forum',                   // source_type
        'draft'                    // status (starts as draft)
      ]
    );

    const proposal = proposalResult.rows[0];

    // 8. Link topic to proposal
    await client.query(
      `UPDATE topics
       SET linked_proposal_id = $1, promotion_status = 'promoted'
       WHERE id = $2`,
      [proposal.id, topicId]
    );

    // 9. Commit transaction
    await client.query('COMMIT');

    // 10. Return success with proposal details
    return NextResponse.json({
      success: true,
      proposal: {
        id: proposal.id,
        title: proposal.title,
        summary: proposal.summary,
        status: proposal.status,
        createdAt: proposal.created_at,
        url: `/governance/${proposal.id}`
      },
      message: 'Topic successfully promoted to proposal'
    });

  } catch (error) {
    // Rollback on any error
    await client.query('ROLLBACK');

    const err = error as Error & { name?: string; errors?: unknown };
    console.error('Topic promotion error:', error);

    if (err.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (err.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: err.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to promote topic to proposal' },
      { status: 500 }
    );
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}
