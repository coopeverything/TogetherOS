// apps/api/src/modules/groups/__tests__/InMemoryGroupRepo.test.ts
// Test suite for InMemoryGroupRepo

import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryGroupRepo } from '../repos/InMemoryGroupRepo'

describe('InMemoryGroupRepo', () => {
  let repo: InMemoryGroupRepo

  const testCreatorId = 'u0000000-0000-0000-0000-000000000001'

  beforeEach(() => {
    repo = new InMemoryGroupRepo()
    repo.clear()
  })

  describe('create', () => {
    it('creates a new group with valid input', async () => {
      const group = await repo.create({
        name: 'Test Group',
        handle: 'testgroup',
        type: 'local',
        creatorId: testCreatorId,
      })

      expect(group.id).toBeDefined()
      expect(group.name).toBe('Test Group')
      expect(group.handle).toBe('testgroup')
      expect(group.type).toBe('local')
      expect(group.members).toContain(testCreatorId)
      expect(group.createdAt).toBeInstanceOf(Date)
    })

    it('creates a group with description and location', async () => {
      const group = await repo.create({
        name: 'City Coop',
        handle: 'citycoop',
        type: 'local',
        description: 'A local cooperative',
        location: 'Boston, MA',
        creatorId: testCreatorId,
      })

      expect(group.description).toBe('A local cooperative')
      expect(group.location).toBe('Boston, MA')
    })

    it('throws error for duplicate handle', async () => {
      await repo.create({
        name: 'First Group',
        handle: 'uniquehandle',
        type: 'local',
        creatorId: testCreatorId,
      })

      await expect(
        repo.create({
          name: 'Second Group',
          handle: 'uniquehandle',
          type: 'global',
          creatorId: testCreatorId,
        })
      ).rejects.toThrow('Group handle "uniquehandle" already exists')
    })
  })

  describe('findById', () => {
    it('returns group when found', async () => {
      const created = await repo.create({
        name: 'Find Me',
        handle: 'findme',
        type: 'local',
        creatorId: testCreatorId,
      })

      const found = await repo.findById(created.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
      expect(found?.name).toBe('Find Me')
    })

    it('returns null for non-existent group', async () => {
      const found = await repo.findById('non-existent-id')
      expect(found).toBeNull()
    })
  })

  describe('findByHandle', () => {
    it('returns group when found by handle', async () => {
      await repo.create({
        name: 'Handle Test',
        handle: 'handletest',
        type: 'local',
        creatorId: testCreatorId,
      })

      const found = await repo.findByHandle('handletest')

      expect(found).not.toBeNull()
      expect(found?.handle).toBe('handletest')
    })

    it('normalizes handle to lowercase', async () => {
      await repo.create({
        name: 'Case Test',
        handle: 'casetest',
        type: 'local',
        creatorId: testCreatorId,
      })

      const found = await repo.findByHandle('CaseTest')

      expect(found).not.toBeNull()
      expect(found?.handle).toBe('casetest')
    })

    it('returns null for non-existent handle', async () => {
      const found = await repo.findByHandle('non-existent')
      expect(found).toBeNull()
    })
  })

  describe('list', () => {
    beforeEach(async () => {
      // Seed test data
      await repo.create({
        name: 'Local Group 1',
        handle: 'local1',
        type: 'local',
        location: 'New York, NY',
        creatorId: testCreatorId,
      })

      await repo.create({
        name: 'Local Group 2',
        handle: 'local2',
        type: 'local',
        location: 'Los Angeles, CA',
        creatorId: testCreatorId,
      })

      await repo.create({
        name: 'Global Group',
        handle: 'global1',
        type: 'global',
        description: 'A worldwide network',
        creatorId: testCreatorId,
      })
    })

    it('returns all groups without filters', async () => {
      const groups = await repo.list()
      expect(groups.length).toBe(3)
    })

    it('filters by type', async () => {
      const localGroups = await repo.list({ type: 'local' })
      expect(localGroups.length).toBe(2)
      localGroups.forEach((g) => expect(g.type).toBe('local'))

      const globalGroups = await repo.list({ type: 'global' })
      expect(globalGroups.length).toBe(1)
      expect(globalGroups[0].type).toBe('global')
    })

    it('filters by location', async () => {
      const nyGroups = await repo.list({ location: 'New York' })
      expect(nyGroups.length).toBe(1)
      expect(nyGroups[0].location).toBe('New York, NY')
    })

    it('filters by search query', async () => {
      const searchResults = await repo.list({ search: 'worldwide' })
      expect(searchResults.length).toBe(1)
      expect(searchResults[0].handle).toBe('global1')
    })

    it('applies pagination', async () => {
      const page1 = await repo.list({ limit: 2, offset: 0 })
      expect(page1.length).toBe(2)

      const page2 = await repo.list({ limit: 2, offset: 2 })
      expect(page2.length).toBe(1)
    })

    it('sorts by newest first by default', async () => {
      const groups = await repo.list({ sortBy: 'newest' })
      // Verify sorted by createdAt descending
      for (let i = 0; i < groups.length - 1; i++) {
        expect(groups[i].createdAt.getTime()).toBeGreaterThanOrEqual(groups[i + 1].createdAt.getTime())
      }
    })

    it('sorts alphabetically', async () => {
      const groups = await repo.list({ sortBy: 'alphabetical' })
      expect(groups[0].name).toBe('Global Group')
      expect(groups[1].name).toBe('Local Group 1')
      expect(groups[2].name).toBe('Local Group 2')
    })
  })

  describe('update', () => {
    it('updates group name and description', async () => {
      const created = await repo.create({
        name: 'Original Name',
        handle: 'updatetest',
        type: 'local',
        creatorId: testCreatorId,
      })

      const updated = await repo.update(created.id, {
        name: 'Updated Name',
        description: 'New description',
      })

      expect(updated.name).toBe('Updated Name')
      expect(updated.description).toBe('New description')
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime())
    })

    it('throws error for non-existent group', async () => {
      await expect(
        repo.update('non-existent-id', { name: 'New Name' })
      ).rejects.toThrow('Group with ID non-existent-id not found')
    })
  })

  describe('addMember', () => {
    it('adds a member to group', async () => {
      const created = await repo.create({
        name: 'Member Test',
        handle: 'membertest',
        type: 'local',
        creatorId: testCreatorId,
      })

      const newMemberId = 'u0000000-0000-0000-0000-000000000002'
      await repo.addMember(created.id, newMemberId)

      const found = await repo.findById(created.id)
      expect(found?.members).toContain(newMemberId)
      expect(found?.members.length).toBe(2)
    })

    it('throws error for non-existent group', async () => {
      await expect(
        repo.addMember('non-existent-id', 'member-id')
      ).rejects.toThrow('Group with ID non-existent-id not found')
    })
  })

  describe('removeMember', () => {
    it('removes a member from group', async () => {
      const memberId2 = 'u0000000-0000-0000-0000-000000000002'
      const created = await repo.create({
        name: 'Remove Test',
        handle: 'removetest',
        type: 'local',
        creatorId: testCreatorId,
      })

      await repo.addMember(created.id, memberId2)
      await repo.removeMember(created.id, memberId2)

      const found = await repo.findById(created.id)
      expect(found?.members).not.toContain(memberId2)
      expect(found?.members.length).toBe(1)
    })

    it('throws error for non-existent group', async () => {
      await expect(
        repo.removeMember('non-existent-id', 'member-id')
      ).rejects.toThrow('Group with ID non-existent-id not found')
    })
  })

  describe('delete', () => {
    it('deletes a group', async () => {
      const created = await repo.create({
        name: 'To Delete',
        handle: 'deletetest',
        type: 'local',
        creatorId: testCreatorId,
      })

      await repo.delete(created.id)

      const found = await repo.findById(created.id)
      expect(found).toBeNull()
    })

    it('throws error for non-existent group', async () => {
      await expect(repo.delete('non-existent-id')).rejects.toThrow(
        'Group with ID non-existent-id not found'
      )
    })
  })

  describe('count', () => {
    beforeEach(async () => {
      for (let i = 0; i < 5; i++) {
        await repo.create({
          name: `Group ${i}`,
          handle: `group${i}`,
          type: i % 2 === 0 ? 'local' : 'global',
          creatorId: testCreatorId,
        })
      }
    })

    it('counts all groups', async () => {
      const count = await repo.count()
      expect(count).toBe(5)
    })

    it('counts with filters', async () => {
      const localCount = await repo.count({ type: 'local' })
      expect(localCount).toBe(3)

      const globalCount = await repo.count({ type: 'global' })
      expect(globalCount).toBe(2)
    })
  })

  describe('handleExists', () => {
    it('returns true for existing handle', async () => {
      await repo.create({
        name: 'Handle Check',
        handle: 'existinghandle',
        type: 'local',
        creatorId: testCreatorId,
      })

      const exists = await repo.handleExists('existinghandle')
      expect(exists).toBe(true)
    })

    it('returns false for non-existent handle', async () => {
      const exists = await repo.handleExists('nonexistent')
      expect(exists).toBe(false)
    })

    it('normalizes handle case', async () => {
      await repo.create({
        name: 'Case Check',
        handle: 'casecheck',
        type: 'local',
        creatorId: testCreatorId,
      })

      const exists = await repo.handleExists('CaseCheck')
      expect(exists).toBe(true)
    })
  })

  describe('getAll', () => {
    it('returns all groups as plain objects', async () => {
      await repo.create({
        name: 'Group 1',
        handle: 'group1',
        type: 'local',
        creatorId: testCreatorId,
      })

      await repo.create({
        name: 'Group 2',
        handle: 'group2',
        type: 'global',
        creatorId: testCreatorId,
      })

      const all = repo.getAll()
      expect(all.length).toBe(2)
      expect(all[0]).toHaveProperty('id')
      expect(all[0]).toHaveProperty('name')
    })
  })
})
