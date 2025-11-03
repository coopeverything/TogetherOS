import { describe, it, expect, vi } from 'vitest'
import { POST } from '../login/route'
import { NextRequest } from 'next/server'

/**
 * Security-focused tests for login endpoint
 * Tests type confusion, SQL injection, and input validation attacks
 */

describe('Login API - Security', () => {
  describe('Type Confusion Attacks', () => {
    it('rejects non-string email', async () => {
      const payloads = [
        { email: 123, password: 'test123' },
        { email: null, password: 'test123' },
        { email: undefined, password: 'test123' },
        { email: {}, password: 'test123' },
        { email: [], password: 'test123' },
        { email: true, password: 'test123' },
      ]

      for (const payload of payloads) {
        const req = new NextRequest('http://localhost/api/auth/login', {
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

    it('rejects non-string password', async () => {
      const payloads = [
        { email: 'test@example.com', password: 123 },
        { email: 'test@example.com', password: null },
        { email: 'test@example.com', password: undefined },
        { email: 'test@example.com', password: {} },
        { email: 'test@example.com', password: [] },
        { email: 'test@example.com', password: false },
      ]

      for (const payload of payloads) {
        const req = new NextRequest('http://localhost/api/auth/login', {
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

    it('rejects missing fields', async () => {
      const payloads = [
        {},
        { email: 'test@example.com' },
        { password: 'test123' },
      ]

      for (const payload of payloads) {
        const req = new NextRequest('http://localhost/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(req)
        expect(response.status).toBe(400)
      }
    })
  })

  describe('SQL Injection Protection', () => {
    it('safely handles SQL injection attempts in email', async () => {
      const sqlInjectionPayloads = [
        "admin'--",
        "admin' OR '1'='1",
        "admin'; DROP TABLE users--",
        "admin' UNION SELECT * FROM users--",
        "' OR 1=1--",
        "1' AND '1'='1",
      ]

      for (const email of sqlInjectionPayloads) {
        const req = new NextRequest('http://localhost/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password: 'test123' }),
          headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(req)
        const data = await response.json()

        // Should either fail email validation or return invalid credentials
        expect([400, 401]).toContain(response.status)
        expect(data.error).toBeTruthy()

        // Ensure no SQL execution hints in error message
        expect(data.error.toLowerCase()).not.toContain('syntax')
        expect(data.error.toLowerCase()).not.toContain('query')
      }
    })

    it('safely handles SQL injection attempts in password', async () => {
      const sqlInjectionPayloads = [
        "password' OR '1'='1",
        "'; DROP TABLE sessions--",
        "' UNION SELECT password FROM users WHERE email='admin@example.com'--",
      ]

      for (const password of sqlInjectionPayloads) {
        const req = new NextRequest('http://localhost/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password }),
          headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(req)
        const data = await response.json()

        // Should return invalid credentials (bcrypt comparison will fail)
        expect(response.status).toBe(401)
        expect(data.error).toBe('Invalid email or password')
      }
    })
  })

  describe('Email Validation ReDoS Protection', () => {
    it('handles long email inputs without catastrophic backtracking', async () => {
      // Test with 10,000 character email to ensure no exponential time
      const longEmail = 'a'.repeat(10000) + '@example.com'

      const start = Date.now()
      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: longEmail, password: 'test123' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      const duration = Date.now() - start

      // Should complete in < 1 second (linear time, not exponential)
      expect(duration).toBeLessThan(1000)
      expect(response.status).toBe(400) // Invalid email format or too long
    })

    it('handles malicious regex patterns without hanging', async () => {
      const reDoSAttempts = [
        '!@!.' + '!.'.repeat(1000), // Pattern from CodeQL alert
        'a' + '@a'.repeat(1000),
        'a'.repeat(1000) + '@' + 'a'.repeat(1000) + '.' + 'a'.repeat(1000),
      ]

      for (const email of reDoSAttempts) {
        const start = Date.now()
        const req = new NextRequest('http://localhost/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password: 'test123' }),
          headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(req)
        const duration = Date.now() - start

        // Should complete in < 1 second
        expect(duration).toBeLessThan(1000)
        expect(response.status).toBe(400)
      }
    })
  })

  describe('Empty String Bypass Protection', () => {
    it('rejects empty email', async () => {
      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: '', password: 'test123' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email and password required')
    })

    it('rejects empty password', async () => {
      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: '' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email and password required')
    })

    it('rejects whitespace-only inputs', async () => {
      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: '   ', password: '   ' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email and password required')
    })
  })

  describe('XSS Protection', () => {
    it('does not reflect user input in error messages', async () => {
      const xssPayloads = [
        '<script>alert(1)</script>@example.com',
        'test@example.com<img src=x onerror=alert(1)>',
        'javascript:alert(1)@example.com',
      ]

      for (const email of xssPayloads) {
        const req = new NextRequest('http://localhost/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password: 'test123' }),
          headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(req)
        const data = await response.json()

        // Error message should be generic, not include user input
        expect(data.error).toBe('Invalid email format')
        expect(data.error).not.toContain('<script>')
        expect(data.error).not.toContain('onerror')
      }
    })
  })

  describe('Timing Attack Protection', () => {
    it('has consistent response time for invalid email vs invalid password', async () => {
      // Test with non-existent user
      const req1 = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'nonexistent@example.com', password: 'test123' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const start1 = Date.now()
      await POST(req1)
      const duration1 = Date.now() - start1

      // Test with existing user but wrong password (if verifyPassword uses constant-time comparison)
      const req2 = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@example.com', password: 'wrongpassword' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const start2 = Date.now()
      await POST(req2)
      const duration2 = Date.now() - start2

      // Response times should be similar (within 100ms tolerance)
      // This tests if verifyPassword uses constant-time comparison
      const timingDifference = Math.abs(duration1 - duration2)
      expect(timingDifference).toBeLessThan(100)
    })
  })
})
