// apps/web/app/api/admin/onboarding/paths/route.ts
// Admin API for learning paths CRUD

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'
import { createLearningPathSchema } from '@togetheros/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    let query = `
      SELECT
        id,
        slug,
        title,
        description,
        icon,
        category,
        order_index as "orderIndex",
        is_active as "isActive",
        rp_reward as "rpReward",
        estimated_minutes as "estimatedMinutes",
        created_at as "createdAt",
        updated_at as "updatedAt",
        (SELECT COUNT(*) FROM onboarding_lessons WHERE path_id = onboarding_learning_paths.id) as "lessonCount"
      FROM onboarding_learning_paths
      WHERE 1=1
    `
    const params: (string | boolean)[] = []
    let paramIndex = 1

    if (category) {
      query += ` AND category = $${paramIndex++}`
      params.push(category)
    }
    if (isActive !== null) {
      query += ` AND is_active = $${paramIndex++}`
      params.push(isActive === 'true')
    }

    query += ` ORDER BY order_index ASC, title ASC`

    const result = await db.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Error fetching learning paths:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch learning paths' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = createLearningPathSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const {
      slug,
      title,
      description,
      icon,
      category,
      orderIndex = 0,
      isActive = true,
      rpReward = 50,
      estimatedMinutes = 30,
    } = validation.data

    const result = await db.query(
      `INSERT INTO onboarding_learning_paths
        (slug, title, description, icon, category, order_index, is_active, rp_reward, estimated_minutes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        slug,
        title,
        description,
        icon,
        category,
        order_index as "orderIndex",
        is_active as "isActive",
        rp_reward as "rpReward",
        estimated_minutes as "estimatedMinutes",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [slug, title, description || null, icon || null, category || null, orderIndex, isActive, rpReward, estimatedMinutes]
    )

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating learning path:', error)
    // Check for unique constraint violation
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json(
        { success: false, error: 'A learning path with this slug already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create learning path' },
      { status: 500 }
    )
  }
}
