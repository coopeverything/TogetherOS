// apps/web/app/api/admin/onboarding/quizzes/[id]/route.ts
// Admin API for single quiz operations

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'
import { updateQuizSchema } from '@togetheros/types'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // Get quiz
    const quizResult = await db.query(
      `SELECT
        q.id,
        q.lesson_id as "lessonId",
        q.title,
        q.description,
        q.passing_score as "passingScore",
        q.rp_reward as "rpReward",
        q.max_attempts as "maxAttempts",
        q.is_active as "isActive",
        q.created_at as "createdAt",
        q.updated_at as "updatedAt",
        l.title as "lessonTitle"
      FROM onboarding_quizzes q
      LEFT JOIN onboarding_lessons l ON q.lesson_id = l.id
      WHERE q.id = $1`,
      [id]
    )

    if (quizResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Get questions
    const questionsResult = await db.query(
      `SELECT
        id,
        quiz_id as "quizId",
        question_text as "questionText",
        question_type as "questionType",
        options,
        explanation,
        order_index as "orderIndex",
        points,
        created_at as "createdAt"
      FROM onboarding_quiz_questions
      WHERE quiz_id = $1
      ORDER BY order_index ASC`,
      [id]
    )

    const quiz = {
      ...quizResult.rows[0],
      questions: questionsResult.rows,
    }

    return NextResponse.json({ success: true, data: quiz })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quiz' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Validate input
    const validation = updateQuizSchema.safeParse(body)
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
      lessonId: 'lesson_id',
      passingScore: 'passing_score',
      rpReward: 'rp_reward',
      maxAttempts: 'max_attempts',
      isActive: 'is_active',
    }

    const allowedFields = ['lessonId', 'title', 'description', 'passingScore', 'rpReward', 'maxAttempts', 'isActive']

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
      `UPDATE onboarding_quizzes
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING
        id,
        lesson_id as "lessonId",
        title,
        description,
        passing_score as "passingScore",
        rp_reward as "rpReward",
        max_attempts as "maxAttempts",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      values
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error updating quiz:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update quiz' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // Delete questions first (cascade should handle this, but be explicit)
    await db.query(
      `DELETE FROM onboarding_quiz_questions WHERE quiz_id = $1`,
      [id]
    )

    const result = await db.query(
      `DELETE FROM onboarding_quizzes
      WHERE id = $1
      RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Quiz deleted' })
  } catch (error) {
    console.error('Error deleting quiz:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete quiz' },
      { status: 500 }
    )
  }
}
