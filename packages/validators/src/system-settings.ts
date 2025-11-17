// packages/validators/src/system-settings.ts
// TogetherOS System Settings Module - Zod Validation Schemas

import { z } from 'zod'

/**
 * Setting category validation
 */
export const settingCategorySchema = z.enum([
  'sp_weights',
  'rp_earnings',
  'conversion_rates',
  'constraints',
])

/**
 * System setting schema
 */
export const systemSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.union([z.number(), z.boolean(), z.string()]),
  category: settingCategorySchema,
  description: z.string().min(1),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  updatedBy: z.string().uuid().optional(),
  updatedAt: z.coerce.date(),
})

/**
 * Update setting request schema
 */
export const updateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.union([z.number(), z.boolean(), z.string()]),
  reason: z.string().min(10).max(500), // Require meaningful explanation
})

/**
 * Audit entry schema
 */
export const systemSettingAuditSchema = z.object({
  id: z.string().uuid(),
  settingKey: z.string(),
  oldValue: z.union([z.number(), z.boolean(), z.string(), z.null()]),
  newValue: z.union([z.number(), z.boolean(), z.string()]),
  changedBy: z.string().uuid(),
  changedAt: z.coerce.date(),
  reason: z.string().optional(),
  ipAddress: z.string().optional(),
})

/**
 * Documentation reference schema
 */
export const documentationReferenceSchema = z.object({
  id: z.string().uuid(),
  settingKey: z.string(),
  filePath: z.string().min(1),
  markerTag: z.string().optional(),
  lastSyncedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
})

/**
 * Settings query filters
 */
export const settingsQuerySchema = z.object({
  category: settingCategorySchema.optional(),
  search: z.string().optional(),
})

/**
 * Audit log query filters
 */
export const auditQuerySchema = z.object({
  settingKey: z.string().optional(),
  changedBy: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

/**
 * Value-specific validators by category
 */

// SP weights: 1-100 range
export const spWeightValueSchema = z.number().int().min(0).max(100)

// RP earnings: 1-1000 range
export const rpEarningValueSchema = z.number().int().min(1).max(1000)

// Conversion rates: varies by key
export const conversionRateValueSchema = z.union([
  z.number().int().min(1).max(10000),  // For rates
  z.boolean(),                         // For enabled flags
])

// Constraints: varies by constraint type
export const constraintValueSchema = z.number().int().min(0).max(1000)

/**
 * Type-safe value validator factory
 */
export function getValueValidator(category: string): z.ZodType {
  switch (category) {
    case 'sp_weights':
      return spWeightValueSchema
    case 'rp_earnings':
      return rpEarningValueSchema
    case 'conversion_rates':
      return conversionRateValueSchema
    case 'constraints':
      return constraintValueSchema
    default:
      return z.union([z.number(), z.boolean(), z.string()])
  }
}

/**
 * Exported type inferrence
 */
export type UpdateSettingInput = z.infer<typeof updateSettingSchema>
export type SettingsQueryInput = z.infer<typeof settingsQuerySchema>
export type AuditQueryInput = z.infer<typeof auditQuerySchema>
