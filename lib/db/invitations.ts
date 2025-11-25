// lib/db/invitations.ts
// Invitation database operations for gamification module

import db from '@togetheros/db'
import type {
  InvitationRecord,
  Invitation,
  SendInvitationInput,
  AcceptInvitationInput,
  InvitationStats,
  InvitationStatus,
} from '@togetheros/types'
import {
  INVITATION_LIMITS,
  INVITATION_REWARDS,
  INVITATION_QUALITY_THRESHOLDS,
} from '@togetheros/types'
import { earnRewardPoints } from './reward-points'

/**
 * Send a new invitation
 * Awards Stage 1 RP (+25) immediately
 */
export async function sendInvitation(input: SendInvitationInput): Promise<InvitationRecord> {
  const { inviterId, inviteeEmail, groupId, expirationDays = INVITATION_LIMITS.EXPIRATION_DAYS } = input

  // Check weekly limit
  const stats = await getInvitationStats(inviterId)
  if (stats.sentThisWeek >= stats.weeklyLimit) {
    throw new Error(`Weekly invitation limit reached (${stats.weeklyLimit}/week)`)
  }

  const client = await db.getClient()

  try {
    await client.query('BEGIN')

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expirationDays)

    // Create invitation
    const result = await client.query(
      `INSERT INTO gamification_invitations
         (inviter_id, invitee_email, group_id, expires_at, rp_awarded_stage_1)
       VALUES ($1, $2, $3, $4, true)
       RETURNING
         id,
         inviter_id as "inviterId",
         invitee_email as "inviteeEmail",
         invitee_member_id as "inviteeMemberId",
         group_id as "groupId",
         status,
         sent_at as "sentAt",
         accepted_at as "acceptedAt",
         expires_at as "expiresAt",
         rp_awarded_stage_1 as "rpAwardedStage1",
         rp_awarded_stage_2 as "rpAwardedStage2",
         rp_awarded_stage_3 as "rpAwardedStage3",
         created_at as "createdAt"`,
      [inviterId, inviteeEmail, groupId, expiresAt]
    )

    const invitation = result.rows[0]

    // Award Stage 1 RP (+25)
    await earnRewardPoints({
      memberId: inviterId,
      eventType: 'invitation_sent',
      rpAmount: INVITATION_REWARDS.STAGE_1_SENT,
      source: 'gamification',
      metadata: { invitationId: invitation.id, groupId },
    })

    await client.query('COMMIT')

    return invitation
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Accept an invitation
 * Awards Stage 2 RP: +50 to inviter, +100 to invitee
 */
export async function acceptInvitation(input: AcceptInvitationInput): Promise<InvitationRecord> {
  const { invitationId, inviteeMemberId } = input

  const client = await db.getClient()

  try {
    await client.query('BEGIN')

    // Update invitation
    const result = await client.query(
      `UPDATE gamification_invitations
       SET status = 'accepted',
           accepted_at = NOW(),
           invitee_member_id = $2,
           rp_awarded_stage_2 = true
       WHERE id = $1 AND status = 'pending'
       RETURNING
         id,
         inviter_id as "inviterId",
         invitee_email as "inviteeEmail",
         invitee_member_id as "inviteeMemberId",
         group_id as "groupId",
         status,
         sent_at as "sentAt",
         accepted_at as "acceptedAt",
         expires_at as "expiresAt",
         rp_awarded_stage_1 as "rpAwardedStage1",
         rp_awarded_stage_2 as "rpAwardedStage2",
         rp_awarded_stage_3 as "rpAwardedStage3",
         created_at as "createdAt"`,
      [invitationId, inviteeMemberId]
    )

    if (result.rows.length === 0) {
      throw new Error('Invitation not found or already processed')
    }

    const invitation = result.rows[0]

    // Award Stage 2 RP to inviter (+50)
    await earnRewardPoints({
      memberId: invitation.inviterId,
      eventType: 'invitation_accepted',
      rpAmount: INVITATION_REWARDS.STAGE_2_ACCEPTED_INVITER,
      source: 'gamification',
      metadata: { invitationId, inviteeMemberId },
    })

    // Award Stage 2 RP to invitee (+100)
    await earnRewardPoints({
      memberId: inviteeMemberId,
      eventType: 'invitation_accepted',
      rpAmount: INVITATION_REWARDS.STAGE_2_ACCEPTED_INVITEE,
      source: 'gamification',
      metadata: { invitationId, inviterId: invitation.inviterId },
    })

    await client.query('COMMIT')

    return invitation
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Record first contribution by invitee
 * Awards Stage 3 RP: +25 to inviter
 */
export async function recordFirstContribution(inviteeMemberId: string): Promise<void> {
  const client = await db.getClient()

  try {
    await client.query('BEGIN')

    // Find invitation where this member was the invitee and Stage 3 not yet awarded
    const result = await client.query(
      `UPDATE gamification_invitations
       SET rp_awarded_stage_3 = true
       WHERE invitee_member_id = $1
         AND status = 'accepted'
         AND rp_awarded_stage_3 = false
       RETURNING inviter_id as "inviterId", id`,
      [inviteeMemberId]
    )

    if (result.rows.length > 0) {
      const { inviterId, id: invitationId } = result.rows[0]

      // Award Stage 3 RP to inviter (+25)
      await earnRewardPoints({
        memberId: inviterId,
        eventType: 'invitation_contributed',
        rpAmount: INVITATION_REWARDS.STAGE_3_CONTRIBUTED,
        source: 'gamification',
        metadata: { invitationId, inviteeMemberId },
      })
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Get invitation by ID with joined data
 */
export async function getInvitation(invitationId: string): Promise<Invitation | null> {
  const result = await db.query(
    `SELECT
       i.id,
       i.inviter_id as "inviterId",
       i.invitee_email as "inviteeEmail",
       i.invitee_member_id as "inviteeMemberId",
       i.group_id as "groupId",
       i.status,
       i.sent_at as "sentAt",
       i.accepted_at as "acceptedAt",
       i.expires_at as "expiresAt",
       i.rp_awarded_stage_1 as "rpAwardedStage1",
       i.rp_awarded_stage_2 as "rpAwardedStage2",
       i.rp_awarded_stage_3 as "rpAwardedStage3",
       i.created_at as "createdAt",
       u.name as "inviterName",
       u.email as "inviterEmail",
       g.name as "groupName",
       g.city as "groupLocation"
     FROM gamification_invitations i
     INNER JOIN users u ON u.id = i.inviter_id
     INNER JOIN groups g ON g.id = i.group_id
     WHERE i.id = $1`,
    [invitationId]
  )

  return result.rows[0] || null
}

/**
 * Get invitations sent by a user
 */
export async function getInvitationsByInviter(
  inviterId: string,
  status?: InvitationStatus
): Promise<Invitation[]> {
  const statusClause = status ? 'AND i.status = $2' : ''
  const params = status ? [inviterId, status] : [inviterId]

  const result = await db.query(
    `SELECT
       i.id,
       i.inviter_id as "inviterId",
       i.invitee_email as "inviteeEmail",
       i.invitee_member_id as "inviteeMemberId",
       i.group_id as "groupId",
       i.status,
       i.sent_at as "sentAt",
       i.accepted_at as "acceptedAt",
       i.expires_at as "expiresAt",
       i.rp_awarded_stage_1 as "rpAwardedStage1",
       i.rp_awarded_stage_2 as "rpAwardedStage2",
       i.rp_awarded_stage_3 as "rpAwardedStage3",
       i.created_at as "createdAt",
       g.name as "groupName",
       g.city as "groupLocation"
     FROM gamification_invitations i
     INNER JOIN groups g ON g.id = i.group_id
     WHERE i.inviter_id = $1 ${statusClause}
     ORDER BY i.sent_at DESC`,
    params
  )

  return result.rows
}

/**
 * Get invitation statistics for a user
 */
export async function getInvitationStats(inviterId: string): Promise<InvitationStats> {
  const result = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE true) as "totalSent",
       COUNT(*) FILTER (WHERE status = 'accepted') as "totalAccepted",
       COUNT(*) FILTER (WHERE rp_awarded_stage_3 = true) as "totalContributed",
       COUNT(*) FILTER (WHERE sent_at > NOW() - INTERVAL '7 days') as "sentThisWeek"
     FROM gamification_invitations
     WHERE inviter_id = $1`,
    [inviterId]
  )

  const { totalSent, totalAccepted, totalContributed, sentThisWeek } = result.rows[0]

  // Calculate quality score (% of invites that become active members)
  const qualityScore = totalSent > 0
    ? Math.round((parseInt(totalContributed) / parseInt(totalSent)) * 100) / 100
    : 1 // New users start with 100% quality

  return {
    totalSent: parseInt(totalSent),
    totalAccepted: parseInt(totalAccepted),
    totalContributed: parseInt(totalContributed),
    qualityScore,
    sentThisWeek: parseInt(sentThisWeek),
    weeklyLimit: INVITATION_LIMITS.WEEKLY_MAX,
  }
}

/**
 * Check if user has invite privileges (quality score above suspension threshold)
 */
export async function hasInvitePrivileges(inviterId: string): Promise<boolean> {
  const stats = await getInvitationStats(inviterId)

  // New users (< 5 invites) always have privileges
  if (stats.totalSent < 5) return true

  return stats.qualityScore >= INVITATION_QUALITY_THRESHOLDS.SUSPENSION
}

/**
 * Expire pending invitations past their expiration date
 */
export async function expirePendingInvitations(): Promise<number> {
  const result = await db.query(
    `UPDATE gamification_invitations
     SET status = 'expired'
     WHERE status = 'pending' AND expires_at < NOW()
     RETURNING id`
  )

  return result.rows.length
}

/**
 * Decline an invitation
 */
export async function declineInvitation(invitationId: string): Promise<InvitationRecord> {
  const result = await db.query(
    `UPDATE gamification_invitations
     SET status = 'declined'
     WHERE id = $1 AND status = 'pending'
     RETURNING
       id,
       inviter_id as "inviterId",
       invitee_email as "inviteeEmail",
       invitee_member_id as "inviteeMemberId",
       group_id as "groupId",
       status,
       sent_at as "sentAt",
       accepted_at as "acceptedAt",
       expires_at as "expiresAt",
       rp_awarded_stage_1 as "rpAwardedStage1",
       rp_awarded_stage_2 as "rpAwardedStage2",
       rp_awarded_stage_3 as "rpAwardedStage3",
       created_at as "createdAt"`,
    [invitationId]
  )

  if (result.rows.length === 0) {
    throw new Error('Invitation not found or already processed')
  }

  return result.rows[0]
}
