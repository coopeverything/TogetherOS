/**
 * Social Horizon Purchase Events API
 * GET /api/social-horizon/events - List available SH purchase events
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { query } from '@togetheros/db';

interface SHPurchaseEventRow {
  id: string;
  event_name: string;
  cycle_id: string | null;
  start_date: Date;
  end_date: Date;
  rp_per_sh: number | null;
  money_per_sh: number | null;
  sh_cap_per_person: number;
  global_sh_cap: number;
  sh_distributed: number;
  fiscal_regularity_required: boolean;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  cycle_name?: string;
}

interface UserPurchaseRow {
  event_id: string;
  total_purchased: number;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const url = new URL(request.url);
    const status = url.searchParams.get('status'); // 'active', 'pending', 'closed', or null for all
    const includeExpired = url.searchParams.get('includeExpired') === 'true';

    let queryText = `
      SELECT e.*, c.cycle_name
      FROM sh_purchase_events e
      LEFT JOIN sh_issuance_cycles c ON e.cycle_id = c.id
      WHERE 1=1
    `;
    const params: string[] = [];
    let paramIndex = 1;

    if (status) {
      queryText += ` AND e.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (!includeExpired) {
      queryText += ` AND e.end_date >= NOW()`;
    }

    queryText += ` ORDER BY e.start_date DESC`;

    const eventsResult = await query<SHPurchaseEventRow>(queryText, params);

    // Get user's purchases in each event
    const userPurchases = await query<UserPurchaseRow>(
      `SELECT t.event_id, COALESCE(SUM(t.amount), 0) as total_purchased
       FROM sh_transactions t
       WHERE t.to_wallet = $1 AND t.event_id IS NOT NULL
       GROUP BY t.event_id`,
      [user.id]
    );

    const purchaseMap = new Map(
      userPurchases.rows.map((p) => [p.event_id, Number(p.total_purchased)])
    );

    // Check user's fiscal regularity (dues up to date)
    // For now, simplified check - in production, check membership_fees table
    const fiscallyRegular = true; // TODO: Implement actual check

    return NextResponse.json({
      events: eventsResult.rows.map((e) => {
        const userPurchased = purchaseMap.get(e.id) || 0;
        const remainingPersonalCap = Math.max(
          0,
          Number(e.sh_cap_per_person) - userPurchased
        );
        const remainingGlobalCap = Math.max(
          0,
          Number(e.global_sh_cap) - Number(e.sh_distributed)
        );

        return {
          id: e.id,
          eventName: e.event_name,
          cycleName: e.cycle_name,
          startDate: e.start_date,
          endDate: e.end_date,
          pricing: {
            rpPerSH: e.rp_per_sh ? Number(e.rp_per_sh) : null,
            moneyPerSH: e.money_per_sh ? Number(e.money_per_sh) : null,
          },
          caps: {
            perPerson: Number(e.sh_cap_per_person),
            global: Number(e.global_sh_cap),
          },
          progress: {
            shDistributed: Number(e.sh_distributed),
            remainingGlobal: remainingGlobalCap,
            percentDistributed:
              Math.round(
                (Number(e.sh_distributed) / Number(e.global_sh_cap)) * 10000
              ) / 100,
          },
          userStatus: {
            purchased: userPurchased,
            remainingAllowance: remainingPersonalCap,
            canPurchase:
              e.status === 'active' &&
              remainingPersonalCap > 0 &&
              remainingGlobalCap > 0 &&
              (!e.fiscal_regularity_required || fiscallyRegular),
          },
          fiscalRegularityRequired: e.fiscal_regularity_required,
          status: e.status,
          createdAt: e.created_at,
        };
      }),
      userFiscalStatus: {
        isRegular: fiscallyRegular,
        description: fiscallyRegular
          ? 'Your membership dues are up to date'
          : 'Please pay your membership dues to participate in SH events',
      },
    });
  } catch (error) {
    console.error('Get SH events error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to get SH events' },
      { status: 500 }
    );
  }
}
