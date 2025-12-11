/**
 * Member Activity API
 * GET /api/admin/members/[id]/activity
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'
import { findUserByIdAdmin, getUserActivity, logActivity } from '@togetheros/db'

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const adminUser = await getCurrentUser(request)
    if (!adminUser || !adminUser.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingUser = await findUserByIdAdmin(id)
    if (!existingUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)

    const activity = await getUserActivity(id, limit)
    await logActivity(adminUser.id, 'admin_view_member_activity', { targetUserId: id })

    return NextResponse.json({
      user: { id: existingUser.id, email: existingUser.email, name: existingUser.name },
      activity,
      pagination: { limit, count: activity.length },
    })
  } catch (error: unknown) {
    console.error('Admin member activity error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to get activity' }, { status: 500 })
  }
}
