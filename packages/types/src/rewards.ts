// packages/types/src/rewards.ts
// TogetherOS Rewards Module - Core Entity Definitions

/**
 * Event types that trigger Support Point rewards
 */
export type RewardEventType =
  | 'pr_merged_small'      // < 50 lines
  | 'pr_merged_medium'     // 50-200 lines
  | 'pr_merged_large'      // > 200 lines
  | 'docs_contribution'    // Documentation updates
  | 'code_review'          // PR review completed
  | 'issue_triage'         // Issue labeled/prioritized
  | 'bug_fix'              // Bug fix merged
  | 'group_created'        // Created a new group (not city group)
  | 'group_joined'         // Joined an existing group (not city group)
  | 'city_group_joined'    // Joined auto-created city group (no reward)

/**
 * Domain-specific context for reward events
 */
export interface EventContext {
  // GitHub-specific
  pr_number?: number
  issue_number?: number
  repo?: string
  lines_changed?: number
  
  // Generic metadata
  [key: string]: string | number | boolean | undefined
}

/**
 * Core reward event entity
 * Represents a single contribution that earns Support Points
 */
export interface RewardEvent {
  /** Unique identifier (UUID v4) */
  id: string
  
  /** Member who earned the reward */
  memberId: string
  
  /** Type of contribution */
  event_type: RewardEventType
  
  /** Support Points awarded (calculated from event_type) */
  sp_weight: number
  
  /** Domain-specific context */
  context: EventContext
  
  /** Event source (e.g., 'github', 'manual') */
  source: string
  
  /** Deduplication key (source + context) */
  dedup_key: string
  
  /** When the event occurred */
  timestamp: Date
  
  /** Processing status */
  status: 'pending' | 'processed' | 'failed'
  
  /** When event was processed */
  processedAt?: Date
}

/**
 * Member's Support Points balance
 */
export interface MemberRewardBalance {
  /** Member ID */
  memberId: string
  
  /** Total SP earned (all time) */
  total: number
  
  /** Available SP (not allocated to proposals) */
  available: number
  
  /** SP allocated to active proposals */
  allocated: number
  
  /** Last updated timestamp */
  updatedAt: Date
}

/**
 * Badge achievement definition
 */
export interface Badge {
  /** Unique badge ID */
  id: string
  
  /** Display name */
  name: string
  
  /** Description of achievement */
  description: string
  
  /** Icon (emoji or URL) */
  icon: string
  
  /** Criteria to earn badge */
  criteria: string
  
  /** Badge category */
  category: 'contribution' | 'milestone' | 'special'
}

/**
 * Member's earned badges
 */
export interface MemberBadge {
  /** Member ID */
  memberId: string
  
  /** Badge ID */
  badgeId: string
  
  /** When badge was earned */
  earnedAt: Date
  
  /** Related event ID (if applicable) */
  eventId?: string
}

/**
 * Input for creating a new reward event
 */
export interface CreateRewardEventInput {
  memberId: string
  event_type: RewardEventType
  context: EventContext
  source: string
  timestamp?: Date
}

/**
 * SP weight mapping for event types
 */
export const SP_WEIGHTS: Record<RewardEventType, number> = {
  pr_merged_small: 5,
  pr_merged_medium: 10,
  pr_merged_large: 20,
  docs_contribution: 8,
  code_review: 3,
  issue_triage: 2,
  bug_fix: 15,
  group_created: 15,        // Creating a new group
  group_joined: 3,          // Joining an existing group
  city_group_joined: 0,     // Joining city group (no reward)
}
