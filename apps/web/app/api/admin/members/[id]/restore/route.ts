/**
 * Restore Member API
 * POST /api/admin/members/[id]/restore
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'
import { findUserByIdAdmin, restoreUser, logActivity } from '@togetheros/db'

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const adminUser = await getCurrentUser(request)
    if (!adminUser || !adminUser.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingUser = await findUserByIdAdmin(id)
    if (!existingUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (!existingUser.deleted_at) return NextResponse.json({ error: 'User is not suspended' }, { status: 400 })

    const restoredUser = await restoreUser(id)
    await logActivity(adminUser.id, 'admin_restore_member', { targetUserId: id, targetEmail: existingUser.email, ip: request.headers.get('x-forwarded-for') || 'unknown' })

    return NextResponse.json({ success: true, message: 'User restored successfully', user: { id: restoredUser.id, email: restoredUser.email, deleted_at: restoredUser.deleted_at } })
  } catch (error: unknown) {
    console.error('Admin restore member error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to restore member' }, { status: 500 })
  }
}
