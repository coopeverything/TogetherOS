/**
 * Session management utilities
 * Handles session validation and user data retrieval
 */

import type { AuthenticatedUser } from './auth/middleware';
import { query } from '@togetheros/db';

interface SessionRow {
  id: string;
  user_id: string;
  expires_at: Date;
  created_at: Date;
}

interface UserRow {
  id: string;
  email: string;
  name?: string;
  is_admin: boolean;
}

/**
 * Verify session token and return user data
 * Returns null if session is invalid or expired
 */
export async function verifySession(
  sessionToken: string
): Promise<AuthenticatedUser | null> {
  try {
    // Query session and user data in one query with JOIN
    const result = await query<UserRow & { session_expires: Date }>(
      `SELECT
         u.id,
         u.email,
         u.name,
         u.is_admin,
         s.expires_at as session_expires
       FROM sessions s
       INNER JOIN users u ON s.user_id = u.id
       WHERE s.token = $1
         AND s.expires_at > NOW()
       LIMIT 1`,
      [sessionToken]
    );

    if (!result.rows[0]) {
      return null;
    }

    const row = result.rows[0];

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      is_admin: row.is_admin,
    };
  } catch (error: any) {
    console.error('Session verification error:', JSON.stringify({
      message: error.message
    }));
    return null;
  }
}
