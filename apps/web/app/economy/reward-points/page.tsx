/**
 * Reward Points Wallet Dashboard
 * Protected route - displays member's RP balance, transactions, and badges
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { findUserById } from '@/lib/db/users'
import { RPWalletClient } from './RPWalletClient'

export const metadata = {
  title: 'Reward Points Wallet | CoopEverything',
  description: 'View your Reward Points balance, transaction history, and badges',
}

export default async function RewardPointsPage() {
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

  return <RPWalletClient userId={user.id} />
}
