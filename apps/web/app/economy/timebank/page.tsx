/**
 * Timebank Credits Page
 * TBC wallet, service browser, and RP→TBC conversion
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { findUserById } from '@/lib/db/users';
import TimebankClient from './TimebankClient';

export default async function TimebankPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) {
    redirect('/login');
  }

  const session = verifySession(sessionToken);
  if (!session) {
    redirect('/login');
  }

  const user = await findUserById(session.userId);
  if (!user) {
    redirect('/login');
  }

  if (!user.onboarding_completed_at) {
    redirect('/onboarding');
  }

  return <TimebankClient />;
}
