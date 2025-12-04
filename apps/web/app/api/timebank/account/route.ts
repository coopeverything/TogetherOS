/**
 * Timebank Account API
 * GET /api/timebank/account - Get member's TBC account balance and fair exchange index
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { query } from '@togetheros/db';

interface TBCAccountRow {
  member_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: Date;
  updated_at: Date;
}

interface TransactionStatsRow {
  provided_count: number;
  provided_tbc: number;
  received_count: number;
  received_tbc: number;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Get TBC account
    let accountResult = await query<TBCAccountRow>(
      `SELECT * FROM timebank_accounts WHERE member_id = $1`,
      [user.id]
    );

    // Initialize account if doesn't exist
    if (!accountResult.rows[0]) {
      const initResult = await query<TBCAccountRow>(
        `INSERT INTO timebank_accounts (member_id, balance, total_earned, total_spent)
         VALUES ($1, 0, 0, 0)
         RETURNING *`,
        [user.id]
      );
      accountResult = initResult;
    }

    const account = accountResult.rows[0];

    // Calculate fair exchange index (ratio of provided vs received)
    // Target: ratio close to 1.0 over 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const statsResult = await query<TransactionStatsRow>(
      `SELECT
         COUNT(CASE WHEN provider_id = $1 AND status = 'confirmed' THEN 1 END) as provided_count,
         COALESCE(SUM(CASE WHEN provider_id = $1 AND status = 'confirmed' THEN tbc_cost ELSE 0 END), 0) as provided_tbc,
         COUNT(CASE WHEN receiver_id = $1 AND status = 'confirmed' THEN 1 END) as received_count,
         COALESCE(SUM(CASE WHEN receiver_id = $1 AND status = 'confirmed' THEN tbc_cost ELSE 0 END), 0) as received_tbc
       FROM timebank_transactions
       WHERE (provider_id = $1 OR receiver_id = $1)
         AND created_at >= $2`,
      [user.id, sixMonthsAgo.toISOString()]
    );

    const stats = statsResult.rows[0];
    const providedTBC = Number(stats.provided_tbc) || 0;
    const receivedTBC = Number(stats.received_tbc) || 0;

    // Fair exchange index: provided/received ratio
    // > 1.0 = giving more than taking (good)
    // < 0.5 = taking twice as much (warning)
    // = 1.0 = perfectly balanced (ideal)
    let fairExchangeIndex = 1.0; // Default if no transactions
    let fairExchangeStatus: 'excellent' | 'good' | 'warning' | 'balanced' =
      'balanced';

    if (receivedTBC > 0 && providedTBC > 0) {
      fairExchangeIndex = providedTBC / receivedTBC;
      if (fairExchangeIndex >= 1.5) {
        fairExchangeStatus = 'excellent';
      } else if (fairExchangeIndex >= 0.75) {
        fairExchangeStatus = 'good';
      } else if (fairExchangeIndex < 0.5) {
        fairExchangeStatus = 'warning';
      } else {
        fairExchangeStatus = 'balanced';
      }
    } else if (providedTBC > 0 && receivedTBC === 0) {
      fairExchangeIndex = Infinity;
      fairExchangeStatus = 'excellent';
    } else if (receivedTBC > 0 && providedTBC === 0) {
      fairExchangeIndex = 0;
      fairExchangeStatus = 'warning';
    }

    return NextResponse.json({
      account: {
        memberId: account.member_id,
        balance: Number(account.balance),
        totalEarned: Number(account.total_earned),
        totalSpent: Number(account.total_spent),
        createdAt: account.created_at,
        updatedAt: account.updated_at,
      },
      activity: {
        sixMonthPeriod: {
          start: sixMonthsAgo.toISOString(),
          end: new Date().toISOString(),
        },
        servicesProvided: Number(stats.provided_count),
        tbcEarnedFromServices: providedTBC,
        servicesReceived: Number(stats.received_count),
        tbcSpentOnServices: receivedTBC,
      },
      fairExchangeIndex: {
        value: fairExchangeIndex === Infinity ? 999 : fairExchangeIndex,
        status: fairExchangeStatus,
        description: getFairExchangeDescription(fairExchangeStatus),
        targetRange: '0.75 - 1.5 (balanced give and take)',
        warningThreshold: '< 0.5 (receiving twice as much as giving)',
      },
    });
  } catch (error) {
    console.error('Get timebank account error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to get timebank account' },
      { status: 500 }
    );
  }
}

function getFairExchangeDescription(
  status: 'excellent' | 'good' | 'warning' | 'balanced'
): string {
  switch (status) {
    case 'excellent':
      return 'You are contributing significantly more than you receive. Thank you for your generosity!';
    case 'good':
      return 'Your give-and-take balance is healthy. Keep it up!';
    case 'balanced':
      return 'Your exchange ratio is perfectly balanced.';
    case 'warning':
      return 'Consider providing more services to maintain a healthy exchange balance.';
  }
}
