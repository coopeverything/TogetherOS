import { describe, it, expect } from 'vitest'
import {
  validateUrl,
  validateSocialMediaUrl,
  URLValidationError,
  SOCIAL_MEDIA_DOMAINS,
} from '../url-validation'

describe('URL Validation', () => {
  describe('validateUrl', () => {
    it('accepts valid HTTPS URLs', () => {
      expect(() => {
        validateUrl('https://example.com/path', {
          allowedDomains: ['example.com'],
        })
      }).not.toThrow()
    })

    it('rejects HTTP URLs when httpsOnly is true', () => {
      expect(() => {
        validateUrl('http://example.com', {
          allowedDomains: ['example.com'],
          httpsOnly: true,
        })
      }).toThrow(URLValidationError)
    })

    it('accepts HTTP URLs when httpsOnly is false', () => {
      expect(() => {
        validateUrl('http://example.com', {
          allowedDomains: ['example.com'],
          httpsOnly: false,
        })
      }).not.toThrow()
    })

    it('rejects localhost addresses', () => {
      const localhostUrls = [
        'https://localhost/path',
        'https://127.0.0.1/admin',
        'https://[::1]/internal',
        'https://0.0.0.0/secrets',
      ]

      localhostUrls.forEach(url => {
        expect(() => {
          validateUrl(url, { blockInternalNetworks: true })
        }).toThrow('Internal network addresses are not allowed')
      })
    })

    it('rejects private IP addresses', () => {
      const privateIPs = [
        'https://10.0.0.1/path',
        'https://172.16.0.1/admin',
        'https://192.168.1.1/router',
      ]

      privateIPs.forEach(url => {
        expect(() => {
          validateUrl(url, { blockInternalNetworks: true })
        }).toThrow('Private IP addresses are not allowed')
      })
    })

    it('rejects direct IP addresses', () => {
      const ipUrls = [
        'https://1.2.3.4/path',
        'https://203.0.113.1/resource',
      ]

      ipUrls.forEach(url => {
        expect(() => {
          validateUrl(url, { blockIPAddresses: true })
        }).toThrow('URL must be a domain name, not an IP address')
      })
    })

    it('validates against allowlist', () => {
      expect(() => {
        validateUrl('https://instagram.com/post', {
          allowedDomains: ['instagram.com'],
        })
      }).not.toThrow()

      expect(() => {
        validateUrl('https://evil.com/post', {
          allowedDomains: ['instagram.com'],
        })
      }).toThrow('URL must be from an allowed domain')
    })

    it('allows subdomains of allowed domains', () => {
      expect(() => {
        validateUrl('https://www.instagram.com/post', {
          allowedDomains: ['instagram.com'],
        })
      }).not.toThrow()

      expect(() => {
        validateUrl('https://mobile.twitter.com/user', {
          allowedDomains: ['twitter.com'],
        })
      }).not.toThrow()
    })

    it('rejects URLs with allowed domain in path', () => {
      expect(() => {
        validateUrl('https://evil.com/instagram.com/phishing', {
          allowedDomains: ['instagram.com'],
        })
      }).toThrow('URL must be from an allowed domain')
    })

    it('rejects malformed URLs', () => {
      const malformedUrls = [
        'not-a-url',
        'javascript:alert(1)',
        '',
        'https://',
      ]

      malformedUrls.forEach(url => {
        expect(() => {
          validateUrl(url)
        }).toThrow('Invalid URL format')
      })
    })
  })

  describe('validateSocialMediaUrl', () => {
    it('accepts all social media domains', () => {
      SOCIAL_MEDIA_DOMAINS.forEach(domain => {
        expect(() => {
          validateSocialMediaUrl(`https://${domain}/post/123`)
        }).not.toThrow()
      })
    })

    it('rejects non-social-media domains', () => {
      expect(() => {
        validateSocialMediaUrl('https://evil.com/post')
      }).toThrow('URL must be from an allowed domain')
    })

    it('enforces HTTPS', () => {
      expect(() => {
        validateSocialMediaUrl('http://instagram.com/post')
      }).toThrow('URL must use HTTPS protocol')
    })

    it('blocks internal networks', () => {
      expect(() => {
        validateSocialMediaUrl('https://localhost/post')
      }).toThrow('Internal network addresses are not allowed')
    })

    it('blocks IP addresses', () => {
      expect(() => {
        validateSocialMediaUrl('https://1.2.3.4/post')
      }).toThrow('URL must be a domain name, not an IP address')
    })
  })
})
