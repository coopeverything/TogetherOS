/**
 * URL Validation and SSRF Protection
 * Centralized security validation for user-provided URLs
 */

export interface URLValidationOptions {
  allowedDomains?: string[]
  httpsOnly?: boolean
  blockInternalNetworks?: boolean
  blockIPAddresses?: boolean
}

export class URLValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'URLValidationError'
  }
}

/**
 * Validates a URL against SSRF protection rules
 *
 * SECURITY: This is the primary security boundary for URL validation.
 * All user-provided URLs must pass through this function before being used in fetch().
 *
 * Protection layers:
 * - HTTPS-only enforcement (optional)
 * - Hostname allowlist validation
 * - Internal network blocking (localhost, 127.0.0.1, ::1, 0.0.0.0, private IPs)
 * - IP address blocking (prevents DNS rebinding)
 *
 * @param url - User-provided URL to validate
 * @param options - Validation options
 * @throws {URLValidationError} If URL fails validation
 */
export function validateUrl(url: string, options: URLValidationOptions = {}): void {
  const {
    allowedDomains = [],
    httpsOnly = true,
    blockInternalNetworks = true,
    blockIPAddresses = true,
  } = options

  // Parse URL
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new URLValidationError('Invalid URL format')
  }

  // Enforce HTTPS
  if (httpsOnly && parsedUrl.protocol !== 'https:') {
    throw new URLValidationError('URL must use HTTPS protocol')
  }

  const hostname = parsedUrl.hostname.toLowerCase()

  // Block internal networks
  if (blockInternalNetworks) {
    const internalHosts = [
      'localhost',
      '127.0.0.1',
      '::1',
      '0.0.0.0',
      '[::]',
    ]

    if (internalHosts.includes(hostname)) {
      throw new URLValidationError('Internal network addresses are not allowed')
    }

    // Block private IP ranges
    if (isPrivateIP(hostname)) {
      throw new URLValidationError('Private IP addresses are not allowed')
    }
  }

  // Block IP addresses (DNS rebinding protection)
  if (blockIPAddresses && isIPAddress(hostname)) {
    throw new URLValidationError('URL must be a domain name, not an IP address')
  }

  // Validate against allowlist
  if (allowedDomains.length > 0) {
    const isAllowed = allowedDomains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    )

    if (!isAllowed) {
      throw new URLValidationError('URL must be from an allowed domain')
    }
  }
}

/**
 * Checks if a hostname is a private IP address
 */
function isPrivateIP(hostname: string): boolean {
  // IPv4 private ranges
  const privateIPv4Patterns = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
  ]

  return privateIPv4Patterns.some(pattern => pattern.test(hostname))
}

/**
 * Checks if a hostname is an IP address (v4 or v6)
 */
function isIPAddress(hostname: string): boolean {
  // IPv4 pattern (simple check)
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/

  // IPv6 pattern (simple check)
  const ipv6Pattern = /^[\da-f:]+$/i

  return ipv4Pattern.test(hostname) || (hostname.includes(':') && ipv6Pattern.test(hostname))
}

/**
 * Social media domain allowlist
 * Used by fetchSocialMediaPreview and related functions
 */
export const SOCIAL_MEDIA_DOMAINS = [
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

/**
 * Validates a URL for social media preview fetching
 * Convenience wrapper around validateUrl with social media allowlist
 */
export function validateSocialMediaUrl(url: string): void {
  validateUrl(url, {
    allowedDomains: SOCIAL_MEDIA_DOMAINS,
    httpsOnly: true,
    blockInternalNetworks: true,
    blockIPAddresses: true,
  })
}
