// packages/validators/src/__tests__/governance.property.test.ts
// Property-based tests for governance validators using fast-check

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  createProposalSchema,
  proposalStatusSchema,
  proposalScopeTypeSchema,
  positionStanceSchema,
} from '../governance'

describe('Governance Validators - Property-Based Tests', () => {
  describe('proposalScopeTypeSchema', () => {
    it('should accept valid scope types', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('individual', 'group'),
          (scopeType: string) => {
            const result = proposalScopeTypeSchema.safeParse(scopeType)
            expect(result.success).toBe(true)
          }
        )
      )
    })

    it('should reject invalid scope types', () => {
      fc.assert(
        fc.property(
          fc.string().filter((s: string) => s !== 'individual' && s !== 'group'),
          (invalidScope: string) => {
            const result = proposalScopeTypeSchema.safeParse(invalidScope)
            expect(result.success).toBe(false)
          }
        )
      )
    })
  })

  describe('proposalStatusSchema', () => {
    const validStatuses = ['draft', 'research', 'deliberation', 'voting', 'decided', 'delivery', 'reviewed', 'archived'] as const

    it('should accept all valid proposal statuses', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...validStatuses),
          (status: string) => {
            const result = proposalStatusSchema.safeParse(status)
            expect(result.success).toBe(true)
          }
        )
      )
    })

    it('should reject invalid statuses', () => {
      fc.assert(
        fc.property(
          fc.string().filter((s: string) => !validStatuses.includes(s as typeof validStatuses[number])),
          (invalidStatus: string) => {
            const result = proposalStatusSchema.safeParse(invalidStatus)
            expect(result.success).toBe(false)
          }
        )
      )
    })
  })

  describe('positionStanceSchema', () => {
    const validStances = ['support', 'oppose', 'abstain', 'block'] as const

    it('should accept all valid position stances', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...validStances),
          (stance: string) => {
            const result = positionStanceSchema.safeParse(stance)
            expect(result.success).toBe(true)
          }
        )
      )
    })
  })

  describe('createProposalSchema', () => {
    // Custom arbitraries for proposal data
    const uuidArbitrary = fc.uuid()
    const titleArbitrary = fc.string({ minLength: 3, maxLength: 200 })
    const summaryArbitrary = fc.string({ minLength: 10, maxLength: 2000 })

    describe('valid proposals', () => {
      it('should accept valid individual proposals where scopeId equals authorId', () => {
        fc.assert(
          fc.property(
            uuidArbitrary,
            titleArbitrary,
            summaryArbitrary,
            (userId: string, title: string, summary: string) => {
              const proposal = {
                scopeType: 'individual' as const,
                scopeId: userId,
                authorId: userId, // Must equal scopeId for individual proposals
                title,
                summary,
              }
              const result = createProposalSchema.safeParse(proposal)
              expect(result.success).toBe(true)
            }
          )
        )
      })

      it('should accept valid group proposals', () => {
        fc.assert(
          fc.property(
            uuidArbitrary,
            uuidArbitrary,
            titleArbitrary,
            summaryArbitrary,
            (groupId: string, authorId: string, title: string, summary: string) => {
              const proposal = {
                scopeType: 'group' as const,
                scopeId: groupId,
                authorId,
                title,
                summary,
              }
              const result = createProposalSchema.safeParse(proposal)
              expect(result.success).toBe(true)
            }
          )
        )
      })
    })

    describe('invalid proposals', () => {
      it('should reject individual proposals where scopeId does not equal authorId', () => {
        fc.assert(
          fc.property(
            uuidArbitrary,
            uuidArbitrary.filter((id: string) => id !== ''),
            titleArbitrary,
            summaryArbitrary,
            (scopeId: string, authorId: string, title: string, summary: string) => {
              fc.pre(scopeId !== authorId) // Only test cases where they differ

              const proposal = {
                scopeType: 'individual' as const,
                scopeId,
                authorId,
                title,
                summary,
              }
              const result = createProposalSchema.safeParse(proposal)
              expect(result.success).toBe(false)
              if (!result.success) {
                expect(result.error.issues[0].message).toContain('scopeId must equal authorId')
              }
            }
          )
        )
      })

      it('should reject proposals with title too short', () => {
        fc.assert(
          fc.property(
            uuidArbitrary,
            fc.string({ maxLength: 2 }), // Title < 3 characters
            summaryArbitrary,
            (userId: string, shortTitle: string, summary: string) => {
              const proposal = {
                scopeType: 'individual' as const,
                scopeId: userId,
                authorId: userId,
                title: shortTitle,
                summary,
              }
              const result = createProposalSchema.safeParse(proposal)
              expect(result.success).toBe(false)
            }
          )
        )
      })

      it('should reject proposals with title too long', () => {
        fc.assert(
          fc.property(
            uuidArbitrary,
            fc.string({ minLength: 201, maxLength: 500 }), // Title > 200 characters
            summaryArbitrary,
            (userId: string, longTitle: string, summary: string) => {
              const proposal = {
                scopeType: 'individual' as const,
                scopeId: userId,
                authorId: userId,
                title: longTitle,
                summary,
              }
              const result = createProposalSchema.safeParse(proposal)
              expect(result.success).toBe(false)
            }
          )
        )
      })

      it('should reject proposals with summary too short', () => {
        fc.assert(
          fc.property(
            uuidArbitrary,
            titleArbitrary,
            fc.string({ maxLength: 9 }), // Summary < 10 characters
            (userId: string, title: string, shortSummary: string) => {
              const proposal = {
                scopeType: 'individual' as const,
                scopeId: userId,
                authorId: userId,
                title,
                summary: shortSummary,
              }
              const result = createProposalSchema.safeParse(proposal)
              expect(result.success).toBe(false)
            }
          )
        )
      })

      it('should reject proposals with summary too long', () => {
        fc.assert(
          fc.property(
            uuidArbitrary,
            titleArbitrary,
            fc.string({ minLength: 2001, maxLength: 3000 }), // Summary > 2000 characters
            (userId: string, title: string, longSummary: string) => {
              const proposal = {
                scopeType: 'individual' as const,
                scopeId: userId,
                authorId: userId,
                title,
                summary: longSummary,
              }
              const result = createProposalSchema.safeParse(proposal)
              expect(result.success).toBe(false)
            }
          )
        )
      })
    })

    describe('boundary conditions', () => {
      it('should accept title exactly at minimum length (3 chars)', () => {
        fc.assert(
          fc.property(
            uuidArbitrary,
            fc.constant('abc'),
            summaryArbitrary,
            (userId: string, title: string, summary: string) => {
              const proposal = {
                scopeType: 'individual' as const,
                scopeId: userId,
                authorId: userId,
                title,
                summary,
              }
              const result = createProposalSchema.safeParse(proposal)
              expect(result.success).toBe(true)
            }
          )
        )
      })

      it('should accept title exactly at maximum length (200 chars)', () => {
        fc.assert(
          fc.property(
            uuidArbitrary,
            fc.constant('a'.repeat(200)),
            summaryArbitrary,
            (userId: string, title: string, summary: string) => {
              const proposal = {
                scopeType: 'individual' as const,
                scopeId: userId,
                authorId: userId,
                title,
                summary,
              }
              const result = createProposalSchema.safeParse(proposal)
              expect(result.success).toBe(true)
            }
          )
        )
      })

      it('should accept summary exactly at minimum length (10 chars)', () => {
        fc.assert(
          fc.property(
            uuidArbitrary,
            titleArbitrary,
            fc.constant('a'.repeat(10)),
            (userId: string, title: string, summary: string) => {
              const proposal = {
                scopeType: 'individual' as const,
                scopeId: userId,
                authorId: userId,
                title,
                summary,
              }
              const result = createProposalSchema.safeParse(proposal)
              expect(result.success).toBe(true)
            }
          )
        )
      })

      it('should accept summary exactly at maximum length (2000 chars)', () => {
        fc.assert(
          fc.property(
            uuidArbitrary,
            titleArbitrary,
            fc.constant('a'.repeat(2000)),
            (userId: string, title: string, summary: string) => {
              const proposal = {
                scopeType: 'individual' as const,
                scopeId: userId,
                authorId: userId,
                title,
                summary,
              }
              const result = createProposalSchema.safeParse(proposal)
              expect(result.success).toBe(true)
            }
          )
        )
      })
    })
  })
})
