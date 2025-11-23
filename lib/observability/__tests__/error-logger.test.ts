/**
 * Comprehensive tests for error-logger
 * Includes unit tests, property-based tests, and edge cases
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { logError, hashIp, createErrorContext, type ErrorLogEntry } from '../error-logger';
import * as fs from 'fs';
import * as crypto from 'crypto';

// Mock file system
vi.mock('fs');
vi.mock('crypto');

describe('error-logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('ERROR_IP_SALT', 'test-salt');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('logError', () => {
    it('should log Error instances with all fields', () => {
      const mockAppendFileSync = vi.mocked(fs.appendFileSync);
      const testError = new Error('Test error message');
      testError.stack = 'Error: Test error message\n    at /home/user/TogetherOS/test.ts:10:15';

      logError({ error: testError, severity: 'critical' });

      expect(mockAppendFileSync).toHaveBeenCalled();
      const loggedData = mockAppendFileSync.mock.calls[0][1] as string;
      const parsed: ErrorLogEntry = JSON.parse(loggedData.trim());

      expect(parsed.severity).toBe('critical');
      expect(parsed.message).toBe('Test error message');
      expect(parsed.stack).toContain('TogetherOS/test.ts:10:15');
      expect(parsed.id).toBeTruthy();
      expect(parsed.ts).toBeTruthy();
    });

    it('should log string errors', () => {
      const mockAppendFileSync = vi.mocked(fs.appendFileSync);

      logError({ error: 'Simple error string' });

      const loggedData = mockAppendFileSync.mock.calls[0][1] as string;
      const parsed: ErrorLogEntry = JSON.parse(loggedData.trim());

      expect(parsed.message).toBe('Simple error string');
      expect(parsed.severity).toBe('error'); // default
    });

    it('should log object errors as JSON', () => {
      const mockAppendFileSync = vi.mocked(fs.appendFileSync);

      logError({ error: { code: 'ERR_001', details: 'Something went wrong' } });

      const loggedData = mockAppendFileSync.mock.calls[0][1] as string;
      const parsed: ErrorLogEntry = JSON.parse(loggedData.trim());

      expect(parsed.message).toContain('ERR_001');
      expect(parsed.message).toContain('Something went wrong');
    });

    it('should include context when provided', () => {
      const mockAppendFileSync = vi.mocked(fs.appendFileSync);
      const context = {
        route: '/api/test',
        user_id: 'user123',
        ip_hash: 'abcd1234',
        metadata: { request_id: 'req-001' },
      };

      logError({ error: new Error('Test'), context });

      const loggedData = mockAppendFileSync.mock.calls[0][1] as string;
      const parsed: ErrorLogEntry = JSON.parse(loggedData.trim());

      expect(parsed.context).toEqual(context);
    });

    it('should sanitize emails from error messages', () => {
      const mockAppendFileSync = vi.mocked(fs.appendFileSync);

      logError({ error: new Error('Error for user test@example.com') });

      const loggedData = mockAppendFileSync.mock.calls[0][1] as string;
      const parsed: ErrorLogEntry = JSON.parse(loggedData.trim());

      expect(parsed.message).not.toContain('test@example.com');
      expect(parsed.message).toContain('[EMAIL_REDACTED]');
    });

    it('should sanitize IP addresses from error messages', () => {
      const mockAppendFileSync = vi.mocked(fs.appendFileSync);

      logError({ error: new Error('Connection from 192.168.1.100 failed') });

      const loggedData = mockAppendFileSync.mock.calls[0][1] as string;
      const parsed: ErrorLogEntry = JSON.parse(loggedData.trim());

      expect(parsed.message).not.toContain('192.168.1.100');
      expect(parsed.message).toContain('[IP_REDACTED]');
    });

    it('should sanitize phone numbers from error messages', () => {
      const mockAppendFileSync = vi.mocked(fs.appendFileSync);

      logError({ error: new Error('Call 555-123-4567 for support') });

      const loggedData = mockAppendFileSync.mock.calls[0][1] as string;
      const parsed: ErrorLogEntry = JSON.parse(loggedData.trim());

      expect(parsed.message).not.toContain('555-123-4567');
      expect(parsed.message).toContain('[PHONE_REDACTED]');
    });

    it('should sanitize tokens from error messages', () => {
      const mockAppendFileSync = vi.mocked(fs.appendFileSync);

      logError({ error: new Error('Invalid token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9') });

      const loggedData = mockAppendFileSync.mock.calls[0][1] as string;
      const parsed: ErrorLogEntry = JSON.parse(loggedData.trim());

      expect(parsed.message).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(parsed.message).toContain('[TOKEN_REDACTED]');
    });

    it('should sanitize absolute paths from stack traces', () => {
      const mockAppendFileSync = vi.mocked(fs.appendFileSync);
      const testError = new Error('Test');
      testError.stack = 'Error: Test\n    at /home/user/projects/TogetherOS/lib/error.ts:10:15';

      logError({ error: testError });

      const loggedData = mockAppendFileSync.mock.calls[0][1] as string;
      const parsed: ErrorLogEntry = JSON.parse(loggedData.trim());

      expect(parsed.stack).not.toContain('/home/user/projects');
      expect(parsed.stack).toContain('TogetherOS/lib/error.ts:10:15');
    });

    it('should fallback to console.error when file write fails', () => {
      const mockAppendFileSync = vi.mocked(fs.appendFileSync);
      const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAppendFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      logError({ error: new Error('Test error') });

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('[Error Log]'),
        expect.any(String)
      );

      mockConsoleError.mockRestore();
    });

    it('should log to console in serverless environments', () => {
      vi.stubEnv('VERCEL', '1');
      const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      logError({ error: new Error('Test error') });

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('[Error Log]'),
        expect.any(String)
      );
      expect(fs.appendFileSync).not.toHaveBeenCalled();

      mockConsoleError.mockRestore();
    });
  });

  describe('hashIp', () => {
    it('should hash IP addresses consistently', () => {
      const mockHash = {
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('abcdef1234567890'),
      };
      vi.mocked(crypto.createHash).mockReturnValue(mockHash as any);

      const hash1 = hashIp('192.168.1.1');
      const hash2 = hashIp('192.168.1.1');

      expect(hash1).toBe(hash2);
      expect(hash1).toBe('abcdef1234567890'.substring(0, 16));
    });

    it('should produce different hashes for different IPs', () => {
      let counter = 0;
      const mockHash = {
        update: vi.fn().mockReturnThis(),
        digest: vi.fn(() => {
          counter++;
          return `hash${counter}0000000000`;
        }),
      };
      vi.mocked(crypto.createHash).mockReturnValue(mockHash as any);

      const hash1 = hashIp('192.168.1.1');
      const hash2 = hashIp('192.168.1.2');

      expect(hash1).not.toBe(hash2);
    });

    it('should use salt from environment', () => {
      const mockHash = {
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('test1234567890ab'),
      };
      vi.mocked(crypto.createHash).mockReturnValue(mockHash as any);

      hashIp('192.168.1.1');

      expect(mockHash.update).toHaveBeenCalledWith('test-salt192.168.1.1');
    });
  });

  describe('createErrorContext', () => {
    it('should extract route from request URL', () => {
      const request = new Request('https://example.com/api/test?foo=bar');

      const context = createErrorContext(request);

      expect(context.route).toBe('/api/test');
    });

    it('should hash IP from x-forwarded-for header', () => {
      const mockHash = {
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('forwarded12345678'),
      };
      vi.mocked(crypto.createHash).mockReturnValue(mockHash as any);

      const request = new Request('https://example.com/api/test', {
        headers: { 'x-forwarded-for': '203.0.113.1, 198.51.100.1' },
      });

      const context = createErrorContext(request);

      expect(context.ip_hash).toBe('forwarded12345678'.substring(0, 16));
    });

    it('should hash IP from x-real-ip header if no x-forwarded-for', () => {
      const mockHash = {
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('realip1234567890'),
      };
      vi.mocked(crypto.createHash).mockReturnValue(mockHash as any);

      const request = new Request('https://example.com/api/test', {
        headers: { 'x-real-ip': '203.0.113.1' },
      });

      const context = createErrorContext(request);

      expect(context.ip_hash).toBe('realip1234567890'.substring(0, 16));
    });

    it('should handle missing IP headers', () => {
      const request = new Request('https://example.com/api/test');

      const context = createErrorContext(request);

      expect(context.ip_hash).toBeUndefined();
    });
  });

  describe('Property-based tests', () => {
    it('should always produce valid NDJSON for any error message', () => {
      fc.assert(
        fc.property(fc.string(), errorMessage => {
          const mockAppendFileSync = vi.mocked(fs.appendFileSync);
          mockAppendFileSync.mockClear();

          logError({ error: errorMessage });

          if (mockAppendFileSync.mock.calls.length > 0) {
            const loggedData = mockAppendFileSync.mock.calls[0][1] as string;
            const parsed = JSON.parse(loggedData.trim());

            expect(parsed).toHaveProperty('id');
            expect(parsed).toHaveProperty('ts');
            expect(parsed).toHaveProperty('severity');
            expect(parsed).toHaveProperty('message');
          }
        })
      );
    });

    it('should sanitize all emails from arbitrary text', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          fc.string(),
          fc.string(),
          (email, prefix, suffix) => {
            const mockAppendFileSync = vi.mocked(fs.appendFileSync);
            mockAppendFileSync.mockClear();

            const message = `${prefix} ${email} ${suffix}`;
            logError({ error: new Error(message) });

            const loggedData = mockAppendFileSync.mock.calls[0][1] as string;
            const parsed: ErrorLogEntry = JSON.parse(loggedData.trim());

            expect(parsed.message).not.toContain(email);
            expect(parsed.message).toContain('[EMAIL_REDACTED]');
          }
        )
      );
    });

    it('should always return 16 character hash for any IP', () => {
      fc.assert(
        fc.property(fc.ipV4(), ip => {
          const mockHash = {
            update: vi.fn().mockReturnThis(),
            digest: vi.fn().mockReturnValue('a'.repeat(64)),
          };
          vi.mocked(crypto.createHash).mockReturnValue(mockHash as any);

          const hash = hashIp(ip);

          expect(hash).toHaveLength(16);
        })
      );
    });
  });
});
