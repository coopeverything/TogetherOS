/**
 * Google OAuth 2.0 handler
 */

import { User } from '@/lib/db/users';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google';

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface GoogleProfile {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

/**
 * Get Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    ...(state && { state }),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function getGoogleTokens(code: string): Promise<GoogleTokenResponse> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    // Log detailed error but throw generic message to avoid exposure
    console.error('Google token exchange failed:', error);
    throw new Error('Failed to exchange authorization code for tokens');
  }

  return response.json();
}

/**
 * Get user profile from Google
 */
export async function getGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    // Log detailed error but throw generic message to avoid exposure
    console.error('Google profile fetch failed:', error);
    throw new Error('Failed to fetch user profile from Google');
  }

  return response.json();
}

/**
 * Map Google profile to TogetherOS user fields
 */
export function mapGoogleProfileToUser(profile: GoogleProfile): Partial<User> {
  return {
    email: profile.email,
    email_verified: profile.email_verified,
    name: profile.name,
    avatar_url: profile.picture,
    google_id: profile.sub,
    oauth_display_name: profile.name,
    oauth_avatar_url: profile.picture,
    oauth_locale: profile.locale,
    oauth_verified: profile.email_verified,
    oauth_raw_profile: profile as Record<string, unknown>,
  };
}
