// apps/web/app/api/bridge-training/examples/[id]/rate/route.ts
// POST /api/bridge-training/examples/:id/rate - Rate Bridge response

import { NextRequest, NextResponse } from 'next/server'
import { rateTrainingExample } from '../../../../../../../api/src/modules/bridge-training/handlers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // TODO: Get userId from session/auth
    const userId = 'admin_1' // Hardcoded for MVP

    const input = {
      exampleId: id,
      ...body,
    }

    const example = await rateTrainingExample(input, userId)

    if (!example) {
      return NextResponse.json(
        { error: 'Training example not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ example })
  } catch (error: any) {
    const { id } = await params
    console.error(`POST /api/bridge-training/examples/${id}/rate error:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to rate training example' },
      { status: 400 }
    )
  }
}
