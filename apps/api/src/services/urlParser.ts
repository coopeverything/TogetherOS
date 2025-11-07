// apps/api/src/services/urlParser.ts
// Service for extracting and parsing URLs from text content

/**
 * Extract all URLs from text content
 * Supports http/https URLs with various TLDs
 */
export function extractUrls(text: string): string[] {
  if (!text) return []

  // Comprehensive URL regex
  // Matches: http://example.com, https://example.com/path, www.example.com
  const urlRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gi

  const matches = text.match(urlRegex)
  if (!matches) return []

  // Deduplicate URLs
  return Array.from(new Set(matches))
}

/**
 * Detect if URL is from a supported social media platform
 * Returns platform name or null if not social media
 */
export function detectSocialMedia(url: string): string | null {
  const urlLower = url.toLowerCase()

  if (urlLower.includes('instagram.com')) return 'instagram'
  if (urlLower.includes('tiktok.com')) return 'tiktok'
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter'
  if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) return 'facebook'
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube'
  if (urlLower.includes('linkedin.com')) return 'linkedin'

  return null
}

/**
 * Filter URLs to only include social media platforms
 */
export function filterSocialMediaUrls(urls: string[]): string[] {
  return urls.filter(url => detectSocialMedia(url) !== null)
}

/**
 * Find position of URL in text (for inline rendering)
 */
export function findUrlPosition(text: string, url: string): number {
  return text.indexOf(url)
}
