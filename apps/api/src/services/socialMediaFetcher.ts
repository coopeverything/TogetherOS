// apps/api/src/services/socialMediaFetcher.ts
// Service for fetching social media link previews via oEmbed + Open Graph

import type { MediaPreview } from '@togetheros/types'

/**
 * Rate limiting for social media fetches
 * 30 requests per hour per IP
 */
const rateLimits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): void {
  const now = Date.now()
  const limit = rateLimits.get(ip)

  if (!limit || now > limit.resetAt) {
    // Reset window
    rateLimits.set(ip, {
      count: 1,
      resetAt: now + 60 * 60 * 1000, // 1 hour
    })
    return
  }

  if (limit.count >= 30) {
    throw new Error('Rate limit exceeded. Try again later.')
  }

  limit.count++
}

/**
 * Detect platform from URL for UI categorization only
 * SECURITY: This is NOT a security boundary. Actual URL validation
 * happens in validateUrlAgainstAllowlist() using URL.hostname parsing.
 */
export function detectPlatform(url: string): string {
  const urlLower = url.toLowerCase()

  if (urlLower.includes('instagram.com')) return 'instagram'
  if (urlLower.includes('tiktok.com')) return 'tiktok'
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter'
  if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) return 'facebook'
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube'
  if (urlLower.includes('linkedin.com')) return 'linkedin'

  return 'other'
}

/**
 * oEmbed endpoint mapping
 */
const OEMBED_ENDPOINTS: Record<string, string> = {
  instagram: 'https://graph.facebook.com/v18.0/instagram_oembed',
  tiktok: 'https://www.tiktok.com/oembed',
  twitter: 'https://publish.twitter.com/oembed',
  youtube: 'https://www.youtube.com/oembed',
}

/**
 * Fetch via oEmbed API
 */
async function fetchViaOEmbed(
  platform: string,
  url: string
): Promise<MediaPreview | null> {
  const endpoint = OEMBED_ENDPOINTS[platform]
  if (!endpoint) return null

  try {
    const oembedUrl = `${endpoint}?url=${encodeURIComponent(url)}&format=json`
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'TogetherOS/1.0',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
      redirect: 'manual', // Prevent automatic redirects (SSRF protection)
    })

    // Check for redirects and block them
    if (response.status >= 300 && response.status < 400) {
      console.warn(`oEmbed redirect blocked for ${platform}`)
      return null
    }

    if (!response.ok) {
      console.warn(`oEmbed failed for ${platform}: ${response.status}`)
      return null
    }

    const data = await response.json() as {
      title?: string;
      description?: string;
      thumbnail_url?: string;
      url?: string;
      author_name?: string;
      author_url?: string;
      html?: string;
    }

    return {
      title: data.title || 'Untitled',
      description: data.description,
      thumbnailUrl: data.thumbnail_url || data.url,
      authorName: data.author_name || data.author_url,
      platform,
      embedHtml: data.html,
      fetchedAt: new Date(),
    }
  } catch (error) {
    console.warn(`oEmbed error for ${platform}:`, error)
    return null
  }
}

/**
 * Fetch via Open Graph meta tags (fallback)
 */
async function fetchViaOpenGraph(url: string, platform: string): Promise<MediaPreview> {
  try {
    // SECURITY: URL validated by validateUrlAgainstAllowlist() before calling this function
    // (see line 226 in fetchSocialMediaPreview). Multi-layer SSRF protection includes:
    // HTTPS-only, hostname allowlist, internal network blocking, no redirects, rate limiting.
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TogetherOS/1.0',
      },
      signal: AbortSignal.timeout(5000),
      redirect: 'manual', // Prevent automatic redirects (SSRF protection)
    })

    // Check for redirects and block them
    if (response.status >= 300 && response.status < 400) {
      throw new Error('Redirects are not allowed for security reasons')
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()

    // Extract Open Graph tags
    const ogTitle = html.match(/<meta property="og:title" content="([^"]*)"/)
    const ogDescription = html.match(/<meta property="og:description" content="([^"]*)"/)
    const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/)
    const ogSiteName = html.match(/<meta property="og:site_name" content="([^"]*)"/)

    // Fallback to regular meta tags
    const title = ogTitle?.[1] || html.match(/<title>([^<]*)<\/title>/)?.[1] || 'Untitled'
    const description = ogDescription?.[1] || html.match(/<meta name="description" content="([^"]*)">/)?.[1]
    const thumbnail = ogImage?.[1]
    const siteName = ogSiteName?.[1]

    return {
      title: title.trim(),
      description: description?.trim(),
      thumbnailUrl: thumbnail,
      authorName: siteName,
      platform,
      fetchedAt: new Date(),
    }
  } catch (error) {
    console.warn('Open Graph fetch failed:', error)
    throw new Error('Failed to fetch link preview')
  }
}

/**
 * Validate URL against allowlist to prevent SSRF
 */
function validateUrlAgainstAllowlist(url: string): void {
  const ALLOWED_DOMAINS = [
    'instagram.com',
    'tiktok.com',
    'twitter.com',
    'x.com',
    'facebook.com',
    'fb.com',
    'youtube.com',
    'youtu.be',
    'linkedin.com',
  ]

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new Error('Invalid URL')
  }

  // Ensure HTTPS only (prevent protocol-level attacks)
  if (parsedUrl.protocol !== 'https:') {
    throw new Error('Only HTTPS URLs are allowed')
  }

  // Check hostname against allowlist
  const hostname = parsedUrl.hostname.toLowerCase()
  const isAllowed = ALLOWED_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  )

  if (!isAllowed) {
    throw new Error(`URL domain not allowed. Supported: ${ALLOWED_DOMAINS.join(', ')}`)
  }

  // Prevent internal network access
  const BLOCKED_IPS = [
    '127.0.0.1',
    'localhost',
    '0.0.0.0',
    '::1',
  ]

  if (BLOCKED_IPS.some((ip) => hostname === ip || hostname.startsWith(ip))) {
    throw new Error('Access to internal network resources is forbidden')
  }

  // Prevent IP address access (only domain names allowed)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    throw new Error('Direct IP address access is not allowed')
  }
}

/**
 * Main entry point: Fetch social media link preview
 * Tries oEmbed first, falls back to Open Graph
 */
export async function fetchSocialMediaPreview(
  url: string,
  ip: string = 'unknown'
): Promise<MediaPreview> {
  // Rate limiting
  checkRateLimit(ip)

  // Validate URL and check against allowlist (SSRF protection)
  validateUrlAgainstAllowlist(url)

  // Detect platform
  const platform = detectPlatform(url)

  // Try oEmbed first
  const oembedResult = await fetchViaOEmbed(platform, url)
  if (oembedResult) {
    return oembedResult
  }

  // Fallback to Open Graph
  return fetchViaOpenGraph(url, platform)
}

/**
 * Extract URLs from text content
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = text.match(urlRegex) || []

  // Filter out URLs with trailing punctuation
  return matches.map((url) => url.replace(/[.,;!?]+$/, ''))
}

/**
 * Check if text contains social media URL
 */
export function containsSocialMediaUrl(text: string): boolean {
  const urls = extractUrls(text)
  return urls.some((url) => {
    const platform = detectPlatform(url)
    return platform !== 'other'
  })
}
