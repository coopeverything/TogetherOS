// apps/web/app/api/admin/gamification/challenges/[id]/route.ts
// Admin API for single challenge operations

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const result = await db.query(
      `SELECT
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
      WHERE id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error fetching challenge:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challenge' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const updateFields: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    const allowedFields = [
      'name',
      'description',
      'category',
      'difficulty',
      'rpReward',
      'actionType',
      'actionTarget',
      'isActive',
      'isFirstWeek',
      'dayNumber',
      'icon',
      'microlessonId',
    ]

    const fieldMap: Record<string, string> = {
      rpReward: 'rp_reward',
      actionType: 'action_type',
      actionTarget: 'action_target',
      isActive: 'is_active',
      isFirstWeek: 'is_first_week',
      dayNumber: 'day_number',
      microlessonId: 'microlesson_id',
    }

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        const dbField = fieldMap[field] || field
        updateFields.push(`${dbField} = $${paramIndex++}`)
        const value = field === 'actionTarget' ? JSON.stringify(body[field]) : body[field]
        values.push(value)
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    updateFields.push(`updated_at = NOW()`)
    values.push(id)

    const result = await db.query(
      `UPDATE gamification_challenge_definitions
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
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
      values
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error updating challenge:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update challenge' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const result = await db.query(
      `DELETE FROM gamification_challenge_definitions
      WHERE id = $1
      RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Challenge deleted' })
  } catch (error) {
    console.error('Error deleting challenge:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete challenge' },
      { status: 500 }
    )
  }
}
