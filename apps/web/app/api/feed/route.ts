// apps/web/app/api/feed/route.ts
// GET /api/feed - List posts
// POST /api/feed - Create post

import { NextRequest, NextResponse } from 'next/server'
import { listPosts, createPost } from '../../../../api/src/modules/feed/handlers/posts'
import { fetchSocialMediaPreview } from '../../../../api/src/services/socialMediaFetcher'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse filters from query params
    const filters = {
      topic: searchParams.get('topic') || undefined,
      authorId: searchParams.get('authorId') || undefined,
      groupId: searchParams.get('groupId') || undefined,
      status: searchParams.get('status') as any,
      type: searchParams.get('type') as any,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    }

    const result = await listPosts(filters)
    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/feed error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Fetch preview if this is an import post and preview not provided
    if (body.type === 'import' && body.sourceUrl && !body.preview) {
      const ip = request.headers.get('x-forwarded-for') || 'unknown'
      body.preview = await fetchSocialMediaPreview(body.sourceUrl, ip)
    }

    // TODO: Get authorId from session/auth
    // For now, use a mock authorId
    if (!body.authorId) {
      body.authorId = '00000000-0000-0000-0000-000000000001' // Mock Alice Cooper
    }

    const post = await createPost(body)
    return NextResponse.json({ post }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/feed error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 400 }
    )
  }
}
