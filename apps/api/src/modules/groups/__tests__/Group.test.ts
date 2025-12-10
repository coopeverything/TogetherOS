// apps/api/src/modules/groups/__tests__/Group.test.ts
// Test suite for Group entity

import { describe, it, expect } from 'vitest'
import { Group } from '../entities/Group'

describe('Group Entity', () => {
  const testCreatorId = 'u0000000-0000-0000-0000-000000000001'

  describe('create', () => {
    it('creates a local group with correct defaults', () => {
      const group = Group.create({
        name: 'Test Local Group',
        handle: 'TestGroup',
        type: 'local',
        creatorId: testCreatorId,
      })

      expect(group.id).toBeDefined()
      expect(group.name).toBe('Test Local Group')
      expect(group.handle).toBe('testgroup') // lowercase normalized
      expect(group.type).toBe('local')
      expect(group.members).toContain(testCreatorId)
      expect(group.memberCount).toBe(1)
      expect(group.createdAt).toBeInstanceOf(Date)
      expect(group.updatedAt).toBeInstanceOf(Date)
    })

    it('creates a global group', () => {
      const group = Group.create({
        name: 'Global Coop Network',
        handle: 'globalcoop',
        type: 'global',
        description: 'A worldwide cooperative network',
        creatorId: testCreatorId,
      })

      expect(group.type).toBe('global')
      expect(group.isGlobal).toBe(true)
      expect(group.isLocal).toBe(false)
      expect(group.description).toBe('A worldwide cooperative network')
    })

    it('creates a group without creator (empty members)', () => {
      const group = Group.create({
        name: 'Empty Group',
        handle: 'emptygroup',
        type: 'local',
      })

      expect(group.members).toEqual([])
      expect(group.memberCount).toBe(0)
    })

    it('creates a group with location', () => {
      const group = Group.create({
        name: 'City Coop',
        handle: 'citycoop',
        type: 'local',
        location: 'New York, NY',
        creatorId: testCreatorId,
      })

      expect(group.location).toBe('New York, NY')
      expect(group.isLocal).toBe(true)
    })
  })

  describe('fromData', () => {
    it('reconstitutes group from storage data', () => {
      const data = {
        id: 'group-123',
        name: 'Reconstituted Group',
        handle: 'reconstituted',
        type: 'local' as const,
        description: 'From storage',
        location: 'Test City',
        members: [testCreatorId, 'member-2'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      }

      const group = Group.fromData(data)

      expect(group.id).toBe('group-123')
      expect(group.name).toBe('Reconstituted Group')
      expect(group.handle).toBe('reconstituted')
      expect(group.memberCount).toBe(2)
    })
  })

  describe('addMember', () => {
    it('adds a new member', () => {
      const group = Group.create({
        name: 'Test Group',
        handle: 'testgroup',
        type: 'local',
        creatorId: testCreatorId,
      })

      const newMemberId = 'u0000000-0000-0000-0000-000000000002'
      const updated = group.addMember(newMemberId)

      expect(updated.members).toContain(newMemberId)
      expect(updated.memberCount).toBe(2)
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(group.updatedAt.getTime())
    })

    it('throws error when adding duplicate member', () => {
      const group = Group.create({
        name: 'Test Group',
        handle: 'testgroup',
        type: 'local',
        creatorId: testCreatorId,
      })

      expect(() => group.addMember(testCreatorId)).toThrow('Member already in group')
    })

    it('throws error when group reaches max capacity', () => {
      // Create a group with 1000 members via fromData
      const members = Array.from({ length: 1000 }, (_, i) => `member-${i}`)
      const group = Group.fromData({
        id: 'full-group',
        name: 'Full Group',
        handle: 'fullgroup',
        type: 'local',
        members,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      expect(() => group.addMember('new-member')).toThrow(
        'Group has reached maximum member capacity (1000)'
      )
    })
  })

  describe('removeMember', () => {
    it('removes an existing member', () => {
      const group = Group.fromData({
        id: 'test-group',
        name: 'Test Group',
        handle: 'testgroup',
        type: 'local',
        members: [testCreatorId, 'member-2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const updated = group.removeMember('member-2')

      expect(updated.members).not.toContain('member-2')
      expect(updated.members).toContain(testCreatorId)
      expect(updated.memberCount).toBe(1)
    })

    it('throws error when removing non-existent member', () => {
      const group = Group.create({
        name: 'Test Group',
        handle: 'testgroup',
        type: 'local',
        creatorId: testCreatorId,
      })

      expect(() => group.removeMember('non-existent')).toThrow('Member not in group')
    })

    it('throws error when removing last member', () => {
      const group = Group.create({
        name: 'Test Group',
        handle: 'testgroup',
        type: 'local',
        creatorId: testCreatorId,
      })

      expect(() => group.removeMember(testCreatorId)).toThrow(
        'Cannot remove last member from group'
      )
    })
  })

  describe('update', () => {
    it('updates name and description', () => {
      const group = Group.create({
        name: 'Original Name',
        handle: 'testgroup',
        type: 'local',
        description: 'Original description',
        creatorId: testCreatorId,
      })

      const updated = group.update({
        name: 'New Name',
        description: 'New description',
      })

      expect(updated.name).toBe('New Name')
      expect(updated.description).toBe('New description')
      expect(updated.handle).toBe('testgroup') // Handle unchanged
    })

    it('updates location', () => {
      const group = Group.create({
        name: 'Test Group',
        handle: 'testgroup',
        type: 'local',
        creatorId: testCreatorId,
      })

      const updated = group.update({ location: 'Los Angeles, CA' })

      expect(updated.location).toBe('Los Angeles, CA')
    })

    it('preserves unchanged fields', () => {
      const group = Group.create({
        name: 'Test Group',
        handle: 'testgroup',
        type: 'local',
        description: 'Keep this description unchanged',  // Must be >= 10 chars
        creatorId: testCreatorId,
      })

      const updated = group.update({ name: 'Only Name Changed' })

      expect(updated.name).toBe('Only Name Changed')
      expect(updated.description).toBe('Keep this description unchanged') // Unchanged
      expect(updated.type).toBe('local') // Unchanged
    })
  })

  describe('helper methods', () => {
    it('hasMember returns true for existing member', () => {
      const group = Group.create({
        name: 'Test Group',
        handle: 'testgroup',
        type: 'local',
        creatorId: testCreatorId,
      })

      expect(group.hasMember(testCreatorId)).toBe(true)
      expect(group.hasMember('non-existent')).toBe(false)
    })

    it('isLocal returns true for local groups', () => {
      const localGroup = Group.create({
        name: 'Local Group',
        handle: 'localgroup',
        type: 'local',
        creatorId: testCreatorId,
      })

      expect(localGroup.isLocal).toBe(true)
      expect(localGroup.isGlobal).toBe(false)
    })

    it('isGlobal returns true for global groups', () => {
      const globalGroup = Group.create({
        name: 'Global Group',
        handle: 'globalgroup',
        type: 'global',
        creatorId: testCreatorId,
      })

      expect(globalGroup.isGlobal).toBe(true)
      expect(globalGroup.isLocal).toBe(false)
    })

    it('getFederationHandle returns correct format', () => {
      const group = Group.create({
        name: 'Test Group',
        handle: 'testgroup',
        type: 'global',
        creatorId: testCreatorId,
      })

      expect(group.getFederationHandle('togetheros.org')).toBe('@testgroup@togetheros.org')
    })

    it('matchesSearch returns true for matching name', () => {
      const group = Group.create({
        name: 'Cooperative Network',
        handle: 'coopnet',
        type: 'local',
        description: 'A great community for all',  // Must be >= 10 chars
        creatorId: testCreatorId,
      })

      expect(group.matchesSearch('cooperative')).toBe(true)
      expect(group.matchesSearch('coopnet')).toBe(true)
      expect(group.matchesSearch('community')).toBe(true)
      expect(group.matchesSearch('xyz')).toBe(false)
    })

    it('matchesLocation returns true for matching location', () => {
      const group = Group.create({
        name: 'City Coop',
        handle: 'citycoop',
        type: 'local',
        location: 'San Francisco, CA',
        creatorId: testCreatorId,
      })

      expect(group.matchesLocation('san francisco')).toBe(true)
      expect(group.matchesLocation('CA')).toBe(true)
      expect(group.matchesLocation('New York')).toBe(false)
    })

    it('matchesLocation returns false for groups without location', () => {
      const group = Group.create({
        name: 'No Location',
        handle: 'nolocation',
        type: 'global',
        creatorId: testCreatorId,
      })

      expect(group.matchesLocation('anywhere')).toBe(false)
    })
  })

  describe('toJSON', () => {
    it('converts group to plain object', () => {
      const group = Group.create({
        name: 'JSON Test',
        handle: 'jsontest',
        type: 'local',
        description: 'Testing serialization',
        location: 'Test City',
        creatorId: testCreatorId,
      })

      const json = group.toJSON()

      expect(json.id).toBe(group.id)
      expect(json.name).toBe('JSON Test')
      expect(json.handle).toBe('jsontest')
      expect(json.type).toBe('local')
      expect(json.description).toBe('Testing serialization')
      expect(json.location).toBe('Test City')
      expect(json.members).toEqual([testCreatorId])
      expect(json.createdAt).toBeInstanceOf(Date)
    })
  })
})
