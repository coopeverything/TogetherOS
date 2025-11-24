/**
 * Forum Topic Promotion API
 * POST /api/forum/topics/[topicId]/promote
 *
 * Promotes a forum topic to a formal governance proposal
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@togetheros/db';
import type { Proposal } from '@togetheros/types';

interface PromoteRequest {
  title?: string;           // Optional: override topic title
  summary?: string;         // Optional: override topic description
  cooperationPath?: string; // Optional: set cooperation path
}

/**
 * POST /api/forum/topics/[topicId]/promote
 * Promote a forum topic to a governance proposal
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
): Promise<NextResponse> {
  try {
    const { topicId } = await params;
    const body: PromoteRequest = await request.json().catch(() => ({}));

    // 1. Fetch the topic
    const topicResult = await query(
      `SELECT id, title, description, author_id, cooperation_path, supporter_count, linked_proposal_id
       FROM topics
       WHERE id = $1 AND deleted_at IS NULL`,
      [topicId]
    );

    if (topicResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    const topic = topicResult.rows[0];

    // 2. Check if already promoted
    if (topic.linked_proposal_id) {
      return NextResponse.json(
        { error: 'Topic already promoted to a proposal', proposalId: topic.linked_proposal_id },
        { status: 400 }
      );
    }

    // 3. Create proposal from topic data
    const proposalTitle = body.title || topic.title;
    const proposalSummary = body.summary || topic.description || `Promoted from forum discussion: ${topic.title}`;
    const cooperationPath = body.cooperationPath || topic.cooperation_path;

    const proposalResult = await query(
      `INSERT INTO proposals (
        scope_type, scope_id, author_id, title, summary,
        cooperation_path, source_topic_id, source_type, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, title, summary, status, created_at`,
      [
        'individual',              // scope_type (default for topic-promoted)
        topic.author_id,          // scope_id (author's ID)
        topic.author_id,          // author_id
        proposalTitle,            // title
        proposalSummary,          // summary
        cooperationPath,          // cooperation_path
        topicId,                  // source_topic_id
        'forum',                  // source_type
        'draft'                   // status (starts as draft)
      ]
    );

    const proposal = proposalResult.rows[0];

    // 4. Link topic to proposal
    await query(
      `UPDATE topics
       SET linked_proposal_id = $1, promotion_status = 'promoted'
       WHERE id = $2`,
      [proposal.id, topicId]
    );

    // 5. Return success with proposal details
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
    console.error('Topic promotion error:', error);
    return NextResponse.json(
      { error: 'Failed to promote topic to proposal' },
      { status: 500 }
    );
  }
}
