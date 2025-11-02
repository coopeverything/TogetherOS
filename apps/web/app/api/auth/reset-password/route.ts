/**
 * Reset password API
 * POST /api/auth/reset-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyResetToken, markResetTokenUsed } from '@/lib/auth/verification';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { logSecurityEvent, hashIP } from '@/lib/auth/security-logger';

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // Strict type validation - prevent type confusion attacks
    if (typeof token !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Token and password must be strings' },
        { status: 400 }
      );
    }

    // Reject empty strings
    if (token.trim() === '' || password.trim() === '') {
      return NextResponse.json(
        { error: 'Token and password required' },
        { status: 400 }
      );
    }

    // Verify token FIRST before any password validation (timing attack prevention)
    const userId = await verifyResetToken(token);

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Validate password strength AFTER token verification
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Additional password complexity check
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain both letters and numbers' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );

    // Mark token as used
    await markResetTokenUsed(token);

    // Invalidate all existing sessions for security
    await query('DELETE FROM sessions WHERE user_id = $1', [userId]);

    // Log security event
    const clientIP = getClientIP(request);
    await logSecurityEvent({
      event_type: 'password_reset_completed',
      user_id: userId,
      ip_hash: hashIP(clientIP),
      metadata: {
        sessions_invalidated: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
