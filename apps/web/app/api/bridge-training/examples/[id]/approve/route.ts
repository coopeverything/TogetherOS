// apps/web/app/api/bridge-training/examples/[id]/approve/route.ts
// POST /api/bridge-training/examples/:id/approve - Approve example

import { NextRequest, NextResponse } from 'next/server'
import { approveTrainingExample } from '../../../../../../../api/src/modules/bridge-training/handlers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // TODO: Get userId from session/auth
    const userId = 'admin_1' // Hardcoded for MVP

    const example = await approveTrainingExample(id, userId, body.reviewNotes)

    if (!example) {
      return NextResponse.json(
        { error: 'Training example not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ example })
  } catch (error: any) {
    const { id } = await params
    console.error(`POST /api/bridge-training/examples/${id}/approve error:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve training example' },
      { status: 400 }
    )
  }
}
