/**
 * RP → TBC Conversion API
 * POST /api/reward-points/convert-to-tbc - Convert RP to TBC with monthly throttling
 *
 * Rate: 100 RP = 1 TBC
 * Monthly cap: 1 TBC per member (100 RP max conversion per month)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { query } from '@togetheros/db';

// Conversion constants (should be in system_settings table eventually)
const RP_PER_TBC = 100;
const MAX_TBC_PER_MONTH = 1;
const MAX_RP_PER_MONTH = RP_PER_TBC * MAX_TBC_PER_MONTH;

interface ConvertRequest {
  rpAmount: number;
}

interface RPBalanceRow {
  member_id: string;
  total_earned: number;
  available: number;
  spent_on_tbc: number;
  spent_on_sh: number;
}

interface ConversionRow {
  total_rp_spent: number;
}

interface TBCAccountRow {
  member_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = (await request.json()) as ConvertRequest;

    // Validate input
    if (!body.rpAmount || body.rpAmount <= 0) {
      return NextResponse.json(
        { error: 'rpAmount must be a positive number' },
        { status: 400 }
      );
    }

    if (body.rpAmount > MAX_RP_PER_MONTH) {
      return NextResponse.json(
        {
          error: `Maximum conversion is ${MAX_RP_PER_MONTH} RP (${MAX_TBC_PER_MONTH} TBC) per month`,
        },
        { status: 400 }
      );
    }

    // Calculate TBC to receive
    const tbcToReceive = body.rpAmount / RP_PER_TBC;
    if (tbcToReceive <= 0) {
      return NextResponse.json(
        { error: `Minimum conversion is ${RP_PER_TBC} RP for 1 TBC` },
        { status: 400 }
      );
    }

    // Get current month (first day of month for tracking)
    const now = new Date();
    const conversionMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    // Check current RP balance
    const balanceResult = await query<RPBalanceRow>(
      `SELECT * FROM reward_points_balances WHERE member_id = $1`,
      [user.id]
    );

    if (!balanceResult.rows[0]) {
      return NextResponse.json(
        { error: 'No RP balance found' },
        { status: 400 }
      );
    }

    const balance = balanceResult.rows[0];
    if (balance.available < body.rpAmount) {
      return NextResponse.json(
        {
          error: `Insufficient RP balance. Available: ${balance.available}, Requested: ${body.rpAmount}`,
        },
        { status: 400 }
      );
    }

    // Check monthly conversion limit
    const monthlyResult = await query<ConversionRow>(
      `SELECT COALESCE(SUM(rp_spent), 0) as total_rp_spent
       FROM rp_to_tbc_conversions
       WHERE member_id = $1 AND conversion_month = $2`,
      [user.id, conversionMonth]
    );

    const alreadyConverted = Number(monthlyResult.rows[0]?.total_rp_spent || 0);
    const remainingAllowance = MAX_RP_PER_MONTH - alreadyConverted;

    if (remainingAllowance <= 0) {
      return NextResponse.json(
        {
          error: `Monthly conversion limit reached. You can convert up to ${MAX_RP_PER_MONTH} RP (${MAX_TBC_PER_MONTH} TBC) per month.`,
          alreadyConverted,
          limit: MAX_RP_PER_MONTH,
        },
        { status: 400 }
      );
    }

    if (body.rpAmount > remainingAllowance) {
      return NextResponse.json(
        {
          error: `Exceeds monthly limit. You can convert ${remainingAllowance} more RP this month.`,
          alreadyConverted,
          remainingAllowance,
          limit: MAX_RP_PER_MONTH,
        },
        { status: 400 }
      );
    }

    // Begin transaction
    await query('BEGIN');

    try {
      // 1. Deduct RP from balance
      await query(
        `UPDATE reward_points_balances
         SET available = available - $1,
             spent_on_tbc = spent_on_tbc + $1,
             updated_at = NOW()
         WHERE member_id = $2`,
        [body.rpAmount, user.id]
      );

      // 2. Log RP transaction
      await query(
        `INSERT INTO reward_points_transactions (member_id, type, amount, source, metadata)
         VALUES ($1, 'spend_tbc', $2, 'conversion', $3)`,
        [user.id, -body.rpAmount, JSON.stringify({ tbcReceived: tbcToReceive })]
      );

      // 3. Record conversion for throttling
      await query(
        `INSERT INTO rp_to_tbc_conversions (member_id, rp_spent, tbc_received, conversion_month, rate_used)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, body.rpAmount, tbcToReceive, conversionMonth, RP_PER_TBC]
      );

      // 4. Add TBC to timebank account
      const tbcResult = await query<TBCAccountRow>(
        `UPDATE timebank_accounts
         SET balance = balance + $1,
             total_earned = total_earned + $1,
             updated_at = NOW()
         WHERE member_id = $2
         RETURNING *`,
        [tbcToReceive, user.id]
      );

      // If no TBC account exists, create one
      let tbcAccount: TBCAccountRow;
      if (!tbcResult.rows[0]) {
        const insertResult = await query<TBCAccountRow>(
          `INSERT INTO timebank_accounts (member_id, balance, total_earned, total_spent)
           VALUES ($1, $2, $2, 0)
           RETURNING *`,
          [user.id, tbcToReceive]
        );
        tbcAccount = insertResult.rows[0];
      } else {
        tbcAccount = tbcResult.rows[0];
      }

      await query('COMMIT');

      // Get updated RP balance
      const updatedBalanceResult = await query<RPBalanceRow>(
        `SELECT * FROM reward_points_balances WHERE member_id = $1`,
        [user.id]
      );
      const updatedRPBalance = updatedBalanceResult.rows[0];

      return NextResponse.json({
        success: true,
        conversion: {
          rpSpent: body.rpAmount,
          tbcReceived: tbcToReceive,
          rate: RP_PER_TBC,
          conversionMonth,
        },
        rpBalance: {
          memberId: updatedRPBalance.member_id,
          totalEarned: updatedRPBalance.total_earned,
          available: updatedRPBalance.available,
          spentOnTBC: updatedRPBalance.spent_on_tbc,
          spentOnSH: updatedRPBalance.spent_on_sh,
        },
        tbcAccount: {
          memberId: tbcAccount.member_id,
          balance: tbcAccount.balance,
          totalEarned: tbcAccount.total_earned,
          totalSpent: tbcAccount.total_spent,
        },
        monthlyStatus: {
          totalConvertedThisMonth: alreadyConverted + body.rpAmount,
          remainingAllowance: remainingAllowance - body.rpAmount,
          limit: MAX_RP_PER_MONTH,
        },
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('RP to TBC conversion error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to convert RP to TBC' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reward-points/convert-to-tbc - Get conversion status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Get current month
    const now = new Date();
    const conversionMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    // Get monthly conversions
    const monthlyResult = await query<ConversionRow>(
      `SELECT COALESCE(SUM(rp_spent), 0) as total_rp_spent
       FROM rp_to_tbc_conversions
       WHERE member_id = $1 AND conversion_month = $2`,
      [user.id, conversionMonth]
    );

    const alreadyConverted = Number(monthlyResult.rows[0]?.total_rp_spent || 0);
    const remainingAllowance = Math.max(0, MAX_RP_PER_MONTH - alreadyConverted);

    // Get RP balance
    const balanceResult = await query<RPBalanceRow>(
      `SELECT * FROM reward_points_balances WHERE member_id = $1`,
      [user.id]
    );

    const balance = balanceResult.rows[0];

    return NextResponse.json({
      conversionRate: {
        rpPerTBC: RP_PER_TBC,
        description: `${RP_PER_TBC} RP = 1 TBC`,
      },
      monthlyLimit: {
        maxRPPerMonth: MAX_RP_PER_MONTH,
        maxTBCPerMonth: MAX_TBC_PER_MONTH,
        currentMonth: conversionMonth,
        alreadyConverted,
        remainingAllowance,
      },
      rpBalance: balance
        ? {
            available: balance.available,
            canConvert: Math.min(balance.available, remainingAllowance),
          }
        : {
            available: 0,
            canConvert: 0,
          },
    });
  } catch (error) {
    console.error('Get conversion status error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to get conversion status' },
      { status: 500 }
    );
  }
}
