// apps/web/app/api/learning/quizzes/[id]/route.ts
// Public API for fetching quiz details

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

type RouteContext = { params: Promise<{ id: string }> }

async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return null
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const userId = await getUserId()

    // Fetch quiz
    const quizResult = await db.query(
      `SELECT
        q.id,
        q.lesson_id as "lessonId",
        q.title,
        q.description,
        q.passing_score as "passingScore",
        q.rp_reward as "rpReward",
        q.max_attempts as "maxAttempts",
        l.title as "lessonTitle",
        l.slug as "lessonSlug",
        p.slug as "pathSlug"
      FROM onboarding_quizzes q
      LEFT JOIN onboarding_lessons l ON l.id = q.lesson_id
      LEFT JOIN onboarding_learning_paths p ON p.id = l.path_id
      WHERE q.id = $1 AND q.is_active = TRUE`,
      [id]
    )

    if (quizResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      )
    }

    const quiz = quizResult.rows[0]

    // Fetch questions (without correct answers in response)
    const questionsResult = await db.query(
      `SELECT
        id,
        question_text as "questionText",
        question_type as "questionType",
        options,
        order_index as "orderIndex",
        points
      FROM onboarding_quiz_questions
      WHERE quiz_id = $1
      ORDER BY order_index ASC`,
      [id]
    )

    // Strip isCorrect from options for security
    const questions = questionsResult.rows.map(q => ({
      ...q,
      options: q.options.map((opt: { id: string; text: string; isCorrect?: boolean }) => ({
        id: opt.id,
        text: opt.text,
        // Don't send isCorrect to client
      })),
    }))

    // Fetch user attempts if authenticated
    let userAttempts: { attemptNumber: number; score: number; passed: boolean; completedAt: Date }[] = []
    if (userId) {
      const attemptsResult = await db.query(
        `SELECT
          attempt_number as "attemptNumber",
          score,
          passed,
          completed_at as "completedAt"
        FROM onboarding_user_quiz_attempts
        WHERE quiz_id = $1 AND user_id = $2
        ORDER BY attempt_number DESC`,
        [id, userId]
      )
      userAttempts = attemptsResult.rows
    }

    return NextResponse.json({
      success: true,
      data: {
        ...quiz,
        questions,
        questionCount: questions.length,
        totalPoints: questions.reduce((sum: number, q: { points: number }) => sum + q.points, 0),
        userAttempts,
        attemptsUsed: userAttempts.length,
        attemptsRemaining: Math.max(0, quiz.maxAttempts - userAttempts.length),
        hasPassed: userAttempts.some(a => a.passed),
      },
    })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quiz' },
      { status: 500 }
    )
  }
}
