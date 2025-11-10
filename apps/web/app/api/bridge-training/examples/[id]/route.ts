// apps/web/app/api/bridge-training/examples/[id]/route.ts
// GET /api/bridge-training/examples/:id - Get single example
// PATCH /api/bridge-training/examples/:id - Update example
// DELETE /api/bridge-training/examples/:id - Delete example

import { NextRequest, NextResponse } from 'next/server'
import {
  getTrainingExample,
  updateTrainingExample,
  deleteTrainingExample,
} from '../../../../../../api/src/modules/bridge-training/handlers'
import type { UpdateTrainingExampleInput } from '@togetheros/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const example = await getTrainingExample(id)

    if (!example) {
      return NextResponse.json(
        { error: 'Training example not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ example })
  } catch (error: any) {
    const { id } = await params
    console.error(`GET /api/bridge-training/examples/${id} error:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch training example' },
      { status: 400 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const input: UpdateTrainingExampleInput = {
      exampleId: id,
      question: body.question,
      bridgeResponse: body.bridgeResponse,
      idealResponse: body.idealResponse,
      helpfulnessRating: body.helpfulnessRating,
      accuracyRating: body.accuracyRating,
      toneRating: body.toneRating,
    }

    // TODO: Get userId from session/auth
    const userId = 'admin_1' // Hardcoded for MVP

    const updated = await updateTrainingExample(input, userId)

    if (!updated) {
      return NextResponse.json(
        { error: 'Training example not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ example: updated })
  } catch (error: any) {
    const { id } = await params
    console.error(`PATCH /api/bridge-training/examples/${id} error:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to update training example' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // TODO: Get userId from session/auth
    const userId = 'admin_1' // Hardcoded for MVP

    const result = await deleteTrainingExample(id, userId)
    return NextResponse.json(result)
  } catch (error: any) {
    const { id } = await params
    console.error(`DELETE /api/bridge-training/examples/${id} error:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete training example' },
      { status: 400 }
    )
  }
}
