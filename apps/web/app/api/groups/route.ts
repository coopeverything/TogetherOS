/**
 * Groups API Endpoint
 * POST /api/groups - Create new group
 * GET /api/groups - List groups with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  createGroup,
  listGroups,
} from '../../../../api/src/modules/groups/handlers';
import type { CreateGroupInput, GroupFilters } from '@togetheros/types/groups';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.handle || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, handle, type' },
        { status: 400 }
      );
    }

    // Set creator to authenticated user
    const input: CreateGroupInput = {
      name: body.name,
      handle: body.handle,
      type: body.type,
      description: body.description,
      location: body.location,
      creatorId: user.id,
    };

    const group = await createGroup(input);

    return NextResponse.json({ group }, { status: 201 });
  } catch (error: any) {
    // SECURITY: Sanitize error for logging (prevent log injection)
    // Use JSON.stringify to safely encode any user-controlled data
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('POST /api/groups error:', JSON.stringify(errorMsg).slice(0, 200));

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create group' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters: GroupFilters = {
      type: searchParams.get('type') as any,
      location: searchParams.get('location') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 20,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!)
        : 0,
      sortBy: (searchParams.get('sortBy') as any) || 'newest',
    };

    // Parse member count filters
    const minMembers = searchParams.get('minMembers');
    const maxMembers = searchParams.get('maxMembers');
    if (minMembers || maxMembers) {
      filters.memberCount = {
        min: minMembers ? parseInt(minMembers) : undefined,
        max: maxMembers ? parseInt(maxMembers) : undefined,
      };
    }

    const result = await listGroups(filters);

    return NextResponse.json(result);
  } catch (error: any) {
    // SECURITY: Sanitize error for logging (prevent log injection)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('GET /api/groups error:', JSON.stringify(errorMsg).slice(0, 200));
    return NextResponse.json(
      { error: error.message || 'Failed to list groups' },
      { status: 500 }
    );
  }
}
