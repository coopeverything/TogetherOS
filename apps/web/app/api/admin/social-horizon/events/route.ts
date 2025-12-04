/**
 * Admin SH Purchase Events API
 * GET /api/admin/social-horizon/events - List all purchase events
 * POST /api/admin/social-horizon/events - Create a new purchase event
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
  updated_at: Date;
  cycle_name?: string;
}

interface CreateEventRequest {
  eventName: string;
  cycleId?: string;
  startDate: string;
  endDate: string;
  rpPerSH?: number;
  moneyPerSH?: number;
  shCapPerPerson: number;
  globalSHCap: number;
  fiscalRegularityRequired?: boolean;
  metadata?: Record<string, unknown>;
}

interface UpdateEventRequest {
  status?: 'pending' | 'active' | 'closed';
}

/**
 * GET /api/admin/social-horizon/events - List all purchase events
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (!user.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const result = await query<SHPurchaseEventRow>(
      `SELECT e.*, c.cycle_name
       FROM sh_purchase_events e
       LEFT JOIN sh_issuance_cycles c ON e.cycle_id = c.id
       ORDER BY e.start_date DESC`
    );

    return NextResponse.json({
      events: result.rows.map((e) => ({
        id: e.id,
        eventName: e.event_name,
        cycleId: e.cycle_id,
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
          distributed: Number(e.sh_distributed),
          remaining: Number(e.global_sh_cap) - Number(e.sh_distributed),
          percentComplete:
            Math.round(
              (Number(e.sh_distributed) / Number(e.global_sh_cap)) * 10000
            ) / 100,
        },
        fiscalRegularityRequired: e.fiscal_regularity_required,
        status: e.status,
        metadata: e.metadata,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
      })),
    });
  } catch (error) {
    console.error('Get SH events error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to get events' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/social-horizon/events - Create a new purchase event
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (!user.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = (await request.json()) as CreateEventRequest;

    // Validate required fields
    if (
      !body.eventName ||
      !body.startDate ||
      !body.endDate ||
      !body.shCapPerPerson ||
      !body.globalSHCap
    ) {
      return NextResponse.json(
        {
          error:
            'eventName, startDate, endDate, shCapPerPerson, and globalSHCap are required',
        },
        { status: 400 }
      );
    }

    // Must have at least one pricing method
    if (!body.rpPerSH && !body.moneyPerSH) {
      return NextResponse.json(
        { error: 'Either rpPerSH or moneyPerSH must be specified' },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'endDate must be after startDate' },
        { status: 400 }
      );
    }

    // Validate caps
    if (body.shCapPerPerson <= 0 || body.globalSHCap <= 0) {
      return NextResponse.json(
        { error: 'Caps must be positive' },
        { status: 400 }
      );
    }

    // Determine initial status
    const now = new Date();
    let status = 'pending';
    if (startDate <= now && endDate > now) {
      status = 'active';
    } else if (endDate <= now) {
      status = 'closed';
    }

    const result = await query<SHPurchaseEventRow>(
      `INSERT INTO sh_purchase_events
       (event_name, cycle_id, start_date, end_date, rp_per_sh, money_per_sh,
        sh_cap_per_person, global_sh_cap, fiscal_regularity_required, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        body.eventName,
        body.cycleId || null,
        body.startDate,
        body.endDate,
        body.rpPerSH || null,
        body.moneyPerSH || null,
        body.shCapPerPerson,
        body.globalSHCap,
        body.fiscalRegularityRequired ?? true,
        status,
        JSON.stringify(body.metadata || {}),
      ]
    );

    const event = result.rows[0];

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        eventName: event.event_name,
        startDate: event.start_date,
        endDate: event.end_date,
        status: event.status,
        pricing: {
          rpPerSH: event.rp_per_sh ? Number(event.rp_per_sh) : null,
          moneyPerSH: event.money_per_sh ? Number(event.money_per_sh) : null,
        },
        caps: {
          perPerson: Number(event.sh_cap_per_person),
          global: Number(event.global_sh_cap),
        },
      },
    });
  } catch (error) {
    console.error('Create SH event error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/social-horizon/events - Update event status
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (!user.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const url = new URL(request.url);
    const eventId = url.searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId query parameter required' },
        { status: 400 }
      );
    }

    const body = (await request.json()) as UpdateEventRequest;

    if (!body.status) {
      return NextResponse.json(
        { error: 'status field required' },
        { status: 400 }
      );
    }

    if (!['pending', 'active', 'closed'].includes(body.status)) {
      return NextResponse.json(
        { error: 'status must be pending, active, or closed' },
        { status: 400 }
      );
    }

    const result = await query<SHPurchaseEventRow>(
      `UPDATE sh_purchase_events
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [body.status, eventId]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      event: {
        id: result.rows[0].id,
        eventName: result.rows[0].event_name,
        status: result.rows[0].status,
        updatedAt: result.rows[0].updated_at,
      },
    });
  } catch (error) {
    console.error('Update SH event error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}
