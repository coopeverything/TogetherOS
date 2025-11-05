// packages/validators/src/governance.ts
// TogetherOS Governance Module - Zod Validation Schemas

import { z } from 'zod'
import type {
  ProposalScopeType,
  ProposalStatus,
  DecisionOutcome,
  PositionStance,
  EvidenceType,
  RegulationStatus,
  RegulationScopeType,
  ConflictSeverity,
} from '@togetheros/types/governance'

/**
 * Proposal scope type enum schema
 */
export const proposalScopeTypeSchema = z.enum(['individual', 'group'])

/**
 * Proposal status enum schema
 */
export const proposalStatusSchema = z.enum([
  'draft',
  'research',
  'deliberation',
  'voting',
  'decided',
  'delivery',
  'reviewed',
  'archived',
])

/**
 * Decision outcome enum schema
 */
export const decisionOutcomeSchema = z.enum(['approved', 'rejected', 'amended'])

/**
 * Position stance enum schema
 */
export const positionStanceSchema = z.enum(['support', 'oppose', 'abstain', 'block'])

/**
 * Evidence type enum schema
 */
export const evidenceTypeSchema = z.enum(['research', 'data', 'expert', 'precedent'])

/**
 * Regulation status enum schema
 */
export const regulationStatusSchema = z.enum(['active', 'superseded', 'repealed'])

/**
 * Regulation scope type enum schema
 */
export const regulationScopeTypeSchema = z.enum(['global', 'group'])

/**
 * Conflict severity enum schema
 */
export const conflictSeveritySchema = z.enum(['blocker', 'warning', 'info'])

/**
 * Create proposal input schema
 * Validates input for creating new proposals
 */
export const createProposalSchema = z.object({
  scopeType: proposalScopeTypeSchema,

  scopeId: z.string().min(1, 'Scope ID is required'),

  authorId: z.string().min(1, 'Author ID is required'),

  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),

  summary: z.string()
    .min(10, 'Summary must be at least 10 characters')
    .max(2000, 'Summary cannot exceed 2000 characters'),
}).refine(
  (data) => {
    // Individual proposals: scopeId should equal authorId
    if (data.scopeType === 'individual') {
      return data.scopeId === data.authorId
    }
    return true
  },
  {
    message: 'For individual proposals, scopeId must equal authorId',
    path: ['scopeId'],
  }
)

/**
 * Type inference from schema
 */
export type CreateProposalInput = z.infer<typeof createProposalSchema>

/**
 * Update proposal input schema
 */
export const updateProposalSchema = z.object({
  title: z.string()
    .min(3)
    .max(200)
    .optional(),

  summary: z.string()
    .min(10)
    .max(2000)
    .optional(),

  status: proposalStatusSchema.optional(),

  minorityReport: z.string()
    .max(5000, 'Minority report cannot exceed 5000 characters')
    .optional(),

  decisionOutcome: decisionOutcomeSchema.optional(),
})

/**
 * Type inference from schema
 */
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>

/**
 * List proposals filters schema
 */
export const listProposalsFiltersSchema = z.object({
  scopeType: proposalScopeTypeSchema.optional(),

  scopeId: z.string().optional(),

  status: proposalStatusSchema.optional(),

  authorId: z.string().optional(),

  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50),

  offset: z.number()
    .int()
    .min(0)
    .default(0),
})

/**
 * Type inference from schema
 */
export type ListProposalsFilters = z.infer<typeof listProposalsFiltersSchema>

/**
 * Tradeoff schema
 */
export const tradeoffSchema = z.object({
  aspect: z.string()
    .min(1, 'Aspect is required')
    .max(100, 'Aspect cannot exceed 100 characters'),

  pro: z.string()
    .min(1, 'Pro description is required')
    .max(500, 'Pro description cannot exceed 500 characters'),

  con: z.string()
    .min(1, 'Con description is required')
    .max(500, 'Con description cannot exceed 500 characters'),
})

/**
 * Add evidence input schema
 */
export const addEvidenceSchema = z.object({
  proposalId: z.string().min(1),

  type: evidenceTypeSchema,

  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),

  url: z.string().url('Invalid URL format').optional(),

  summary: z.string()
    .min(10, 'Summary must be at least 10 characters')
    .max(1000, 'Summary cannot exceed 1000 characters'),

  attachedBy: z.string().min(1, 'Attached by is required'),
})

/**
 * Type inference from schema
 */
export type AddEvidenceInput = z.infer<typeof addEvidenceSchema>

/**
 * Add option input schema
 */
export const addOptionSchema = z.object({
  proposalId: z.string().min(1),

  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),

  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),

  tradeoffs: z.array(tradeoffSchema)
    .min(1, 'At least one tradeoff is required'),

  estimatedCost: z.number().nonnegative().optional(),

  estimatedTime: z.string()
    .max(100, 'Estimated time cannot exceed 100 characters')
    .optional(),

  proposedBy: z.string().min(1, 'Proposed by is required'),
})

/**
 * Type inference from schema
 */
export type AddOptionInput = z.infer<typeof addOptionSchema>

/**
 * Add position input schema
 */
export const addPositionSchema = z.object({
  proposalId: z.string().min(1),

  memberId: z.string().min(1, 'Member ID is required'),

  stance: positionStanceSchema,

  reasoning: z.string()
    .min(10, 'Reasoning must be at least 10 characters')
    .max(2000, 'Reasoning cannot exceed 2000 characters'),

  isMinority: z.boolean().default(false),
})

/**
 * Type inference from schema
 */
export type AddPositionInput = z.infer<typeof addPositionSchema>

/**
 * Create regulation input schema
 */
export const createRegulationSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),

  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),

  category: z.string()
    .max(100, 'Category cannot exceed 100 characters')
    .optional(),

  sourceProposalId: z.string().optional(),

  fullText: z.string()
    .min(10, 'Full text must be at least 10 characters'),

  scopeType: regulationScopeTypeSchema,

  scopeId: z.string().optional(),
}).refine(
  (data) => {
    // Global regulations: scopeId must be null/undefined
    // Group regulations: scopeId must be provided
    if (data.scopeType === 'global') {
      return !data.scopeId
    }
    return !!data.scopeId
  },
  {
    message: 'Global regulations cannot have scopeId; group regulations must have scopeId',
    path: ['scopeId'],
  }
)

/**
 * Type inference from schema
 */
export type CreateRegulationInput = z.infer<typeof createRegulationSchema>

/**
 * Update regulation input schema
 */
export const updateRegulationSchema = z.object({
  title: z.string()
    .min(3)
    .max(200)
    .optional(),

  description: z.string()
    .min(10)
    .max(5000)
    .optional(),

  category: z.string()
    .max(100)
    .optional(),

  fullText: z.string()
    .min(10)
    .optional(),

  status: regulationStatusSchema.optional(),

  supersededBy: z.string().optional(),
})

/**
 * Type inference from schema
 */
export type UpdateRegulationInput = z.infer<typeof updateRegulationSchema>

/**
 * List regulations filters schema
 */
export const listRegulationsFiltersSchema = z.object({
  scopeType: regulationScopeTypeSchema.optional(),

  scopeId: z.string().optional(),

  status: regulationStatusSchema.optional(),

  category: z.string().optional(),

  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50),

  offset: z.number()
    .int()
    .min(0)
    .default(0),
})

/**
 * Type inference from schema
 */
export type ListRegulationsFilters = z.infer<typeof listRegulationsFiltersSchema>

/**
 * Similarity match schema (for Bridge AI)
 */
export const similarityMatchSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: proposalStatusSchema,
  similarity: z.number().min(0).max(1),
  scopeType: proposalScopeTypeSchema,
  scopeId: z.string(),
  summary: z.string().optional(),
})

/**
 * Regulation conflict schema (for Bridge AI)
 */
export const regulationConflictSchema = z.object({
  regulationId: z.string(),
  regulationTitle: z.string(),
  conflictDescription: z.string(),
  severity: conflictSeveritySchema,
  suggestedAmendment: z.string().optional(),
})

/**
 * Conversation message schema
 */
export const conversationMessageSchema = z.object({
  role: z.enum(['bridge', 'user']),
  content: z.string().min(1),
  timestamp: z.coerce.date(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Phrasing suggestion schema (for Bridge AI)
 */
export const phrasingSuggestionSchema = z.object({
  field: z.enum(['title', 'summary']),
  originalText: z.string(),
  suggestedText: z.string(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  accepted: z.boolean().optional(),
})

/**
 * Full proposal schema (for validation of complete proposals)
 */
export const proposalSchema = z.object({
  id: z.string(),
  scopeType: proposalScopeTypeSchema,
  scopeId: z.string(),
  authorId: z.string(),
  title: z.string(),
  summary: z.string(),
  status: proposalStatusSchema,
  evidence: z.array(z.any()).default([]),
  options: z.array(z.any()).default([]),
  positions: z.array(z.any()).default([]),
  minorityReport: z.string().optional(),
  decidedAt: z.coerce.date().optional(),
  decisionOutcome: decisionOutcomeSchema.optional(),
  bridgeSimilarityCheckDone: z.boolean(),
  bridgeSimilarProposals: z.array(similarityMatchSchema).default([]),
  bridgeRegulationConflicts: z.array(regulationConflictSchema).default([]),
  bridgeClarificationThreadId: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().optional(),
})

/**
 * Full regulation schema (for validation of complete regulations)
 */
export const regulationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string().optional(),
  sourceProposalId: z.string().optional(),
  implementedAt: z.coerce.date(),
  fullText: z.string(),
  scopeType: regulationScopeTypeSchema,
  scopeId: z.string().optional(),
  status: regulationStatusSchema,
  supersededBy: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
