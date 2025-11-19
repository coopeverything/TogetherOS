/**
 * Auth middleware for API routes
 * Handles authentication and user session management
 */

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '../session';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  is_admin: boolean;
}

/**
 * Require authentication for API route
 * Returns authenticated user or throws error
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthenticatedUser> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      throw new Error('Unauthorized');
    }

    // Verify session and get user data
    const user = await verifySession(sessionCookie.value);

    if (!user) {
      throw new Error('Unauthorized');
    }

    return user;
  } catch (error: any) {
    throw new Error('Unauthorized');
  }
}

/**
 * Check if user is authorized to modify a resource
 * User can modify if they are the author OR an admin
 */
export function canModifyResource(
  user: AuthenticatedUser,
  resourceAuthorId: string
): boolean {
  return user.is_admin || user.id === resourceAuthorId;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthenticatedUser): boolean {
  return user.is_admin;
}
