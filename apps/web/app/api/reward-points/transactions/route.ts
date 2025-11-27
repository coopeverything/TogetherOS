/**
 * Reward Points Transactions API
 * GET /api/reward-points/transactions - Get current user's RP transaction history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { query } from '@togetheros/db';

interface RPTransactionRow {
  id: string;
  member_id: string;
  type: string;
  amount: number;
  source: string;
  metadata: Record<string, unknown>;
  created_at: Date;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get RP transactions from database
    const result = await query<RPTransactionRow>(
      `SELECT * FROM reward_points_transactions
       WHERE member_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [user.id, limit, offset]
    );

    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM reward_points_transactions WHERE member_id = $1`,
      [user.id]
    );

    const transactions = result.rows.map(row => ({
      id: row.id,
      memberId: row.member_id,
      type: row.type,
      amount: row.amount,
      source: row.source,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      transactions,
      total: parseInt(countResult.rows[0]?.count || '0', 10),
    });
  } catch (error) {
    console.error('Get Reward Points transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to get transactions' },
      { status: 500 }
    );
  }
}
