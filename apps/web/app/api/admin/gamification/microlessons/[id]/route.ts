// apps/web/app/api/admin/gamification/microlessons/[id]/route.ts
// Admin API for single microlesson operations

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const result = await db.query(
      `SELECT
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
      WHERE id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Microlesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error fetching microlesson:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch microlesson' },
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
      'title',
      'description',
      'category',
      'content',
      'rpReward',
      'estimatedMinutes',
      'isActive',
      'sortOrder',
    ]

    const fieldMap: Record<string, string> = {
      rpReward: 'rp_reward',
      estimatedMinutes: 'estimated_minutes',
      isActive: 'is_active',
      sortOrder: 'sort_order',
    }

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        const dbField = fieldMap[field] || field
        updateFields.push(`${dbField} = $${paramIndex++}`)
        const value = field === 'content' ? JSON.stringify(body[field]) : body[field]
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
      `UPDATE gamification_microlessons
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
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
      values
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Microlesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error updating microlesson:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update microlesson' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const result = await db.query(
      `DELETE FROM gamification_microlessons
      WHERE id = $1
      RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Microlesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Microlesson deleted' })
  } catch (error) {
    console.error('Error deleting microlesson:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete microlesson' },
      { status: 500 }
    )
  }
}
