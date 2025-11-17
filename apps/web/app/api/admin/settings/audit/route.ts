// apps/web/app/api/admin/settings/audit/route.ts
// Admin Settings Audit Log API

import { NextRequest, NextResponse } from 'next/server'
import { getSettingAudit, getRecentAudit } from '@togetheros/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const settingKey = searchParams.get('settingKey')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const audit = settingKey
      ? await getSettingAudit(settingKey, limit, offset)
      : await getRecentAudit(limit)

    return NextResponse.json({ success: true, data: audit })
  } catch (error) {
    console.error('Error fetching audit log:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit log' },
      { status: 500 }
    )
  }
}
