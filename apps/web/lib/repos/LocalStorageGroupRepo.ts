/**
 * LocalStorageGroupRepo
 * Extends InMemoryGroupRepo with localStorage persistence
 * Shares group data across page navigations
 */

import { InMemoryGroupRepo } from './InMemoryGroupRepo'
import type { Group as GroupType, CreateGroupInput, UpdateGroupInput, GroupFilters } from '@togetheros/types/groups'
import { Group } from '../entities/Group'

const STORAGE_KEY = 'togetheros_groups'

/**
 * LocalStorage-backed group repository
 * Persists groups to localStorage for cross-page state
 */
export class LocalStorageGroupRepo extends InMemoryGroupRepo {
  /**
   * Load groups from localStorage on init
   */
  constructor(fixtureGroups?: GroupType[]) {
    super(fixtureGroups)
    this.loadFromStorage()
  }

  /**
   * Load groups from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const data = JSON.parse(stored) as GroupType[]

      // Convert stored JSON back to Group entities
      data.forEach((groupData) => {
        const group = Group.fromData(groupData)
        this.groups.set(group.id, group)
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
      const groups = Array.from(this.groups.values()).map((g) => g.toJSON())
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
    } catch (error) {
      console.error('Failed to save groups to localStorage:', error)
    }
  }

  /**
   * Create group and persist
   */
  override async create(input: CreateGroupInput): Promise<GroupType> {
    const group = await super.create(input)
    this.saveToStorage()
    return group
  }

  /**
   * Update group and persist
   */
  override async update(id: string, input: UpdateGroupInput): Promise<GroupType> {
    const group = await super.update(id, input)
    this.saveToStorage()
    return group
  }

  /**
   * Delete group and persist
   */
  override async delete(id: string): Promise<void> {
    await super.delete(id)
    this.saveToStorage()
  }

  /**
   * Add member and persist
   */
  override async addMember(groupId: string, userId: string): Promise<void> {
    await super.addMember(groupId, userId)
    this.saveToStorage()
  }

  /**
   * Remove member and persist
   */
  override async removeMember(groupId: string, userId: string): Promise<void> {
    await super.removeMember(groupId, userId)
    this.saveToStorage()
  }

  /**
   * Clear all stored groups (for testing)
   */
  static clearStorage(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }
}
