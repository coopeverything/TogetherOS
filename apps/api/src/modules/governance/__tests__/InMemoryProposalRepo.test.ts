// apps/api/src/modules/governance/__tests__/InMemoryProposalRepo.test.ts
// Test suite for InMemoryProposalRepo

import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryProposalRepo } from '../repos/InMemoryProposalRepo'
import type { Proposal } from '@togetheros/types/governance'

describe('InMemoryProposalRepo', () => {
  let repo: InMemoryProposalRepo

  const testAuthorId = 'a0000000-0000-0000-0000-000000000001'
  const testGroupId = 'g0000000-0000-0000-0000-000000000001'

  beforeEach(async () => {
    repo = new InMemoryProposalRepo()
    await repo.clear()
  })

  describe('create', () => {
    it('creates a new proposal with valid input', async () => {
      const proposal = await repo.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Test Proposal',
        summary: 'This is a test proposal summary',
      })

      expect(proposal.id).toBeDefined()
      expect(proposal.title).toBe('Test Proposal')
      expect(proposal.summary).toBe('This is a test proposal summary')
      expect(proposal.status).toBe('draft')
      expect(proposal.scopeType).toBe('group')
      expect(proposal.scopeId).toBe(testGroupId)
      expect(proposal.authorId).toBe(testAuthorId)
      expect(proposal.createdAt).toBeInstanceOf(Date)
      expect(proposal.updatedAt).toBeInstanceOf(Date)
    })

    it('creates individual proposal with matching scopeId and authorId', async () => {
      const proposal = await repo.create({
        scopeType: 'individual',
        scopeId: testAuthorId,
        authorId: testAuthorId,
        title: 'Individual Proposal',
        summary: 'Personal proposal',
      })

      expect(proposal.scopeType).toBe('individual')
      expect(proposal.scopeId).toBe(testAuthorId)
    })

    it('throws error for individual proposal with mismatched scopeId', async () => {
      await expect(
        repo.create({
          scopeType: 'individual',
          scopeId: testGroupId, // Different from authorId
          authorId: testAuthorId,
          title: 'Invalid Proposal',
          summary: 'This should fail',
        })
      ).rejects.toThrow('Individual proposals must have scopeId equal to authorId')
    })
  })

  describe('findById', () => {
    it('returns proposal when found', async () => {
      const created = await repo.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Find Me',
        summary: 'A proposal to find',
      })

      const found = await repo.findById(created.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
      expect(found?.title).toBe('Find Me')
    })

    it('returns null for non-existent proposal', async () => {
      const found = await repo.findById('non-existent-id')
      expect(found).toBeNull()
    })

    it('returns null for soft-deleted proposal', async () => {
      const created = await repo.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'To Delete',
        summary: 'Will be deleted',
      })

      await repo.delete(created.id)
      const found = await repo.findById(created.id)

      expect(found).toBeNull()
    })
  })

  describe('list', () => {
    beforeEach(async () => {
      // Seed test data
      await repo.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Proposal 1',
        summary: 'First proposal',
      })

      await repo.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: 'author-2',
        title: 'Proposal 2',
        summary: 'Second proposal',
      })

      await repo.create({
        scopeType: 'individual',
        scopeId: testAuthorId,
        authorId: testAuthorId,
        title: 'Individual Proposal',
        summary: 'Personal proposal',
      })
    })

    it('returns all proposals without filters', async () => {
      const proposals = await repo.list()
      expect(proposals.length).toBe(3)
    })

    it('filters by scopeType', async () => {
      const groupProposals = await repo.list({ scopeType: 'group', limit: 100, offset: 0 })
      expect(groupProposals.length).toBe(2)
      groupProposals.forEach((p) => expect(p.scopeType).toBe('group'))

      const individualProposals = await repo.list({ scopeType: 'individual', limit: 100, offset: 0 })
      expect(individualProposals.length).toBe(1)
      expect(individualProposals[0].scopeType).toBe('individual')
    })

    it('filters by authorId', async () => {
      const proposals = await repo.list({ authorId: testAuthorId, limit: 100, offset: 0 })
      expect(proposals.length).toBe(2) // Proposal 1 and Individual Proposal
      proposals.forEach((p) => expect(p.authorId).toBe(testAuthorId))
    })

    it('applies pagination', async () => {
      const page1 = await repo.list({ limit: 2, offset: 0 })
      expect(page1.length).toBe(2)

      const page2 = await repo.list({ limit: 2, offset: 2 })
      expect(page2.length).toBe(1)
    })

    it('excludes soft-deleted proposals', async () => {
      const proposals = await repo.list()
      const toDelete = proposals[0]

      await repo.delete(toDelete.id)

      const afterDelete = await repo.list()
      expect(afterDelete.length).toBe(2)
      expect(afterDelete.find((p) => p.id === toDelete.id)).toBeUndefined()
    })
  })

  describe('update', () => {
    it('updates proposal title and summary', async () => {
      const created = await repo.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Original Title',
        summary: 'Original summary',
      })

      const updated = await repo.update(created.id, {
        title: 'Updated Title',
        summary: 'Updated summary',
      })

      expect(updated.title).toBe('Updated Title')
      expect(updated.summary).toBe('Updated summary')
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime())
    })

    it('updates proposal status', async () => {
      const created = await repo.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Status Test',
        summary: 'Testing status transitions',
      })

      const updated = await repo.update(created.id, {
        status: 'research',
      })

      expect(updated.status).toBe('research')
    })

    it('throws error for non-existent proposal', async () => {
      await expect(
        repo.update('non-existent-id', { title: 'New Title' })
      ).rejects.toThrow('Proposal with ID non-existent-id not found')
    })
  })

  describe('delete', () => {
    it('soft deletes a proposal', async () => {
      const created = await repo.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'To Delete',
        summary: 'Will be deleted',
      })

      await repo.delete(created.id)

      // Should not be findable
      const found = await repo.findById(created.id)
      expect(found).toBeNull()
    })

    it('throws error for non-existent proposal', async () => {
      await expect(repo.delete('non-existent-id')).rejects.toThrow(
        'Proposal with ID non-existent-id not found'
      )
    })
  })

  describe('count', () => {
    beforeEach(async () => {
      for (let i = 0; i < 5; i++) {
        await repo.create({
          scopeType: 'group',
          scopeId: testGroupId,
          authorId: testAuthorId,
          title: `Proposal ${i}`,
          summary: `Summary ${i}`,
        })
      }
    })

    it('counts all proposals', async () => {
      const count = await repo.count()
      expect(count).toBe(5)
    })

    it('counts with filters', async () => {
      // Create one individual proposal
      await repo.create({
        scopeType: 'individual',
        scopeId: testAuthorId,
        authorId: testAuthorId,
        title: 'Individual',
        summary: 'Personal',
      })

      const groupCount = await repo.count({ scopeType: 'group', limit: 100, offset: 0 })
      expect(groupCount).toBe(5)

      const individualCount = await repo.count({ scopeType: 'individual', limit: 100, offset: 0 })
      expect(individualCount).toBe(1)
    })
  })

  describe('findByAuthor', () => {
    it('returns all proposals by author', async () => {
      await repo.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'My Proposal 1',
        summary: 'First',
      })

      await repo.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'My Proposal 2',
        summary: 'Second',
      })

      await repo.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: 'other-author',
        title: 'Other Proposal',
        summary: "Someone else's",
      })

      const myProposals = await repo.findByAuthor(testAuthorId)
      expect(myProposals.length).toBe(2)
      myProposals.forEach((p) => expect(p.authorId).toBe(testAuthorId))
    })
  })

  describe('findByScope', () => {
    it('returns proposals for specific scope', async () => {
      const groupId2 = 'g0000000-0000-0000-0000-000000000002'

      await repo.create({
        scopeType: 'group',
        scopeId: testGroupId,
        authorId: testAuthorId,
        title: 'Group 1 Proposal',
        summary: 'For group 1',
      })

      await repo.create({
        scopeType: 'group',
        scopeId: groupId2,
        authorId: testAuthorId,
        title: 'Group 2 Proposal',
        summary: 'For group 2',
      })

      const group1Proposals = await repo.findByScope('group', testGroupId)
      expect(group1Proposals.length).toBe(1)
      expect(group1Proposals[0].scopeId).toBe(testGroupId)

      const group2Proposals = await repo.findByScope('group', groupId2)
      expect(group2Proposals.length).toBe(1)
      expect(group2Proposals[0].scopeId).toBe(groupId2)
    })
  })

  describe('seed', () => {
    it('seeds repository with test data', async () => {
      const testData: Proposal[] = [
        {
          id: 'seeded-1',
          scopeType: 'group',
          scopeId: testGroupId,
          authorId: testAuthorId,
          title: 'Seeded Proposal 1',
          summary: 'First seeded proposal',
          status: 'draft',
          evidence: [],
          options: [],
          positions: [],
          bridgeSimilarityCheckDone: false,
          bridgeSimilarProposals: [],
          bridgeRegulationConflicts: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'seeded-2',
          scopeType: 'group',
          scopeId: testGroupId,
          authorId: testAuthorId,
          title: 'Seeded Proposal 2',
          summary: 'Second seeded proposal',
          status: 'research',
          evidence: [],
          options: [],
          positions: [],
          bridgeSimilarityCheckDone: false,
          bridgeSimilarProposals: [],
          bridgeRegulationConflicts: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      await repo.seed(testData)

      const seeded1 = await repo.findById('seeded-1')
      expect(seeded1?.title).toBe('Seeded Proposal 1')

      const seeded2 = await repo.findById('seeded-2')
      expect(seeded2?.title).toBe('Seeded Proposal 2')
      expect(seeded2?.status).toBe('research')
    })
  })
})
