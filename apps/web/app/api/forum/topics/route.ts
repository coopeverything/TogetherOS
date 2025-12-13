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
} from '@togetheros/db';
import { createTopicSchema, listTopicsFiltersSchema } from '@togetheros/validators/forum';
import { reputationService } from '@/lib/services/ReputationService';
import { indexForumTopic } from '@/lib/bridge/content-indexer';

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

    // Index topic for Bridge RAG (non-blocking)
    indexForumTopic(topic.id, {
      title: topic.title,
      description: topic.description || undefined,
      authorId: user.id,
      createdAt: topic.createdAt,
      slug: topic.slug,
    }).catch((err) => console.error('Failed to index forum topic:', err));

    // Check and award topic-related badges
    try {
      await reputationService.checkTopicCreationBadges(user.id);
    } catch (badgeError) {
      // Don't fail the request if badge check fails
      console.error('Badge check failed:', badgeError);
    }

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
