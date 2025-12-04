/**
 * Social Horizon Wallet API
 * GET /api/social-horizon/wallet - Get member's SH wallet balance
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { query } from '@togetheros/db';

interface SHWalletRow {
  member_id: string;
  sh_balance: number;
  total_issued: number;
  total_transferred: number;
  created_at: Date;
  updated_at: Date;
}

interface SHAllocationRow {
  cycle_name: string;
  sh_amount: number;
  basis: string;
  created_at: Date;
}

interface SHTransactionRow {
  id: string;
  amount: number;
  transaction_type: string;
  created_at: Date;
  cycle_name?: string;
  event_name?: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Get wallet balance
    let walletResult = await query<SHWalletRow>(
      `SELECT * FROM social_horizon_wallets WHERE member_id = $1`,
      [user.id]
    );

    // Initialize wallet if doesn't exist
    if (!walletResult.rows[0]) {
      const initResult = await query<SHWalletRow>(
        `INSERT INTO social_horizon_wallets (member_id, sh_balance, total_issued, total_transferred)
         VALUES ($1, 0, 0, 0)
         RETURNING *`,
        [user.id]
      );
      walletResult = initResult;
    }

    const wallet = walletResult.rows[0];

    // Get recent allocations (per issuance cycle)
    const allocationsResult = await query<SHAllocationRow>(
      `SELECT a.sh_amount, a.basis, a.created_at, c.cycle_name
       FROM sh_allocations a
       JOIN sh_issuance_cycles c ON a.cycle_id = c.id
       WHERE a.member_id = $1
       ORDER BY a.created_at DESC
       LIMIT 10`,
      [user.id]
    );

    // Get recent transactions
    const transactionsResult = await query<SHTransactionRow>(
      `SELECT t.id, t.amount, t.transaction_type, t.created_at,
              c.cycle_name, e.event_name
       FROM sh_transactions t
       LEFT JOIN sh_issuance_cycles c ON t.cycle_id = c.id
       LEFT JOIN sh_purchase_events e ON t.event_id = e.id
       WHERE t.to_wallet = $1 OR t.from_wallet = $1
       ORDER BY t.created_at DESC
       LIMIT 20`,
      [user.id]
    );

    // Get total SH in circulation (for percentage calculation)
    const circulationResult = await query<{ total: number }>(
      `SELECT COALESCE(SUM(sh_balance), 0) as total FROM social_horizon_wallets`
    );
    const totalCirculation = Number(circulationResult.rows[0]?.total || 0);

    // Calculate ownership percentage
    const ownershipPercentage =
      totalCirculation > 0
        ? (Number(wallet.sh_balance) / totalCirculation) * 100
        : 0;

    return NextResponse.json({
      wallet: {
        memberId: wallet.member_id,
        balance: Number(wallet.sh_balance),
        totalIssued: Number(wallet.total_issued),
        totalTransferred: Number(wallet.total_transferred),
        createdAt: wallet.created_at,
        updatedAt: wallet.updated_at,
      },
      ownership: {
        percentage: Math.round(ownershipPercentage * 10000) / 10000,
        totalCirculation,
        description: `You own ${ownershipPercentage.toFixed(4)}% of all Social Horizon in circulation`,
      },
      allocations: allocationsResult.rows.map((a) => ({
        cycleName: a.cycle_name,
        amount: Number(a.sh_amount),
        basis: a.basis,
        createdAt: a.created_at,
      })),
      recentTransactions: transactionsResult.rows.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.transaction_type,
        cycleName: t.cycle_name,
        eventName: t.event_name,
        createdAt: t.created_at,
      })),
      // Information about SH
      info: {
        description:
          'Social Horizon (SH) represents your long-term stake in the cooperative. It grows through sustained contribution and participation.',
        howToEarn: [
          'Quarterly issuance cycles reward contribution history',
          'Timebank activity increases your allocation weight',
          'Occasional RP purchase events (with caps)',
        ],
        benefits: [
          'Receive dividends from cooperative treasury surplus',
          'Long-term wealth tied to community participation',
          'Non-tradable to prevent speculation',
        ],
      },
    });
  } catch (error) {
    console.error('Get SH wallet error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to get SH wallet' },
      { status: 500 }
    );
  }
}
