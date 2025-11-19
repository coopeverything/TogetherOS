/**
 * Forum Topic Detail API Endpoint
 * GET /api/forum/topics/[topicId] - Get single topic by ID
 * PATCH /api/forum/topics/[topicId] - Update topic
 * DELETE /api/forum/topics/[topicId] - Delete topic (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getTopicById, updateTopic, deleteTopic } from '@togetheros/db';
import { updateTopicSchema } from '@togetheros/validators/forum';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params
    const topic = await getTopicById(topicId);

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ topic });
  } catch (error: any) {
    console.error('GET /api/forum/topics/[topicId] error:', JSON.stringify({ message: error.message }));
    return NextResponse.json(
      { error: error.message || 'Failed to get topic' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params

    // Require authentication
    const user = await requireAuth(request);

    const body = await request.json();

    // Validate with Zod schema
    const validatedData = updateTopicSchema.parse(body);

    // Check if topic exists
    const existingTopic = await getTopicById(topicId);
    if (!existingTopic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Check if user can modify (author OR admin)
    if (!user.is_admin && existingTopic.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Only the topic author or an admin can update it' },
        { status: 403 }
      );
    }

    const updatedTopic = await updateTopic(topicId, validatedData);

    return NextResponse.json({ topic: updatedTopic });
  } catch (error: any) {
    console.error('PATCH /api/forum/topics/[topicId] error:', JSON.stringify({ message: error.message, name: error.name }));

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
      { error: error.message || 'Failed to update topic' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params

    // Require authentication
    const user = await requireAuth(request);

    // Check if topic exists
    const existingTopic = await getTopicById(topicId);
    if (!existingTopic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Check if user can modify (author OR admin)
    if (!user.is_admin && existingTopic.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Only the topic author or an admin can delete it' },
        { status: 403 }
      );
    }

    await deleteTopic(topicId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/forum/topics/[topicId] error:', JSON.stringify({ message: error.message }));

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete topic' },
      { status: 500 }
    );
  }
}
