// packages/types/src/system-settings.ts
// TogetherOS System Settings Module - Type Definitions

/**
 * Setting categories for organizational grouping
 */
export type SettingCategory =
  | 'sp_weights'           // Support Points earning weights
  | 'rp_earnings'          // Reputation Points earning amounts
  | 'conversion_rates'     // Cross-ledger conversion rates
  | 'constraints'          // System limits and constraints

/**
 * Core system setting entity
 */
export interface SystemSetting {
  /** Unique setting key (e.g., 'sp_weights.pr_merged_small') */
  key: string

  /** Setting value (stored as JSONB, typically number or boolean) */
  value: number | boolean | string

  /** Category for grouping */
  category: SettingCategory

  /** Human-readable description */
  description: string

  /** Minimum allowed value (for validation) */
  minValue?: number

  /** Maximum allowed value (for validation) */
  maxValue?: number

  /** User who last updated this setting */
  updatedBy?: string

  /** When setting was last updated */
  updatedAt: Date
}

/**
 * Audit log entry for settings changes
 * Provides full transparency on who changed what and why
 */
export interface SystemSettingAuditEntry {
  /** Unique audit entry ID */
  id: string

  /** Setting key that was changed */
  settingKey: string

  /** Previous value (null for initial creation) */
  oldValue: number | boolean | string | null

  /** New value */
  newValue: number | boolean | string

  /** User who made the change */
  changedBy: string

  /** When change occurred */
  changedAt: Date

  /** Reason provided by admin for change */
  reason?: string

  /** IP address of user who made change */
  ipAddress?: string
}

/**
 * Documentation reference
 * Tracks which docs reference which settings for auto-sync
 */
export interface DocumentationReference {
  /** Reference ID */
  id: string

  /** Setting key referenced */
  settingKey: string

  /** File path relative to repo root */
  filePath: string

  /** Comment marker tag for replacement */
  markerTag?: string

  /** Last time this reference was synced */
  lastSyncedAt?: Date

  /** When reference was created */
  createdAt: Date
}

/**
 * Settings grouped by category for display
 */
export interface SettingsByCategory {
  category: SettingCategory
  label: string  // Display name
  settings: SystemSetting[]
}

/**
 * Update setting request
 */
export interface UpdateSettingRequest {
  /** Setting key to update */
  key: string

  /** New value */
  value: number | boolean | string

  /** Reason for change (required for transparency) */
  reason: string
}

/**
 * Validation result for setting update
 */
export interface SettingValidationResult {
  /** Whether value is valid */
  valid: boolean

  /** Error message if invalid */
  error?: string

  /** Warnings (non-blocking) */
  warnings?: string[]
}

/**
 * Documentation sync result
 */
export interface DocumentationSyncResult {
  /** Whether sync succeeded */
  success: boolean

  /** Files that were updated */
  filesUpdated: string[]

  /** Files that failed to update */
  filesFailed: string[]

  /** Git commit SHA if auto-committed */
  commitSha?: string

  /** Error message if sync failed */
  error?: string
}

/**
 * Settings diff for change preview
 */
export interface SettingDiff {
  /** Setting being changed */
  setting: SystemSetting

  /** Current value */
  currentValue: number | boolean | string

  /** Proposed new value */
  newValue: number | boolean | string

  /** Calculated impact (e.g., "25% increase") */
  impact: string

  /** Documentation files that will be updated */
  affectedDocs: string[]
}

/**
 * Strongly-typed setting keys for type safety
 */
export type SPWeightKey =
  | 'sp_weights.pr_merged_small'
  | 'sp_weights.pr_merged_medium'
  | 'sp_weights.pr_merged_large'
  | 'sp_weights.docs_contribution'
  | 'sp_weights.code_review'
  | 'sp_weights.issue_triage'
  | 'sp_weights.bug_fix'
  | 'sp_weights.group_created'
  | 'sp_weights.group_joined'
  | 'sp_weights.city_group_joined'
  | 'sp_weights.proposal_rating_submitted'
  | 'sp_weights.proposal_rating_quality'
  | 'sp_weights.proposal_rating_innovative'
  | 'sp_weights.proposal_highly_rated'

export type RPEarningKey =
  | 'rp_earnings.pr_merged_small'
  | 'rp_earnings.pr_merged_medium'
  | 'rp_earnings.pr_merged_large'
  | 'rp_earnings.docs_contribution'
  | 'rp_earnings.code_review'
  | 'rp_earnings.issue_triage'
  | 'rp_earnings.bug_fix'
  | 'rp_earnings.monthly_dues_paid'
  | 'rp_earnings.donation'

export type ConversionRateKey =
  | 'conversion.rp_to_tbc_rate'
  | 'conversion.monthly_tbc_cap'
  | 'conversion.sp_to_rp_enabled'

export type ConstraintKey =
  | 'constraints.max_sp_per_proposal'
  | 'constraints.initial_sp_balance'
  | 'constraints.min_sp_for_voting'

export type SettingKey = SPWeightKey | RPEarningKey | ConversionRateKey | ConstraintKey

/**
 * Category metadata for UI display
 */
export interface CategoryMetadata {
  category: SettingCategory
  label: string
  description: string
  icon: string  // Icon name for UI
}

export const CATEGORY_METADATA: Record<SettingCategory, CategoryMetadata> = {
  sp_weights: {
    category: 'sp_weights',
    label: 'Support Points Weights',
    description: 'SP earned for various contribution activities',
    icon: 'star',
  },
  rp_earnings: {
    category: 'rp_earnings',
    label: 'Reputation Points Earnings',
    description: 'RP earned for contributions and participation',
    icon: 'award',
  },
  conversion_rates: {
    category: 'conversion_rates',
    label: 'Conversion Rates',
    description: 'Cross-ledger exchange rates and caps',
    icon: 'repeat',
  },
  constraints: {
    category: 'constraints',
    label: 'System Constraints',
    description: 'Limits and allocation constraints',
    icon: 'shield',
  },
}
