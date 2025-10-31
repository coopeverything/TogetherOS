// apps/api/src/modules/groups/repos/InMemoryGroupRepo.ts
// In-memory implementation of GroupRepo for testing and fixtures

import type { GroupRepo } from './GroupRepo'
import type { Group as GroupType, GroupFilters, CreateGroupInput, UpdateGroupInput } from '@togetheros/types/groups'
import { Group } from '../entities/Group'

/**
 * In-memory group repository
 * Stores groups in memory (non-persistent)
 */
export class InMemoryGroupRepo implements GroupRepo {
  private groups: Map<string, Group>

  constructor(initialGroups: GroupType[] = []) {
    this.groups = new Map()

    // Load initial data
    initialGroups.forEach((data) => {
      const group = Group.fromData(data)
      this.groups.set(group.id, group)
    })
  }

  async create(input: CreateGroupInput): Promise<GroupType> {
    // Check handle uniqueness
    const handleExists = await this.handleExists(input.handle)
    if (handleExists) {
      throw new Error(`Group handle "${input.handle}" already exists`)
    }

    // Create group entity
    const group = Group.create(input)

    // Store
    this.groups.set(group.id, group)

    return group.toJSON()
  }

  async findById(id: string): Promise<GroupType | null> {
    const group = this.groups.get(id)
    return group ? group.toJSON() : null
  }

  async findByHandle(handle: string): Promise<GroupType | null> {
    const normalized = handle.toLowerCase()

    for (const group of this.groups.values()) {
      if (group.handle === normalized) {
        return group.toJSON()
      }
    }

    return null
  }

  async list(filters: GroupFilters = {}): Promise<GroupType[]> {
    let groups = Array.from(this.groups.values())

    // Apply type filter
    if (filters.type) {
      groups = groups.filter((g) => g.type === filters.type)
    }

    // Apply location filter
    if (filters.location) {
      groups = groups.filter((g) => g.matchesLocation(filters.location!))
    }

    // Apply member count filter
    if (filters.memberCount) {
      const { min, max } = filters.memberCount
      if (min !== undefined) {
        groups = groups.filter((g) => g.memberCount >= min)
      }
      if (max !== undefined) {
        groups = groups.filter((g) => g.memberCount <= max)
      }
    }

    // Apply search filter
    if (filters.search) {
      groups = groups.filter((g) => g.matchesSearch(filters.search!))
    }

    // Apply sorting
    const sortBy = filters.sortBy ?? 'newest'
    groups.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime()
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime()
        case 'most_members':
          return b.memberCount - a.memberCount
        case 'alphabetical':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    // Apply pagination
    const offset = filters.offset ?? 0
    const limit = filters.limit ?? 20
    groups = groups.slice(offset, offset + limit)

    return groups.map((g) => g.toJSON())
  }

  async update(id: string, updates: UpdateGroupInput): Promise<GroupType> {
    const group = this.groups.get(id)
    if (!group) {
      throw new Error(`Group with ID ${id} not found`)
    }

    // Update group
    const updated = group.update(updates)

    // Store updated version
    this.groups.set(id, updated)

    return updated.toJSON()
  }

  async addMember(groupId: string, memberId: string): Promise<void> {
    const group = this.groups.get(groupId)
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found`)
    }

    // Add member using entity method
    const updated = group.addMember(memberId)

    // Store updated version
    this.groups.set(groupId, updated)
  }

  async removeMember(groupId: string, memberId: string): Promise<void> {
    const group = this.groups.get(groupId)
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found`)
    }

    // Remove member using entity method
    const updated = group.removeMember(memberId)

    // Store updated version
    this.groups.set(groupId, updated)
  }

  async delete(id: string): Promise<void> {
    const deleted = this.groups.delete(id)
    if (!deleted) {
      throw new Error(`Group with ID ${id} not found`)
    }
  }

  async count(filters: GroupFilters = {}): Promise<number> {
    // For simplicity, get all matching groups and count them
    const groups = await this.list({ ...filters, limit: 10000, offset: 0 })
    return groups.length
  }

  async handleExists(handle: string): Promise<boolean> {
    const normalized = handle.toLowerCase()

    for (const group of this.groups.values()) {
      if (group.handle === normalized) {
        return true
      }
    }

    return false
  }

  /**
   * Test helper: Clear all groups
   */
  clear(): void {
    this.groups.clear()
  }

  /**
   * Test helper: Get all groups
   */
  getAll(): GroupType[] {
    return Array.from(this.groups.values()).map((g) => g.toJSON())
  }
}
