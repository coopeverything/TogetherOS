/**
 * Group Join Requests API Endpoint
 * GET /api/groups/[groupId]/join-requests - List pending join requests (admin only)
 * POST /api/groups/[groupId]/join-requests - Approve/reject a join request (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import {
  getGroupById,
  getGroupRoles,
  addGroupMember,
} from '../../../../../../api/src/modules/groups/handlers'
import { query } from '@togetheros/db'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { groupId } = await context.params

    // Verify group exists
    const group = await getGroupById(groupId)
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check if user is admin
    const roles = await getGroupRoles(groupId)
    const userRole = roles.find(r => r.memberId === user.id)
    if (userRole?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can view join requests' },
        { status: 403 }
      )
    }

    // Query pending join requests
    const result = await query<{ id: string; user_id: string; requested_at: string }>(
      `SELECT id, user_id, requested_at
       FROM group_join_requests
       WHERE group_id = $1 AND status = 'pending'
       ORDER BY requested_at ASC`,
      [groupId]
    )

    const requests = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      requestedAt: row.requested_at,
    }))

    return NextResponse.json({ requests })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('GET /api/groups/[groupId]/join-requests error:', message)

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If the table doesn't exist yet, return empty array
    if (message.includes('does not exist')) {
      return NextResponse.json({ requests: [] })
    }

    return NextResponse.json(
      { error: message || 'Failed to fetch join requests' },
      { status: 400 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { groupId } = await context.params
    const body = await request.json()
    const { requestId, action } = body

    if (!requestId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Missing requestId or invalid action' },
        { status: 400 }
      )
    }

    // Verify group exists
    const group = await getGroupById(groupId)
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check if user is admin
    const roles = await getGroupRoles(groupId)
    const userRole = roles.find(r => r.memberId === user.id)
    if (userRole?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can manage join requests' },
        { status: 403 }
      )
    }

    // Get the join request
    const requestResult = await query<{ id: string; user_id: string; status: string }>(
      `SELECT id, user_id, status FROM group_join_requests WHERE id = $1 AND group_id = $2`,
      [requestId, groupId]
    )

    if (requestResult.rows.length === 0) {
      return NextResponse.json({ error: 'Join request not found' }, { status: 404 })
    }

    const joinRequest = requestResult.rows[0]
    if (joinRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'This request has already been processed' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Add user to group
      await addGroupMember(groupId, joinRequest.user_id)

      // Update request status
      await query(
        `UPDATE group_join_requests
         SET status = 'approved', processed_at = NOW(), processed_by = $1
         WHERE id = $2`,
        [user.id, requestId]
      )

      return NextResponse.json({
        success: true,
        message: 'Member approved and added to group',
      })
    } else {
      // Reject request
      await query(
        `UPDATE group_join_requests
         SET status = 'rejected', processed_at = NOW(), processed_by = $1
         WHERE id = $2`,
        [user.id, requestId]
      )

      return NextResponse.json({
        success: true,
        message: 'Join request rejected',
      })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('POST /api/groups/[groupId]/join-requests error:', message)

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If the table doesn't exist yet, return a helpful message
    if (message.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Join requests feature not yet configured' },
        { status: 501 }
      )
    }

    return NextResponse.json(
      { error: message || 'Failed to process join request' },
      { status: 400 }
    )
  }
}
