/**
 * Google OAuth callback
 * GET /api/auth/callback/google
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGoogleTokens, getGoogleProfile, mapGoogleProfileToUser } from '@/lib/auth/oauth/google';
import { findUserByEmail, findUserByGoogleId, createUser, updateUser } from '@/lib/db/users';
import { createSession } from '@/lib/auth/session';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Get base URL for safe redirects
  const baseUrl = new URL(request.url).origin;

  // Check for OAuth errors
  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?error=${error}`);
  }

  // Verify required params
  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/login?error=invalid_callback`);
  }

  // Verify state (CSRF protection)
  const storedState = request.cookies.get('oauth_state')?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${baseUrl}/login?error=invalid_state`);
  }

  try {
    // Exchange code for tokens
    const tokens = await getGoogleTokens(code);

    // Get user profile
    const profile = await getGoogleProfile(tokens.access_token);

    // Map profile to user fields
    const userData = mapGoogleProfileToUser(profile);

    // Check if user exists by Google ID first (prevents duplicate accounts)
    let user = await findUserByGoogleId(userData.google_id!);

    if (user) {
      // Update existing user with latest OAuth data
      user = await updateUser(user.id, userData);
    } else {
      // Check if user exists by email (account linking)
      user = await findUserByEmail(userData.email!);
      
      if (user) {
        // Link Google account to existing user
        user = await updateUser(user.id, userData);
      } else {
        // Create new user with OAuth data in a single operation
        user = await createUser(userData.email!, undefined, userData);
      }
    }

    // Create session
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const sessionToken = await createSession(user.id, user.email, ip, userAgent);

    // Log activity
    await query(
      'INSERT INTO user_activity (user_id, action, metadata) VALUES ($1, $2, $3)',
      [user.id, 'google_login', { provider: 'google' }]
    );

    // Set session cookie and redirect
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Clear OAuth state cookie
    response.cookies.delete('oauth_state');

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`);
  }
}
