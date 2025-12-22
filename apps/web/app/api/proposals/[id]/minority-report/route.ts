/**
 * Minority Report API Endpoint
 * GET /api/proposals/[id]/minority-report - Get minority report
 * POST /api/proposals/[id]/minority-report - Generate minority report
 * PUT /api/proposals/[id]/minority-report - Update minority report (moderator only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import {
  getMinorityReport,
  generateAndSaveMinorityReport,
  updateMinorityReport,
  hasMinorityPositions,
} from '../../../../../../api/src/modules/governance/handlers/minorityReportHandlers'

/**
 * Get the minority report for a proposal
 * GET /api/proposals/[id]/minority-report
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params

    const report = await getMinorityReport(proposalId)
    const hasPositions = await hasMinorityPositions(proposalId)

    return NextResponse.json(
      {
        report,
        hasMinorityPositions: hasPositions,
        canGenerate: hasPositions && !report
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('GET /api/proposals/[id]/minority-report error:', error)

    if (error.message === 'Proposal not found') {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to get minority report' },
      { status: 500 }
    )
  }
}

/**
 * Generate a minority report from minority positions
 * POST /api/proposals/[id]/minority-report
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id: proposalId } = await params

    const report = await generateAndSaveMinorityReport(proposalId)

    if (!report) {
      return NextResponse.json(
        { error: 'No minority positions to compile into a report' },
        { status: 400 }
      )
    }

    return NextResponse.json({ report }, { status: 200 })
  } catch (error: any) {
    console.error('POST /api/proposals/[id]/minority-report error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error.message === 'Proposal not found') {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    if (error.message.includes('Minority reports can only be generated')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate minority report' },
      { status: 500 }
    )
  }
}

/**
 * Update a minority report (moderator only)
 * PUT /api/proposals/[id]/minority-report
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id: proposalId } = await params
    const body = await request.json()

    // Only admins/moderators can update minority reports
    if (!user.is_admin) {
      return NextResponse.json(
        { error: 'Only moderators can update minority reports' },
        { status: 403 }
      )
    }

    if (!body.report || typeof body.report !== 'string') {
      return NextResponse.json(
        { error: 'Report content is required' },
        { status: 400 }
      )
    }

    await updateMinorityReport(proposalId, body.report, user.id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('PUT /api/proposals/[id]/minority-report error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error.message === 'Proposal not found') {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update minority report' },
      { status: 500 }
    )
  }
}
