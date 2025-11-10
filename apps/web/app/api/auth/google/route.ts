/**
 * Google OAuth initiation
 * GET /api/auth/google
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/auth/oauth/google';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in cookie for verification
    const response = NextResponse.redirect(getGoogleAuthUrl(state));
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect('/login?error=oauth_failed');
  }
}
