/**
 * User Dashboard
 * Protected route - requires authentication
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { findUserById } from '@/lib/db/users';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  // Get session from cookies
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) {
    redirect('/login');
  }

  // Verify session
  const session = verifySession(sessionToken);
  if (!session) {
    redirect('/login');
  }

  // Get user
  const user = await findUserById(session.userId);
  if (!user) {
    redirect('/login');
  }

  // If user hasn't completed onboarding, redirect
  if (!user.onboarding_completed_at) {
    redirect('/onboarding');
  }

  return <DashboardClient user={user} />;
}
