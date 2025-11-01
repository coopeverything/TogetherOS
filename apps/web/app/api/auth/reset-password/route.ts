/**
 * Reset password API
 * POST /api/auth/reset-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyResetToken, markResetTokenUsed } from '@/lib/auth/verification';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password required' },
        { status: 400 }
      );
    }

    // Validate password strength (basic)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Verify token
    const userId = await verifyResetToken(token);

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
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
