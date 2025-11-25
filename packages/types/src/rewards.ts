// packages/types/src/rewards.ts
// TogetherOS Rewards Module - Core Entity Definitions

/**
 * Event types that trigger Support Point (SP) rewards
 *
 * IMPORTANT: SP is ONLY for POLITICAL PARTICIPATION, never for technical contributions
 * - Governance activities (proposals, ratings, voting) → earn SP
 * - Community activities (groups, volunteering) → earn SP
 * - Coding activities (PRs, code review, bug fixes) → earn RP (Reputation Points), NOT SP
 *
 * See docs/guides/4-ledger-system.md for complete ledger separation rules
 */
export type SPRewardEventType =
  | 'group_created'        // Created a new group (not city group)
  | 'group_joined'         // Joined an existing group (not city group)
  | 'city_group_joined'    // Joined auto-created city group (no reward)
  | 'proposal_rating_submitted'  // Submitted any rating on proposal
  | 'proposal_rating_quality'    // Submitted high-quality detailed rating
  | 'proposal_rating_innovative' // Marked proposal as innovative (validated later)
  | 'proposal_highly_rated'      // Authored proposal that received excellent ratings

/**
 * Event types that trigger Reputation Point (RP) rewards
 *
 * IMPORTANT: RP is for TECHNICAL CONTRIBUTIONS, FINANCIAL SUPPORT, and GAMIFICATION
 * - Coding (PRs, reviews, bug fixes, docs) → earn RP
 * - Dues and donations → earn RP
 * - Gamification activities (invitations, meetups, milestones) → earn RP
 * - Governance activities → earn SP, NOT RP
 */
export type RPRewardEventType =
  // Technical contributions
  | 'pr_merged_small'      // < 50 lines
  | 'pr_merged_medium'     // 50-200 lines
  | 'pr_merged_large'      // > 200 lines
  | 'docs_contribution'    // Documentation updates
  | 'code_review'          // PR review completed
  | 'issue_triage'         // Issue labeled/prioritized
  | 'bug_fix'              // Bug fix merged
  // Financial support
  | 'monthly_dues_paid'    // Monthly membership dues
  | 'donation'             // One-time donation (min $20)
  // Gamification activities
  | 'invitation_sent'      // Stage 1: Sent invite (+25 RP)
  | 'invitation_accepted'  // Stage 2: Invite accepted (+50 RP inviter, +100 RP invitee)
  | 'invitation_contributed' // Stage 3: Invitee made first contribution (+25 RP)
  | 'meetup_organized'     // Organized a meetup (+100 RP, requires 15+ members)
  | 'federated_connection' // Connected with federated groups (+75 RP)
  | 'working_group_launched' // Launched working group (+150 RP, requires 50+ members)
  | 'group_mentored'       // Mentored a new group (+200 RP, requires 100+ members)
  | 'governance_proposal_drafted' // Drafted governance proposal (+250 RP, requires 150+ members)
  // Onboarding & challenges
  | 'onboarding_step_completed'   // Completed an onboarding step
  | 'daily_challenge_completed'   // Completed a daily challenge
  | 'first_week_completed'        // Completed first-week journey (7-day bonus)

/**
 * Combined event type for all reward-triggering events
 * @deprecated Use SPRewardEventType or RPRewardEventType for type safety
 */
export type RewardEventType = SPRewardEventType | RPRewardEventType

/**
 * Domain-specific context for reward events
 */
export interface EventContext {
  // GitHub-specific
  pr_number?: number
  issue_number?: number
  repo?: string
  lines_changed?: number

  // Governance/Rating-specific
  proposalId?: string
  ratingId?: string
  rating_quality_score?: number  // 0-100 calculated quality metric
  has_feedback?: boolean
  clarity_rating?: number
  constructiveness_rating?: number

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
 * Support Points transaction types
 */
export type SPTransactionType =
  | 'earned'      // Earned SP from contribution
  | 'allocated'   // Allocated SP to proposal
  | 'reclaimed'   // Reclaimed SP from closed proposal

/**
 * Support Points transaction
 * Records all SP balance changes with detailed audit trail
 */
export interface SPTransaction {
  /** Unique identifier (UUID) */
  id: string

  /** Member who owns this transaction */
  memberId: string

  /** Transaction type */
  type: SPTransactionType

  /** Amount of SP (positive for earn/reclaim, negative for allocate) */
  amount: number

  /** Source event type */
  sourceType: 'group_created' | 'proposal_rating_submitted' | 'proposal_created' | 'moderation_quality' | 'allocation' | 'reclaim'

  /** Source entity ID (proposal ID, event ID, etc.) */
  sourceId?: string

  /** Human-readable description */
  description: string

  /** When transaction occurred */
  timestamp: Date
}

/**
 * Support Points allocation to proposals
 * Tracks which member allocated how much SP to which proposal
 */
export interface SPAllocation {
  /** Unique identifier (UUID) */
  id: string

  /** Member who allocated SP */
  memberId: string

  /** Proposal receiving SP allocation */
  proposalId: string

  /** Amount allocated (1-10) */
  amount: number

  /** When allocation was made */
  allocatedAt: Date

  /** Allocation status */
  status: 'active' | 'reclaimed'

  /** When SP was reclaimed (if status = reclaimed) */
  reclaimedAt?: Date
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
  dedup_key?: string
  timestamp?: Date
}

/**
 * SP weight mapping for political participation events
 * @deprecated Use system_settings table for configurable values
 */
export const SP_WEIGHTS: Record<SPRewardEventType, number> = {
  group_created: 15,        // Creating a new group
  group_joined: 3,          // Joining an existing group
  city_group_joined: 0,     // Joining city group (no reward)
  proposal_rating_submitted: 2,   // Basic rating participation
  proposal_rating_quality: 5,     // High-quality detailed rating
  proposal_rating_innovative: 3,  // Marked as innovative (bonus to rater if validated)
  proposal_highly_rated: 10,      // Proposal author bonus for excellent ratings
}

/**
 * RP earnings mapping for technical contributions and gamification
 * @deprecated Use system_settings table for configurable values
 */
export const RP_EARNINGS: Record<RPRewardEventType, number> = {
  // Technical contributions
  pr_merged_small: 25,
  pr_merged_medium: 50,
  pr_merged_large: 100,
  docs_contribution: 40,
  code_review: 15,
  issue_triage: 10,
  bug_fix: 75,
  // Financial support
  monthly_dues_paid: 100,
  donation: 100,  // min $20
  // Gamification activities
  invitation_sent: 25,
  invitation_accepted: 50,  // inviter bonus (invitee gets 100)
  invitation_contributed: 25,
  meetup_organized: 100,
  federated_connection: 75,
  working_group_launched: 150,
  group_mentored: 200,
  governance_proposal_drafted: 250,
  // Onboarding & challenges
  onboarding_step_completed: 10,     // Completed an onboarding step
  daily_challenge_completed: 25,     // Completed a daily challenge
  first_week_completed: 100,         // Completed first-week journey (7-day bonus)
}

// ==================================================
// Ledger 2: Reward Points (RP)
// ==================================================

/**
 * RP transaction types
 */
export type RPTransactionType =
  | 'earn_contribution'  // Earned from contribution event
  | 'earn_dues'          // Earned from monthly membership fee
  | 'earn_donation'      // Earned from one-off donation
  | 'spend_tbc'          // Spent converting to TBC
  | 'spend_sh'           // Spent purchasing SH in event
  | 'spend_perk'         // Spent on perk (priority seat, raffle, etc.)

/**
 * Reward Points balance (per member)
 */
export interface RewardPointsBalance {
  memberId: string
  totalEarned: number
  available: number
  spentOnTBC: number
  spentOnSH: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Reward Points transaction
 */
export interface RewardPointsTransaction {
  id: string
  memberId: string
  type: RPTransactionType
  amount: number
  source?: string  // 'pr_merged', 'monthly_dues', 'donation_campaign_X'
  metadata?: Record<string, unknown>
  createdAt: Date
}

/**
 * RP earning rule (configurable via governance)
 */
export interface RPEarningRule {
  id: string
  eventType: string  // Same as RewardEventType
  rpAmount: number
  minThreshold?: Record<string, unknown>
  active: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * RP → TBC conversion
 */
export interface RPToTBCConversion {
  id: string
  memberId: string
  rpSpent: number
  tbcReceived: number
  conversionMonth: string  // YYYY-MM-DD format
  rateUsed: number  // RP per 1 TBC
  createdAt: Date
}

// ==================================================
// Ledger 3: Timebank Credits (TBC)
// ==================================================

/**
 * Timebank transaction status
 */
export type TimebankTransactionStatus =
  | 'pending'    // Awaiting receiver confirmation
  | 'confirmed'  // Both parties confirmed
  | 'disputed'   // Under dispute resolution
  | 'resolved'   // Dispute resolved

/**
 * Timebank account balance
 */
export interface TimebankAccount {
  memberId: string
  balance: number
  totalEarned: number
  totalSpent: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Timebank service transaction
 */
export interface TimebankTransaction {
  id: string
  providerId: string
  receiverId: string
  serviceId?: string
  serviceDescription: string
  tbcCost: number
  hourlyRate?: number  // TBC per hour (1-3 typically)
  hoursProvided?: number
  status: TimebankTransactionStatus
  confirmedAt?: Date
  metadata?: Record<string, unknown>
  createdAt: Date
}

/**
 * Timebank service offering
 */
export interface TimebankService {
  id: string
  memberId: string
  serviceType: string  // 'tutoring', 'massage', 'repair', etc.
  title: string
  description?: string
  tbcPerHour: number  // Pricing (1-3 typically)
  availability?: string
  locationPreference?: 'remote' | 'in_person' | 'both'
  cityId?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// ==================================================
// Ledger 4: Social Horizon (SH)
// ==================================================

/**
 * SH transaction types
 */
export type SHTransactionType =
  | 'issuance'       // Allocated in issuance cycle
  | 'rp_purchase'    // Purchased with RP in event
  | 'money_purchase' // Purchased with money in campaign
  | 'dividend'       // Dividend received
  | 'transfer'       // P2P transfer (if allowed)

/**
 * SH purchase event status
 */
export type SHPurchaseEventStatus =
  | 'pending'  // Not yet started
  | 'active'   // Currently open for purchases
  | 'closed'   // Ended

/**
 * Social Horizon wallet balance
 */
export interface SocialHorizonWallet {
  memberId: string
  shBalance: number
  totalIssued: number
  totalTransferred: number
  createdAt: Date
  updatedAt: Date
}

/**
 * SH issuance cycle
 */
export interface SHIssuanceCycle {
  id: string
  cycleName: string  // 'Q1 2025', 'Q2 2025'
  issuanceDate: string  // YYYY-MM-DD
  totalSHIssued: number
  contributionAllocated: number  // Portion for contribution-based (80%)
  purchaseAllocated: number      // Portion for purchase events (20%)
  formulaUsed?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

/**
 * SH allocation (per cycle, per member)
 */
export interface SHAllocation {
  id: string
  cycleId: string
  memberId: string
  shAmount: number
  basis: 'contribution' | 'timebank_activity' | 'rp_purchase' | 'money_purchase'
  calculationDetails?: Record<string, unknown>
  createdAt: Date
}

/**
 * SH purchase event (rare, capped)
 */
export interface SHPurchaseEvent {
  id: string
  eventName: string
  cycleId?: string
  startDate: Date
  endDate: Date
  rpPerSH?: number      // RP cost per 1 SH
  moneyPerSH?: number   // USD cost per 1 SH
  shCapPerPerson: number  // Max SH per member
  globalSHCap: number     // Total SH available
  shDistributed: number   // How much distributed so far
  fiscalRegularityRequired: boolean
  status: SHPurchaseEventStatus
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

/**
 * SH transaction
 */
export interface SHTransaction {
  id: string
  fromWallet?: string  // NULL for issuance
  toWallet?: string    // NULL for burns
  amount: number
  transactionType: SHTransactionType
  eventId?: string
  cycleId?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

// ==================================================
// Budget Tracking
// ==================================================

/**
 * Global budget fund types
 */
export type GlobalBudgetFundType =
  | 'infra'         // Infrastructure (servers, tools)
  | 'legal'         // Legal, compliance
  | 'platform_team' // Core contributors
  | 'solidarity'    // Bootstrap grants, crisis support

/**
 * City budget fund types
 */
export type CityBudgetFundType =
  | 'local'  // Recurring costs, meetups, outreach
  | 'event'  // Specific events and campaigns

/**
 * Donor badge tier
 */
export type DonorTier = 'bronze' | 'silver' | 'gold' | 'platinum'

/**
 * Global budget
 */
export interface GlobalBudget {
  id: string
  fundType: GlobalBudgetFundType
  balanceUSD: number
  totalAllocatedUSD: number
  totalSpentUSD: number
  currency: string
  createdAt: Date
  updatedAt: Date
}

/**
 * City budget
 */
export interface CityBudget {
  id: string
  cityId: string
  fundType: CityBudgetFundType
  balanceUSD: number
  totalAllocatedUSD: number
  totalSpentUSD: number
  currency: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Membership fee record
 */
export interface MembershipFee {
  id: string
  memberId: string
  paymentDate: string  // YYYY-MM-DD
  amountUSD: number
  currency: string
  rpGranted: number
  allocationSplit: Record<string, number>  // {"global_infra": 0.5, "local_city": 0.3, "solidarity": 0.2}
  paymentMethod?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

/**
 * Donation record
 */
export interface Donation {
  id: string
  donorId?: string  // NULL if anonymous
  amountUSD: number
  currency: string
  rpGranted?: number  // NULL if donor not a member
  campaignId?: string
  tier?: DonorTier
  allocationSplit: Record<string, number>
  paymentMethod?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

// ==================================================
// Input Types
// ==================================================

/**
 * Input for earning RP from contribution
 */
export interface EarnRPFromContributionInput {
  memberId: string
  eventType: RewardEventType
  rpAmount: number
  source: string
  metadata?: Record<string, unknown>
}

/**
 * Input for converting RP to TBC
 */
export interface ConvertRPToTBCInput {
  memberId: string
  rpAmount: number
  conversionMonth: string  // YYYY-MM-DD
}

/**
 * Input for creating timebank transaction
 */
export interface CreateTimebankTransactionInput {
  providerId: string
  receiverId: string
  serviceId?: string
  serviceDescription: string
  tbcCost: number
  hourlyRate?: number
  hoursProvided?: number
  metadata?: Record<string, unknown>
}

/**
 * Input for creating timebank service
 */
export interface CreateTimebankServiceInput {
  memberId: string
  serviceType: string
  title: string
  description?: string
  tbcPerHour: number
  availability?: string
  locationPreference?: 'remote' | 'in_person' | 'both'
  cityId?: string
}

/**
 * Input for purchasing SH with RP
 */
export interface PurchaseSHWithRPInput {
  memberId: string
  eventId: string
  rpAmount: number
  shAmount: number
}

/**
 * Input for recording membership fee
 */
export interface RecordMembershipFeeInput {
  memberId: string
  paymentDate: string
  amountUSD: number
  currency: string
  rpGranted: number
  allocationSplit: Record<string, number>
  paymentMethod?: string
  metadata?: Record<string, unknown>
}

/**
 * Input for recording donation
 */
export interface RecordDonationInput {
  donorId?: string
  amountUSD: number
  currency: string
  rpGranted?: number
  campaignId?: string
  tier?: DonorTier
  allocationSplit: Record<string, number>
  paymentMethod?: string
  metadata?: Record<string, unknown>
}
