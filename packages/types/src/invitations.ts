/**
 * Invitation type definitions for gamification module
 * Based on docs/modules/gamification.md
 */

/**
 * Invitation status values
 */
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'declined'

/**
 * Database record for gamification_invitations table
 */
export interface InvitationRecord {
  id: string
  inviterId: string
  inviteeEmail: string
  inviteeMemberId: string | null
  groupId: string
  status: InvitationStatus
  sentAt: Date
  acceptedAt: Date | null
  expiresAt: Date
  rpAwardedStage1: boolean
  rpAwardedStage2: boolean
  rpAwardedStage3: boolean
  createdAt: Date
}

/**
 * Invitation with computed/joined fields for display
 */
export interface Invitation extends InvitationRecord {
  inviterName?: string
  inviterEmail?: string
  groupName?: string
  groupLocation?: string
}

/**
 * Input for sending a new invitation
 */
export interface SendInvitationInput {
  inviterId: string
  inviteeEmail: string
  groupId: string
  /** Days until expiration (default: 7) */
  expirationDays?: number
}

/**
 * Input for accepting an invitation
 */
export interface AcceptInvitationInput {
  invitationId: string
  inviteeMemberId: string
}

/**
 * Invitation statistics for quality tracking
 */
export interface InvitationStats {
  /** Total invitations sent */
  totalSent: number
  /** Invitations that were accepted */
  totalAccepted: number
  /** Invitees who made at least one contribution */
  totalContributed: number
  /** Quality score (% of invites that become active members) */
  qualityScore: number
  /** Invitations sent this week */
  sentThisWeek: number
  /** Weekly limit (default: 5) */
  weeklyLimit: number
}

/**
 * Invitation quality thresholds
 */
export const INVITATION_QUALITY_THRESHOLDS = {
  /** Low quality triggers warning */
  WARNING: 0.3,
  /** Very low quality triggers temp suspension */
  SUSPENSION: 0.2,
  /** Good quality (target) */
  GOOD: 0.6,
} as const

/**
 * Invitation reward amounts (in RP)
 */
export const INVITATION_REWARDS = {
  /** Stage 1: Invitation sent */
  STAGE_1_SENT: 25,
  /** Stage 2: Invitation accepted (inviter bonus) */
  STAGE_2_ACCEPTED_INVITER: 50,
  /** Stage 2: Invitation accepted (invitee starting balance) */
  STAGE_2_ACCEPTED_INVITEE: 100,
  /** Stage 3: First contribution (inviter bonus) */
  STAGE_3_CONTRIBUTED: 25,
} as const

/**
 * Invitation limits
 */
export const INVITATION_LIMITS = {
  /** Max invitations per week */
  WEEKLY_MAX: 5,
  /** Days until invitation expires */
  EXPIRATION_DAYS: 7,
  /** Min profile completion for invitee (%) */
  MIN_PROFILE_COMPLETION: 50,
} as const
