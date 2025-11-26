// apps/web/app/api/admin/gamification/challenges/route.ts
// Admin API for challenge definitions CRUD

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isFirstWeek = searchParams.get('isFirstWeek')
    const isActive = searchParams.get('isActive')

    let query = `
      SELECT
        id,
        name,
        description,
        category,
        difficulty,
        rp_reward as "rpReward",
        action_type as "actionType",
        action_target as "actionTarget",
        is_active as "isActive",
        is_first_week as "isFirstWeek",
        day_number as "dayNumber",
        icon,
        microlesson_id as "microlessonId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM gamification_challenge_definitions
      WHERE 1=1
    `
    const params: (string | boolean)[] = []
    let paramIndex = 1

    if (category) {
      query += ` AND category = $${paramIndex++}`
      params.push(category)
    }
    if (isFirstWeek !== null) {
      query += ` AND is_first_week = $${paramIndex++}`
      params.push(isFirstWeek === 'true')
    }
    if (isActive !== null) {
      query += ` AND is_active = $${paramIndex++}`
      params.push(isActive === 'true')
    }

    query += ` ORDER BY is_first_week DESC, day_number ASC NULLS LAST, category, name`

    const result = await db.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challenges' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      category,
      difficulty,
      rpReward = 25,
      actionType,
      actionTarget = {},
      isActive = true,
      isFirstWeek = false,
      dayNumber,
      icon,
      microlessonId,
    } = body

    if (!name || !description || !category || !difficulty || !actionType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await db.query(
      `INSERT INTO gamification_challenge_definitions
        (name, description, category, difficulty, rp_reward, action_type, action_target, is_active, is_first_week, day_number, icon, microlesson_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING
        id,
        name,
        description,
        category,
        difficulty,
        rp_reward as "rpReward",
        action_type as "actionType",
        action_target as "actionTarget",
        is_active as "isActive",
        is_first_week as "isFirstWeek",
        day_number as "dayNumber",
        icon,
        microlesson_id as "microlessonId",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [
        name,
        description,
        category,
        difficulty,
        rpReward,
        actionType,
        JSON.stringify(actionTarget),
        isActive,
        isFirstWeek,
        dayNumber || null,
        icon || null,
        microlessonId || null,
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating challenge:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create challenge' },
      { status: 500 }
    )
  }
}
