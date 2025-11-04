// apps/web/app/api/bridge-training/examples/[id]/reject/route.ts
// POST /api/bridge-training/examples/:id/reject - Reject example

import { NextRequest, NextResponse } from 'next/server'
import { rejectTrainingExample } from '../../../../../../../api/src/modules/bridge-training/handlers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // TODO: Get userId from session/auth
    const userId = 'admin_1' // Hardcoded for MVP

    if (!body.reviewNotes) {
      return NextResponse.json(
        { error: 'Review notes are required for rejection' },
        { status: 400 }
      )
    }

    const example = await rejectTrainingExample(id, userId, body.reviewNotes)

    if (!example) {
      return NextResponse.json(
        { error: 'Training example not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ example })
  } catch (error: any) {
    const { id } = await params
    console.error(`POST /api/bridge-training/examples/${id}/reject error:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to reject training example' },
      { status: 400 }
    )
  }
}
