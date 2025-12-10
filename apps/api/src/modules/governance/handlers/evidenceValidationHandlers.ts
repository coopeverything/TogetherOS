/**
 * Evidence Validation Handlers
 * Business logic for evidence peer review and verification
 */

import type {
  EvidenceValidation,
  EvidenceValidationStatus,
  EvidenceDisputeReason,
  EvidenceModeratorReview,
} from '@togetheros/types';
import { v4 as uuidv4 } from 'uuid';
import { getProposalById, updateProposal } from '@togetheros/db';

// In-memory storage for MVP (will migrate to database later)
const validationStore = new Map<string, EvidenceValidation>();

const DEFAULT_VERIFY_THRESHOLD = 3;
const DEFAULT_DISPUTE_THRESHOLD = 2;

/**
 * Initialize validation for evidence
 */
export async function initializeValidation(evidenceId: string): Promise<EvidenceValidation> {
  const validation: EvidenceValidation = {
    id: uuidv4(),
    evidenceId,
    status: 'pending',
    verifyCount: 0,
    disputeCount: 0,
    verifyThreshold: DEFAULT_VERIFY_THRESHOLD,
    disputeThreshold: DEFAULT_DISPUTE_THRESHOLD,
    verifiers: [],
    disputers: [],
    disputeReasons: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  validationStore.set(evidenceId, validation);
  return validation;
}

/**
 * Get validation status for evidence
 */
export async function getValidation(evidenceId: string): Promise<EvidenceValidation | null> {
  return validationStore.get(evidenceId) || null;
}

/**
 * Verify evidence (add a verification vote)
 */
export async function verifyEvidence(
  evidenceId: string,
  memberId: string
): Promise<EvidenceValidation> {
  let validation = validationStore.get(evidenceId);

  if (!validation) {
    validation = await initializeValidation(evidenceId);
  }

  // Check if member already voted
  if (validation.verifiers.includes(memberId)) {
    throw new Error('You have already verified this evidence');
  }
  if (validation.disputers.includes(memberId)) {
    throw new Error('You have already disputed this evidence');
  }

  // Add verification
  validation.verifiers.push(memberId);
  validation.verifyCount++;
  validation.updatedAt = new Date();

  // Check if verification threshold met
  if (validation.verifyCount >= validation.verifyThreshold) {
    validation.status = 'verified';
  }

  validationStore.set(evidenceId, validation);
  return validation;
}

/**
 * Dispute evidence (add a dispute vote with reason)
 */
export async function disputeEvidence(
  evidenceId: string,
  memberId: string,
  category: EvidenceDisputeReason['category'],
  explanation: string
): Promise<EvidenceValidation> {
  let validation = validationStore.get(evidenceId);

  if (!validation) {
    validation = await initializeValidation(evidenceId);
  }

  // Check if member already voted
  if (validation.verifiers.includes(memberId)) {
    throw new Error('You have already verified this evidence');
  }
  if (validation.disputers.includes(memberId)) {
    throw new Error('You have already disputed this evidence');
  }

  // Add dispute
  validation.disputers.push(memberId);
  validation.disputeCount++;

  const disputeReason: EvidenceDisputeReason = {
    memberId,
    category,
    explanation,
    filedAt: new Date(),
  };
  validation.disputeReasons.push(disputeReason);
  validation.updatedAt = new Date();

  // Check if dispute threshold met
  if (validation.disputeCount >= validation.disputeThreshold) {
    validation.status = 'disputed';
  }

  validationStore.set(evidenceId, validation);
  return validation;
}

/**
 * Submit moderator review for disputed evidence
 */
export async function submitModeratorReview(
  evidenceId: string,
  moderatorId: string,
  decision: EvidenceModeratorReview['decision'],
  reasoning: string,
  action?: EvidenceModeratorReview['action']
): Promise<EvidenceValidation> {
  const validation = validationStore.get(evidenceId);

  if (!validation) {
    throw new Error('Validation record not found');
  }

  if (validation.status !== 'disputed') {
    throw new Error('Evidence is not in disputed status');
  }

  validation.moderatorReview = {
    moderatorId,
    decision,
    reasoning,
    action,
    reviewedAt: new Date(),
  };

  // Update status based on decision
  if (decision === 'verified') {
    validation.status = 'verified';
  } else if (decision === 'rejected') {
    validation.status = 'rejected';
  }
  // 'needs_update' keeps it in disputed until evidence is updated

  validation.updatedAt = new Date();
  validationStore.set(evidenceId, validation);

  return validation;
}

/**
 * Get all evidence awaiting validation for a proposal
 */
export async function getPendingValidations(proposalId: string): Promise<EvidenceValidation[]> {
  const proposal = await getProposalById(proposalId);
  if (!proposal) {
    return [];
  }

  const pendingValidations: EvidenceValidation[] = [];

  for (const evidence of proposal.evidence) {
    const validation = validationStore.get(evidence.id);
    if (validation && validation.status === 'pending') {
      pendingValidations.push(validation);
    }
  }

  return pendingValidations;
}

/**
 * Get all disputed evidence for moderator queue
 */
export async function getDisputedEvidence(): Promise<EvidenceValidation[]> {
  const disputed: EvidenceValidation[] = [];

  for (const validation of validationStore.values()) {
    if (validation.status === 'disputed' && !validation.moderatorReview) {
      disputed.push(validation);
    }
  }

  return disputed;
}

/**
 * Get validation statistics
 */
export async function getValidationStats(): Promise<{
  total: number;
  pending: number;
  verified: number;
  disputed: number;
  rejected: number;
}> {
  let pending = 0;
  let verified = 0;
  let disputed = 0;
  let rejected = 0;

  for (const validation of validationStore.values()) {
    switch (validation.status) {
      case 'pending':
        pending++;
        break;
      case 'verified':
        verified++;
        break;
      case 'disputed':
        disputed++;
        break;
      case 'rejected':
        rejected++;
        break;
    }
  }

  return {
    total: validationStore.size,
    pending,
    verified,
    disputed,
    rejected,
  };
}

/**
 * Check if member can vote on evidence
 */
export async function canMemberVote(
  evidenceId: string,
  memberId: string
): Promise<{ canVote: boolean; reason?: string }> {
  const validation = validationStore.get(evidenceId);

  if (!validation) {
    return { canVote: true };
  }

  if (validation.status === 'verified' || validation.status === 'rejected') {
    return { canVote: false, reason: 'Validation is already complete' };
  }

  if (validation.verifiers.includes(memberId)) {
    return { canVote: false, reason: 'You have already verified this evidence' };
  }

  if (validation.disputers.includes(memberId)) {
    return { canVote: false, reason: 'You have already disputed this evidence' };
  }

  return { canVote: true };
}
