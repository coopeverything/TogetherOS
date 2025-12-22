/**
 * Proposal SP Total API
 * GET /api/proposals/[id]/sp-total - Get total SP allocated to a proposal
 */

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Query total SP allocated to this proposal
    const result = await db.query<{ total: string }>(
      `SELECT COALESCE(SUM(amount), 0)::integer as total
       FROM support_points_allocations
       WHERE target_type = 'proposal'
         AND target_id = $1
         AND status = 'active'`,
      [id]
    )

    const total = result.rows[0]?.total || 0

    return NextResponse.json({ total: Number(total) })
  } catch (error: any) {
    console.error('GET /api/proposals/[id]/sp-total error:', error.message)
    return NextResponse.json(
      { error: 'Failed to fetch SP total' },
      { status: 500 }
    )
  }
}
