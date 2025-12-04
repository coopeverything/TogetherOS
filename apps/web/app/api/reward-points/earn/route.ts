/**
 * Reward Points Earn API
 * POST /api/reward-points/earn - Award RP for contribution events
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { query } from '@togetheros/db';

interface EarnRPRequest {
  eventType: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

interface RPEarningRuleRow {
  event_type: string;
  rp_amount: number;
  min_threshold: Record<string, unknown> | null;
  active: boolean;
}

interface RPBalanceRow {
  member_id: string;
  total_earned: number;
  available: number;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = (await request.json()) as EarnRPRequest;

    if (!body.eventType) {
      return NextResponse.json(
        { error: 'eventType is required' },
        { status: 400 }
      );
    }

    // Look up RP earning rule for this event type
    const ruleResult = await query<RPEarningRuleRow>(
      `SELECT event_type, rp_amount, min_threshold, active
       FROM rp_earning_rules
       WHERE event_type = $1 AND active = TRUE`,
      [body.eventType]
    );

    if (!ruleResult.rows[0]) {
      return NextResponse.json(
        { error: `No active earning rule for event type: ${body.eventType}` },
        { status: 400 }
      );
    }

    const rule = ruleResult.rows[0];
    const rpAmount = rule.rp_amount;

    // Begin transaction to update balance and log transaction
    await query('BEGIN');

    try {
      // Update RP balance
      const updateResult = await query<RPBalanceRow>(
        `UPDATE reward_points_balances
         SET total_earned = total_earned + $1,
             available = available + $1,
             updated_at = NOW()
         WHERE member_id = $2
         RETURNING member_id, total_earned, available`,
        [rpAmount, user.id]
      );

      // If no row exists, insert one first
      let balance: RPBalanceRow;
      if (!updateResult.rows[0]) {
        const insertResult = await query<RPBalanceRow>(
          `INSERT INTO reward_points_balances (member_id, total_earned, available, spent_on_tbc, spent_on_sh)
           VALUES ($1, $2, $2, 0, 0)
           RETURNING member_id, total_earned, available`,
          [user.id, rpAmount]
        );
        balance = insertResult.rows[0];
      } else {
        balance = updateResult.rows[0];
      }

      // Log the transaction
      await query(
        `INSERT INTO reward_points_transactions (member_id, type, amount, source, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          user.id,
          'earn_contribution',
          rpAmount,
          body.source || body.eventType,
          JSON.stringify(body.metadata || {}),
        ]
      );

      await query('COMMIT');

      return NextResponse.json({
        success: true,
        earned: {
          amount: rpAmount,
          eventType: body.eventType,
          source: body.source || body.eventType,
        },
        balance: {
          memberId: balance.member_id,
          totalEarned: balance.total_earned,
          available: balance.available,
        },
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Earn Reward Points error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to earn reward points' },
      { status: 500 }
    );
  }
}
