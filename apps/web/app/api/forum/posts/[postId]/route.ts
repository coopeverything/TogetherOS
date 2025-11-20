/**
 * Forum Post Detail API Endpoint
 * GET /api/forum/posts/[postId] - Get single post by ID
 * PATCH /api/forum/posts/[postId] - Update post
 * DELETE /api/forum/posts/[postId] - Delete post (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getPostById, updatePost, deletePost } from '@togetheros/db';
import { updatePostSchema } from '@togetheros/validators/forum';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const post = await getPostById(postId);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error('GET /api/forum/posts/[postId] error:', JSON.stringify({ message: error.message }));
    return NextResponse.json(
      { error: error.message || 'Failed to get post' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    // Require authentication
    const user = await requireAuth(request);

    const body = await request.json();

    // Validate with Zod schema
    const validatedData = updatePostSchema.parse(body);

    // Check if post exists
    const existingPost = await getPostById(postId);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user can modify (author OR admin)
    if (!user.is_admin && existingPost.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Only the post author or an admin can update it' },
        { status: 403 }
      );
    }

    const updatedPost = await updatePost(postId, validatedData);

    return NextResponse.json({ post: updatedPost });
  } catch (error: any) {
    console.error('PATCH /api/forum/posts/[postId] error:', JSON.stringify({ message: error.message, name: error.name }));

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
      { error: error.message || 'Failed to update post' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    // Require authentication
    const user = await requireAuth(request);

    // Check if post exists
    const existingPost = await getPostById(postId);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user can modify (author OR admin)
    if (!user.is_admin && existingPost.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Only the post author or an admin can delete it' },
        { status: 403 }
      );
    }

    await deletePost(postId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/forum/posts/[postId] error:', JSON.stringify({ message: error.message }));

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete post' },
      { status: 500 }
    );
  }
}
