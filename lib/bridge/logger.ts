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
 * Ensure log directory exists
 */
function ensureLogDir(): void {
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
 */
export function logBridgeAction(entry: Omit<BridgeLogEntry, 'id' | 'ts'>): void {
  ensureLogDir();

  const logEntry: BridgeLogEntry = {
    id: ulid(),
    ts: new Date().toISOString(),
    ...entry,
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  const logPath = getLogFilePath();

  try {
    appendFileSync(logPath, logLine, 'utf8');
  } catch (error) {
    console.error('Failed to write Bridge log:', error);
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
