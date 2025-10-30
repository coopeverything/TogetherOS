/**
 * Onboarding Flow
 * Protected route - requires authentication
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { findUserById } from '@/lib/db/users';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
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

  // If user already completed onboarding, redirect to dashboard
  if (user.onboarding_completed_at) {
    redirect('/dashboard');
  }

  return <OnboardingClient user={user} />;
}
