/**
 * Group Roles API Endpoint
 * GET /api/groups/[groupId]/roles - List all roles
 * POST /api/groups/[groupId]/roles - Assign a role
 * DELETE /api/groups/[groupId]/roles?roleId=xxx - Revoke a role
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import {
  getGroupRoles,
  assignGroupRole,
  revokeGroupRole,
  isGroupAdmin,
  getGroupById,
} from '../../../../../../api/src/modules/groups/handlers'
import type { GroupRoleType } from '@togetheros/types/groups'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params

    // Verify group exists
    const group = await getGroupById(groupId)
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const roles = await getGroupRoles(groupId)

    return NextResponse.json({ roles })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('GET /api/groups/[groupId]/roles error:', message)
    return NextResponse.json(
      { error: message || 'Failed to get roles' },
      { status: 500 }
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

    // Verify group exists
    const group = await getGroupById(groupId)
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check if user is admin (only admins can assign roles)
    const userIsAdmin = await isGroupAdmin(groupId, user.id)
    // Also allow group creator
    const isCreator = group.creatorId === user.id

    if (!userIsAdmin && !isCreator) {
      return NextResponse.json(
        { error: 'Only group admins can assign roles' },
        { status: 403 }
      )
    }

    // Validate required fields
    const { memberId, role } = body
    if (!memberId || !role) {
      return NextResponse.json(
        { error: 'memberId and role are required' },
        { status: 400 }
      )
    }

    const validRoles: GroupRoleType[] = ['admin', 'coordinator', 'member']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, coordinator, or member' },
        { status: 400 }
      )
    }

    const newRole = await assignGroupRole(
      groupId,
      memberId,
      role as GroupRoleType,
      user.id,
      {
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        recallable: body.recallable ?? true,
      }
    )

    return NextResponse.json({
      success: true,
      role: newRole,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('POST /api/groups/[groupId]/roles error:', message)

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (message.includes('already has this role')) {
      return NextResponse.json({ error: message }, { status: 409 })
    }

    if (message.includes('not a member')) {
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json(
      { error: message || 'Failed to assign role' },
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
    const roleId = searchParams.get('roleId')

    if (!roleId) {
      return NextResponse.json(
        { error: 'roleId query parameter is required' },
        { status: 400 }
      )
    }

    // Verify group exists
    const group = await getGroupById(groupId)
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check if user is admin (only admins can revoke roles)
    const userIsAdmin = await isGroupAdmin(groupId, user.id)
    const isCreator = group.creatorId === user.id

    if (!userIsAdmin && !isCreator) {
      return NextResponse.json(
        { error: 'Only group admins can revoke roles' },
        { status: 403 }
      )
    }

    await revokeGroupRole(roleId, user.id)

    return NextResponse.json({
      success: true,
      message: 'Role revoked successfully',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('DELETE /api/groups/[groupId]/roles error:', message)

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (message.includes('cannot be revoked')) {
      return NextResponse.json({ error: message }, { status: 403 })
    }

    if (message.includes('not found')) {
      return NextResponse.json({ error: message }, { status: 404 })
    }

    return NextResponse.json(
      { error: message || 'Failed to revoke role' },
      { status: 400 }
    )
  }
}
