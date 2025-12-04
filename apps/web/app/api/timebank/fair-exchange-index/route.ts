/**
 * Fair Exchange Index API
 * GET /api/timebank/fair-exchange-index - Get a member's fair exchange index
 *
 * The Fair Exchange Index tracks whether members take more than they give:
 * - Target: Roughly balanced over 6 months (ratio ~1.0)
 * - Warning: If ratio < 0.5 (taking twice as much as giving)
 * - Index = TBC earned from providing services / TBC spent on receiving services
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { query } from '@togetheros/db';

interface ExchangeStatsRow {
  provided_count: number;
  provided_tbc: number;
  received_count: number;
  received_tbc: number;
}

interface MonthlyActivityRow {
  month: string;
  provided_tbc: number;
  received_tbc: number;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const url = new URL(request.url);
    const memberId = url.searchParams.get('memberId') || user.id;
    const monthsBack = Math.min(
      Number(url.searchParams.get('months')) || 6,
      24
    );

    // Only admins can view other members' indices
    if (memberId !== user.id && !user.is_admin) {
      return NextResponse.json(
        { error: 'Can only view your own fair exchange index' },
        { status: 403 }
      );
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    // Get overall stats
    const statsResult = await query<ExchangeStatsRow>(
      `SELECT
         COUNT(CASE WHEN provider_id = $1 AND status = 'confirmed' THEN 1 END) as provided_count,
         COALESCE(SUM(CASE WHEN provider_id = $1 AND status = 'confirmed' THEN tbc_cost ELSE 0 END), 0) as provided_tbc,
         COUNT(CASE WHEN receiver_id = $1 AND status = 'confirmed' THEN 1 END) as received_count,
         COALESCE(SUM(CASE WHEN receiver_id = $1 AND status = 'confirmed' THEN tbc_cost ELSE 0 END), 0) as received_tbc
       FROM timebank_transactions
       WHERE (provider_id = $1 OR receiver_id = $1)
         AND created_at >= $2`,
      [memberId, startDate.toISOString()]
    );

    // Get monthly breakdown
    const monthlyResult = await query<MonthlyActivityRow>(
      `SELECT
         TO_CHAR(created_at, 'YYYY-MM') as month,
         COALESCE(SUM(CASE WHEN provider_id = $1 AND status = 'confirmed' THEN tbc_cost ELSE 0 END), 0) as provided_tbc,
         COALESCE(SUM(CASE WHEN receiver_id = $1 AND status = 'confirmed' THEN tbc_cost ELSE 0 END), 0) as received_tbc
       FROM timebank_transactions
       WHERE (provider_id = $1 OR receiver_id = $1)
         AND created_at >= $2
       GROUP BY TO_CHAR(created_at, 'YYYY-MM')
       ORDER BY month DESC`,
      [memberId, startDate.toISOString()]
    );

    const stats = statsResult.rows[0];
    const providedTBC = Number(stats.provided_tbc) || 0;
    const receivedTBC = Number(stats.received_tbc) || 0;

    // Calculate index
    let index = 1.0;
    let status: 'excellent' | 'good' | 'balanced' | 'warning' | 'critical';
    let recommendation: string;

    if (receivedTBC === 0 && providedTBC === 0) {
      index = 1.0;
      status = 'balanced';
      recommendation = 'Start by either providing or requesting services!';
    } else if (receivedTBC === 0) {
      index = providedTBC > 0 ? 999 : 1.0;
      status = 'excellent';
      recommendation =
        'You are all give and no take! Consider using some services too.';
    } else if (providedTBC === 0) {
      index = 0;
      status = 'critical';
      recommendation =
        'Consider offering some services to balance your exchange.';
    } else {
      index = providedTBC / receivedTBC;

      if (index >= 2.0) {
        status = 'excellent';
        recommendation =
          'Great generosity! You can comfortably use more services.';
      } else if (index >= 1.0) {
        status = 'good';
        recommendation = 'Well balanced! You give as much as you receive.';
      } else if (index >= 0.75) {
        status = 'balanced';
        recommendation = 'Slightly more receiving than giving, but healthy.';
      } else if (index >= 0.5) {
        status = 'warning';
        recommendation =
          'Consider providing more services to maintain balance.';
      } else {
        status = 'critical';
        recommendation =
          'You are receiving significantly more than giving. Please offer some services.';
      }
    }

    return NextResponse.json({
      memberId,
      period: {
        months: monthsBack,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
      summary: {
        servicesProvided: Number(stats.provided_count),
        tbcEarned: providedTBC,
        servicesReceived: Number(stats.received_count),
        tbcSpent: receivedTBC,
        netTBC: providedTBC - receivedTBC,
      },
      fairExchangeIndex: {
        value: Math.round(index * 100) / 100,
        status,
        recommendation,
        thresholds: {
          excellent: '>= 2.0',
          good: '>= 1.0',
          balanced: '>= 0.75',
          warning: '>= 0.5',
          critical: '< 0.5',
        },
      },
      monthlyBreakdown: monthlyResult.rows.map((row) => ({
        month: row.month,
        provided: Number(row.provided_tbc),
        received: Number(row.received_tbc),
        net: Number(row.provided_tbc) - Number(row.received_tbc),
        ratio:
          Number(row.received_tbc) > 0
            ? Math.round(
                (Number(row.provided_tbc) / Number(row.received_tbc)) * 100
              ) / 100
            : Number(row.provided_tbc) > 0
              ? 999
              : 1.0,
      })),
    });
  } catch (error) {
    console.error('Get fair exchange index error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to get fair exchange index' },
      { status: 500 }
    );
  }
}
