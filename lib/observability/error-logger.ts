/**
 * Self-Hosted Error Logger
 *
 * Captures all application errors in NDJSON format
 * Logs to: logs/errors/errors-YYYY-MM-DD.ndjson
 *
 * Privacy-first: No PII, stack traces sanitized
 */

import { createHash } from 'crypto';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ulid } from 'ulid';

const LOG_DIR = join(process.cwd(), 'logs', 'errors');

/**
 * Check if running in serverless environment
 */
function isServerless(): boolean {
  return !!(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY ||
    process.env.LAMBDA_TASK_ROOT
  );
}

/**
 * Ensure log directory exists (skip in serverless)
 */
function ensureLogDir(): void {
  if (isServerless()) return;

  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Get log file path for today
 */
function getLogFilePath(): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return join(LOG_DIR, `errors-${date}.ndjson`);
}

/**
 * Sanitize error message to remove PII
 */
function sanitizeMessage(message: string): string {
  return message
    // Redact emails
    .replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      '[EMAIL_REDACTED]'
    )
    // Redact IPs
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP_REDACTED]')
    // Redact phone numbers
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]')
    // Redact API keys/tokens (common patterns)
    .replace(/\b[A-Za-z0-9_-]{20,}\b/g, '[TOKEN_REDACTED]');
}

/**
 * Sanitize stack trace
 */
function sanitizeStackTrace(stack?: string): string | undefined {
  if (!stack) return undefined;

  // Remove full file paths, keep relative paths
  return stack
    .split('\n')
    .map(line => {
      // Remove absolute paths like /home/user/project/...
      return line.replace(/\/[^\s]+\/(TogetherOS\/)/g, '$1');
    })
    .join('\n');
}

export interface ErrorLogEntry {
  id: string;
  ts: string;
  severity: 'critical' | 'error' | 'warning';
  message: string;
  stack?: string;
  code?: string;
  context?: {
    route?: string;
    user_id?: string;
    ip_hash?: string;
    metadata?: Record<string, unknown>;
  };
}

/**
 * Log an error to NDJSON
 */
export function logError(params: {
  error: Error | unknown;
  severity?: 'critical' | 'error' | 'warning';
  context?: ErrorLogEntry['context'];
}): void {
  const { error, severity = 'error', context } = params;

  let message = 'Unknown error';
  let stack: string | undefined;
  let code: string | undefined;

  if (error instanceof Error) {
    message = error.message;
    stack = error.stack;
    code = (error as any).code;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    message = JSON.stringify(error);
  }

  const logEntry: ErrorLogEntry = {
    id: ulid(),
    ts: new Date().toISOString(),
    severity,
    message: sanitizeMessage(message),
    stack: sanitizeStackTrace(stack),
    code,
    context,
  };

  const logLine = JSON.stringify(logEntry);

  // In serverless environments, log to console (platform captures it)
  if (isServerless()) {
    console.error('[Error Log]', logLine);
    return;
  }

  // In local/VPS deployment, write to NDJSON file
  ensureLogDir();
  const logPath = getLogFilePath();

  try {
    appendFileSync(logPath, logLine + '\n', 'utf8');
  } catch (err) {
    console.error('Failed to write error log:', err);
    // Fallback to console
    console.error('[Error Log]', logLine);
  }
}

/**
 * Hash IP for privacy
 */
export function hashIp(ip: string): string {
  const salt = process.env.ERROR_IP_SALT || 'togetheros-error-salt';
  return createHash('sha256')
    .update(salt + ip)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Create error context from request
 */
export function createErrorContext(request: Request): ErrorLogEntry['context'] {
  // Extract IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0].trim() || realIp || 'unknown';

  return {
    route: new URL(request.url).pathname,
    ip_hash: ip !== 'unknown' ? hashIp(ip) : undefined,
  };
}
