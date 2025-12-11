/**
 * Admin Member Detail API
 * GET /api/admin/members/[id] - Get user details
 * PATCH /api/admin/members/[id] - Update user
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'
import { findUserByIdAdmin, updateUser, getUserActivity, logActivity } from '@togetheros/db'

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const adminUser = await getCurrentUser(request)
    if (!adminUser || !adminUser.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await findUserByIdAdmin(id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const activity = await getUserActivity(id, 20)
    await logActivity(adminUser.id, 'admin_view_member', { targetUserId: id })

    return NextResponse.json({
      user: {
        id: user.id, email: user.email, email_verified: user.email_verified, name: user.name,
        username: user.username, bio: user.bio, avatar_url: user.avatar_url, city: user.city,
        state: user.state, country: user.country, timezone: user.timezone, paths: user.paths,
        skills: user.skills, is_admin: user.is_admin, created_at: user.created_at, updated_at: user.updated_at,
        last_seen_at: user.last_seen_at, deleted_at: user.deleted_at, onboarding_step: user.onboarding_step,
        onboarding_completed_at: user.onboarding_completed_at,
      },
      activity,
    })
  } catch (error: unknown) {
    console.error('Admin member detail error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to get member' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const adminUser = await getCurrentUser(request)
    if (!adminUser || !adminUser.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { is_admin, name, email_verified } = body

    if (id === adminUser.id && is_admin === false) {
      return NextResponse.json({ error: 'Cannot remove your own admin status' }, { status: 400 })
    }

    const existingUser = await findUserByIdAdmin(id)
    if (!existingUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const updates: Record<string, any> = {}
    if (typeof is_admin === 'boolean') updates.is_admin = is_admin
    if (typeof name === 'string') updates.name = name
    if (typeof email_verified === 'boolean') updates.email_verified = email_verified

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 })
    }

    const updatedUser = await updateUser(id, updates)
    await logActivity(adminUser.id, 'admin_update_member', { targetUserId: id, changes: updates, ip: request.headers.get('x-forwarded-for') || 'unknown' })

    return NextResponse.json({
      success: true,
      user: { id: updatedUser.id, email: updatedUser.email, email_verified: updatedUser.email_verified, name: updatedUser.name, username: updatedUser.username, is_admin: updatedUser.is_admin, updated_at: updatedUser.updated_at },
    })
  } catch (error: unknown) {
    console.error('Admin member update error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update member' }, { status: 500 })
  }
}
