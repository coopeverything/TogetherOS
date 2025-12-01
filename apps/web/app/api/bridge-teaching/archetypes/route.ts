// GET /api/bridge-teaching/archetypes - List all archetypes

import { NextRequest, NextResponse } from 'next/server'
import { getArchetypes } from '@togetheros/db'

export async function GET(request: NextRequest) {
  try {
    const archetypes = await getArchetypes()
    return NextResponse.json({ archetypes })
  } catch (error: any) {
    console.error('GET /api/bridge-teaching/archetypes error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch archetypes' },
      { status: 500 }
    )
  }
}
