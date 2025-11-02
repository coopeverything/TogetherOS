// apps/web/app/api/feed/preview/route.ts
// POST /api/feed/preview - Fetch social media preview

import { NextRequest, NextResponse } from 'next/server'
import { fetchSocialMediaPreview } from '../../../../../api/src/services/socialMediaFetcher'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const preview = await fetchSocialMediaPreview(url, ip)

    return NextResponse.json({ preview })
  } catch (error: any) {
    console.error('POST /api/feed/preview error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch preview' },
      { status: 400 }
    )
  }
}
