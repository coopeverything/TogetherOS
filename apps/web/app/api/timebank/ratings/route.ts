/**
 * Timebank Ratings API
 * GET /api/timebank/ratings - Get ratings for a provider or transaction
 * POST /api/timebank/ratings - Submit a rating after service completion
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/middleware';
import { query } from '@togetheros/db';

interface RatingRow {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  provider_id: string;
  rating: number;
  review_text: string | null;
  created_at: Date;
  reviewer_name?: string;
  reviewer_avatar_url?: string | null;
}

interface CreateRatingRequest {
  transactionId: string;
  rating: number;
  reviewText?: string;
}

/**
 * GET /api/timebank/ratings - Get ratings
 * Query params:
 * - providerId: Get all ratings for a provider
 * - transactionId: Get rating for a specific transaction
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const providerId = url.searchParams.get('providerId');
    const transactionId = url.searchParams.get('transactionId');
    const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 50);
    const offset = Number(url.searchParams.get('offset')) || 0;

    if (!providerId && !transactionId) {
      return NextResponse.json(
        { error: 'providerId or transactionId is required' },
        { status: 400 }
      );
    }

    let queryText = `
      SELECT r.*,
             u.name as reviewer_name,
             u.avatar_url as reviewer_avatar_url
      FROM timebank_ratings r
      JOIN users u ON r.reviewer_id = u.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (providerId) {
      queryText += ` AND r.provider_id = $${paramIndex}`;
      params.push(providerId);
      paramIndex++;
    }

    if (transactionId) {
      queryText += ` AND r.transaction_id = $${paramIndex}`;
      params.push(transactionId);
      paramIndex++;
    }

    queryText += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query<RatingRow>(queryText, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM timebank_ratings r WHERE 1=1`;
    const countParams: string[] = [];
    let countParamIndex = 1;

    if (providerId) {
      countQuery += ` AND r.provider_id = $${countParamIndex}`;
      countParams.push(providerId);
      countParamIndex++;
    }

    if (transactionId) {
      countQuery += ` AND r.transaction_id = $${countParamIndex}`;
      countParams.push(transactionId);
    }

    const countResult = await query<{ total: number }>(countQuery, countParams);
    const total = Number(countResult.rows[0]?.total || 0);

    return NextResponse.json({
      ratings: result.rows.map(row => ({
        id: row.id,
        transactionId: row.transaction_id,
        reviewerId: row.reviewer_id,
        providerId: row.provider_id,
        rating: Number(row.rating),
        reviewText: row.review_text,
        createdAt: row.created_at,
        reviewer: {
          name: row.reviewer_name,
          avatarUrl: row.reviewer_avatar_url,
        },
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + result.rows.length < total,
      },
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    return NextResponse.json(
      { error: 'Failed to get ratings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/timebank/ratings - Submit a rating
 * Only the receiver of a confirmed transaction can rate the provider
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = (await request.json()) as CreateRatingRequest;

    // Validate required fields
    if (!body.transactionId || !body.rating) {
      return NextResponse.json(
        { error: 'transactionId and rating are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (body.rating < 1 || body.rating > 5 || !Number.isInteger(body.rating)) {
      return NextResponse.json(
        { error: 'rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Verify the transaction exists and is confirmed
    const txResult = await query<{
      id: string;
      receiver_id: string;
      provider_id: string;
      status: string;
    }>(
      `SELECT id, receiver_id, provider_id, status
       FROM timebank_transactions
       WHERE id = $1`,
      [body.transactionId]
    );

    const transaction = txResult.rows[0];
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Only confirmed transactions can be rated
    if (transaction.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Only confirmed transactions can be rated' },
        { status: 400 }
      );
    }

    // Only the receiver can rate the provider
    if (transaction.receiver_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the service receiver can rate the provider' },
        { status: 403 }
      );
    }

    // Check if already rated
    const existingRating = await query<{ id: string }>(
      `SELECT id FROM timebank_ratings
       WHERE transaction_id = $1 AND reviewer_id = $2`,
      [body.transactionId, user.id]
    );

    if (existingRating.rows[0]) {
      return NextResponse.json(
        { error: 'You have already rated this transaction' },
        { status: 400 }
      );
    }

    // Insert the rating (trigger will update provider stats)
    const result = await query<RatingRow>(
      `INSERT INTO timebank_ratings
       (transaction_id, reviewer_id, provider_id, rating, review_text)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        body.transactionId,
        user.id,
        transaction.provider_id,
        body.rating,
        body.reviewText || null,
      ]
    );

    const rating = result.rows[0];

    return NextResponse.json({
      success: true,
      rating: {
        id: rating.id,
        transactionId: rating.transaction_id,
        reviewerId: rating.reviewer_id,
        providerId: rating.provider_id,
        rating: Number(rating.rating),
        reviewText: rating.review_text,
        createdAt: rating.created_at,
      },
    });
  } catch (error) {
    console.error('Create rating error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to create rating' },
      { status: 500 }
    );
  }
}
