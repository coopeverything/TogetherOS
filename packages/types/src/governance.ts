// packages/types/src/governance.ts
// TogetherOS Governance Module - Core Entity Definitions

/**
 * Proposal scope type (individual OR group)
 */
export type ProposalScopeType = 'individual' | 'group'

/**
 * Proposal status through governance workflow
 */
export type ProposalStatus =
  | 'draft'          // Being written
  | 'research'       // Gathering evidence/options
  | 'deliberation'   // Discussion phase
  | 'voting'         // Decision in progress
  | 'decided'        // Outcome reached
  | 'delivery'       // Being implemented
  | 'reviewed'       // Post-implementation review
  | 'archived'       // Closed/historical

/**
 * Decision outcome types
 */
export type DecisionOutcome = 'approved' | 'rejected' | 'amended'

/**
 * Position stance types
 */
export type PositionStance = 'support' | 'oppose' | 'abstain' | 'block'

/**
 * Evidence type classifications
 */
export type EvidenceType = 'research' | 'data' | 'expert' | 'precedent'

/**
 * Regulation status types
 */
export type RegulationStatus = 'active' | 'superseded' | 'repealed'

/**
 * Regulation scope type (global or group-specific)
 */
export type RegulationScopeType = 'global' | 'group'

/**
 * Bridge AI conflict severity levels
 */
export type ConflictSeverity = 'blocker' | 'warning' | 'info'

/**
 * Core proposal entity
 * Represents a governance proposal (individual or group-scoped)
 */
export interface Proposal {
  /** Unique identifier (UUID v4) */
  id: string

  /** Scope type: individual or group */
  scopeType: ProposalScopeType

  /** Scope ID: user.id (if individual) OR group.id (if group) */
  scopeId: string

  /** Author ID (always an individual user) */
  authorId: string

  /** Proposal title (3-200 chars) */
  title: string

  /** Proposal summary (10-2000 chars) */
  summary: string

  /** Governance workflow status */
  status: ProposalStatus

  /** Evidence array (research, data, expert opinions) */
  evidence: ProposalEvidence[]

  /** Options array (alternatives with trade-offs) */
  options: Option[]

  /** Positions array (member stances with reasoning) */
  positions: Position[]

  /** Minority report (codified objections) */
  minorityReport?: string

  /** Decision timestamp */
  decidedAt?: Date

  /** Decision outcome */
  decisionOutcome?: DecisionOutcome

  /** Bridge similarity check completed */
  bridgeSimilarityCheckDone: boolean

  /** Similar proposals detected by Bridge */
  bridgeSimilarProposals: SimilarityMatch[]

  /** Regulation conflicts detected by Bridge */
  bridgeRegulationConflicts: RegulationConflict[]

  /** Bridge clarification thread ID */
  bridgeClarificationThreadId?: string

  /** Creation timestamp */
  createdAt: Date

  /** Last modification timestamp */
  updatedAt: Date

  /** Soft delete timestamp */
  deletedAt?: Date
}

/**
 * Proposal Evidence entity
 * Research, data, expert opinions supporting proposals
 */
export interface ProposalEvidence {
  /** Unique identifier (UUID v4) */
  id: string

  /** Proposal this evidence belongs to */
  proposalId: string

  /** Evidence type classification */
  type: EvidenceType

  /** Evidence title */
  title: string

  /** Optional URL to source */
  url?: string

  /** Summary of evidence */
  summary: string

  /** Member who attached this evidence */
  attachedBy: string

  /** When evidence was attached */
  attachedAt: Date
}

/**
 * Option entity
 * Alternative approaches with trade-off analysis
 */
export interface Option {
  /** Unique identifier (UUID v4) */
  id: string

  /** Proposal this option belongs to */
  proposalId: string

  /** Option title */
  title: string

  /** Detailed description */
  description: string

  /** Trade-off analysis */
  tradeoffs: Tradeoff[]

  /** Estimated cost (optional) */
  estimatedCost?: number

  /** Estimated time (optional, e.g., "3 months") */
  estimatedTime?: string

  /** Member who proposed this option */
  proposedBy: string

  /** When option was proposed */
  proposedAt: Date
}

/**
 * Tradeoff entity
 * Pros and cons for an option
 */
export interface Tradeoff {
  /** Aspect being analyzed (e.g., "Cost", "Time", "Impact") */
  aspect: string

  /** Positive considerations */
  pro: string

  /** Negative considerations */
  con: string
}

/**
 * Position entity
 * Member stance on a proposal with reasoning
 */
export interface Position {
  /** Unique identifier (UUID v4) */
  id: string

  /** Proposal this position is for */
  proposalId: string

  /** Member who holds this position */
  memberId: string

  /** Position stance */
  stance: PositionStance

  /** Reasoning for this stance */
  reasoning: string

  /** Whether this is a minority position to be preserved */
  isMinority: boolean

  /** When position was recorded */
  recordedAt: Date
}

/**
 * Regulation entity
 * Implemented policies/rules for Bridge to check against
 */
export interface Regulation {
  /** Unique identifier (UUID v4) */
  id: string

  /** Regulation title (3-200 chars) */
  title: string

  /** Full description */
  description: string

  /** Category for organization */
  category?: string

  /** Source proposal ID (if regulation came from a proposal) */
  sourceProposalId?: string

  /** When regulation was implemented */
  implementedAt: Date

  /** Complete regulation text for Bridge analysis */
  fullText: string

  /** Scope type: global or group-specific */
  scopeType: RegulationScopeType

  /** Scope ID: null for global, group.id for group-specific */
  scopeId?: string

  /** Regulation status */
  status: RegulationStatus

  /** Link to newer regulation that supersedes this one */
  supersededBy?: string

  /** Creation timestamp */
  createdAt: Date

  /** Last modification timestamp */
  updatedAt: Date
}

/**
 * Similarity match from Bridge AI
 * Detected similar proposals
 */
export interface SimilarityMatch {
  /** Proposal ID */
  id: string

  /** Proposal title */
  title: string

  /** Proposal status */
  status: ProposalStatus

  /** Similarity score (0.0 - 1.0) */
  similarity: number

  /** Scope type */
  scopeType: ProposalScopeType

  /** Scope ID */
  scopeId: string

  /** Optional summary for context */
  summary?: string
}

/**
 * Regulation conflict from Bridge AI
 * Detected conflicts between proposal and regulations
 */
export interface RegulationConflict {
  /** Regulation ID */
  regulationId: string

  /** Regulation title */
  regulationTitle: string

  /** AI-generated conflict description */
  conflictDescription: string

  /** Conflict severity level */
  severity: ConflictSeverity

  /** Optional suggested amendment to resolve conflict */
  suggestedAmendment?: string
}

/**
 * Conversation thread for Bridge clarification
 * Dialogue between member and Bridge AI
 */
export interface ConversationThread {
  /** Unique identifier (UUID v4) */
  id: string

  /** Proposal this conversation is about */
  proposalId: string

  /** Messages in the conversation */
  messages: ConversationMessage[]

  /** Thread status */
  status: 'active' | 'resolved' | 'abandoned'

  /** Resolution type (if resolved) */
  resolution?: 'modified' | 'proceeded_anyway' | 'withdrawn'
}

/**
 * Conversation message
 * Single message in a Bridge clarification thread
 */
export interface ConversationMessage {
  /** Message sender role */
  role: 'bridge' | 'user'

  /** Message content */
  content: string

  /** Message timestamp */
  timestamp: Date

  /** Optional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Phrasing suggestion from Bridge AI
 * Suggestions to improve proposal clarity
 */
export interface PhrasingSuggestion {
  /** Field being suggested for (title or summary) */
  field: 'title' | 'summary'

  /** Original text */
  originalText: string

  /** Suggested improved text */
  suggestedText: string

  /** Reasoning for suggestion */
  reasoning: string

  /** Confidence score (0.0 - 1.0) */
  confidence: number

  /** Whether user accepted this suggestion */
  accepted?: boolean
}
