// apps/web/app/api/admin/onboarding/paths/[id]/route.ts
// Admin API for single learning path operations

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'
import { updateLearningPathSchema } from '@togetheros/types'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const result = await db.query(
      `SELECT
        id,
        slug,
        title,
        description,
        icon,
        category,
        order_index as "orderIndex",
        is_active as "isActive",
        rp_reward as "rpReward",
        estimated_minutes as "estimatedMinutes",
        created_at as "createdAt",
        updated_at as "updatedAt",
        (SELECT COUNT(*) FROM onboarding_lessons WHERE path_id = onboarding_learning_paths.id) as "lessonCount"
      FROM onboarding_learning_paths
      WHERE id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Learning path not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error fetching learning path:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch learning path' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Validate input
    const validation = updateLearningPathSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const updateFields: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    const fieldMap: Record<string, string> = {
      orderIndex: 'order_index',
      isActive: 'is_active',
      rpReward: 'rp_reward',
      estimatedMinutes: 'estimated_minutes',
    }

    const allowedFields = ['slug', 'title', 'description', 'icon', 'category', 'orderIndex', 'isActive', 'rpReward', 'estimatedMinutes']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        const dbField = fieldMap[field] || field
        updateFields.push(`${dbField} = $${paramIndex++}`)
        values.push(body[field])
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    updateFields.push(`updated_at = NOW()`)
    values.push(id)

    const result = await db.query(
      `UPDATE onboarding_learning_paths
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING
        id,
        slug,
        title,
        description,
        icon,
        category,
        order_index as "orderIndex",
        is_active as "isActive",
        rp_reward as "rpReward",
        estimated_minutes as "estimatedMinutes",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      values
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Learning path not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error updating learning path:', error)
    // Check for unique constraint violation
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json(
        { success: false, error: 'A learning path with this slug already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update learning path' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // Check if path has lessons
    const lessonsResult = await db.query(
      `SELECT COUNT(*) as count FROM onboarding_lessons WHERE path_id = $1`,
      [id]
    )

    if (parseInt(lessonsResult.rows[0].count) > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete path with existing lessons. Delete lessons first.' },
        { status: 400 }
      )
    }

    const result = await db.query(
      `DELETE FROM onboarding_learning_paths
      WHERE id = $1
      RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Learning path not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Learning path deleted' })
  } catch (error) {
    console.error('Error deleting learning path:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete learning path' },
      { status: 500 }
    )
  }
}
