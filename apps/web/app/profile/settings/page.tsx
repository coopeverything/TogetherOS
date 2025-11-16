/**
 * Account Settings Page
 * Manage account preferences, security, and sign out
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { findUserById } from '@/lib/db/users';
import SettingsClient from './SettingsClient';

export default async function ProfileSettingsPage() {
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

  return <SettingsClient user={user} />;
}
