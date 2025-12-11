/**
 * Admin Members API
 * GET /api/admin/members - List users with stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'
import { listUsers, getUserStats, logActivity } from '@togetheros/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const sortBy = (searchParams.get('sortBy') || 'created_at') as 'created_at' | 'name' | 'email' | 'last_seen_at'
    const sortDir = (searchParams.get('sortDir') || 'desc') as 'asc' | 'desc'
    const filter = searchParams.get('filter') || 'all'

    const includeDeleted = filter === 'suspended' || filter === 'all'
    const adminOnly = filter === 'admins'

    const [usersResult, stats] = await Promise.all([
      listUsers({ search, limit, offset, sortBy, sortDir, includeDeleted: filter === 'all' || filter === 'suspended', adminOnly }),
      getUserStats(),
    ])

    let users = usersResult.users
    if (filter === 'suspended') {
      users = users.filter(u => u.deleted_at !== null)
    } else if (filter === 'active') {
      users = users.filter(u => u.deleted_at === null)
    }

    await logActivity(user.id, 'admin_view_members', { search, filter, resultsCount: users.length })

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id, email: u.email, email_verified: u.email_verified, name: u.name,
        username: u.username, avatar_url: u.avatar_url, is_admin: u.is_admin,
        created_at: u.created_at, last_seen_at: u.last_seen_at, deleted_at: u.deleted_at, paths: u.paths,
      })),
      stats,
      pagination: { total: usersResult.total, limit: usersResult.limit, offset: usersResult.offset, hasMore: usersResult.offset + usersResult.users.length < usersResult.total },
    })
  } catch (error: unknown) {
    console.error('Admin members list error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to list members' }, { status: 500 })
  }
}
