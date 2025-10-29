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
  onboarding_step?: string;
  onboarding_completed_at?: Date;
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
    fields.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  });

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
