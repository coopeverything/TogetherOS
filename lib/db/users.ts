/**
 * User database operations
 */

import { query } from './index';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  paths?: string[];
  skills?: string[];
  can_offer?: string;
  seeking_help?: string;
  profile_visibility?: 'public' | 'members' | 'private';
  social_links?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
    mastodon?: string;
    bluesky?: string;
  };
  onboarding_step?: string;
  onboarding_completed_at?: Date;
  // OAuth fields
  google_id?: string;
  oauth_display_name?: string;
  oauth_avatar_url?: string;
  oauth_locale?: string;
  oauth_verified?: boolean;
  oauth_raw_profile?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create a new user (email signup or OAuth)
 */
export async function createUser(email: string, password?: string, userData?: Partial<User>): Promise<User> {
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  // Build dynamic insert based on provided data
  const fields = ['email', 'password_hash'];
  const values: any[] = [email, passwordHash];
  const placeholders = ['$1', '$2'];
  
  if (userData) {
    let paramIndex = 3;
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined && key !== 'email' && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        fields.push(key);
        values.push(value);
        placeholders.push(`$${paramIndex}`);
        paramIndex++;
      }
    });
  }

  const result = await query<User>(
    `INSERT INTO users (${fields.join(', ')})
     VALUES (${placeholders.join(', ')})
     RETURNING *`,
    values
  );

  return result.rows[0];
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );

  return result.rows[0] || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );

  return result.rows[0] || null;
}

/**
 * Find user by username
 */
export async function findUserByUsername(username: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL',
    [username]
  );

  return result.rows[0] || null;
}

/**
 * Find user by Google ID
 */
export async function findUserByGoogleId(googleId: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE google_id = $1 AND deleted_at IS NULL',
    [googleId]
  );

  return result.rows[0] || null;
}

/**
 * Verify password
 */
export async function verifyPassword(
  email: string,
  password: string
): Promise<User | null> {
  const result = await query<User & { password_hash: string }>(
    'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );

  const user = result.rows[0];
  if (!user || !user.password_hash) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return null;
  }

  // Remove password_hash from returned user
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<User> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });

  // Always update updated_at
  fields.push(`updated_at = NOW()`);

  values.push(userId);

  const result = await query<User>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0];
}

/**
 * Log user activity
 */
export async function logActivity(
  userId: string,
  action: string,
  metadata?: object
): Promise<void> {
  await query(
    'INSERT INTO user_activity (user_id, action, metadata) VALUES ($1, $2, $3)',
    [userId, action, metadata ? JSON.stringify(metadata) : null]
  );
}
