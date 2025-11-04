// apps/web/app/api/bridge-training/examples/route.ts
// GET /api/bridge-training/examples - List training examples with filters
// POST /api/bridge-training/examples - Create new training example

import { NextRequest, NextResponse } from 'next/server'
import {
  listTrainingExamples,
  createTrainingExample,
} from '../../../../../api/src/modules/bridge-training/handlers'
import type { TrainingExampleFilters } from '@togetheros/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse filters
    const status = searchParams.get('status') || undefined
    const category = searchParams.get('category') || undefined
    const searchQuery = searchParams.get('searchQuery') || undefined
    const minQualityScore = searchParams.get('minQualityScore')
      ? parseInt(searchParams.get('minQualityScore')!)
      : undefined
    const sortBy = searchParams.get('sortBy') || undefined
    const sortOrder = searchParams.get('sortOrder') || undefined
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const pageSize = searchParams.get('pageSize')
      ? parseInt(searchParams.get('pageSize')!)
      : 20

    const filters: TrainingExampleFilters = {
      status: status as any,
      category,
      searchQuery,
      minQualityScore,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      page,
      pageSize,
    }

    const result = await listTrainingExamples(filters)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('GET /api/bridge-training/examples error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch training examples' },
      { status: 400 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Get userId from session/auth
    const userId = 'admin_1' // Hardcoded for MVP

    const example = await createTrainingExample(body, userId)
    return NextResponse.json({ example }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/bridge-training/examples error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create training example' },
      { status: 400 }
    )
  }
}
