// apps/web/app/api/learning/paths/route.ts
// Public API for fetching learning paths with user progress

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

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

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = `
      SELECT
        p.id,
        p.slug,
        p.title,
        p.description,
        p.icon,
        p.category,
        p.order_index as "orderIndex",
        p.rp_reward as "rpReward",
        p.estimated_minutes as "estimatedMinutes",
        (SELECT COUNT(*) FROM onboarding_lessons WHERE path_id = p.id AND is_active = TRUE) as "lessonCount"
    `

    // Add user progress if authenticated
    if (userId) {
      query += `,
        COALESCE((
          SELECT COUNT(*)
          FROM onboarding_user_lesson_progress ulp
          JOIN onboarding_lessons l ON l.id = ulp.lesson_id
          WHERE l.path_id = p.id AND ulp.user_id = $1 AND ulp.status = 'completed'
        ), 0) as "completedLessonCount",
        (
          SELECT json_build_object(
            'status', upp.status,
            'lessonsCompleted', upp.lessons_completed,
            'startedAt', upp.started_at,
            'completedAt', upp.completed_at,
            'rpAwarded', upp.rp_awarded
          )
          FROM onboarding_user_path_progress upp
          WHERE upp.path_id = p.id AND upp.user_id = $1
        ) as "userProgress"
      `
    } else {
      query += `,
        0 as "completedLessonCount",
        NULL as "userProgress"
      `
    }

    query += `
      FROM onboarding_learning_paths p
      WHERE p.is_active = TRUE
    `

    const params: (string | null)[] = userId ? [userId] : []
    let paramIndex = userId ? 2 : 1

    if (category) {
      query += ` AND p.category = $${paramIndex++}`
      params.push(category)
    }

    query += ` ORDER BY p.order_index ASC, p.title ASC`

    const result = await db.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        lessonCount: parseInt(row.lessonCount) || 0,
        completedLessonCount: parseInt(row.completedLessonCount) || 0,
      })),
    })
  } catch (error) {
    console.error('Error fetching learning paths:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch learning paths' },
      { status: 500 }
    )
  }
}
