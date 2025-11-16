/**
 * Email verification and password reset tokens
 */

import { query } from '@togetheros/db';
import crypto from 'crypto';

const TOKEN_EXPIRY_HOURS = 24; // 24 hours for verification tokens
const RESET_TOKEN_EXPIRY_HOURS = 1; // 1 hour for password reset tokens

export interface VerificationToken {
  id: string;
  user_id: string;
  token: string;
  type: 'email_verification' | 'password_reset';
  expires_at: Date;
  used_at?: Date;
  created_at: Date;
}

/**
 * Generate a random verification token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create an email verification token
 */
export async function createEmailVerificationToken(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

  await query(
    `INSERT INTO verification_tokens (user_id, token, type, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, token, 'email_verification', expiresAt]
  );

  return token;
}

/**
 * Create a password reset token
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRY_HOURS);

  await query(
    `INSERT INTO verification_tokens (user_id, token, type, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, token, 'password_reset', expiresAt]
  );

  return token;
}

/**
 * Verify an email verification token
 */
export async function verifyEmailToken(token: string): Promise<string | null> {
  const result = await query<VerificationToken>(
    `SELECT * FROM verification_tokens
     WHERE token = $1
       AND type = 'email_verification'
       AND expires_at > NOW()
       AND used_at IS NULL`,
    [token]
  );

  const tokenRecord = result.rows[0];
  if (!tokenRecord) {
    return null;
  }

  // Mark token as used
  await query(
    'UPDATE verification_tokens SET used_at = NOW() WHERE id = $1',
    [tokenRecord.id]
  );

  // Mark user's email as verified
  await query(
    'UPDATE users SET email_verified = true WHERE id = $1',
    [tokenRecord.user_id]
  );

  return tokenRecord.user_id;
}

/**
 * Verify a password reset token
 */
export async function verifyResetToken(token: string): Promise<string | null> {
  const result = await query<VerificationToken>(
    `SELECT * FROM verification_tokens
     WHERE token = $1
       AND type = 'password_reset'
       AND expires_at > NOW()
       AND used_at IS NULL`,
    [token]
  );

  const tokenRecord = result.rows[0];
  if (!tokenRecord) {
    return null;
  }

  return tokenRecord.user_id;
}

/**
 * Mark a password reset token as used
 */
export async function markResetTokenUsed(token: string): Promise<void> {
  await query(
    'UPDATE verification_tokens SET used_at = NOW() WHERE token = $1',
    [token]
  );
}

/**
 * Clean up expired tokens (run periodically)
 */
export async function cleanExpiredTokens(): Promise<void> {
  await query('DELETE FROM verification_tokens WHERE expires_at < NOW()');
}

/**
 * Resend verification email (invalidates old tokens)
 */
export async function resendVerificationToken(userId: string): Promise<string> {
  // Mark all existing email verification tokens as used
  await query(
    `UPDATE verification_tokens
     SET used_at = NOW()
     WHERE user_id = $1 AND type = 'email_verification' AND used_at IS NULL`,
    [userId]
  );

  // Create new token
  return createEmailVerificationToken(userId);
}
