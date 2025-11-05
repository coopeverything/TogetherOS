// apps/api/src/modules/governance/entities/Proposal.ts
// Domain entity for Proposal - Pure business logic

import type {
  Proposal as ProposalType,
  ProposalScopeType,
  ProposalStatus,
  DecisionOutcome,
} from '@togetheros/types/governance'
import { proposalSchema } from '@togetheros/validators/governance'
import { v4 as uuidv4 } from 'uuid'

/**
 * Proposal entity
 * Represents a governance proposal with business logic
 */
export class Proposal {
  private constructor(
    public readonly id: string,
    public readonly scopeType: ProposalScopeType,
    public readonly scopeId: string,
    public readonly authorId: string,
    public readonly title: string,
    public readonly summary: string,
    public readonly status: ProposalStatus,
    public readonly minorityReport: string | undefined,
    public readonly decidedAt: Date | undefined,
    public readonly decisionOutcome: DecisionOutcome | undefined,
    public readonly bridgeSimilarityCheckDone: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | undefined
  ) {}

  /**
   * Factory: Create new proposal
   */
  static create(input: {
    scopeType: ProposalScopeType
    scopeId: string
    authorId: string
    title: string
    summary: string
  }): Proposal {
    const now = new Date()
    const id = uuidv4()

    // Validate scope consistency
    if (input.scopeType === 'individual' && input.scopeId !== input.authorId) {
      throw new Error('Individual proposals must have scopeId equal to authorId')
    }

    const proposalData: ProposalType = {
      id,
      scopeType: input.scopeType,
      scopeId: input.scopeId,
      authorId: input.authorId,
      title: input.title,
      summary: input.summary,
      status: 'draft',
      evidence: [],
      options: [],
      positions: [],
      bridgeSimilarityCheckDone: false,
      bridgeSimilarProposals: [],
      bridgeRegulationConflicts: [],
      createdAt: now,
      updatedAt: now,
    }

    const validated = proposalSchema.parse(proposalData)

    return new Proposal(
      validated.id,
      validated.scopeType,
      validated.scopeId,
      validated.authorId,
      validated.title,
      validated.summary,
      validated.status,
      validated.minorityReport,
      validated.decidedAt,
      validated.decisionOutcome,
      validated.bridgeSimilarityCheckDone,
      validated.createdAt,
      validated.updatedAt,
      validated.deletedAt
    )
  }

  /**
   * Factory: Reconstitute from storage
   */
  static fromData(data: ProposalType): Proposal {
    const validated = proposalSchema.parse(data)

    return new Proposal(
      validated.id,
      validated.scopeType,
      validated.scopeId,
      validated.authorId,
      validated.title,
      validated.summary,
      validated.status,
      validated.minorityReport,
      validated.decidedAt,
      validated.decisionOutcome,
      validated.bridgeSimilarityCheckDone,
      validated.createdAt,
      validated.updatedAt,
      validated.deletedAt
    )
  }

  /**
   * Update proposal fields (returns new instance - immutable)
   */
  update(changes: {
    title?: string
    summary?: string
    status?: ProposalStatus
    minorityReport?: string
    decisionOutcome?: DecisionOutcome
  }): Proposal {
    const now = new Date()

    const updatedData: ProposalType = {
      id: this.id,
      scopeType: this.scopeType,
      scopeId: this.scopeId,
      authorId: this.authorId,
      title: changes.title ?? this.title,
      summary: changes.summary ?? this.summary,
      status: changes.status ?? this.status,
      evidence: [],
      options: [],
      positions: [],
      minorityReport: changes.minorityReport ?? this.minorityReport,
      decidedAt: changes.status === 'decided' ? now : this.decidedAt,
      decisionOutcome: changes.decisionOutcome ?? this.decisionOutcome,
      bridgeSimilarityCheckDone: this.bridgeSimilarityCheckDone,
      bridgeSimilarProposals: [],
      bridgeRegulationConflicts: [],
      createdAt: this.createdAt,
      updatedAt: now,
      deletedAt: this.deletedAt,
    }

    return Proposal.fromData(updatedData)
  }

  /**
   * Transition to next status (with validation)
   */
  transitionTo(newStatus: ProposalStatus): Proposal {
    const validTransitions: Record<ProposalStatus, ProposalStatus[]> = {
      draft: ['research', 'archived'],
      research: ['deliberation', 'draft', 'archived'],
      deliberation: ['voting', 'research', 'archived'],
      voting: ['decided', 'deliberation', 'archived'],
      decided: ['delivery', 'archived'],
      delivery: ['reviewed', 'archived'],
      reviewed: ['archived'],
      archived: [], // Cannot transition from archived
    }

    const allowed = validTransitions[this.status]
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${this.status} to ${newStatus}. Valid transitions: ${allowed.join(', ')}`
      )
    }

    return this.update({ status: newStatus })
  }

  /**
   * Soft delete
   */
  delete(): Proposal {
    const deletedData: ProposalType = {
      id: this.id,
      scopeType: this.scopeType,
      scopeId: this.scopeId,
      authorId: this.authorId,
      title: this.title,
      summary: this.summary,
      status: this.status,
      evidence: [],
      options: [],
      positions: [],
      minorityReport: this.minorityReport,
      decidedAt: this.decidedAt,
      decisionOutcome: this.decisionOutcome,
      bridgeSimilarityCheckDone: this.bridgeSimilarityCheckDone,
      bridgeSimilarProposals: [],
      bridgeRegulationConflicts: [],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: new Date(),
    }

    return Proposal.fromData(deletedData)
  }

  /**
   * Check if proposal is individual-scoped
   */
  isIndividual(): boolean {
    return this.scopeType === 'individual'
  }

  /**
   * Check if proposal is group-scoped
   */
  isGroup(): boolean {
    return this.scopeType === 'group'
  }

  /**
   * Check if proposal is editable (draft status)
   */
  isEditable(): boolean {
    return this.status === 'draft'
  }

  /**
   * Check if proposal is soft-deleted
   */
  isDeleted(): boolean {
    return this.deletedAt !== undefined
  }

  /**
   * Convert to plain object (for storage/API)
   */
  toJSON(): ProposalType {
    return {
      id: this.id,
      scopeType: this.scopeType,
      scopeId: this.scopeId,
      authorId: this.authorId,
      title: this.title,
      summary: this.summary,
      status: this.status,
      evidence: [],
      options: [],
      positions: [],
      minorityReport: this.minorityReport,
      decidedAt: this.decidedAt,
      decisionOutcome: this.decisionOutcome,
      bridgeSimilarityCheckDone: this.bridgeSimilarityCheckDone,
      bridgeSimilarProposals: [],
      bridgeRegulationConflicts: [],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    }
  }
}
