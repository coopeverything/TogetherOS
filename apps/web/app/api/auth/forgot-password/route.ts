/**
 * POST /api/auth/forgot-password
 *
 * Request a password reset token
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createPasswordResetToken } from '@/lib/auth/verification';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const result = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      // Don't reveal whether email exists (security best practice)
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const userId = result.rows[0].id;

    // Invalidate any existing password reset tokens
    await query(
      `UPDATE verification_tokens
       SET used_at = NOW()
       WHERE user_id = $1 AND type = 'password_reset' AND used_at IS NULL`,
      [userId]
    );

    // Create new reset token
    const token = await createPasswordResetToken(userId);

    // Generate reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    if (process.env.NODE_ENV === 'development') {
      // Dev mode: Return reset URL for testing
      return NextResponse.json({
        message: 'Password reset email sent',
        resetUrl // Only in dev mode
      });
    }

    // MVP LIMITATION: Email sending not implemented yet
    // Email infrastructure (SMTP, templates) requires separate setup
    // Will be implemented in future PR with email service (SendGrid/Resend)
    // For now, users must request reset link from admin
    console.warn('Password reset requested for', email, '- email sending not configured');
    // Future: await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
