// apps/web/app/api/learning/lessons/[id]/complete/route.ts
// API for marking a lesson as complete

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

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: lessonId } = await context.params
    const userId = await getUserId()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch lesson with path info
    const lessonResult = await db.query(
      `SELECT
        l.id,
        l.path_id as "pathId",
        l.rp_reward as "rpReward",
        p.rp_reward as "pathRpReward",
        (SELECT COUNT(*) FROM onboarding_lessons WHERE path_id = l.path_id AND is_active = TRUE) as "totalLessons"
      FROM onboarding_lessons l
      JOIN onboarding_learning_paths p ON p.id = l.path_id
      WHERE l.id = $1 AND l.is_active = TRUE`,
      [lessonId]
    )

    if (lessonResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      )
    }

    const lesson = lessonResult.rows[0]
    let rpAwarded = 0
    let pathCompleted = false
    let pathRpAwarded = 0

    // Check if already completed
    const existingProgress = await db.query(
      `SELECT status, rp_awarded FROM onboarding_user_lesson_progress
       WHERE lesson_id = $1 AND user_id = $2`,
      [lessonId, userId]
    )

    if (existingProgress.rows[0]?.status === 'completed') {
      // Already completed, return current state
      return NextResponse.json({
        success: true,
        data: {
          lessonId,
          rpAwarded: 0,
          alreadyCompleted: true,
        },
      })
    }

    // Upsert lesson progress
    rpAwarded = lesson.rpReward || 10
    await db.query(
      `INSERT INTO onboarding_user_lesson_progress
        (user_id, lesson_id, status, completed_at, rp_awarded)
       VALUES ($1, $2, 'completed', NOW(), $3)
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET status = 'completed', completed_at = NOW(), rp_awarded = $3`,
      [userId, lessonId, rpAwarded]
    )

    // Award RP to user
    await db.query(
      `UPDATE users SET rp_balance = COALESCE(rp_balance, 0) + $1 WHERE id = $2`,
      [rpAwarded, userId]
    )

    // Log RP transaction
    await db.query(
      `INSERT INTO rp_transactions (user_id, amount, event_type, description)
       VALUES ($1, $2, 'lesson_completed', $3)`,
      [userId, rpAwarded, `Completed lesson: ${lessonId}`]
    )

    // Check path progress
    const completedLessonsResult = await db.query(
      `SELECT COUNT(*) as count
       FROM onboarding_user_lesson_progress
       WHERE user_id = $1 AND status = 'completed'
       AND lesson_id IN (SELECT id FROM onboarding_lessons WHERE path_id = $2 AND is_active = TRUE)`,
      [userId, lesson.pathId]
    )

    const completedLessons = parseInt(completedLessonsResult.rows[0].count) || 0
    const totalLessons = parseInt(lesson.totalLessons) || 0

    // Upsert path progress
    await db.query(
      `INSERT INTO onboarding_user_path_progress
        (user_id, path_id, status, lessons_completed, started_at)
       VALUES ($1, $2, 'started', $3, NOW())
       ON CONFLICT (user_id, path_id)
       DO UPDATE SET lessons_completed = $3`,
      [userId, lesson.pathId, completedLessons]
    )

    // Check if path is now complete
    if (completedLessons >= totalLessons) {
      pathCompleted = true
      pathRpAwarded = lesson.pathRpReward || 50

      // Mark path as completed
      await db.query(
        `UPDATE onboarding_user_path_progress
         SET status = 'completed', completed_at = NOW(), rp_awarded = $1
         WHERE user_id = $2 AND path_id = $3`,
        [pathRpAwarded, userId, lesson.pathId]
      )

      // Award path completion RP
      await db.query(
        `UPDATE users SET rp_balance = COALESCE(rp_balance, 0) + $1 WHERE id = $2`,
        [pathRpAwarded, userId]
      )

      // Log path completion RP
      await db.query(
        `INSERT INTO rp_transactions (user_id, amount, event_type, description)
         VALUES ($1, $2, 'learning_path_completed', $3)`,
        [userId, pathRpAwarded, `Completed learning path: ${lesson.pathId}`]
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        lessonId,
        rpAwarded,
        pathProgress: {
          lessonsCompleted: completedLessons,
          totalLessons,
          pathCompleted,
          pathRpAwarded: pathCompleted ? pathRpAwarded : 0,
        },
      },
    })
  } catch (error) {
    console.error('Error completing lesson:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to complete lesson' },
      { status: 500 }
    )
  }
}
