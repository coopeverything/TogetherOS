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
  // Preferences
  preferred_theme?: string;
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

/**
 * List users with pagination and search
 */
export interface ListUsersOptions {
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'name' | 'email' | 'last_seen_at';
  sortDir?: 'asc' | 'desc';
  includeDeleted?: boolean;
  adminOnly?: boolean;
}

export interface ListUsersResult {
  users: User[];
  total: number;
  limit: number;
  offset: number;
}

export async function listUsers(options: ListUsersOptions = {}): Promise<ListUsersResult> {
  const {
    search,
    limit = 20,
    offset = 0,
    sortBy = 'created_at',
    sortDir = 'desc',
    includeDeleted = false,
    adminOnly = false,
  } = options;

  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (!includeDeleted) {
    conditions.push('deleted_at IS NULL');
  }

  if (adminOnly) {
    conditions.push('is_admin = TRUE');
  }

  if (search) {
    conditions.push(`(
      email ILIKE $${paramIndex} OR
      name ILIKE $${paramIndex} OR
      username ILIKE $${paramIndex}
    )`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const validSortColumns = ['created_at', 'name', 'email', 'last_seen_at'];
  const safeSort = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const safeDir = sortDir === 'asc' ? 'ASC' : 'DESC';

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM users ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0]?.count || '0', 10);

  params.push(limit, offset);
  const result = await query<User>(
    `SELECT id, email, email_verified, name, username, bio, avatar_url,
            city, state, country, timezone, paths, skills,
            is_admin, created_at, updated_at, deleted_at, last_seen_at
     FROM users
     ${whereClause}
     ORDER BY ${safeSort} ${safeDir} NULLS LAST
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  return { users: result.rows, total, limit, offset };
}

/**
 * Get aggregate user statistics
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  suspendedUsers: number;
  newThisWeek: number;
  newThisMonth: number;
}

export async function getUserStats(): Promise<UserStats> {
  const result = await query<{
    total_users: string;
    active_users: string;
    admin_users: string;
    suspended_users: string;
    new_this_week: string;
    new_this_month: string;
  }>(`
    SELECT
      COUNT(*)::text as total_users,
      COUNT(*) FILTER (WHERE deleted_at IS NULL)::text as active_users,
      COUNT(*) FILTER (WHERE is_admin = TRUE AND deleted_at IS NULL)::text as admin_users,
      COUNT(*) FILTER (WHERE deleted_at IS NOT NULL)::text as suspended_users,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days' AND deleted_at IS NULL)::text as new_this_week,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days' AND deleted_at IS NULL)::text as new_this_month
    FROM users
  `);

  const row = result.rows[0];
  return {
    totalUsers: parseInt(row?.total_users || '0', 10),
    activeUsers: parseInt(row?.active_users || '0', 10),
    adminUsers: parseInt(row?.admin_users || '0', 10),
    suspendedUsers: parseInt(row?.suspended_users || '0', 10),
    newThisWeek: parseInt(row?.new_this_week || '0', 10),
    newThisMonth: parseInt(row?.new_this_month || '0', 10),
  };
}

/**
 * Get user activity log
 */
export interface ActivityLogEntry {
  id: string;
  user_id: string;
  action: string;
  metadata: any;
  created_at: Date;
}

export async function getUserActivity(
  userId: string,
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  const result = await query<ActivityLogEntry>(
    `SELECT id, user_id, action, metadata, created_at
     FROM user_activity
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

/**
 * Soft delete (suspend) a user
 */
export async function softDeleteUser(userId: string): Promise<User> {
  const result = await query<User>(
    `UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
    [userId]
  );
  if (!result.rows[0]) throw new Error('User not found');
  return result.rows[0];
}

/**
 * Restore a soft-deleted user
 */
export async function restoreUser(userId: string): Promise<User> {
  const result = await query<User>(
    `UPDATE users SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [userId]
  );
  if (!result.rows[0]) throw new Error('User not found');
  return result.rows[0];
}

/**
 * Find user by ID including deleted users (for admin use)
 */
export async function findUserByIdAdmin(id: string): Promise<User | null> {
  const result = await query<User>('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}
