// packages/db/src/system-settings.ts
// System Settings Repository - Database operations for centralized configuration

import { query } from './index'
import type {
  SystemSetting,
  SystemSettingAuditEntry,
  DocumentationReference,
  SettingCategory,
  UpdateSettingRequest,
} from '@togetheros/types'

/**
 * Get all settings, optionally filtered by category
 */
export async function getAllSettings(category?: SettingCategory): Promise<SystemSetting[]> {
  const sql = category
    ? 'SELECT * FROM system_settings WHERE category = $1 ORDER BY key'
    : 'SELECT * FROM system_settings ORDER BY category, key'

  const params = category ? [category] : []
  const result = await query<any>(sql, params)

  return result.rows.map((row) => ({
    key: row.key,
    value: parseSettingValue(row.value),
    category: row.category,
    description: row.description,
    minValue: row.min_value,
    maxValue: row.max_value,
    updatedBy: row.updated_by,
    updatedAt: new Date(row.updated_at),
  }))
}

/**
 * Get a single setting by key
 */
export async function getSetting(key: string): Promise<SystemSetting | null> {
  const sql = 'SELECT * FROM system_settings WHERE key = $1'
  const result = await query<any>(sql, [key])

  if (result.rows.length === 0) {
    return null
  }

  const row = result.rows[0]
  return {
    key: row.key,
    value: parseSettingValue(row.value),
    category: row.category,
    description: row.description,
    minValue: row.min_value,
    maxValue: row.max_value,
    updatedBy: row.updated_by,
    updatedAt: new Date(row.updated_at),
  }
}

/**
 * Get setting value (shorthand, returns just the value)
 */
export async function getSettingValue<T = number | boolean | string>(
  key: string,
  defaultValue?: T
): Promise<T> {
  const setting = await getSetting(key)
  if (setting === null) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`Setting not found: ${key}`)
  }
  return setting.value as T
}

/**
 * Update a setting with automatic audit logging
 */
export async function updateSetting(
  request: UpdateSettingRequest,
  userId: string,
  ipAddress?: string
): Promise<SystemSetting> {
  // Call the database function which handles both update and audit
  const sql = 'SELECT update_setting($1, $2, $3, $4, $5)'
  await query(sql, [
    request.key,
    JSON.stringify(request.value),
    userId,
    request.reason,
    ipAddress || null,
  ])

  // Return updated setting
  const setting = await getSetting(request.key)
  if (!setting) {
    throw new Error(`Failed to update setting: ${request.key}`)
  }

  return setting
}

/**
 * Get audit log for a setting
 */
export async function getSettingAudit(
  settingKey?: string,
  limit = 50,
  offset = 0
): Promise<SystemSettingAuditEntry[]> {
  const sql = settingKey
    ? `
      SELECT * FROM system_settings_audit
      WHERE setting_key = $1
      ORDER BY changed_at DESC
      LIMIT $2 OFFSET $3
    `
    : `
      SELECT * FROM system_settings_audit
      ORDER BY changed_at DESC
      LIMIT $1 OFFSET $2
    `

  const params = settingKey ? [settingKey, limit, offset] : [limit, offset]
  const result = await query<any>(sql, params)

  return result.rows.map((row) => ({
    id: row.id,
    settingKey: row.setting_key,
    oldValue: row.old_value ? parseSettingValue(row.old_value) : null,
    newValue: parseSettingValue(row.new_value),
    changedBy: row.changed_by,
    changedAt: new Date(row.changed_at),
    reason: row.reason,
    ipAddress: row.ip_address,
  }))
}

/**
 * Get audit log for a specific user
 */
export async function getUserAuditLog(
  userId: string,
  limit = 50,
  offset = 0
): Promise<SystemSettingAuditEntry[]> {
  const sql = `
    SELECT * FROM system_settings_audit
    WHERE changed_by = $1
    ORDER BY changed_at DESC
    LIMIT $2 OFFSET $3
  `

  const result = await query<any>(sql, [userId, limit, offset])

  return result.rows.map((row) => ({
    id: row.id,
    settingKey: row.setting_key,
    oldValue: row.old_value ? parseSettingValue(row.old_value) : null,
    newValue: parseSettingValue(row.new_value),
    changedBy: row.changed_by,
    changedAt: new Date(row.changed_at),
    reason: row.reason,
    ipAddress: row.ip_address,
  }))
}

/**
 * Get recent audit entries (for transparency dashboard)
 */
export async function getRecentAudit(limit = 20): Promise<SystemSettingAuditEntry[]> {
  return getSettingAudit(undefined, limit, 0)
}

/**
 * Get documentation references for a setting
 */
export async function getDocumentationReferences(
  settingKey?: string
): Promise<DocumentationReference[]> {
  const sql = settingKey
    ? 'SELECT * FROM documentation_references WHERE setting_key = $1'
    : 'SELECT * FROM documentation_references'

  const params = settingKey ? [settingKey] : []
  const result = await query<any>(sql, params)

  return result.rows.map((row) => ({
    id: row.id,
    settingKey: row.setting_key,
    filePath: row.file_path,
    markerTag: row.marker_tag,
    lastSyncedAt: row.last_synced_at ? new Date(row.last_synced_at) : undefined,
    createdAt: new Date(row.created_at),
  }))
}

/**
 * Update last sync timestamp for documentation reference
 */
export async function updateDocumentationSyncTime(settingKey: string): Promise<void> {
  const sql = `
    UPDATE documentation_references
    SET last_synced_at = NOW()
    WHERE setting_key = $1
  `
  await query(sql, [settingKey])
}

/**
 * Validate setting value against constraints
 */
export async function validateSettingValue(
  key: string,
  value: number | boolean | string
): Promise<{ valid: boolean; error?: string }> {
  const setting = await getSetting(key)
  if (!setting) {
    return { valid: false, error: 'Setting not found' }
  }

  // Type check
  if (typeof value !== typeof setting.value) {
    return {
      valid: false,
      error: `Invalid type: expected ${typeof setting.value}, got ${typeof value}`,
    }
  }

  // Range check for numbers
  if (typeof value === 'number') {
    if (setting.minValue !== undefined && setting.minValue !== null && value < setting.minValue!) {
      return {
        valid: false,
        error: `Value ${value} is below minimum ${setting.minValue}`,
      }
    }
    if (setting.maxValue !== undefined && setting.maxValue !== null && value > setting.maxValue!) {
      return {
        valid: false,
        error: `Value ${value} exceeds maximum ${setting.maxValue}`,
      }
    }
  }

  return { valid: true }
}

/**
 * Helper: Parse JSONB setting value to TypeScript type
 */
function parseSettingValue(jsonbValue: any): number | boolean | string {
  // JSONB values are already parsed by pg driver
  if (typeof jsonbValue === 'number' || typeof jsonbValue === 'boolean') {
    return jsonbValue
  }
  if (typeof jsonbValue === 'string') {
    // Try parsing as number first
    const num = Number(jsonbValue)
    if (!isNaN(num)) {
      return num
    }
    // Try parsing as boolean
    if (jsonbValue === 'true') return true
    if (jsonbValue === 'false') return false
    // Return as string
    return jsonbValue
  }
  // Fallback: stringify
  return String(jsonbValue)
}

/**
 * Helper: Get settings grouped by category for UI display
 */
export async function getSettingsByCategory(): Promise<
  Array<{ category: SettingCategory; settings: SystemSetting[] }>
> {
  const allSettings = await getAllSettings()

  const categories: SettingCategory[] = ['sp_weights', 'rp_earnings', 'conversion_rates', 'constraints']

  return categories.map((category) => ({
    category,
    settings: allSettings.filter((s) => s.category === category),
  }))
}
