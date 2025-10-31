// apps/api/src/modules/groups/repos/GroupRepo.ts
// Repository interface for Group entity

import type { Group as GroupType, GroupFilters, CreateGroupInput, UpdateGroupInput } from '@togetheros/types/groups'

/**
 * Group repository interface
 * Defines contract for data access
 */
export interface GroupRepo {
  /**
   * Create a new group
   */
  create(input: CreateGroupInput): Promise<GroupType>

  /**
   * Find group by ID
   */
  findById(id: string): Promise<GroupType | null>

  /**
   * Find group by unique handle
   */
  findByHandle(handle: string): Promise<GroupType | null>

  /**
   * List groups with filters
   */
  list(filters?: GroupFilters): Promise<GroupType[]>

  /**
   * Update group metadata
   */
  update(id: string, updates: UpdateGroupInput): Promise<GroupType>

  /**
   * Add member to group
   */
  addMember(groupId: string, memberId: string): Promise<void>

  /**
   * Remove member from group
   */
  removeMember(groupId: string, memberId: string): Promise<void>

  /**
   * Delete group
   */
  delete(id: string): Promise<void>

  /**
   * Count groups (for pagination)
   */
  count(filters?: GroupFilters): Promise<number>

  /**
   * Check if handle exists (for uniqueness validation)
   */
  handleExists(handle: string): Promise<boolean>
}
