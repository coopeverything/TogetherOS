// apps/web/app/api/gamification/groups/[groupId]/milestones/route.ts
// GET /api/gamification/groups/:groupId/milestones - Get group's milestone achievements

import { NextRequest, NextResponse } from 'next/server'
import { getGroupMilestones, checkAndRecordMilestones } from '@/lib/db/milestones'
import { MILESTONES, getMilestoneByThreshold, getNextMilestone, calculateMilestoneProgress } from '@togetheros/types'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params
    const { searchParams } = new URL(request.url)

    // Optional: current member count for progress calculation
    const memberCount = parseInt(searchParams.get('memberCount') || '0')

    const achieved = await getGroupMilestones(groupId)

    // Calculate progress info
    const nextMilestone = memberCount > 0 ? getNextMilestone(memberCount) : null
    const progress = memberCount > 0 ? calculateMilestoneProgress(memberCount) : 0

    // Enrich achieved milestones with definitions
    const enrichedAchieved = achieved.map(record => ({
      ...record,
      milestone: getMilestoneByThreshold(record.threshold)
    }))

    return NextResponse.json({
      groupId,
      milestones: enrichedAchieved,
      achievedCount: achieved.length,
      totalMilestones: MILESTONES.length,
      nextMilestone,
      progress,
      memberCount
    })
  } catch (error: any) {
    console.error('GET /api/gamification/groups/[groupId]/milestones error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch group milestones' },
      { status: 500 }
    )
  }
}

// POST /api/gamification/groups/:groupId/milestones - Check and record new milestones
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params
    const body = await request.json()

    const { memberCount, triggeredByMemberId } = body

    if (!memberCount || memberCount < 1) {
      return NextResponse.json(
        { error: 'memberCount is required and must be positive' },
        { status: 400 }
      )
    }

    const newMilestones = await checkAndRecordMilestones(
      groupId,
      memberCount,
      triggeredByMemberId
    )

    // Enrich with definitions
    const enrichedMilestones = newMilestones.map(record => ({
      ...record,
      milestone: getMilestoneByThreshold(record.threshold)
    }))

    return NextResponse.json({
      success: true,
      newMilestones: enrichedMilestones,
      count: newMilestones.length
    })
  } catch (error: any) {
    console.error('POST /api/gamification/groups/[groupId]/milestones error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check milestones' },
      { status: 500 }
    )
  }
}
