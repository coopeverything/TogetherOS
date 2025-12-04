/**
 * SH Purchase API
 * POST /api/social-horizon/events/[id]/purchase - Purchase SH with RP in an event
 *
 * Rules:
 * - Must be an active event
 * - Per-person cap enforced
 * - Global cap enforced
 * - Fiscal regularity required (if event requires it)
 * - RP is BURNED (cannot also convert to TBC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { query } from '@togetheros/db';

interface PurchaseRequest {
  shAmount: number;
}

interface SHPurchaseEventRow {
  id: string;
  event_name: string;
  rp_per_sh: number | null;
  money_per_sh: number | null;
  sh_cap_per_person: number;
  global_sh_cap: number;
  sh_distributed: number;
  fiscal_regularity_required: boolean;
  status: string;
}

interface UserPurchaseRow {
  total_purchased: number;
}

interface RPBalanceRow {
  available: number;
}

interface SHWalletRow {
  sh_balance: number;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    const { id: eventId } = await context.params;
    const body = (await request.json()) as PurchaseRequest;

    if (!body.shAmount || body.shAmount <= 0) {
      return NextResponse.json(
        { error: 'shAmount must be a positive number' },
        { status: 400 }
      );
    }

    // Get the event
    const eventResult = await query<SHPurchaseEventRow>(
      `SELECT * FROM sh_purchase_events WHERE id = $1`,
      [eventId]
    );

    if (!eventResult.rows[0]) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const event = eventResult.rows[0];

    // Validate event is active
    if (event.status !== 'active') {
      return NextResponse.json(
        { error: `Event is ${event.status}, not accepting purchases` },
        { status: 400 }
      );
    }

    // Only RP purchases implemented (not money)
    if (!event.rp_per_sh) {
      return NextResponse.json(
        { error: 'This event does not accept RP purchases' },
        { status: 400 }
      );
    }

    const rpRequired = body.shAmount * Number(event.rp_per_sh);

    // Check user's existing purchases in this event
    const existingPurchases = await query<UserPurchaseRow>(
      `SELECT COALESCE(SUM(amount), 0) as total_purchased
       FROM sh_transactions
       WHERE to_wallet = $1 AND event_id = $2`,
      [user.id, eventId]
    );

    const alreadyPurchased = Number(
      existingPurchases.rows[0]?.total_purchased || 0
    );
    const remainingPersonalCap =
      Number(event.sh_cap_per_person) - alreadyPurchased;

    if (body.shAmount > remainingPersonalCap) {
      return NextResponse.json(
        {
          error: `Exceeds personal cap. You can purchase ${remainingPersonalCap} more SH in this event.`,
          alreadyPurchased,
          personalCap: Number(event.sh_cap_per_person),
          remainingCap: remainingPersonalCap,
        },
        { status: 400 }
      );
    }

    // Check global cap
    const remainingGlobalCap =
      Number(event.global_sh_cap) - Number(event.sh_distributed);
    if (body.shAmount > remainingGlobalCap) {
      return NextResponse.json(
        {
          error: `Exceeds global cap. Only ${remainingGlobalCap} SH remaining in this event.`,
          globalCap: Number(event.global_sh_cap),
          distributed: Number(event.sh_distributed),
          remaining: remainingGlobalCap,
        },
        { status: 400 }
      );
    }

    // Check user's RP balance
    const rpBalanceResult = await query<RPBalanceRow>(
      `SELECT available FROM reward_points_balances WHERE member_id = $1`,
      [user.id]
    );

    if (!rpBalanceResult.rows[0]) {
      return NextResponse.json(
        { error: 'No RP balance found' },
        { status: 400 }
      );
    }

    const availableRP = Number(rpBalanceResult.rows[0].available);
    if (availableRP < rpRequired) {
      return NextResponse.json(
        {
          error: `Insufficient RP. Required: ${rpRequired}, Available: ${availableRP}`,
          rpRequired,
          rpAvailable: availableRP,
          shRequested: body.shAmount,
        },
        { status: 400 }
      );
    }

    // TODO: Check fiscal regularity if required
    // For now, assume all members are fiscally regular

    // Begin transaction
    await query('BEGIN');

    try {
      // 1. Burn RP (deduct from balance, add to spent_on_sh)
      await query(
        `UPDATE reward_points_balances
         SET available = available - $1,
             spent_on_sh = spent_on_sh + $1,
             updated_at = NOW()
         WHERE member_id = $2`,
        [rpRequired, user.id]
      );

      // 2. Log RP transaction
      await query(
        `INSERT INTO reward_points_transactions (member_id, type, amount, source, metadata)
         VALUES ($1, 'spend_sh', $2, $3, $4)`,
        [
          user.id,
          -rpRequired,
          `sh_event_${eventId}`,
          JSON.stringify({
            eventId,
            eventName: event.event_name,
            shPurchased: body.shAmount,
          }),
        ]
      );

      // 3. Add SH to user's wallet
      const walletResult = await query<SHWalletRow>(
        `UPDATE social_horizon_wallets
         SET sh_balance = sh_balance + $1,
             total_issued = total_issued + $1,
             updated_at = NOW()
         WHERE member_id = $2
         RETURNING sh_balance`,
        [body.shAmount, user.id]
      );

      // Create wallet if doesn't exist
      let newBalance: number;
      if (!walletResult.rows[0]) {
        const insertResult = await query<SHWalletRow>(
          `INSERT INTO social_horizon_wallets (member_id, sh_balance, total_issued, total_transferred)
           VALUES ($1, $2, $2, 0)
           RETURNING sh_balance`,
          [user.id, body.shAmount]
        );
        newBalance = Number(insertResult.rows[0].sh_balance);
      } else {
        newBalance = Number(walletResult.rows[0].sh_balance);
      }

      // 4. Log SH transaction
      await query(
        `INSERT INTO sh_transactions (from_wallet, to_wallet, amount, transaction_type, event_id, metadata)
         VALUES (NULL, $1, $2, 'rp_purchase', $3, $4)`,
        [
          user.id,
          body.shAmount,
          eventId,
          JSON.stringify({
            rpSpent: rpRequired,
            rateUsed: event.rp_per_sh,
          }),
        ]
      );

      // 5. Update event's distributed amount
      await query(
        `UPDATE sh_purchase_events
         SET sh_distributed = sh_distributed + $1,
             updated_at = NOW()
         WHERE id = $2`,
        [body.shAmount, eventId]
      );

      await query('COMMIT');

      return NextResponse.json({
        success: true,
        purchase: {
          shAmount: body.shAmount,
          rpSpent: rpRequired,
          rate: Number(event.rp_per_sh),
          eventId,
          eventName: event.event_name,
        },
        wallet: {
          newBalance,
        },
        eventStatus: {
          totalDistributed: Number(event.sh_distributed) + body.shAmount,
          remainingGlobal: remainingGlobalCap - body.shAmount,
          yourTotal: alreadyPurchased + body.shAmount,
          yourRemaining: remainingPersonalCap - body.shAmount,
        },
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('SH purchase error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to purchase SH' },
      { status: 500 }
    );
  }
}
