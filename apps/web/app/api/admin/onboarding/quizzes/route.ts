// apps/web/app/api/admin/onboarding/quizzes/route.ts
// Admin API for quizzes CRUD

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'
import { createQuizSchema } from '@togetheros/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')
    const isActive = searchParams.get('isActive')

    let query = `
      SELECT
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
        l.title as "lessonTitle",
        (SELECT COUNT(*) FROM onboarding_quiz_questions WHERE quiz_id = q.id) as "questionCount"
      FROM onboarding_quizzes q
      LEFT JOIN onboarding_lessons l ON q.lesson_id = l.id
      WHERE 1=1
    `
    const params: (string | boolean)[] = []
    let paramIndex = 1

    if (lessonId) {
      query += ` AND q.lesson_id = $${paramIndex++}`
      params.push(lessonId)
    }
    if (isActive !== null) {
      query += ` AND q.is_active = $${paramIndex++}`
      params.push(isActive === 'true')
    }

    query += ` ORDER BY q.title ASC`

    const result = await db.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quizzes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = createQuizSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const {
      lessonId,
      title,
      description,
      passingScore = 70,
      rpReward = 25,
      maxAttempts = 3,
      isActive = true,
      questions = [],
    } = validation.data

    // Verify lesson exists if provided
    if (lessonId) {
      const lessonResult = await db.query(
        `SELECT id FROM onboarding_lessons WHERE id = $1`,
        [lessonId]
      )
      if (lessonResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Lesson not found' },
          { status: 400 }
        )
      }
    }

    // Create quiz
    const quizResult = await db.query(
      `INSERT INTO onboarding_quizzes
        (lesson_id, title, description, passing_score, rp_reward, max_attempts, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
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
      [lessonId || null, title, description || null, passingScore, rpReward, maxAttempts, isActive]
    )

    const quiz = quizResult.rows[0]

    // Create questions if provided
    if (questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await db.query(
          `INSERT INTO onboarding_quiz_questions
            (quiz_id, question_text, question_type, options, explanation, order_index, points)
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            quiz.id,
            q.questionText,
            q.questionType,
            JSON.stringify(q.options),
            q.explanation || null,
            q.orderIndex ?? i,
            q.points ?? 1,
          ]
        )
      }
    }

    return NextResponse.json({ success: true, data: quiz }, { status: 201 })
  } catch (error) {
    console.error('Error creating quiz:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create quiz' },
      { status: 500 }
    )
  }
}
