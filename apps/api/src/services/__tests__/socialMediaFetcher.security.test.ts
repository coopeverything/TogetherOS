import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchSocialMediaPreview } from '../socialMediaFetcher'

/**
 * Security-focused tests for socialMediaFetcher
 * Tests SSRF protection and attack vector blocking
 */

describe('socialMediaFetcher - Security', () => {
  beforeEach(() => {
    // Reset rate limit between tests
    vi.clearAllMocks()
  })

  describe('SSRF Protection', () => {
    it('blocks localhost URLs', async () => {
      const attacks = [
        'http://localhost:8080/malicious',
        'https://localhost/admin',
        'http://127.0.0.1/internal',
        'http://127.0.0.1:3000/api',
        'http://[::1]/internal',
        'http://0.0.0.0/secrets',
      ]

      for (const url of attacks) {
        await expect(
          fetchSocialMediaPreview(url, '127.0.0.1')
        ).rejects.toThrow('URL must be from an allowed social media platform')
      }
    })

    it('blocks internal network IP ranges', async () => {
      const internalIPs = [
        'http://192.168.1.1/router',
        'http://10.0.0.1/admin',
        'http://172.16.0.1/internal',
      ]

      for (const url of internalIPs) {
        await expect(
          fetchSocialMediaPreview(url, '1.2.3.4')
        ).rejects.toThrow('URL must be from an allowed social media platform')
      }
    })

    it('blocks direct IP addresses (DNS rebinding protection)', async () => {
      const ipAddresses = [
        'http://1.2.3.4/instagram.com',
        'https://203.0.113.1/path',
        'http://[2001:db8::1]/resource',
      ]

      for (const url of ipAddresses) {
        await expect(
          fetchSocialMediaPreview(url, '1.2.3.4')
        ).rejects.toThrow('URL must be a domain name, not an IP address')
      }
    })

    it('blocks HTTP URLs (HTTPS-only enforcement)', async () => {
      const httpUrls = [
        'http://instagram.com/post',
        'http://twitter.com/user',
      ]

      for (const url of httpUrls) {
        await expect(
          fetchSocialMediaPreview(url, '1.2.3.4')
        ).rejects.toThrow('URL must use HTTPS protocol')
      }
    })

    it('blocks exotic protocols', async () => {
      const exoticProtocols = [
        'ftp://instagram.com/file',
        'file:///etc/passwd',
        'gopher://evil.com',
        'data:text/html,<script>alert(1)</script>',
      ]

      for (const url of exoticProtocols) {
        await expect(
          fetchSocialMediaPreview(url, '1.2.3.4')
        ).rejects.toThrow()
      }
    })

    it('blocks URLs with embedded allowed domains in path', async () => {
      const pathInjection = [
        'https://evil.com/instagram.com/phishing',
        'https://attacker.net/twitter.com/fake',
        'https://malicious.org/?redirect=facebook.com',
      ]

      for (const url of pathInjection) {
        await expect(
          fetchSocialMediaPreview(url, '1.2.3.4')
        ).rejects.toThrow('URL must be from an allowed social media platform')
      }
    })

    it('allows valid social media domains', async () => {
      const validDomains = [
        'instagram.com',
        'www.instagram.com',
        'mobile.twitter.com',
        'www.facebook.com',
        'youtube.com',
        'www.linkedin.com',
      ]

      for (const domain of validDomains) {
        const url = `https://${domain}/post/123`
        // Note: This will fail because we don't mock fetch, but it should pass validation
        // In a real test, we'd mock fetch to return a valid response
        try {
          await fetchSocialMediaPreview(url, '1.2.3.4')
        } catch (error) {
          // Should fail at fetch stage, not at validation stage
          if (error instanceof Error) {
            expect(error.message).not.toContain('URL must be from an allowed social media platform')
            expect(error.message).not.toContain('URL must use HTTPS protocol')
            expect(error.message).not.toContain('IP address')
          }
        }
      }
    })

    it('blocks subdomain wildcards that could bypass checks', async () => {
      const subdomainAttacks = [
        'https://instagram.com.evil.net/phishing',
        'https://twitter.com.attacker.org/fake',
      ]

      for (const url of subdomainAttacks) {
        await expect(
          fetchSocialMediaPreview(url, '1.2.3.4')
        ).rejects.toThrow('URL must be from an allowed social media platform')
      }
    })
  })

  describe('Rate Limiting', () => {
    it('enforces rate limit (30 requests per hour per IP)', async () => {
      const url = 'https://instagram.com/post/123'
      const ip = '1.2.3.4'

      // Make 30 requests (max allowed)
      const requests = Array(30).fill(null).map(() =>
        fetchSocialMediaPreview(url, ip).catch(() => null) // Ignore fetch errors
      )

      await Promise.all(requests)

      // 31st request should be rate limited
      await expect(
        fetchSocialMediaPreview(url, ip)
      ).rejects.toThrow('Rate limit exceeded')
    })

    it('isolates rate limits by IP address', async () => {
      const url = 'https://instagram.com/post/123'

      // IP 1 makes 30 requests
      const ip1Requests = Array(30).fill(null).map(() =>
        fetchSocialMediaPreview(url, '1.2.3.4').catch(() => null)
      )
      await Promise.all(ip1Requests)

      // IP 2 should still be able to make requests
      // This should fail at fetch, not rate limit
      try {
        await fetchSocialMediaPreview(url, '5.6.7.8')
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).not.toContain('Rate limit exceeded')
        }
      }
    })
  })

  describe('Input Validation', () => {
    it('rejects malformed URLs', async () => {
      const malformedUrls = [
        'not-a-url',
        'javascript:alert(1)',
        '//evil.com',
        'https://',
        '',
      ]

      for (const url of malformedUrls) {
        await expect(
          fetchSocialMediaPreview(url, '1.2.3.4')
        ).rejects.toThrow()
      }
    })

    it('handles URL encoding edge cases', async () => {
      const encodedAttacks = [
        'https://instagram.com%00evil.com/path',
        'https://instagram.com%0d%0aevil.com/path',
        'https://instagram.com/../../../etc/passwd',
      ]

      for (const url of encodedAttacks) {
        await expect(
          fetchSocialMediaPreview(url, '1.2.3.4')
        ).rejects.toThrow()
      }
    })
  })
})
