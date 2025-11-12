// apps/web/app/api/feed/[postId]/route.ts
// GET /api/feed/[postId] - Get single post
// DELETE /api/feed/[postId] - Delete post (owner only)
// PATCH /api/feed/[postId] - Update post (owner only)

import { NextRequest, NextResponse } from 'next/server'
import { getPost, deletePost, updatePost } from '../../../../../api/src/modules/feed/handlers/posts'
import { getCurrentUser } from '@/lib/auth/middleware'
import { findUserById } from '@/lib/db/users'

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    const post = await getPost(postId)

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Enrich with author info
    const author = await findUserById(post.authorId)
    const postWithAuthor = {
      ...post,
      authorInfo: author ? {
        id: author.id,
        name: author.name,
        city: author.city,
        avatar_url: author.avatar_url,
      } : null
    }

    return NextResponse.json({ post: postWithAuthor })
  } catch (error) {
    console.error('GET /api/feed/[postId] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    // Require authentication
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to delete posts.' },
        { status: 401 }
      )
    }

    const { postId } = params
    const result = await deletePost(postId, user.id)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('DELETE /api/feed/[postId] error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete post' },
      { status: error.message?.includes('not found') ? 404 : 400 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    // Require authentication
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to edit posts.' },
        { status: 401 }
      )
    }

    const { postId } = params
    const body = await request.json()

    const updatedPost = await updatePost(postId, user.id, body)

    // Enrich with author info
    const author = await findUserById(updatedPost.authorId)
    const postWithAuthor = {
      ...updatedPost,
      authorInfo: author ? {
        id: author.id,
        name: author.name,
        city: author.city,
        avatar_url: author.avatar_url,
      } : null
    }

    return NextResponse.json({ post: postWithAuthor })
  } catch (error: any) {
    console.error('PATCH /api/feed/[postId] error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: error.message?.includes('not found') ? 404 : 400 }
    )
  }
}
