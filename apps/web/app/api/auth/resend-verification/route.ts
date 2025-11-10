/**
 * Resend verification email API
 * POST /api/auth/resend-verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { resendVerificationToken } from '@/lib/auth/verification';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    const token = await resendVerificationToken(user.id);

    // In production, this would send an email
    // For now, we'll return the token (dev mode only)
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
      // Remove this in production - only for development
      ...(process.env.NODE_ENV !== 'production' && {
        devOnly: {
          token,
          verificationUrl,
        },
      }),
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
