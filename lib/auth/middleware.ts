/**
 * Auth middleware utilities
 */

import { NextRequest } from 'next/server';
import { verifySession } from './session';
import { findUserById, User } from '../db/users';

/**
 * Get current user from request cookies
 */
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    const token = request.cookies.get('session')?.value;

    if (!token) {
      return null;
    }

    const session = verifySession(token);
    if (!session) {
      return null;
    }

    const user = await findUserById(session.userId);
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Require authentication - returns user or throws error
 */
export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await getCurrentUser(request);

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
