import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePassword,
  validateResetToken,
  requireNonEmptyString,
  requireMatch,
  validateLength,
  sanitizeInput,
  ValidationError,
} from '../input-validation'

describe('Input Validation', () => {
  describe('validateEmail', () => {
    it('accepts valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.com',
        'test_user@subdomain.example.com',
      ]

      validEmails.forEach(email => {
        expect(() => validateEmail(email)).not.toThrow()
      })
    })

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
      ]

      invalidEmails.forEach(email => {
        expect(() => validateEmail(email)).toThrow(ValidationError)
      })
    })

    it('rejects excessively long emails (DoS protection)', () => {
      const longEmail = 'a'.repeat(256) + '@example.com'

      expect(() => validateEmail(longEmail)).toThrow('Email address too long')
    })

    it('handles ReDoS attempts without hanging', () => {
      const reDoSAttempts = [
        '!@!.' + '!.'.repeat(1000),
        'a' + '@a'.repeat(1000),
      ]

      reDoSAttempts.forEach(email => {
        const start = Date.now()
        try {
          validateEmail(email)
        } catch {
          // Expected to throw
        }
        const duration = Date.now() - start

        // Should complete in < 100ms (linear time)
        expect(duration).toBeLessThan(100)
      })
    })
  })

  describe('validatePassword', () => {
    it('accepts strong passwords', () => {
      const strongPasswords = [
        'Password123',
        'MySecure1Pass',
        'Test1234',
      ]

      strongPasswords.forEach(password => {
        expect(() => validatePassword(password)).not.toThrow()
      })
    })

    it('rejects passwords shorter than 8 characters', () => {
      const weakPasswords = ['short', '1234567', 'abc123']

      weakPasswords.forEach(password => {
        expect(() => validatePassword(password)).toThrow('at least 8 characters')
      })
    })

    it('rejects passwords without letters', () => {
      expect(() => validatePassword('12345678')).toThrow('contain both letters and numbers')
    })

    it('rejects passwords without numbers', () => {
      expect(() => validatePassword('onlyletters')).toThrow('contain both letters and numbers')
    })

    it('rejects passwords longer than 72 characters (bcrypt limit)', () => {
      const longPassword = 'a'.repeat(73) + '123'

      expect(() => validatePassword(longPassword)).toThrow('Password too long')
    })
  })

  describe('validateResetToken', () => {
    it('accepts valid reset tokens', () => {
      expect(() => validateResetToken('validtoken1234567890')).not.toThrow()
    })

    it('rejects empty tokens', () => {
      expect(() => validateResetToken('')).toThrow('Reset token is required')
      expect(() => validateResetToken('   ')).toThrow('Reset token is required')
    })

    it('rejects short tokens', () => {
      expect(() => validateResetToken('short')).toThrow('Invalid reset token format')
    })

    it('rejects tokens with dangerous characters', () => {
      const dangerousTokens = [
        'token<script>alert(1)</script>',
        'token;DROP TABLE',
        'token\x00injection',
        'token"injection',
        "token'injection",
      ]

      dangerousTokens.forEach(token => {
        expect(() => validateResetToken(token)).toThrow('Invalid characters in reset token')
      })
    })
  })

  describe('requireNonEmptyString', () => {
    it('accepts non-empty strings', () => {
      expect(() => requireNonEmptyString('valid', 'field')).not.toThrow()
    })

    it('rejects non-string values', () => {
      const nonStrings = [123, null, undefined, {}, [], true]

      nonStrings.forEach(value => {
        expect(() => requireNonEmptyString(value, 'field')).toThrow('must be a string')
      })
    })

    it('rejects empty or whitespace-only strings', () => {
      const emptyStrings = ['', '   ', '\t\n']

      emptyStrings.forEach(value => {
        expect(() => requireNonEmptyString(value, 'field')).toThrow('is required')
      })
    })
  })

  describe('requireMatch', () => {
    it('accepts matching values', () => {
      expect(() => requireMatch('password', 'password', 'Password')).not.toThrow()
    })

    it('rejects non-matching values', () => {
      expect(() => requireMatch('password1', 'password2', 'Password')).toThrow('values do not match')
    })
  })

  describe('validateLength', () => {
    it('accepts strings within bounds', () => {
      expect(() => validateLength('hello', 'field', 1, 10)).not.toThrow()
    })

    it('rejects strings too short', () => {
      expect(() => validateLength('hi', 'field', 5, 10)).toThrow('must be at least 5 characters')
    })

    it('rejects strings too long', () => {
      expect(() => validateLength('very long string', 'field', 1, 5)).toThrow('must be at most 5 characters')
    })

    it('uses default bounds when not specified', () => {
      expect(() => validateLength('valid string', 'field')).not.toThrow()

      const veryLong = 'a'.repeat(1001)
      expect(() => validateLength(veryLong, 'field')).toThrow('must be at most 1000 characters')
    })
  })

  describe('sanitizeInput', () => {
    it('escapes HTML special characters', () => {
      const input = '<script>alert("XSS")</script>'
      const sanitized = sanitizeInput(input)

      expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;')
      expect(sanitized).not.toContain('<')
      expect(sanitized).not.toContain('>')
    })

    it('escapes quotes and apostrophes', () => {
      const input = "It's a \"test\""
      const sanitized = sanitizeInput(input)

      expect(sanitized).toContain('&#x27;')
      expect(sanitized).toContain('&quot;')
    })

    it('handles empty strings', () => {
      expect(sanitizeInput('')).toBe('')
    })

    it('handles strings without special characters', () => {
      const input = 'hello world'
      expect(sanitizeInput(input)).toBe('hello world')
    })
  })
})
