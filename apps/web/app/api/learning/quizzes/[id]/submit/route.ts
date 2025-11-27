// apps/web/app/api/learning/quizzes/[id]/submit/route.ts
// API for submitting quiz answers

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

interface QuizQuestion {
  id: string
  questionType: string
  options: { id: string; text: string; isCorrect: boolean }[]
  explanation: string | null
  points: number
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: quizId } = await context.params
    const userId = await getUserId()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { answers } = body as { answers: Record<string, string | string[]> }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Answers are required' },
        { status: 400 }
      )
    }

    // Fetch quiz
    const quizResult = await db.query(
      `SELECT
        id,
        passing_score as "passingScore",
        rp_reward as "rpReward",
        max_attempts as "maxAttempts"
      FROM onboarding_quizzes
      WHERE id = $1 AND is_active = TRUE`,
      [quizId]
    )

    if (quizResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      )
    }

    const quiz = quizResult.rows[0]

    // Check attempt count
    const attemptsResult = await db.query(
      `SELECT COUNT(*) as count FROM onboarding_user_quiz_attempts
       WHERE quiz_id = $1 AND user_id = $2`,
      [quizId, userId]
    )

    const attemptCount = parseInt(attemptsResult.rows[0].count) || 0

    if (attemptCount >= quiz.maxAttempts) {
      return NextResponse.json(
        { success: false, error: 'Maximum attempts reached' },
        { status: 400 }
      )
    }

    // Fetch questions with correct answers
    const questionsResult = await db.query(
      `SELECT
        id,
        question_type as "questionType",
        options,
        explanation,
        points
      FROM onboarding_quiz_questions
      WHERE quiz_id = $1`,
      [quizId]
    )

    const questions: QuizQuestion[] = questionsResult.rows

    // Calculate score
    let totalPoints = 0
    let earnedPoints = 0
    const questionResults = []

    for (const question of questions) {
      totalPoints += question.points
      const userAnswer = answers[question.id]
      const correctOptions = question.options
        .filter(o => o.isCorrect)
        .map(o => o.id)

      let isCorrect = false

      if (question.questionType === 'multi_select') {
        const selectedArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer].filter(Boolean)
        isCorrect =
          selectedArray.length === correctOptions.length &&
          selectedArray.every(s => correctOptions.includes(s))
      } else {
        const selectedId = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer
        isCorrect = correctOptions.includes(selectedId)
      }

      if (isCorrect) {
        earnedPoints += question.points
      }

      questionResults.push({
        questionId: question.id,
        correct: isCorrect,
        selectedOptions: Array.isArray(userAnswer) ? userAnswer : [userAnswer].filter(Boolean),
        correctOptions,
        explanation: question.explanation,
        pointsEarned: isCorrect ? question.points : 0,
      })
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const passed = score >= quiz.passingScore
    const attemptNumber = attemptCount + 1
    let rpAwarded = 0

    // Award RP if passed for the first time
    if (passed) {
      const previousPassResult = await db.query(
        `SELECT id FROM onboarding_user_quiz_attempts
         WHERE quiz_id = $1 AND user_id = $2 AND passed = TRUE LIMIT 1`,
        [quizId, userId]
      )

      if (previousPassResult.rows.length === 0) {
        // First pass - award RP
        rpAwarded = quiz.rpReward || 25

        // Bonus for perfect score
        if (score === 100) {
          rpAwarded += 10 // Quiz perfect score bonus
        }

        await db.query(
          `UPDATE users SET rp_balance = COALESCE(rp_balance, 0) + $1 WHERE id = $2`,
          [rpAwarded, userId]
        )

        await db.query(
          `INSERT INTO rp_transactions (user_id, amount, event_type, description)
           VALUES ($1, $2, 'quiz_passed', $3)`,
          [userId, rpAwarded, `Passed quiz: ${quizId} with score ${score}%`]
        )
      }
    }

    // Save attempt
    await db.query(
      `INSERT INTO onboarding_user_quiz_attempts
        (user_id, quiz_id, attempt_number, score, answers, passed, rp_awarded, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [userId, quizId, attemptNumber, score, JSON.stringify(answers), passed, rpAwarded]
    )

    return NextResponse.json({
      success: true,
      data: {
        passed,
        score,
        totalPoints,
        earnedPoints,
        rpAwarded,
        attemptNumber,
        attemptsRemaining: Math.max(0, quiz.maxAttempts - attemptNumber),
        questionResults,
      },
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}
