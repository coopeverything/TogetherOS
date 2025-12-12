/**
 * Bridge Content Index Stats API
 * GET /api/admin/bridge-trust/stats - Get index statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getIndexStats } from '@togetheros/db'
import { requireAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const user = await requireAuth(request)
    if (!user.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const stats = await getIndexStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to get index stats:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
}
