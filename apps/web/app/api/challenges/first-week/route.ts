// GET/POST /api/challenges/first-week - First-week journey progress

import { NextRequest, NextResponse } from 'next/server'
import {
  getFirstWeekProgress,
  initializeFirstWeekJourney,
  getFirstWeekChallenges,
  getUserDailyChallenges,
} from '@/lib/db/challenges'
import type { FirstWeekSummary, FirstWeekDay } from '@togetheros/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const [progress, challenges, userChallenges] = await Promise.all([
      getFirstWeekProgress(userId),
      getFirstWeekChallenges(),
      getUserDailyChallenges(userId),
    ])

    if (!progress) {
      return NextResponse.json({
        initialized: false,
        message: 'First-week journey not started. POST to initialize.',
      })
    }

    // Build day-by-day summary
    const days: FirstWeekDay[] = challenges.map((challenge) => {
      const dayNum = challenge.dayNumber || 0
      const isCompleted = progress.completedDays.includes(dayNum)
      const userChallenge = userChallenges.find(
        (uc) => uc.challengeId === challenge.id
      )

      let status: 'locked' | 'available' | 'completed' = 'locked'
      if (isCompleted) {
        status = 'completed'
      } else if (dayNum <= progress.currentDay) {
        status = 'available'
      }

      return {
        dayNumber: dayNum,
        challenge,
        status,
        completedAt: userChallenge?.completedAt,
        rpEarned: userChallenge?.rpAwarded,
      }
    })

    const summary: FirstWeekSummary = {
      days,
      currentDay: progress.currentDay,
      totalRPEarned: progress.totalRPEarned,
      streakBonusRP: progress.streakBonusRP,
      isComplete: progress.completedAt !== null,
      completionDate: progress.completedAt,
    }

    return NextResponse.json({ initialized: true, progress: summary })
  } catch (error: any) {
    console.error('GET /api/challenges/first-week error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get first-week progress' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const progress = await initializeFirstWeekJourney(userId)

    return NextResponse.json({
      success: true,
      progress,
      message: 'First-week journey initialized. Day 1 challenge assigned.',
    }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/challenges/first-week error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize first-week journey' },
      { status: 500 }
    )
  }
}
