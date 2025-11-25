/**
 * Feature Flags System
 *
 * Self-hosted feature flag management for controlled rollouts.
 * Supports percentage-based rollouts, user targeting, and environment overrides.
 *
 * Features:
 * - Percentage-based gradual rollouts
 * - User/group targeting rules
 * - Environment-based overrides
 * - Real-time flag updates
 * - Audit logging
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const FLAGS_FILE = join(process.cwd(), 'config', 'observability', 'feature-flags.json');

// Flag configuration types
export interface FeatureFlagRule {
  type: 'percentage' | 'user' | 'group' | 'environment';
  value: number | string | string[];
}

export interface FeatureFlag {
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  rules: FeatureFlagRule[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface FlagEvaluationContext {
  userId?: string;
  groupId?: string;
  environment?: string;
  sessionId?: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface FlagEvaluationResult {
  flagName: string;
  enabled: boolean;
  reason: 'default' | 'percentage' | 'rule' | 'override' | 'disabled';
  ruleMatched?: string;
}

interface FlagsStore {
  flags: Record<string, FeatureFlag>;
  lastUpdated: string;
  version: number;
}

// In-memory cache for flags
let flagsCache: FlagsStore | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

/**
 * Check if running in serverless environment
 */
function isServerless(): boolean {
  return !!(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY ||
    process.env.LAMBDA_TASK_ROOT
  );
}

/**
 * Ensure config directory exists
 */
function ensureConfigDir(): void {
  if (isServerless()) return;

  const configDir = join(process.cwd(), 'config', 'observability');
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
}

/**
 * Load flags from persistent storage
 */
export function loadFlags(): FlagsStore {
  const now = Date.now();

  // Return cached flags if still valid
  if (flagsCache && now - cacheTimestamp < CACHE_TTL_MS) {
    return flagsCache;
  }

  if (isServerless()) {
    // In serverless, use environment variable or default
    const envFlags = process.env.FEATURE_FLAGS;
    if (envFlags) {
      try {
        flagsCache = JSON.parse(envFlags);
        cacheTimestamp = now;
        return flagsCache!;
      } catch {
        // Fall through to default
      }
    }
    flagsCache = { flags: {}, lastUpdated: new Date().toISOString(), version: 1 };
    cacheTimestamp = now;
    return flagsCache;
  }

  ensureConfigDir();

  if (!existsSync(FLAGS_FILE)) {
    const defaultStore: FlagsStore = {
      flags: {},
      lastUpdated: new Date().toISOString(),
      version: 1,
    };
    writeFileSync(FLAGS_FILE, JSON.stringify(defaultStore, null, 2), 'utf8');
    flagsCache = defaultStore;
    cacheTimestamp = now;
    return defaultStore;
  }

  try {
    const content = readFileSync(FLAGS_FILE, 'utf8');
    flagsCache = JSON.parse(content);
    cacheTimestamp = now;
    return flagsCache!;
  } catch {
    flagsCache = { flags: {}, lastUpdated: new Date().toISOString(), version: 1 };
    cacheTimestamp = now;
    return flagsCache;
  }
}

/**
 * Save flags to persistent storage
 */
export function saveFlags(store: FlagsStore): void {
  if (isServerless()) {
    // In serverless, just update cache
    flagsCache = store;
    cacheTimestamp = Date.now();
    return;
  }

  ensureConfigDir();

  store.lastUpdated = new Date().toISOString();
  store.version = (store.version || 0) + 1;

  try {
    writeFileSync(FLAGS_FILE, JSON.stringify(store, null, 2), 'utf8');
    flagsCache = store;
    cacheTimestamp = Date.now();
  } catch (error) {
    console.error('Failed to save feature flags:', error);
  }
}

/**
 * Generate consistent hash for user/session
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Check if user falls within percentage rollout
 */
function isInPercentage(identifier: string, percentage: number, flagName: string): boolean {
  if (percentage >= 100) return true;
  if (percentage <= 0) return false;

  // Use flag name + identifier for consistent bucketing per flag
  const hash = hashString(`${flagName}:${identifier}`);
  const bucket = hash % 100;
  return bucket < percentage;
}

/**
 * Evaluate a single rule against context
 */
function evaluateRule(rule: FeatureFlagRule, context: FlagEvaluationContext): boolean {
  switch (rule.type) {
    case 'percentage':
      // Percentage rules are handled separately
      return false;

    case 'user':
      if (typeof rule.value === 'string') {
        return context.userId === rule.value;
      }
      if (Array.isArray(rule.value)) {
        return rule.value.includes(context.userId || '');
      }
      return false;

    case 'group':
      if (typeof rule.value === 'string') {
        return context.groupId === rule.value;
      }
      if (Array.isArray(rule.value)) {
        return rule.value.includes(context.groupId || '');
      }
      return false;

    case 'environment':
      const currentEnv = context.environment || process.env.NODE_ENV || 'development';
      if (typeof rule.value === 'string') {
        return currentEnv === rule.value;
      }
      if (Array.isArray(rule.value)) {
        return rule.value.includes(currentEnv);
      }
      return false;

    default:
      return false;
  }
}

/**
 * Evaluate if a feature flag is enabled for the given context
 */
export function evaluateFlag(
  flagName: string,
  context: FlagEvaluationContext = {}
): FlagEvaluationResult {
  const store = loadFlags();
  const flag = store.flags[flagName];

  // Flag doesn't exist - return disabled
  if (!flag) {
    return {
      flagName,
      enabled: false,
      reason: 'default',
    };
  }

  // Flag is globally disabled
  if (!flag.enabled) {
    return {
      flagName,
      enabled: false,
      reason: 'disabled',
    };
  }

  // Check explicit rules first (higher priority)
  for (const rule of flag.rules) {
    if (evaluateRule(rule, context)) {
      return {
        flagName,
        enabled: true,
        reason: 'rule',
        ruleMatched: rule.type,
      };
    }
  }

  // Check percentage rollout
  const identifier = context.userId || context.sessionId || 'anonymous';
  if (isInPercentage(identifier, flag.rolloutPercentage, flagName)) {
    return {
      flagName,
      enabled: true,
      reason: 'percentage',
    };
  }

  // Default: flag exists and is enabled but user not in rollout
  return {
    flagName,
    enabled: false,
    reason: 'default',
  };
}

/**
 * Simple boolean check for feature flag
 */
export function isFeatureEnabled(flagName: string, context?: FlagEvaluationContext): boolean {
  return evaluateFlag(flagName, context).enabled;
}

/**
 * Create or update a feature flag
 */
export function setFlag(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): FeatureFlag {
  const store = loadFlags();
  const existing = store.flags[flag.name];
  const now = new Date().toISOString();

  const updatedFlag: FeatureFlag = {
    ...flag,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  store.flags[flag.name] = updatedFlag;
  saveFlags(store);

  console.log(`[Feature Flags] Updated flag: ${flag.name} (enabled: ${flag.enabled}, rollout: ${flag.rolloutPercentage}%)`);

  return updatedFlag;
}

/**
 * Delete a feature flag
 */
export function deleteFlag(flagName: string): boolean {
  const store = loadFlags();

  if (!store.flags[flagName]) {
    return false;
  }

  delete store.flags[flagName];
  saveFlags(store);

  console.log(`[Feature Flags] Deleted flag: ${flagName}`);
  return true;
}

/**
 * Get all feature flags
 */
export function getAllFlags(): FeatureFlag[] {
  const store = loadFlags();
  return Object.values(store.flags);
}

/**
 * Get a single feature flag by name
 */
export function getFlag(flagName: string): FeatureFlag | null {
  const store = loadFlags();
  return store.flags[flagName] || null;
}

/**
 * Update rollout percentage for a flag
 */
export function updateRolloutPercentage(flagName: string, percentage: number): FeatureFlag | null {
  const store = loadFlags();
  const flag = store.flags[flagName];

  if (!flag) {
    return null;
  }

  flag.rolloutPercentage = Math.max(0, Math.min(100, percentage));
  flag.updatedAt = new Date().toISOString();
  saveFlags(store);

  console.log(`[Feature Flags] Updated rollout for ${flagName}: ${flag.rolloutPercentage}%`);
  return flag;
}

/**
 * Invalidate cache to force reload from file
 */
export function invalidateCache(): void {
  flagsCache = null;
  cacheTimestamp = 0;
}

/**
 * Export flags for Prometheus metrics
 */
export function exportFlagMetrics(): string {
  const store = loadFlags();
  const lines: string[] = [];

  lines.push('# HELP togetheros_feature_flag_enabled Feature flag enabled status');
  lines.push('# TYPE togetheros_feature_flag_enabled gauge');

  lines.push('# HELP togetheros_feature_flag_rollout Feature flag rollout percentage');
  lines.push('# TYPE togetheros_feature_flag_rollout gauge');

  for (const flag of Object.values(store.flags)) {
    const safeName = flag.name.replace(/"/g, '\\"');
    lines.push(`togetheros_feature_flag_enabled{name="${safeName}"} ${flag.enabled ? 1 : 0}`);
    lines.push(`togetheros_feature_flag_rollout{name="${safeName}"} ${flag.rolloutPercentage}`);
  }

  return lines.join('\n');
}
