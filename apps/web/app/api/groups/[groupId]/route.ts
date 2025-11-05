/**
 * Single Group API Endpoint
 * GET /api/groups/[groupId] - Get group by ID
 * PUT /api/groups/[groupId] - Update group
 * DELETE /api/groups/[groupId] - Delete group
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  getGroupById,
  updateGroup,
  deleteGroup,
} from '../../../../../api/src/modules/groups/handlers';
import type { UpdateGroupInput } from '@togetheros/types/groups';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params;

    const group = await getGroupById(groupId);

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({ group });
  } catch (error: any) {
    console.error('GET /api/groups/[groupId] error:', error.message || 'Unknown error');
    return NextResponse.json(
      { error: error.message || 'Failed to get group' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    const { groupId } = await context.params;
    const body = await request.json();

    // Check group exists
    const existingGroup = await getGroupById(groupId);
    if (!existingGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // TODO: Check if user is group admin/coordinator
    // For now, any authenticated user can update
    // Future: Implement role-based access control

    const updates: UpdateGroupInput = {
      name: body.name,
      description: body.description,
      location: body.location,
    };

    const group = await updateGroup(groupId, updates);

    return NextResponse.json({ group });
  } catch (error: any) {
    console.error('PUT /api/groups/[groupId] error:', error.message || 'Unknown error');

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update group' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    const { groupId } = await context.params;

    // Check group exists
    const existingGroup = await getGroupById(groupId);
    if (!existingGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // TODO: Check if user is group admin
    // For now, any authenticated user can delete
    // Future: Implement role-based access control

    await deleteGroup(groupId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/groups/[groupId] error:', error.message || 'Unknown error');

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete group' },
      { status: 400 }
    );
  }
}
