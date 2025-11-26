// apps/web/app/api/admin/gamification/onboarding/route.ts
// Admin API for onboarding suggestions

import { NextRequest, NextResponse } from 'next/server'
import db from '@togetheros/db'

export async function GET() {
  try {
    const result = await db.query(
      `SELECT
        os.id,
        os.challenge_id as "challengeId",
        os.microlesson_id as "microlessonId",
        os.suggested_order as "suggestedOrder",
        os.reason,
        os.action_type as "actionType",
        os.category,
        os.is_active as "isActive",
        os.created_at as "createdAt",
        os.updated_at as "updatedAt",
        json_build_object(
          'id', cd.id,
          'name', cd.name,
          'description', cd.description,
          'rpReward', cd.rp_reward,
          'difficulty', cd.difficulty
        ) as challenge,
        CASE WHEN ml.id IS NOT NULL THEN
          json_build_object(
            'id', ml.id,
            'title', ml.title,
            'rpReward', ml.rp_reward
          )
        ELSE NULL END as microlesson
      FROM gamification_onboarding_suggestions os
      JOIN gamification_challenge_definitions cd ON os.challenge_id = cd.id
      LEFT JOIN gamification_microlessons ml ON os.microlesson_id = ml.id
      ORDER BY os.suggested_order ASC`
    )

    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Error fetching onboarding suggestions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch onboarding suggestions' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { suggestions } = body

    if (!Array.isArray(suggestions)) {
      return NextResponse.json(
        { success: false, error: 'suggestions must be an array' },
        { status: 400 }
      )
    }

    // Update each suggestion's order and active status
    for (const suggestion of suggestions) {
      await db.query(
        `UPDATE gamification_onboarding_suggestions
        SET
          suggested_order = $1,
          is_active = $2,
          reason = COALESCE($3, reason),
          microlesson_id = $4,
          updated_at = NOW()
        WHERE id = $5`,
        [
          suggestion.suggestedOrder,
          suggestion.isActive ?? true,
          suggestion.reason,
          suggestion.microlessonId || null,
          suggestion.id,
        ]
      )
    }

    // Fetch updated list
    const result = await db.query(
      `SELECT
        os.id,
        os.challenge_id as "challengeId",
        os.microlesson_id as "microlessonId",
        os.suggested_order as "suggestedOrder",
        os.reason,
        os.action_type as "actionType",
        os.category,
        os.is_active as "isActive",
        os.created_at as "createdAt",
        os.updated_at as "updatedAt"
      FROM gamification_onboarding_suggestions os
      ORDER BY os.suggested_order ASC`
    )

    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Error updating onboarding suggestions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update onboarding suggestions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'reset') {
      // Reset to default onboarding suggestions
      await db.query('DELETE FROM gamification_onboarding_suggestions')

      // Re-insert first-week suggestions
      await db.query(`
        INSERT INTO gamification_onboarding_suggestions (challenge_id, microlesson_id, suggested_order, reason, action_type, category)
        SELECT
          c.id,
          c.microlesson_id,
          c.day_number,
          CASE c.day_number
            WHEN 1 THEN 'Start by introducing yourself - it helps others welcome you and find common ground'
            WHEN 2 THEN 'Understanding the cooperation paths helps you find where your energy fits best'
            WHEN 3 THEN 'Sharing your skills helps the community match you with opportunities'
            WHEN 4 THEN 'Engaging with others builds relationships and shows you are here to participate'
            WHEN 5 THEN 'Inviting others who share your values strengthens the whole community'
            WHEN 6 THEN 'Participating in governance is how we make collective decisions'
            WHEN 7 THEN 'Completing your journey shows commitment and unlocks full participation'
            ELSE 'Part of your onboarding journey'
          END,
          c.action_type,
          c.category
        FROM gamification_challenge_definitions c
        WHERE c.is_first_week = true
      `)

      // Add bonus daily challenges
      await db.query(`
        INSERT INTO gamification_onboarding_suggestions (challenge_id, microlesson_id, suggested_order, reason, action_type, category)
        SELECT c.id, c.microlesson_id, 8, 'Helping others is at the heart of mutual aid - even small gestures matter', c.action_type, c.category
        FROM gamification_challenge_definitions c WHERE c.name = 'Helpful Hand'
      `)
      await db.query(`
        INSERT INTO gamification_onboarding_suggestions (challenge_id, microlesson_id, suggested_order, reason, action_type, category)
        SELECT c.id, c.microlesson_id, 9, 'Sharing resources multiplies everyone''s knowledge and capability', c.action_type, c.category
        FROM gamification_challenge_definitions c WHERE c.name = 'Knowledge Sharer'
      `)
      await db.query(`
        INSERT INTO gamification_onboarding_suggestions (challenge_id, microlesson_id, suggested_order, reason, action_type, category)
        SELECT c.id, c.microlesson_id, 10, 'Exploring groups helps you find your community within the community', c.action_type, c.category
        FROM gamification_challenge_definitions c WHERE c.name = 'Explorer'
      `)

      return NextResponse.json({ success: true, message: 'Onboarding suggestions reset to defaults' })
    }

    // Create new suggestion
    const body = await request.json()
    const { challengeId, microlessonId, suggestedOrder, reason, actionType, category, isActive = true } = body

    if (!challengeId || !reason || !actionType || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await db.query(
      `INSERT INTO gamification_onboarding_suggestions
        (challenge_id, microlesson_id, suggested_order, reason, action_type, category, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        challenge_id as "challengeId",
        microlesson_id as "microlessonId",
        suggested_order as "suggestedOrder",
        reason,
        action_type as "actionType",
        category,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [challengeId, microlessonId || null, suggestedOrder || 0, reason, actionType, category, isActive]
    )

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error with onboarding suggestions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process onboarding suggestions' },
      { status: 500 }
    )
  }
}
