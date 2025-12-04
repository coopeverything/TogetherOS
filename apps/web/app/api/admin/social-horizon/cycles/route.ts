/**
 * Admin SH Issuance Cycles API
 * GET /api/admin/social-horizon/cycles - List all issuance cycles
 * POST /api/admin/social-horizon/cycles - Create a new issuance cycle
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { query } from '@togetheros/db';

interface IssuanceCycleRow {
  id: string;
  cycle_name: string;
  issuance_date: Date;
  total_sh_issued: number;
  contribution_allocated: number;
  purchase_allocated: number;
  formula_used: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

interface CreateCycleRequest {
  cycleName: string;
  issuanceDate: string;
  totalSHIssued: number;
  contributionPercentage?: number; // Default 80%
  formulaUsed?: string;
  metadata?: Record<string, unknown>;
}

/**
 * GET /api/admin/social-horizon/cycles - List all issuance cycles
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (!user.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const result = await query<IssuanceCycleRow>(
      `SELECT * FROM sh_issuance_cycles ORDER BY issuance_date DESC`
    );

    // Get allocation stats per cycle
    const cyclesWithStats = await Promise.all(
      result.rows.map(async (cycle) => {
        const allocStats = await query<{ basis: string; total: number; member_count: number }>(
          `SELECT basis, SUM(sh_amount) as total, COUNT(DISTINCT member_id) as member_count
           FROM sh_allocations
           WHERE cycle_id = $1
           GROUP BY basis`,
          [cycle.id]
        );

        const allocByBasis = Object.fromEntries(
          allocStats.rows.map((s) => [
            s.basis,
            { total: Number(s.total), memberCount: Number(s.member_count) },
          ])
        );

        return {
          id: cycle.id,
          cycleName: cycle.cycle_name,
          issuanceDate: cycle.issuance_date,
          totalSHIssued: Number(cycle.total_sh_issued),
          contributionAllocated: Number(cycle.contribution_allocated),
          purchaseAllocated: Number(cycle.purchase_allocated),
          formulaUsed: cycle.formula_used,
          metadata: cycle.metadata,
          createdAt: cycle.created_at,
          allocations: allocByBasis,
        };
      })
    );

    return NextResponse.json({
      cycles: cyclesWithStats,
      summary: {
        totalCycles: result.rows.length,
        totalSHEverIssued: result.rows.reduce(
          (sum, c) => sum + Number(c.total_sh_issued),
          0
        ),
      },
    });
  } catch (error) {
    console.error('Get SH cycles error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to get cycles' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/social-horizon/cycles - Create a new issuance cycle
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (!user.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = (await request.json()) as CreateCycleRequest;

    if (!body.cycleName || !body.issuanceDate || !body.totalSHIssued) {
      return NextResponse.json(
        { error: 'cycleName, issuanceDate, and totalSHIssued are required' },
        { status: 400 }
      );
    }

    if (body.totalSHIssued <= 0) {
      return NextResponse.json(
        { error: 'totalSHIssued must be positive' },
        { status: 400 }
      );
    }

    // Default 80/20 split
    const contributionPercentage = body.contributionPercentage ?? 80;
    if (contributionPercentage < 0 || contributionPercentage > 100) {
      return NextResponse.json(
        { error: 'contributionPercentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    const contributionAllocated =
      (body.totalSHIssued * contributionPercentage) / 100;
    const purchaseAllocated = body.totalSHIssued - contributionAllocated;

    const result = await query<IssuanceCycleRow>(
      `INSERT INTO sh_issuance_cycles
       (cycle_name, issuance_date, total_sh_issued, contribution_allocated, purchase_allocated, formula_used, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        body.cycleName,
        body.issuanceDate,
        body.totalSHIssued,
        contributionAllocated,
        purchaseAllocated,
        body.formulaUsed || 'Standard 80/20 split',
        JSON.stringify(body.metadata || {}),
      ]
    );

    const cycle = result.rows[0];

    return NextResponse.json({
      success: true,
      cycle: {
        id: cycle.id,
        cycleName: cycle.cycle_name,
        issuanceDate: cycle.issuance_date,
        totalSHIssued: Number(cycle.total_sh_issued),
        contributionAllocated: Number(cycle.contribution_allocated),
        purchaseAllocated: Number(cycle.purchase_allocated),
        formulaUsed: cycle.formula_used,
        createdAt: cycle.created_at,
      },
      nextSteps: [
        'Create allocation entries for eligible members based on their contribution scores',
        'Optionally create a purchase event for the purchaseAllocated portion',
      ],
    });
  } catch (error) {
    console.error('Create SH cycle error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to create cycle' },
      { status: 500 }
    );
  }
}
