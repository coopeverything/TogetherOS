// apps/web/app/api/admin/onboarding/lessons/route.ts
// Admin API for lessons CRUD

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'
import { createLessonSchema } from '@togetheros/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pathId = searchParams.get('pathId')
    const isActive = searchParams.get('isActive')

    let query = `
      SELECT
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
        p.title as "pathTitle",
        (SELECT COUNT(*) FROM onboarding_quizzes WHERE lesson_id = l.id) as "quizCount"
      FROM onboarding_lessons l
      JOIN onboarding_learning_paths p ON l.path_id = p.id
      WHERE 1=1
    `
    const params: (string | boolean)[] = []
    let paramIndex = 1

    if (pathId) {
      query += ` AND l.path_id = $${paramIndex++}`
      params.push(pathId)
    }
    if (isActive !== null) {
      query += ` AND l.is_active = $${paramIndex++}`
      params.push(isActive === 'true')
    }

    query += ` ORDER BY p.order_index ASC, l.order_index ASC, l.title ASC`

    const result = await db.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = createLessonSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const {
      pathId,
      slug,
      title,
      description,
      contentType,
      content,
      orderIndex = 0,
      durationMinutes = 5,
      rpReward = 10,
      isActive = true,
    } = validation.data

    // Verify path exists
    const pathResult = await db.query(
      `SELECT id FROM onboarding_learning_paths WHERE id = $1`,
      [pathId]
    )
    if (pathResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Learning path not found' },
        { status: 400 }
      )
    }

    const result = await db.query(
      `INSERT INTO onboarding_lessons
        (path_id, slug, title, description, content_type, content, order_index, duration_minutes, rp_reward, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
      [pathId, slug, title, description || null, contentType, JSON.stringify(content), orderIndex, durationMinutes, rpReward, isActive]
    )

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating lesson:', error)
    // Check for unique constraint violation
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json(
        { success: false, error: 'A lesson with this slug already exists in this path' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create lesson' },
      { status: 500 }
    )
  }
}
