// apps/api/src/modules/governance/__tests__/Proposal.test.ts
// Test suite for Proposal entity

import { describe, it, expect } from 'vitest'
import { Proposal } from '../entities/Proposal'

describe('Proposal Entity', () => {
  const testAuthorId = 'a0000000-0000-0000-0000-000000000001'
  const testGroupId = 'g0000000-0000-0000-0000-000000000001'

  describe('create', () => {
    it('creates a group proposal with correct defaults', () => {
      const proposal = Proposal.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Test Proposal',
        summary: 'A test proposal summary',
      })

      expect(proposal.id).toBeDefined()
      expect(proposal.scopeType).toBe('group')
      expect(proposal.scopeId).toBe(testGroupId)
      expect(proposal.authorId).toBe(testAuthorId)
      expect(proposal.title).toBe('Test Proposal')
      expect(proposal.summary).toBe('A test proposal summary')
      expect(proposal.status).toBe('draft')
      expect(proposal.bridgeSimilarityCheckDone).toBe(false)
      expect(proposal.createdAt).toBeInstanceOf(Date)
      expect(proposal.updatedAt).toBeInstanceOf(Date)
      expect(proposal.deletedAt).toBeUndefined()
    })

    it('creates an individual proposal with matching scopeId', () => {
      const proposal = Proposal.create({
        scopeType: 'individual',
        scopeId: testAuthorId,
        authorId: testAuthorId,
        title: 'Personal Proposal',
        summary: 'My personal proposal',
      })

      expect(proposal.scopeType).toBe('individual')
      expect(proposal.scopeId).toBe(testAuthorId)
    })

    it('throws error when individual scopeId mismatches authorId', () => {
      expect(() =>
        Proposal.create({
          scopeType: 'individual',
          scopeId: testGroupId, // Different from authorId
          authorId: testAuthorId,
          title: 'Invalid Proposal',
          summary: 'Should fail',
        })
      ).toThrow('Individual proposals must have scopeId equal to authorId')
    })
  })

  describe('fromData', () => {
    it('reconstitutes proposal from storage data', () => {
      const data = {
        id: 'proposal-123',
        scopeType: 'group' as const,
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Reconstituted Proposal',
        summary: 'From storage',
        status: 'research' as const,
        evidence: [],
        options: [],
        positions: [],
        bridgeSimilarityCheckDone: true,
        bridgeSimilarProposals: [],
        bridgeRegulationConflicts: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      }

      const proposal = Proposal.fromData(data)

      expect(proposal.id).toBe('proposal-123')
      expect(proposal.status).toBe('research')
      expect(proposal.bridgeSimilarityCheckDone).toBe(true)
    })
  })

  describe('update', () => {
    it('updates title and summary', () => {
      const proposal = Proposal.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Original Title',
        summary: 'Original summary',
      })

      const updated = proposal.update({
        title: 'New Title',
        summary: 'New summary',
      })

      expect(updated.title).toBe('New Title')
      expect(updated.summary).toBe('New summary')
      expect(updated.id).toBe(proposal.id) // ID unchanged
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(proposal.updatedAt.getTime())
    })

    it('updates status', () => {
      const proposal = Proposal.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Status Test',
        summary: 'Testing status update',
      })

      const updated = proposal.update({ status: 'research' })

      expect(updated.status).toBe('research')
    })

    it('sets decidedAt when status becomes decided', () => {
      const proposal = Proposal.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Decision Test',
        summary: 'Testing decision',
      })

      const updated = proposal.update({ status: 'decided' })

      expect(updated.status).toBe('decided')
      expect(updated.decidedAt).toBeInstanceOf(Date)
    })

    it('preserves unchanged fields', () => {
      const proposal = Proposal.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Preserve Test',
        summary: 'Testing field preservation',
      })

      const updated = proposal.update({ title: 'Only Title Changed' })

      expect(updated.title).toBe('Only Title Changed')
      expect(updated.summary).toBe('Testing field preservation') // Unchanged
      expect(updated.scopeType).toBe('group') // Unchanged
    })
  })

  describe('transitionTo', () => {
    it('allows valid status transitions', () => {
      const proposal = Proposal.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Transition Test',
        summary: 'Testing transitions',
      })

      // draft -> research
      const research = proposal.transitionTo('research')
      expect(research.status).toBe('research')

      // research -> deliberation
      const deliberation = research.transitionTo('deliberation')
      expect(deliberation.status).toBe('deliberation')

      // deliberation -> voting
      const voting = deliberation.transitionTo('voting')
      expect(voting.status).toBe('voting')

      // voting -> decided
      const decided = voting.transitionTo('decided')
      expect(decided.status).toBe('decided')
    })

    it('throws error for invalid transitions', () => {
      const proposal = Proposal.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Invalid Transition',
        summary: 'Testing invalid transition',
      })

      // draft cannot go directly to voting
      expect(() => proposal.transitionTo('voting')).toThrow(
        'Cannot transition from draft to voting'
      )
    })

    it('allows archiving from any status', () => {
      const proposal = Proposal.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Archive Test',
        summary: 'Can archive from draft',
      })

      const archived = proposal.transitionTo('archived')
      expect(archived.status).toBe('archived')
    })

    it('prevents transitions from archived status', () => {
      const proposal = Proposal.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Archived',
        summary: 'Cannot transition from here',
      })

      const archived = proposal.transitionTo('archived')

      expect(() => archived.transitionTo('draft')).toThrow(
        'Cannot transition from archived to draft'
      )
    })
  })

  describe('delete', () => {
    it('soft deletes proposal by setting deletedAt', () => {
      const proposal = Proposal.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'To Delete',
        summary: 'Will be soft deleted',
      })

      expect(proposal.isDeleted()).toBe(false)

      const deleted = proposal.delete()

      expect(deleted.isDeleted()).toBe(true)
      expect(deleted.deletedAt).toBeInstanceOf(Date)
    })
  })

  describe('helper methods', () => {
    it('isIndividual returns true for individual scope', () => {
      const proposal = Proposal.create({
        scopeType: 'individual',
        scopeId: testAuthorId,
        authorId: testAuthorId,
        title: 'Individual',
        summary: 'Personal',
      })

      expect(proposal.isIndividual()).toBe(true)
      expect(proposal.isGroup()).toBe(false)
    })

    it('isGroup returns true for group scope', () => {
      const proposal = Proposal.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Group',
        summary: 'Collective',
      })

      expect(proposal.isGroup()).toBe(true)
      expect(proposal.isIndividual()).toBe(false)
    })

    it('isEditable returns true only for draft status', () => {
      const draft = Proposal.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Draft',
        summary: 'In draft',
      })

      expect(draft.isEditable()).toBe(true)

      const research = draft.transitionTo('research')
      expect(research.isEditable()).toBe(false)
    })
  })

  describe('toJSON', () => {
    it('converts proposal to plain object', () => {
      const proposal = Proposal.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'JSON Test',
        summary: 'Testing serialization',
      })

      const json = proposal.toJSON()

      expect(json.id).toBe(proposal.id)
      expect(json.title).toBe('JSON Test')
      expect(json.evidence).toEqual([])
      expect(json.options).toEqual([])
      expect(json.positions).toEqual([])
      expect(typeof json.createdAt).toBe('object') // Date object
    })
  })
})
