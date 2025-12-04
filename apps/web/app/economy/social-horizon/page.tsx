/**
 * Social Horizon Page
 * SH wallet and purchase events
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { findUserById } from '@/lib/db/users';
import SocialHorizonClient from './SocialHorizonClient';

export default async function SocialHorizonPage() {
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

  return <SocialHorizonClient />;
}
