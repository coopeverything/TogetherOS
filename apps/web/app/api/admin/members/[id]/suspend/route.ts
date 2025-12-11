/**
 * Suspend Member API
 * POST /api/admin/members/[id]/suspend
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'
import { findUserByIdAdmin, softDeleteUser, logActivity } from '@togetheros/db'

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const adminUser = await getCurrentUser(request)
    if (!adminUser || !adminUser.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (id === adminUser.id) {
      return NextResponse.json({ error: 'Cannot suspend your own account' }, { status: 400 })
    }

    const existingUser = await findUserByIdAdmin(id)
    if (!existingUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (existingUser.deleted_at) return NextResponse.json({ error: 'User is already suspended' }, { status: 400 })

    const body = await request.json().catch(() => ({}))
    const reason = body.reason || 'No reason provided'

    const suspendedUser = await softDeleteUser(id)
    await logActivity(adminUser.id, 'admin_suspend_member', { targetUserId: id, targetEmail: existingUser.email, reason, ip: request.headers.get('x-forwarded-for') || 'unknown' })

    return NextResponse.json({ success: true, message: 'User suspended successfully', user: { id: suspendedUser.id, email: suspendedUser.email, deleted_at: suspendedUser.deleted_at } })
  } catch (error: unknown) {
    console.error('Admin suspend member error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to suspend member' }, { status: 500 })
  }
}
