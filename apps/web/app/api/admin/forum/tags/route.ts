/**
 * Admin Forum Tags API
 * GET /api/admin/forum/tags - Get all unique tags with usage counts
 * POST /api/admin/forum/tags - Create a new standalone tag
 * PATCH /api/admin/forum/tags - Rename a tag across all topics
 * DELETE /api/admin/forum/tags - Delete a tag from all topics and forum_tags table
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

    // Get all unique tags with counts from both topics and standalone tags
    const result = await query<{ tag: string; count: string }>(
      `SELECT tag, COALESCE(count, 0)::text as count
      FROM (
        -- Tags from topics
        SELECT
          unnest(tags) as tag,
          COUNT(*) as count
        FROM topics
        WHERE deleted_at IS NULL
        GROUP BY tag

        UNION

        -- Standalone tags (with 0 count)
        SELECT
          tag,
          0 as count
        FROM forum_tags
      ) combined
      GROUP BY tag, count
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
 * POST /api/admin/forum/tags
 * Create a new standalone tag for autocomplete
 */
export async function POST(request: NextRequest) {
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

    if (!tag || typeof tag !== 'string') {
      return NextResponse.json(
        { error: 'Tag is required' },
        { status: 400 }
      )
    }

    const trimmedTag = tag.trim()

    if (!trimmedTag) {
      return NextResponse.json(
        { error: 'Tag cannot be empty' },
        { status: 400 }
      )
    }

    // Insert into forum_tags table
    await query(
      `INSERT INTO forum_tags (tag, created_by)
       VALUES ($1, $2)
       ON CONFLICT (tag) DO NOTHING`,
      [trimmedTag, user.id]
    )

    return NextResponse.json({
      success: true,
      tag: trimmedTag,
      message: `Tag "${trimmedTag}" created successfully`
    })
  } catch (error: any) {
    console.error('POST /api/admin/forum/tags error:', JSON.stringify({ message: error.message }))

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create tag' },
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
    const topicsResult = await query(
      `UPDATE topics
       SET tags = array_remove(tags, $1)
       WHERE $1 = ANY(tags)
       AND deleted_at IS NULL
       RETURNING id`,
      [tag]
    )

    // Also delete from forum_tags table if it exists
    await query(
      `DELETE FROM forum_tags WHERE tag = $1`,
      [tag]
    )

    const updatedCount = topicsResult.rows.length

    return NextResponse.json({
      success: true,
      updatedTopics: updatedCount,
      message: `Deleted "${tag}" from ${updatedCount} topic(s) and removed from standalone tags`
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
