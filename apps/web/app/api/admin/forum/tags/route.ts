/**
 * Admin Forum Tags API
 * GET /api/admin/forum/tags - Get all unique tags with usage counts
 * PATCH /api/admin/forum/tags - Rename a tag across all topics
 * DELETE /api/admin/forum/tags - Delete a tag from all topics
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { query } from '@togetheros/db'

/**
 * GET /api/admin/forum/tags
 * Returns all unique tags with their usage counts
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireAuth(request)
    if (!user.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get all unique tags with counts
    const result = await query<{ tag: string; count: string }>(
      `SELECT
        unnest(tags) as tag,
        COUNT(*) as count
      FROM topics
      WHERE deleted_at IS NULL
      GROUP BY tag
      ORDER BY count DESC, tag ASC`
    )

    const tags = result.rows.map(row => ({
      tag: row.tag,
      count: parseInt(row.count, 10)
    }))

    return NextResponse.json({ tags })
  } catch (error: any) {
    console.error('GET /api/admin/forum/tags error:', JSON.stringify({ message: error.message }))

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to get tags' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/forum/tags
 * Rename a tag across all topics
 */
export async function PATCH(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireAuth(request)
    if (!user.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { oldTag, newTag } = body

    if (!oldTag || !newTag) {
      return NextResponse.json(
        { error: 'Both oldTag and newTag are required' },
        { status: 400 }
      )
    }

    if (oldTag === newTag) {
      return NextResponse.json(
        { error: 'Old and new tags must be different' },
        { status: 400 }
      )
    }

    // Update all topics that have the old tag
    // Replace array element using PostgreSQL array functions
    const result = await query(
      `UPDATE topics
       SET tags = array_replace(tags, $1, $2)
       WHERE $1 = ANY(tags)
       AND deleted_at IS NULL
       RETURNING id`,
      [oldTag, newTag]
    )

    const updatedCount = result.rows.length

    return NextResponse.json({
      success: true,
      updatedTopics: updatedCount,
      message: `Renamed "${oldTag}" to "${newTag}" in ${updatedCount} topic(s)`
    })
  } catch (error: any) {
    console.error('PATCH /api/admin/forum/tags error:', JSON.stringify({ message: error.message }))

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to rename tag' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/forum/tags
 * Delete a tag from all topics
 */
export async function DELETE(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireAuth(request)
    if (!user.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { tag } = body

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag is required' },
        { status: 400 }
      )
    }

    // Remove tag from all topics that have it
    // Use array_remove to remove the tag from the tags array
    const result = await query(
      `UPDATE topics
       SET tags = array_remove(tags, $1)
       WHERE $1 = ANY(tags)
       AND deleted_at IS NULL
       RETURNING id`,
      [tag]
    )

    const updatedCount = result.rows.length

    return NextResponse.json({
      success: true,
      updatedTopics: updatedCount,
      message: `Deleted "${tag}" from ${updatedCount} topic(s)`
    })
  } catch (error: any) {
    console.error('DELETE /api/admin/forum/tags error:', JSON.stringify({ message: error.message }))

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete tag' },
      { status: 500 }
    )
  }
}
