/**
 * LocalStorageGroupRepo
 * Client-side group repository with localStorage persistence
 * Shares group data across page navigations
 */

import type {
  Group,
  CreateGroupInput,
  UpdateGroupInput,
  GroupFilters,
} from '@togetheros/types/groups'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'togetheros_groups'

/**
 * LocalStorage-backed group repository
 * Persists groups to localStorage for cross-page state
 */
export class LocalStorageGroupRepo {
  private groups: Map<string, Group>

  /**
   * Load groups from localStorage on init
   */
  constructor(fixtureGroups: Group[] = []) {
    this.groups = new Map()

    // Load from localStorage first
    this.loadFromStorage()

    // Add fixture groups if not already present
    fixtureGroups.forEach((group) => {
      if (!this.groups.has(group.id)) {
        this.groups.set(group.id, group)
      }
    })

    // Save initial state
    this.saveToStorage()
  }

  /**
   * Load groups from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const data = JSON.parse(stored) as Group[]

      // Store groups
      data.forEach((group) => {
        this.groups.set(group.id, {
          ...group,
          createdAt: new Date(group.createdAt),
          updatedAt: new Date(group.updatedAt),
        })
      })
    } catch (error) {
      console.error('Failed to load groups from localStorage:', error)
    }
  }

  /**
   * Save groups to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const groups = Array.from(this.groups.values())
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
    } catch (error) {
      console.error('Failed to save groups to localStorage:', error)
    }
  }

  /**
   * Create group and persist
   */
  async create(input: CreateGroupInput): Promise<Group> {
    // Check handle uniqueness
    const handleExists = await this.handleExists(input.handle)
    if (handleExists) {
      throw new Error(`Group handle "${input.handle}" already exists`)
    }

    const now = new Date()
    const group: Group = {
      id: uuidv4(),
      name: input.name,
      handle: input.handle.toLowerCase(),
      type: input.type,
      description: input.description,
      location: input.location,
      members: input.creatorId ? [input.creatorId] : [],
      createdAt: now,
      updatedAt: now,
    }

    this.groups.set(group.id, group)
    this.saveToStorage()

    return group
  }

  /**
   * Find group by ID
   */
  async findById(id: string): Promise<Group | null> {
    return this.groups.get(id) ?? null
  }

  /**
   * Find group by handle
   */
  async findByHandle(handle: string): Promise<Group | null> {
    const normalized = handle.toLowerCase()

    for (const group of this.groups.values()) {
      if (group.handle === normalized) {
        return group
      }
    }

    return null
  }

  /**
   * List groups with filters
   */
  async list(filters: GroupFilters = {}): Promise<Group[]> {
    let groups = Array.from(this.groups.values())

    // Apply type filter
    if (filters.type) {
      groups = groups.filter((g) => g.type === filters.type)
    }

    // Apply location filter
    if (filters.location) {
      const searchLocation = filters.location.toLowerCase()
      groups = groups.filter((g) =>
        g.location?.toLowerCase().includes(searchLocation)
      )
    }

    // Apply member count filter
    if (filters.memberCount) {
      const { min, max } = filters.memberCount
      if (min !== undefined) {
        groups = groups.filter((g) => g.members.length >= min)
      }
      if (max !== undefined) {
        groups = groups.filter((g) => g.members.length <= max)
      }
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      groups = groups.filter(
        (g) =>
          g.name.toLowerCase().includes(searchTerm) ||
          g.description?.toLowerCase().includes(searchTerm) ||
          g.handle.toLowerCase().includes(searchTerm)
      )
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
          return b.members.length - a.members.length
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

    return groups
  }

  /**
   * Update group and persist
   */
  async update(id: string, updates: UpdateGroupInput): Promise<Group> {
    const group = this.groups.get(id)
    if (!group) {
      throw new Error(`Group with ID ${id} not found`)
    }

    const updated: Group = {
      ...group,
      ...updates,
      updatedAt: new Date(),
    }

    this.groups.set(id, updated)
    this.saveToStorage()

    return updated
  }

  /**
   * Delete group and persist
   */
  async delete(id: string): Promise<void> {
    const deleted = this.groups.delete(id)
    if (!deleted) {
      throw new Error(`Group with ID ${id} not found`)
    }

    this.saveToStorage()
  }

  /**
   * Add member and persist
   */
  async addMember(groupId: string, userId: string): Promise<void> {
    const group = this.groups.get(groupId)
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found`)
    }

    if (!group.members.includes(userId)) {
      const updated: Group = {
        ...group,
        members: [...group.members, userId],
        updatedAt: new Date(),
      }

      this.groups.set(groupId, updated)
      this.saveToStorage()
    }
  }

  /**
   * Remove member and persist
   */
  async removeMember(groupId: string, userId: string): Promise<void> {
    const group = this.groups.get(groupId)
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found`)
    }

    const updated: Group = {
      ...group,
      members: group.members.filter((id) => id !== userId),
      updatedAt: new Date(),
    }

    this.groups.set(groupId, updated)
    this.saveToStorage()
  }

  /**
   * Count groups matching filters
   */
  async count(filters: GroupFilters = {}): Promise<number> {
    const groups = await this.list({ ...filters, limit: 10000, offset: 0 })
    return groups.length
  }

  /**
   * Check if handle exists
   */
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
   * Test helper: Get all groups
   */
  getAll(): Group[] {
    return Array.from(this.groups.values())
  }

  /**
   * Clear all stored groups (for testing)
   */
  static clearStorage(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }
}
