/**
 * Batch Proposal Ratings API
 * POST /api/proposals/ratings-batch - Get rating aggregates and SP totals for multiple proposals
 */

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'
import type { ProposalRatingAggregate } from '@togetheros/types/governance'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { proposalIds } = body

    if (!proposalIds || !Array.isArray(proposalIds) || proposalIds.length === 0) {
      return NextResponse.json({ aggregates: {}, spTotals: {} })
    }

    // Limit batch size
    if (proposalIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 proposal IDs per request' },
        { status: 400 }
      )
    }

    // Fetch rating aggregates for all proposals
    const ratingsResult = await db.query<{
      proposal_id: string
      total_ratings: string
      avg_clarity: string
      avg_importance: string
      avg_urgency: string
      avg_constructiveness: string
      innovative_count: string
      clarity_brown: string
      clarity_yellow: string
      clarity_green: string
      constructiveness_red: string
      constructiveness_yellow: string
      constructiveness_green: string
      red_flag_count: string
    }>(
      `SELECT
        proposal_id,
        COUNT(*) as total_ratings,
        AVG(clarity)::numeric(3,2) as avg_clarity,
        AVG(importance)::numeric(3,2) as avg_importance,
        AVG(urgency)::numeric(3,2) as avg_urgency,
        AVG(constructiveness)::numeric(3,2) as avg_constructiveness,
        SUM(CASE WHEN is_innovative THEN 1 ELSE 0 END) as innovative_count,
        SUM(CASE WHEN clarity = 1 THEN 1 ELSE 0 END) as clarity_brown,
        SUM(CASE WHEN clarity = 2 THEN 1 ELSE 0 END) as clarity_yellow,
        SUM(CASE WHEN clarity = 3 THEN 1 ELSE 0 END) as clarity_green,
        SUM(CASE WHEN constructiveness = 1 THEN 1 ELSE 0 END) as constructiveness_red,
        SUM(CASE WHEN constructiveness = 2 THEN 1 ELSE 0 END) as constructiveness_yellow,
        SUM(CASE WHEN constructiveness = 3 THEN 1 ELSE 0 END) as constructiveness_green,
        SUM(CASE WHEN constructiveness = 1 THEN 1 ELSE 0 END) as red_flag_count
      FROM proposal_ratings
      WHERE proposal_id = ANY($1)
      GROUP BY proposal_id`,
      [proposalIds]
    )

    // Fetch SP totals for all proposals
    const spResult = await db.query<{ target_id: string; total: string }>(
      `SELECT target_id, COALESCE(SUM(amount), 0)::integer as total
       FROM support_points_allocations
       WHERE target_type = 'proposal'
         AND target_id = ANY($1)
         AND status = 'active'
       GROUP BY target_id`,
      [proposalIds]
    )

    // Build aggregates map
    const aggregates: Record<string, ProposalRatingAggregate> = {}
    for (const row of ratingsResult.rows) {
      const totalRatings = Number(row.total_ratings)
      aggregates[row.proposal_id] = {
        proposalId: row.proposal_id,
        totalRatings,
        avgClarity: Number(row.avg_clarity) || 0,
        avgImportance: Number(row.avg_importance) || 0,
        avgUrgency: Number(row.avg_urgency) || 0,
        avgConstructiveness: Number(row.avg_constructiveness) || 0,
        innovativeCount: Number(row.innovative_count) || 0,
        innovativePercentage: totalRatings > 0 ? Number(row.innovative_count) / totalRatings : 0,
        clarityDistribution: {
          brown: Number(row.clarity_brown) || 0,
          yellow: Number(row.clarity_yellow) || 0,
          green: Number(row.clarity_green) || 0,
        },
        constructivenessDistribution: {
          red: Number(row.constructiveness_red) || 0,
          yellow: Number(row.constructiveness_yellow) || 0,
          green: Number(row.constructiveness_green) || 0,
        },
        hasRedFlags: Number(row.red_flag_count) > 0,
        redFlagCount: Number(row.red_flag_count) || 0,
      }
    }

    // Build SP totals map
    const spTotals: Record<string, number> = {}
    for (const row of spResult.rows) {
      spTotals[row.target_id] = Number(row.total) || 0
    }

    return NextResponse.json({ aggregates, spTotals })
  } catch (error: any) {
    console.error('POST /api/proposals/ratings-batch error:', error.message)
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
}
