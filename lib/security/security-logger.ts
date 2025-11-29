/**
 * Security event logging for API routes
 * Uses NDJSON format with IP hashing for privacy
 */

import * as crypto from 'crypto';

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
 * Log security event
 * In serverless environments, uses console logging with structured format
 */
export async function logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
  const logEntry: SecurityEvent = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...event,
  };

  // Use structured console logging for serverless/edge
  console.log('[SECURITY_EVENT]', JSON.stringify(logEntry));
}
