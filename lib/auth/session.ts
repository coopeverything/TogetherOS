/**
 * Session management with JWT
 */

import jwt from 'jsonwebtoken';
import { query } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'togetheros-default-secret-change-in-production';
const TOKEN_EXPIRY = '7d'; // 7 days

export interface SessionData {
  userId: string;
  email: string;
}

/**
 * Create a new session token
 */
export async function createSession(userId: string, email: string, ip?: string, userAgent?: string): Promise<string> {
  const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await query(
    'INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
    [userId, token, expiresAt, ip, userAgent]
  );

  return token;
}

/**
 * Verify and decode a session token
 */
export function verifySession(token: string): SessionData | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionData;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(token: string): Promise<void> {
  await query('DELETE FROM sessions WHERE token = $1', [token]);
}

/**
 * Delete all sessions for a user (logout everywhere)
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await query('DELETE FROM sessions WHERE user_id = $1', [userId]);
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanExpiredSessions(): Promise<void> {
  await query('DELETE FROM sessions WHERE expires_at < NOW()');
}
