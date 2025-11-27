// apps/web/app/api/learning/badges/route.ts
// API for fetching user learning badges

import { NextResponse } from 'next/server'
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

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  earnedAt?: string
  progress?: {
    current: number
    threshold: number
    percentage: number
  }
}

export async function GET() {
  try {
    const userId = await getUserId()

    // Fetch all learning-related badges
    const badgesResult = await db.query(
      `SELECT
        b.id,
        b.name,
        b.description,
        b.icon,
        b.category,
        b.criteria,
        mb.earned_at as "earnedAt"
      FROM badges b
      LEFT JOIN member_badges mb ON mb.badge_id = b.id AND mb.member_id = $1
      WHERE b.id IN (
        'first-lesson', 'path-complete', 'all-paths',
        'quiz-ace', 'perfect-score', 'lesson-streak',
        'lesson-master', 'quick-learner', 'knowledge-sharer'
      )
      ORDER BY
        CASE WHEN mb.earned_at IS NOT NULL THEN 0 ELSE 1 END,
        b.category,
        b.name`,
      [userId || '00000000-0000-0000-0000-000000000000']
    )

    // If user is logged in, calculate progress for unearned badges
    const badges: Badge[] = []

    for (const row of badgesResult.rows) {
      const badge: Badge = {
        id: row.id,
        name: row.name,
        description: row.description,
        icon: row.icon,
        category: row.category,
        earnedAt: row.earnedAt?.toISOString(),
      }

      // Calculate progress for unearned badges
      if (!row.earnedAt && userId) {
        const criteria = row.criteria
        const threshold = criteria?.threshold || 0
        let current = 0

        // Get current progress based on event type
        if (criteria?.event_types?.includes('lesson_completed')) {
          const result = await db.query(
            `SELECT COUNT(*) as count FROM onboarding_user_lesson_progress
             WHERE user_id = $1 AND status = 'completed'`,
            [userId]
          )
          current = parseInt(result.rows[0].count) || 0
        } else if (criteria?.event_types?.includes('quiz_passed')) {
          const result = await db.query(
            `SELECT COUNT(DISTINCT quiz_id) as count FROM onboarding_user_quiz_attempts
             WHERE user_id = $1 AND passed = TRUE`,
            [userId]
          )
          current = parseInt(result.rows[0].count) || 0
        } else if (criteria?.event_types?.includes('quiz_perfect')) {
          const result = await db.query(
            `SELECT COUNT(*) as count FROM onboarding_user_quiz_attempts
             WHERE user_id = $1 AND score = 100`,
            [userId]
          )
          current = parseInt(result.rows[0].count) || 0
        } else if (criteria?.event_types?.includes('path_completed')) {
          const result = await db.query(
            `SELECT COUNT(*) as count FROM onboarding_user_path_progress
             WHERE user_id = $1 AND status = 'completed'`,
            [userId]
          )
          current = parseInt(result.rows[0].count) || 0
        } else if (criteria?.event_types?.includes('all_paths_completed')) {
          const pathCountResult = await db.query(
            `SELECT COUNT(*) as count FROM onboarding_user_path_progress
             WHERE user_id = $1 AND status = 'completed'`,
            [userId]
          )
          const totalPathsResult = await db.query(
            `SELECT COUNT(*) as count FROM onboarding_learning_paths WHERE is_active = TRUE`
          )
          current = parseInt(pathCountResult.rows[0].count) || 0
          // Override threshold with actual total paths
          if (totalPathsResult.rows[0].count) {
            badge.progress = {
              current,
              threshold: parseInt(totalPathsResult.rows[0].count),
              percentage: Math.min(100, Math.round((current / parseInt(totalPathsResult.rows[0].count)) * 100))
            }
            badges.push(badge)
            continue
          }
        }

        if (threshold > 0) {
          badge.progress = {
            current: Math.min(current, threshold),
            threshold,
            percentage: Math.min(100, Math.round((current / threshold) * 100))
          }
        }
      }

      badges.push(badge)
    }

    // Calculate summary stats
    const earnedCount = badges.filter(b => b.earnedAt).length
    const totalCount = badges.length

    return NextResponse.json({
      success: true,
      data: {
        badges,
        summary: {
          earned: earnedCount,
          total: totalCount,
          percentage: totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch badges' },
      { status: 500 }
    )
  }
}
