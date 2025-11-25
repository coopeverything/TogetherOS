// GET/POST /api/challenges/daily - User's daily challenges

import { NextRequest, NextResponse } from 'next/server'
import {
  getUserDailyChallenges,
  assignDailyChallenges,
  getUserChallengeStreak,
} from '@/lib/db/challenges'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const [challenges, streak] = await Promise.all([
      getUserDailyChallenges(userId),
      getUserChallengeStreak(userId),
    ])

    return NextResponse.json({
      challenges,
      streak,
      date: new Date().toISOString().split('T')[0],
    })
  } catch (error: any) {
    console.error('GET /api/challenges/daily error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get daily challenges' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, count = 3 } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const challenges = await assignDailyChallenges(userId, count)

    return NextResponse.json({
      success: true,
      challenges,
      count: challenges.length,
    }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/challenges/daily error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to assign daily challenges' },
      { status: 500 }
    )
  }
}
