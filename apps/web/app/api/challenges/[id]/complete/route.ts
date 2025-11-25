// POST /api/challenges/[id]/complete - Complete a challenge

import { NextRequest, NextResponse } from 'next/server'
import { completeChallenge, getUserChallengeStreak } from '@/lib/db/challenges'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: challengeId } = await context.params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get current streak for bonus calculation
    const streak = await getUserChallengeStreak(userId)

    // Complete the challenge
    const result = await completeChallenge(userId, challengeId, streak)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, result },
        { status: 400 }
      )
    }

    return NextResponse.json({
      ...result,
      newStreak: streak + 1,
    })
  } catch (error: any) {
    console.error('POST /api/challenges/[id]/complete error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to complete challenge' },
      { status: 500 }
    )
  }
}
