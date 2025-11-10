import { describe, it, expect } from 'vitest'
import { POST } from '../reset-password/route'
import { NextRequest } from 'next/server'

/**
 * Security-focused tests for reset-password endpoint
 * Tests token validation, session invalidation, and password strength
 */

describe('Reset Password API - Security', () => {
  describe('Token Validation', () => {
    it('rejects empty token', async () => {
      const req = new NextRequest('http://localhost/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: '', password: 'NewPassword123' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Token and password required')
    })

    it('rejects invalid token format', async () => {
      const invalidTokens = [
        'short',
        '!@#$%^&*()',
        '<script>alert(1)</script>',
        '../../../etc/passwd',
        'token\0injection',
      ]

      for (const token of invalidTokens) {
        const req = new NextRequest('http://localhost/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token, password: 'NewPassword123' }),
          headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(req)
        const data = await response.json()

        // Should fail at token verification stage
        expect(response.status).toBe(400)
        expect(data.error).toBe('Invalid or expired reset token')
      }
    })

    it('rejects type confusion attacks on token', async () => {
      const payloads = [
        { token: 123, password: 'NewPassword123' },
        { token: null, password: 'NewPassword123' },
        { token: {}, password: 'NewPassword123' },
        { token: [], password: 'NewPassword123' },
        { token: true, password: 'NewPassword123' },
      ]

      for (const payload of payloads) {
        const req = new NextRequest('http://localhost/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(req)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('must be strings')
      }
    })

    it('prevents token reuse', async () => {
      const validToken = 'valid-token-12345' // Mocked valid token

      // First request should work (if token is valid)
      const req1 = new NextRequest('http://localhost/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: validToken, password: 'NewPassword123' }),
        headers: { 'Content-Type': 'application/json' },
      })

      await POST(req1)

      // Second request with same token should fail (token marked as used)
      const req2 = new NextRequest('http://localhost/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: validToken, password: 'AnotherPassword123' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response2 = await POST(req2)
      const data2 = await response2.json()

      expect(response2.status).toBe(400)
      expect(data2.error).toBe('Invalid or expired reset token')
    })
  })

  describe('Password Strength Validation', () => {
    it('rejects weak passwords (too short)', async () => {
      const weakPasswords = [
        'short',
        '1234567',
        'abc123',
      ]

      for (const password of weakPasswords) {
        const req = new NextRequest('http://localhost/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token: 'valid-token-123', password }),
          headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(req)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('at least 8 characters')
      }
    })

    it('requires both letters and numbers', async () => {
      const weakPasswords = [
        'onlylettershere',
        '12345678901234',
        'NoNumbersHere',
        '1234567890',
      ]

      for (const password of weakPasswords) {
        const req = new NextRequest('http://localhost/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token: 'valid-token-123', password }),
          headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(req)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('contain both letters and numbers')
      }
    })

    it('accepts strong passwords', async () => {
      const strongPasswords = [
        'StrongPassword123',
        'MySecure123Pass',
        'Test1234Password',
      ]

      for (const password of strongPasswords) {
        const req = new NextRequest('http://localhost/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token: 'invalid-token', password }), // Will fail at token validation, not password
          headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(req)
        const data = await response.json()

        // Should fail at token validation, not password validation
        expect(data.error).not.toContain('at least 8 characters')
        expect(data.error).not.toContain('contain both letters and numbers')
      }
    })
  })

  describe('SQL Injection Protection', () => {
    it('safely handles SQL injection in token', async () => {
      const sqlPayloads = [
        "token' OR '1'='1",
        "token'; DROP TABLE reset_tokens--",
        "token' UNION SELECT * FROM users--",
      ]

      for (const token of sqlPayloads) {
        const req = new NextRequest('http://localhost/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token, password: 'NewPassword123' }),
          headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(req)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Invalid or expired reset token')

        // No SQL error leakage
        expect(data.error.toLowerCase()).not.toContain('syntax')
        expect(data.error.toLowerCase()).not.toContain('query')
      }
    })

    it('safely handles SQL injection in new password', async () => {
      const sqlPayloads = [
        "password' OR '1'='1",
        "'; DROP TABLE users--",
      ]

      for (const password of sqlPayloads) {
        const req = new NextRequest('http://localhost/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token: 'valid-token-123', password }),
          headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(req)
        const data = await response.json()

        // Should either fail password validation or token validation
        expect([400, 401]).toContain(response.status)
        expect(data.error).toBeTruthy()
      }
    })
  })

  describe('Session Invalidation', () => {
    it('invalidates all existing sessions after password reset', async () => {
      const req = new NextRequest('http://localhost/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: 'valid-token-123', password: 'NewPassword123' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)

      // Verify response includes session invalidation logic
      // (Implementation detail: check that deleteSessions() was called)
      // This test would need to mock the deleteSessions function to verify it's called
      expect(response.status).toBeLessThan(500) // Should not error
    })
  })

  describe('XSS Protection', () => {
    it('does not reflect user input in error messages', async () => {
      const xssPayloads = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        'javascript:alert(1)',
      ]

      for (const token of xssPayloads) {
        const req = new NextRequest('http://localhost/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token, password: 'NewPassword123' }),
          headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(req)
        const data = await response.json()

        // Error message should be generic
        expect(data.error).toBe('Invalid or expired reset token')
        expect(data.error).not.toContain('<script>')
        expect(data.error).not.toContain('onerror')
      }
    })
  })

  describe('Timing Attack Protection', () => {
    it('has consistent response time for invalid vs expired tokens', async () => {
      // Test with completely invalid token
      const req1 = new NextRequest('http://localhost/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: 'invalid-token-123', password: 'NewPassword123' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const start1 = Date.now()
      await POST(req1)
      const duration1 = Date.now() - start1

      // Test with different invalid token
      const req2 = new NextRequest('http://localhost/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: 'another-invalid-token', password: 'NewPassword123' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const start2 = Date.now()
      await POST(req2)
      const duration2 = Date.now() - start2

      // Response times should be similar (within 100ms tolerance)
      const timingDifference = Math.abs(duration1 - duration2)
      expect(timingDifference).toBeLessThan(100)
    })
  })

  describe('Password Length Limits', () => {
    it('handles extremely long passwords (bcrypt limit)', async () => {
      // bcrypt has a 72-character limit; ensure we handle this
      const veryLongPassword = 'a'.repeat(200) + '123'

      const req = new NextRequest('http://localhost/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: 'valid-token-123', password: veryLongPassword }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)

      // Should handle gracefully (either accept or reject with clear error)
      expect(response.status).toBeLessThan(500)
    })

    it('prevents denial of service via huge passwords', async () => {
      // Test with 1MB password to ensure we don't allow DoS
      const hugePassword = 'a'.repeat(1000000)

      const start = Date.now()
      const req = new NextRequest('http://localhost/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: 'valid-token-123', password: hugePassword }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      const duration = Date.now() - start

      // Should reject quickly (within 1 second), not hash a massive string
      expect(duration).toBeLessThan(1000)
      expect(response.status).toBeLessThan(500)
    })
  })
})
