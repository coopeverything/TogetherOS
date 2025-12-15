// apps/web/app/api/feed/route.ts
// GET /api/feed - List posts
// POST /api/feed - Create post

import { NextRequest, NextResponse } from 'next/server'
import { listPosts, createPost } from '../../../../api/src/modules/feed/handlers/posts'
import { fetchSocialMediaPreview } from '../../../../api/src/services/socialMediaFetcher'
import { getCurrentUser } from '@/lib/auth/middleware'
import { findUserById, findUsersByIds } from '@/lib/db/users'
import { checkRateLimit } from '@/lib/bridge/rate-limiter'
import { hashIp, getClientIp } from '@/lib/bridge/logger'
import { createNativePostSchema, createImportPostSchema } from '@togetheros/validators/feed'
import { z } from 'zod'

const FEED_RATE_LIMIT_MAX = parseInt(process.env.FEED_RATE_LIMIT_PER_HOUR || '50', 10)
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in ms

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

    // Enrich posts with author information (batch fetch to prevent N+1 queries)
    const authorIds = result.posts.map(post => post.authorId)
    const authorsMap = await findUsersByIds(authorIds)

    const postsWithAuthorInfo = result.posts.map(post => {
      const author = authorsMap.get(post.authorId)
      return {
        ...post,
        authorInfo: author ? {
          id: author.id,
          name: author.name,
          city: author.city,
          avatar_url: author.avatar_url,
        } : null
      }
    })

    return NextResponse.json({
      ...result,
      posts: postsWithAuthorInfo
    })
  } catch (error) {
    console.error('GET /api/feed error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request)
    const ipHash = hashIp(clientIp)

    // Rate limiting check
    const rateLimit = checkRateLimit(ipHash, {
      maxRequests: FEED_RATE_LIMIT_MAX,
      windowMs: RATE_LIMIT_WINDOW,
    })

    if (!rateLimit.allowed) {
      const resetInSeconds = Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Please wait ${resetInSeconds} seconds before trying again`,
          resetAt: rateLimit.resetAt,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': FEED_RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          },
        }
      )
    }

    // Require authentication
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to create posts.' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json().catch(() => ({}))

    // Determine post type and validate with appropriate schema
    let validatedData: z.infer<typeof createNativePostSchema> | z.infer<typeof createImportPostSchema>

    if (body.sourceUrl) {
      // Import post (has sourceUrl)
      const result = createImportPostSchema.safeParse(body)
      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: result.error.format()
          },
          { status: 400 }
        )
      }
      validatedData = result.data
    } else {
      // Native post (has content/title)
      const result = createNativePostSchema.safeParse(body)
      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: result.error.format()
          },
          { status: 400 }
        )
      }
      validatedData = result.data
    }

    // Build post data with author and IP
    const isImportPost = 'sourceUrl' in validatedData && validatedData.sourceUrl

    // Debug: log incoming mediaUrls
    console.log('POST /api/feed - validatedData.mediaUrls:', (validatedData as any).mediaUrls)

    let postData: any = {
      ...validatedData,
      type: isImportPost ? 'import' : 'native',
      authorId: user.id,
      ip: clientIp,
    }

    // Debug: log postData.mediaUrls
    console.log('POST /api/feed - postData.mediaUrls:', postData.mediaUrls)

    // Fetch preview if this is an import post and preview not provided
    if (isImportPost && !body.preview) {
      try {
        // Use body.sourceUrl since we already verified it exists via isImportPost
        const preview = await fetchSocialMediaPreview(body.sourceUrl as string, clientIp)
        if (preview) {
          postData.preview = preview
        } else {
          // Create minimal preview if fetch failed
          postData.preview = {
            title: 'Shared Link',
            platform: 'other',
            fetchedAt: new Date(),
          }
        }
      } catch (previewError) {
        console.warn('Failed to fetch preview, using fallback:', previewError)
        // Create minimal preview as fallback
        postData.preview = {
          title: 'Shared Link',
          platform: 'other',
          fetchedAt: new Date(),
        }
      }
    }

    const post = await createPost(postData)

    return NextResponse.json(
      { post },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': FEED_RATE_LIMIT_MAX.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetAt.toString(),
        },
      }
    )
  } catch (error: any) {
    console.error('POST /api/feed error:', error)

    // Determine appropriate status code
    let status = 500
    let message = 'Failed to create post'

    if (error.message?.includes('not found')) {
      status = 404
      message = error.message
    } else if (error.message?.includes('Validation') || error.message?.includes('required') || error.message?.includes('must have')) {
      status = 400
      message = error.message
    } else if (error.message?.includes('Unauthorized') || error.message?.includes('permission')) {
      status = 403
      message = error.message
    } else if (error.message) {
      message = error.message
    }

    return NextResponse.json({ error: message }, { status })
  }
}
