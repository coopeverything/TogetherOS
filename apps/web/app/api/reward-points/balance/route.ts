/**
 * Reward Points Balance API
 * GET /api/reward-points/balance - Get current user's RP balance
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { query } from '@togetheros/db';

interface RPBalanceRow {
  member_id: string;
  total_earned: number;
  available: number;
  spent_on_tbc: number;
  spent_on_sh: number;
  created_at: Date;
  updated_at: Date;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get RP balance from database
    const result = await query<RPBalanceRow>(
      `SELECT * FROM reward_points_balances WHERE member_id = $1`,
      [user.id]
    );

    if (!result.rows[0]) {
      // Initialize balance if doesn't exist
      const initResult = await query<RPBalanceRow>(
        `INSERT INTO reward_points_balances (member_id, total_earned, available, spent_on_tbc, spent_on_sh)
         VALUES ($1, 0, 0, 0, 0)
         RETURNING *`,
        [user.id]
      );

      const row = initResult.rows[0];
      return NextResponse.json({
        balance: {
          memberId: row.member_id,
          totalEarned: row.total_earned,
          available: row.available,
          spentOnTBC: row.spent_on_tbc,
          spentOnSH: row.spent_on_sh,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        },
      });
    }

    const row = result.rows[0];
    return NextResponse.json({
      balance: {
        memberId: row.member_id,
        totalEarned: row.total_earned,
        available: row.available,
        spentOnTBC: row.spent_on_tbc,
        spentOnSH: row.spent_on_sh,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('Get Reward Points balance error:', error);
    return NextResponse.json(
      { error: 'Failed to get balance' },
      { status: 500 }
    );
  }
}
