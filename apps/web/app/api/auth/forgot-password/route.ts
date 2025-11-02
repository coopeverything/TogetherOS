/**
 * POST /api/auth/forgot-password
 *
 * Request a password reset token
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createPasswordResetToken } from '@/lib/auth/verification';
import { checkRateLimit } from '@/lib/bridge/rate-limiter';
import { logSecurityEvent, hashIP, hashEmail } from '@/lib/auth/security-logger';

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: Request) {
  try {
    // Rate limiting: 5 requests per hour per IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user by email
    const result = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      // Don't reveal whether email exists (security best practice)
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const userId = result.rows[0].id;

    // Delete any existing unused password reset tokens
    await query(
      `DELETE FROM verification_tokens
       WHERE user_id = $1 AND type = 'password_reset' AND used_at IS NULL`,
      [userId]
    );

    // Create new reset token
    const token = await createPasswordResetToken(userId);

    // Log security event
    await logSecurityEvent({
      event_type: 'password_reset_requested',
      user_id: userId,
      ip_hash: hashIP(clientIP),
      metadata: {
        email_hash: hashEmail(email)
      }
    });

    // Generate reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    if (process.env.NODE_ENV === 'development') {
      // Dev mode: Return reset URL for testing
      return NextResponse.json({
        message: 'Password reset email sent',
        devOnly: {
          resetUrl,
          tokenId: token.substring(0, 8) + '...'
        }
      });
    }

    // MVP LIMITATION: Email sending not implemented yet
    // Email infrastructure (SMTP, templates) requires separate setup
    // Will be implemented in future PR with email service (SendGrid/Resend)
    // For now, users must request reset link from admin
    // Log sanitized email hash instead of raw email (prevent log injection)
    console.warn('Password reset requested - email sending not configured', {
      emailHash: hashEmail(email),
      userId,
    });
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
