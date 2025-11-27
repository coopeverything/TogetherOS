// apps/web/app/api/learning/lessons/[id]/route.ts
// Public API for fetching a single lesson with content

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

    // Fetch lesson with path info
    const lessonResult = await db.query(
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
        p.slug as "pathSlug",
        p.title as "pathTitle"
      FROM onboarding_lessons l
      JOIN onboarding_learning_paths p ON p.id = l.path_id
      WHERE l.id = $1 AND l.is_active = TRUE AND p.is_active = TRUE`,
      [id]
    )

    if (lessonResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      )
    }

    const lesson = lessonResult.rows[0]

    // Fetch quiz if exists
    const quizResult = await db.query(
      `SELECT
        id,
        title,
        description,
        passing_score as "passingScore",
        rp_reward as "rpReward",
        max_attempts as "maxAttempts"
      FROM onboarding_quizzes
      WHERE lesson_id = $1 AND is_active = TRUE`,
      [id]
    )

    // Fetch user progress if authenticated
    let userProgress = null
    if (userId) {
      const progressResult = await db.query(
        `SELECT
          status,
          started_at as "startedAt",
          completed_at as "completedAt",
          rp_awarded as "rpAwarded"
        FROM onboarding_user_lesson_progress
        WHERE lesson_id = $1 AND user_id = $2`,
        [id, userId]
      )
      userProgress = progressResult.rows[0] || null
    }

    // Get next and previous lessons
    const navResult = await db.query(
      `SELECT
        (SELECT json_build_object('id', id, 'slug', slug, 'title', title)
         FROM onboarding_lessons
         WHERE path_id = $1 AND order_index < $2 AND is_active = TRUE
         ORDER BY order_index DESC LIMIT 1) as "previousLesson",
        (SELECT json_build_object('id', id, 'slug', slug, 'title', title)
         FROM onboarding_lessons
         WHERE path_id = $1 AND order_index > $2 AND is_active = TRUE
         ORDER BY order_index ASC LIMIT 1) as "nextLesson"`,
      [lesson.pathId, lesson.orderIndex]
    )

    return NextResponse.json({
      success: true,
      data: {
        ...lesson,
        quiz: quizResult.rows[0] || null,
        userProgress,
        previousLesson: navResult.rows[0]?.previousLesson || null,
        nextLesson: navResult.rows[0]?.nextLesson || null,
      },
    })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lesson' },
      { status: 500 }
    )
  }
}
