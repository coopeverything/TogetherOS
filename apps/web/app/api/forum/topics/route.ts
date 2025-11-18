/**
 * Forum Topics API Endpoint
 * POST /api/forum/topics - Create new topic
 * GET /api/forum/topics - List topics with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  createTopic,
  listTopics,
  type CreateTopicInput,
  type ListTopicsFilters,
} from '../../../../../../packages/db/src/forum-topics';
import { createTopicSchema, listTopicsFiltersSchema } from '@togetheros/validators/forum';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    const body = await request.json();

    // Validate with Zod schema
    const validatedData = createTopicSchema.parse({
      ...body,
      authorId: user.id, // Always use authenticated user's ID
    });

    const topic = await createTopic(validatedData);

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/forum/topics error:', JSON.stringify({ message: error.message, name: error.name }));

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create topic' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters from query params
    const rawFilters = {
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      authorId: searchParams.get('authorId') || undefined,
      groupId: searchParams.get('groupId') || undefined,
      tags: searchParams.get('tags')
        ? searchParams.get('tags')!.split(',')
        : undefined,
      isPinned: searchParams.get('isPinned')
        ? searchParams.get('isPinned') === 'true'
        : undefined,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 50,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!)
        : 0,
    };

    // Validate filters with Zod
    const validatedFilters = listTopicsFiltersSchema.parse(rawFilters);

    const result = await listTopics(validatedFilters);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('GET /api/forum/topics error:', JSON.stringify({ message: error.message, name: error.name }));

    // Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid filters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to list topics' },
      { status: 500 }
    );
  }
}
