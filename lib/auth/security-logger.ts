/**
 * Security event logging for authentication flows
 * Uses NDJSON format with IP hashing for privacy
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  event_type: string;
  user_id?: string;
  ip_hash: string;
  metadata?: Record<string, unknown>;
}

/**
 * Hash IP address for privacy (SHA-256)
 */
export function hashIP(ip: string | null): string {
  if (!ip || ip === 'unknown') {
    return 'unknown';
  }
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

/**
 * Hash email for privacy
 */
export function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex').substring(0, 16);
}

/**
 * Log security event to NDJSON file
 */
export async function logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
  const logEntry: SecurityEvent = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...event,
  };

  // In serverless/edge environments, logging might not be file-based
  // For now, use console logging with structured format
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    console.log('[SECURITY_EVENT]', JSON.stringify(logEntry));
    return;
  }

  // For local/VPS deployment, append to NDJSON file
  try {
    const logsDir = path.join(process.cwd(), 'logs', 'auth');
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `security-${today}.ndjson`);

    // Ensure directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Append log entry
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Failed to write security log:', error);
    // Fallback to console
    console.log('[SECURITY_EVENT]', JSON.stringify(logEntry));
  }
}
