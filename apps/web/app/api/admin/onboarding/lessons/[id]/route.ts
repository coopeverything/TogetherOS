// apps/web/app/api/admin/onboarding/lessons/[id]/route.ts
// Admin API for single lesson operations

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'
import { updateLessonSchema } from '@togetheros/types'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const result = await db.query(
      `SELECT
        l.id,
        l.path_id as "pathId",
        l.slug,
        l.title,
        l.description,
        l.content_type as "contentType",
        l.content,
        l.order_index as "orderIndex",
        l.duration_minutes as "durationMinutes",
        l.rp_reward as "rpReward",
        l.is_active as "isActive",
        l.created_at as "createdAt",
        l.updated_at as "updatedAt",
        p.title as "pathTitle"
      FROM onboarding_lessons l
      JOIN onboarding_learning_paths p ON l.path_id = p.id
      WHERE l.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lesson' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Validate input
    const validation = updateLessonSchema.safeParse(body)
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
      contentType: 'content_type',
      orderIndex: 'order_index',
      durationMinutes: 'duration_minutes',
      rpReward: 'rp_reward',
      isActive: 'is_active',
    }

    const allowedFields = ['slug', 'title', 'description', 'contentType', 'content', 'orderIndex', 'durationMinutes', 'rpReward', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        const dbField = fieldMap[field] || field
        updateFields.push(`${dbField} = $${paramIndex++}`)
        const value = field === 'content' ? JSON.stringify(body[field]) : body[field]
        values.push(value)
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
      `UPDATE onboarding_lessons
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING
        id,
        path_id as "pathId",
        slug,
        title,
        description,
        content_type as "contentType",
        content,
        order_index as "orderIndex",
        duration_minutes as "durationMinutes",
        rp_reward as "rpReward",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      values
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error updating lesson:', error)
    // Check for unique constraint violation
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json(
        { success: false, error: 'A lesson with this slug already exists in this path' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update lesson' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // Check if lesson has quizzes
    const quizzesResult = await db.query(
      `SELECT COUNT(*) as count FROM onboarding_quizzes WHERE lesson_id = $1`,
      [id]
    )

    if (parseInt(quizzesResult.rows[0].count) > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete lesson with existing quizzes. Delete quizzes first.' },
        { status: 400 }
      )
    }

    const result = await db.query(
      `DELETE FROM onboarding_lessons
      WHERE id = $1
      RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Lesson deleted' })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete lesson' },
      { status: 500 }
    )
  }
}
