/**
 * Bridge Trust Thresholds API
 * GET /api/admin/bridge-trust/thresholds - Get current thresholds
 * PUT /api/admin/bridge-trust/thresholds - Update thresholds
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTrustThresholds, updateTrustThresholds } from '@togetheros/db'
import { requireAuth } from '@/lib/auth/middleware'
import type { TrustThresholds } from '@togetheros/types'

export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const user = await requireAuth(request)
    if (!user.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const thresholds = await getTrustThresholds()
    return NextResponse.json(thresholds)
  } catch (error) {
    console.error('Failed to get trust thresholds:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check admin auth
    const user = await requireAuth(request)
    if (!user.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const thresholds: TrustThresholds = await request.json()

    // Validate thresholds
    if (!thresholds.newContentHours || thresholds.newContentHours < 1) {
      return NextResponse.json(
        { error: 'newContentHours must be at least 1' },
        { status: 400 }
      )
    }

    // Validate tier thresholds exist
    for (const tier of ['low', 'medium', 'high', 'consensus'] as const) {
      if (!thresholds[tier]) {
        return NextResponse.json(
          { error: `Missing ${tier} tier configuration` },
          { status: 400 }
        )
      }
    }

    await updateTrustThresholds(thresholds)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update trust thresholds:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to save thresholds' }, { status: 500 })
  }
}
