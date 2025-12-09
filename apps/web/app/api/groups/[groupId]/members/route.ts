/**
 * Group Membership API Endpoint
 * GET /api/groups/[groupId]/members - List members with their roles
 * POST /api/groups/[groupId]/members - Join group (or request to join)
 * DELETE /api/groups/[groupId]/members - Leave group (self) or remove member (admin)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getCurrentUser } from '@/lib/auth/middleware'
import {
  addGroupMember,
  removeGroupMember,
  getGroupById,
  getGroupRoles,
} from '../../../../../../api/src/modules/groups/handlers'

export async function POST(
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

    // Add user to group
    await addGroupMember(groupId, user.id)

    return NextResponse.json({
      success: true,
      message: 'Successfully joined group',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('POST /api/groups/[groupId]/members error:', message)

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (message.includes('already a member')) {
      return NextResponse.json({ error: message }, { status: 409 })
    }

    return NextResponse.json(
      { error: message || 'Failed to join group' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { groupId } = await context.params
    const { searchParams } = new URL(request.url)
    const targetMemberId = searchParams.get('memberId')

    // Verify group exists
    const group = await getGroupById(groupId)
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // If no memberId provided, user is leaving themselves
    if (!targetMemberId) {
      await removeGroupMember(groupId, user.id)
      return NextResponse.json({
        success: true,
        message: 'Successfully left group',
      })
    }

    // Admin removing another member - check permissions
    const roles = await getGroupRoles(groupId)
    const userRole = roles.find(r => r.memberId === user.id)
    const isAdmin = userRole?.role === 'admin'

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can remove other members' },
        { status: 403 }
      )
    }

    // Prevent admins from removing other admins (need consensus for that)
    const targetRole = roles.find(r => r.memberId === targetMemberId)
    if (targetRole?.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot remove another admin. Revoke their admin role first.' },
        { status: 403 }
      )
    }

    // Remove the target member
    await removeGroupMember(groupId, targetMemberId)

    return NextResponse.json({
      success: true,
      message: 'Successfully removed member from group',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('DELETE /api/groups/[groupId]/members error:', message)

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (message.includes('not a member')) {
      return NextResponse.json({ error: message }, { status: 409 })
    }

    return NextResponse.json(
      { error: message || 'Failed to remove member' },
      { status: 400 }
    )
  }
}
