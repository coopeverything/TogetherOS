// POST /api/gamification/onboarding-rp - Award RP for onboarding steps

import { NextRequest, NextResponse } from 'next/server'
import { earnRewardPoints } from '@/lib/db/reward-points'
import { getSettingValue } from '@togetheros/db'

const VALID_STEPS = [2, 3, 4, 5, 6, 7] as const

// Default values (fallback if DB settings not yet migrated)
const DEFAULT_STEP_RP: Record<number, number> = {
  2: 15,
  3: 10,
  4: 20,
  5: 15,
  6: 30,
  7: 25,
}

async function getStepMaxRP(step: number): Promise<number> {
  try {
    return await getSettingValue<number>(
      `rp_earnings.onboarding_step_${step}`,
      DEFAULT_STEP_RP[step]
    )
  } catch {
    return DEFAULT_STEP_RP[step]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, step, rpAmount } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (!VALID_STEPS.includes(step)) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
    }

    // Get max RP from system settings (with fallback)
    const maxRP = await getStepMaxRP(step)
    if (rpAmount > maxRP) {
      return NextResponse.json(
        { error: `Max RP for step ${step} is ${maxRP}` },
        { status: 400 }
      )
    }

    // Award the RP
    await earnRewardPoints({
      memberId: userId,
      eventType: 'onboarding_step_completed',
      rpAmount,
      source: `onboarding:step_${step}`,
      metadata: { step },
    })

    return NextResponse.json({
      success: true,
      step,
      rpAwarded: rpAmount,
    })
  } catch (error: any) {
    console.error('POST /api/gamification/onboarding-rp error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to award RP' },
      { status: 500 }
    )
  }
}
