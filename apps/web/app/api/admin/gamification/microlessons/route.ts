// apps/web/app/api/admin/gamification/microlessons/route.ts
// Admin API for microlesson CRUD

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    let query = `
      SELECT
        id,
        title,
        description,
        category,
        content,
        rp_reward as "rpReward",
        estimated_minutes as "estimatedMinutes",
        is_active as "isActive",
        sort_order as "sortOrder",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM gamification_microlessons
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

    query += ` ORDER BY sort_order ASC, title ASC`

    const result = await db.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Error fetching microlessons:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch microlessons' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      category,
      content,
      rpReward = 15,
      estimatedMinutes = 5,
      isActive = true,
      sortOrder = 0,
    } = body

    if (!title || !description || !category || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await db.query(
      `INSERT INTO gamification_microlessons
        (title, description, category, content, rp_reward, estimated_minutes, is_active, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        title,
        description,
        category,
        content,
        rp_reward as "rpReward",
        estimated_minutes as "estimatedMinutes",
        is_active as "isActive",
        sort_order as "sortOrder",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [
        title,
        description,
        category,
        JSON.stringify(content),
        rpReward,
        estimatedMinutes,
        isActive,
        sortOrder,
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating microlesson:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create microlesson' },
      { status: 500 }
    )
  }
}
