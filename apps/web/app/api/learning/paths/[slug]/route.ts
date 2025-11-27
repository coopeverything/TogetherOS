// apps/web/app/api/learning/paths/[slug]/route.ts
// Public API for fetching a single learning path with lessons

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

type RouteContext = { params: Promise<{ slug: string }> }

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
    const { slug } = await context.params
    const userId = await getUserId()

    // Fetch path
    const pathResult = await db.query(
      `SELECT
        id,
        slug,
        title,
        description,
        icon,
        category,
        order_index as "orderIndex",
        rp_reward as "rpReward",
        estimated_minutes as "estimatedMinutes"
      FROM onboarding_learning_paths
      WHERE slug = $1 AND is_active = TRUE`,
      [slug]
    )

    if (pathResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Learning path not found' },
        { status: 404 }
      )
    }

    const path = pathResult.rows[0]

    // Fetch lessons with user progress
    let lessonsQuery = `
      SELECT
        l.id,
        l.slug,
        l.title,
        l.description,
        l.content_type as "contentType",
        l.order_index as "orderIndex",
        l.duration_minutes as "durationMinutes",
        l.rp_reward as "rpReward",
        (SELECT id FROM onboarding_quizzes WHERE lesson_id = l.id AND is_active = TRUE LIMIT 1) as "quizId"
    `

    if (userId) {
      lessonsQuery += `,
        (
          SELECT json_build_object(
            'status', ulp.status,
            'startedAt', ulp.started_at,
            'completedAt', ulp.completed_at,
            'rpAwarded', ulp.rp_awarded
          )
          FROM onboarding_user_lesson_progress ulp
          WHERE ulp.lesson_id = l.id AND ulp.user_id = $2
        ) as "userProgress"
      `
    } else {
      lessonsQuery += `, NULL as "userProgress"`
    }

    lessonsQuery += `
      FROM onboarding_lessons l
      WHERE l.path_id = $1 AND l.is_active = TRUE
      ORDER BY l.order_index ASC
    `

    const lessonsResult = await db.query(
      lessonsQuery,
      userId ? [path.id, userId] : [path.id]
    )

    // Fetch user path progress if authenticated
    let userPathProgress = null
    if (userId) {
      const progressResult = await db.query(
        `SELECT
          status,
          lessons_completed as "lessonsCompleted",
          started_at as "startedAt",
          completed_at as "completedAt",
          rp_awarded as "rpAwarded"
        FROM onboarding_user_path_progress
        WHERE path_id = $1 AND user_id = $2`,
        [path.id, userId]
      )
      userPathProgress = progressResult.rows[0] || null
    }

    return NextResponse.json({
      success: true,
      data: {
        ...path,
        lessons: lessonsResult.rows,
        lessonCount: lessonsResult.rows.length,
        completedLessonCount: lessonsResult.rows.filter(
          (l: { userProgress?: { status: string } }) => l.userProgress?.status === 'completed'
        ).length,
        userProgress: userPathProgress,
      },
    })
  } catch (error) {
    console.error('Error fetching learning path:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch learning path' },
      { status: 500 }
    )
  }
}
