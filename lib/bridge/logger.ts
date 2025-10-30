/**
 * NDJSON Logger for Bridge
 *
 * Privacy-first append-only logging with IP hashing
 * Logs to: logs/bridge/actions-YYYY-MM-DD.ndjson
 */

import { createHash } from 'crypto';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ulid } from 'ulid';

const LOG_DIR = join(process.cwd(), 'logs', 'bridge');
const IP_SALT = process.env.BRIDGE_IP_SALT || 'togetheros-default-salt-change-in-prod';

/**
 * Hash IP address for privacy
 */
export function hashIp(ip: string): string {
  return createHash('sha256')
    .update(IP_SALT + ip)
    .digest('hex');
}

/**
 * Get log file path for today
 */
function getLogFilePath(): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return join(LOG_DIR, `actions-${date}.ndjson`);
}

/**
 * Check if running in serverless environment (Vercel, AWS Lambda, etc.)
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

export interface BridgeLogEntry {
  id: string;
  ts: string;
  action: 'ask' | 'error' | 'rate_limit';
  ip_hash: string;
  q_len?: number;
  latency_ms?: number;
  status?: number;
  error?: string;
}

/**
 * Log a Bridge action to NDJSON
 * In serverless: logs to console (captured by platform)
 * In local dev: appends to NDJSON file
 */
export function logBridgeAction(entry: Omit<BridgeLogEntry, 'id' | 'ts'>): void {
  const logEntry: BridgeLogEntry = {
    id: ulid(),
    ts: new Date().toISOString(),
    ...entry,
  };

  const logLine = JSON.stringify(logEntry);

  // In serverless environments, log to console (platform captures it)
  if (isServerless()) {
    console.log('[Bridge Log]', logLine);
    return;
  }

  // In local development, write to NDJSON file
  ensureLogDir();
  const logPath = getLogFilePath();

  try {
    appendFileSync(logPath, logLine + '\n', 'utf8');
  } catch (error) {
    console.error('Failed to write Bridge log:', error);
    // Fallback to console
    console.log('[Bridge Log]', logLine);
  }
}

/**
 * Extract IP from Next.js request
 */
export function getClientIp(request: Request): string {
  // Try various headers for proxied requests
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to connection IP (may not be available in Edge runtime)
  return 'unknown';
}
