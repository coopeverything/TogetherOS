/**
 * Group Membership API Endpoint
 * POST /api/groups/[groupId]/members - Join group
 * DELETE /api/groups/[groupId]/members - Leave group
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import {
  addGroupMember,
  removeGroupMember,
  getGroupById,
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

    // Verify group exists
    const group = await getGroupById(groupId)
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Remove user from group
    await removeGroupMember(groupId, user.id)

    return NextResponse.json({
      success: true,
      message: 'Successfully left group',
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
      { error: message || 'Failed to leave group' },
      { status: 400 }
    )
  }
}
