import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/auth/session'
import { findUserById } from '@/lib/db/users'
import { SPTransactionHistoryClient } from './SPTransactionHistoryClient'

export default async function SPTransactionHistoryPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value

  if (!sessionToken) {
    redirect('/login?redirect=/economy/support-points/history')
  }

  const session = verifySession(sessionToken)
  if (!session) {
    redirect('/login?redirect=/economy/support-points/history')
  }

  const user = await findUserById(session.userId)
  if (!user || !user.onboarding_completed_at) {
    redirect('/onboarding')
  }

  return <SPTransactionHistoryClient userId={user.id} />
}
