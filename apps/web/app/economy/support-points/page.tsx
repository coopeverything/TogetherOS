/**
 * Support Points Wallet Dashboard
 * Protected route - displays member's SP balance and allocation history
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { findUserById } from '@/lib/db/users'
import { SPWalletClient } from './SPWalletClient'

export const metadata = {
  title: 'Support Points Wallet | CoopEverything',
  description: 'View your Support Points balance and allocation history',
}

export default async function SupportPointsPage() {
  // Get session from cookies
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value

  if (!sessionToken) {
    redirect('/login')
  }

  // Verify session
  const session = verifySession(sessionToken)
  if (!session) {
    redirect('/login')
  }

  // Get user
  const user = await findUserById(session.userId)
  if (!user) {
    redirect('/login')
  }

  // If user hasn't completed onboarding, redirect
  if (!user.onboarding_completed_at) {
    redirect('/onboarding')
  }

  return <SPWalletClient userId={user.id} />
}
