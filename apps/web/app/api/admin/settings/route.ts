// apps/web/app/api/admin/settings/route.ts
// Admin Settings API - List all settings

import { NextRequest, NextResponse } from 'next/server'
import { getAllSettings, getSettingsByCategory } from '@togetheros/db'
import { settingsQuerySchema } from '@togetheros/validators'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const grouped = searchParams.get('grouped') === 'true'

    if (grouped) {
      const settingsByCategory = await getSettingsByCategory()
      return NextResponse.json({ success: true, data: settingsByCategory })
    }

    const settings = category
      ? await getAllSettings(category as any)
      : await getAllSettings()

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
