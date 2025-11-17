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
  facebook_id?: string;
  bluesky_handle?: string;
  mastodon_handle?: string;
  instagram_id?: string;
  oauth_display_name?: string;
  oauth_avatar_url?: string;
  oauth_locale?: string;
  oauth_verified?: boolean;
  oauth_raw_profile?: any;
  // Admin fields
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create a new user (email signup)
 */
export async function createUser(email: string, password?: string): Promise<User> {
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  const result = await query<User>(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, email_verified, name, created_at, updated_at`,
    [email, passwordHash]
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
 * Find multiple users by IDs (batch fetch to prevent N+1 queries)
 */
export async function findUsersByIds(ids: string[]): Promise<Map<string, User>> {
  if (ids.length === 0) {
    return new Map();
  }

  // Remove duplicates
  const uniqueIds = [...new Set(ids)];

  const result = await query<User>(
    'SELECT * FROM users WHERE id = ANY($1) AND deleted_at IS NULL',
    [uniqueIds]
  );

  // Create a map for O(1) lookups
  const userMap = new Map<string, User>();
  result.rows.forEach((user) => {
    userMap.set(user.id, user);
  });

  return userMap;
}

/**
 * Find user by username
 * @param username - Username to search for
 * @param checkVisibility - If true, only return users with public profiles
 */
export async function findUserByUsername(
  username: string,
  checkVisibility: boolean = false
): Promise<User | null> {
  const visibilityClause = checkVisibility
    ? "AND (profile_visibility = 'public' OR profile_visibility IS NULL)"
    : '';

  const result = await query<User>(
    `SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL ${visibilityClause}`,
    [username]
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

  // JSONB fields that need JSON.stringify()
  const jsonbFields = ['paths', 'social_links', 'oauth_raw_profile'];

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${paramIndex}`);
      // Properly serialize JSONB fields to prevent "invalid input syntax for type json" error
      values.push(jsonbFields.includes(key) ? JSON.stringify(value) : value);
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
