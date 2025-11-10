// apps/api/src/modules/groups/entities/Group.ts
// Domain entity for Group - Pure business logic

import type { Group as GroupType, GroupType as GroupTypeEnum } from '@togetheros/types/groups'
import { groupSchema } from '@togetheros/validators/groups'
import { v4 as uuidv4 } from 'uuid'

/**
 * Group entity
 * Represents a cooperative organization with business logic
 */
export class Group {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly handle: string,
    public readonly type: GroupTypeEnum,
    public readonly description: string | undefined,
    public readonly location: string | undefined,
    public readonly members: ReadonlyArray<string>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Factory: Create new group
   */
  static create(input: {
    name: string
    handle: string
    type: GroupTypeEnum
    description?: string
    location?: string
    creatorId?: string
  }): Group {
    const now = new Date()

    // Validate input
    const validated = groupSchema.parse({
      id: uuidv4(),
      name: input.name,
      handle: input.handle.toLowerCase(),
      type: input.type,
      description: input.description,
      location: input.location,
      members: input.creatorId ? [input.creatorId] : [],
      createdAt: now,
      updatedAt: now,
    })

    return new Group(
      validated.id,
      validated.name,
      validated.handle,
      validated.type,
      validated.description,
      validated.location,
      validated.members,
      validated.createdAt,
      validated.updatedAt
    )
  }

  /**
   * Factory: Reconstitute from storage
   */
  static fromData(data: GroupType): Group {
    const validated = groupSchema.parse(data)

    return new Group(
      validated.id,
      validated.name,
      validated.handle,
      validated.type,
      validated.description,
      validated.location,
      validated.members,
      validated.createdAt,
      validated.updatedAt
    )
  }

  /**
   * Add member to group
   * Returns new Group instance (immutable pattern)
   */
  addMember(memberId: string): Group {
    // Prevent duplicates
    if (this.members.includes(memberId)) {
      throw new Error('Member already in group')
    }

    // Business rule: max 1000 members per group (prevents spam)
    if (this.members.length >= 1000) {
      throw new Error('Group has reached maximum member capacity (1000)')
    }

    return new Group(
      this.id,
      this.name,
      this.handle,
      this.type,
      this.description,
      this.location,
      [...this.members, memberId],
      this.createdAt,
      new Date() // Update timestamp
    )
  }

  /**
   * Remove member from group
   * Returns new Group instance (immutable pattern)
   */
  removeMember(memberId: string): Group {
    // Check if member exists
    if (!this.members.includes(memberId)) {
      throw new Error('Member not in group')
    }

    // Business rule: cannot remove last member
    if (this.members.length === 1) {
      throw new Error('Cannot remove last member from group')
    }

    return new Group(
      this.id,
      this.name,
      this.handle,
      this.type,
      this.description,
      this.location,
      this.members.filter((id) => id !== memberId),
      this.createdAt,
      new Date() // Update timestamp
    )
  }

  /**
   * Update group metadata
   * Returns new Group instance (immutable pattern)
   */
  update(updates: {
    name?: string
    description?: string
    location?: string
  }): Group {
    return new Group(
      this.id,
      updates.name ?? this.name,
      this.handle, // Handle cannot be changed
      this.type, // Type cannot be changed
      updates.description ?? this.description,
      updates.location ?? this.location,
      this.members,
      this.createdAt,
      new Date() // Update timestamp
    )
  }

  /**
   * Check if member is in group
   */
  hasMember(memberId: string): boolean {
    return this.members.includes(memberId)
  }

  /**
   * Get member count
   */
  get memberCount(): number {
    return this.members.length
  }

  /**
   * Check if group is local (has location)
   */
  get isLocal(): boolean {
    return this.type === 'local'
  }

  /**
   * Check if group is global (formerly federated)
   */
  get isGlobal(): boolean {
    return this.type === 'global'
  }

  /**
   * Get federation handle (for future use)
   * Format: @handle@domain.tld
   */
  getFederationHandle(domain: string): string {
    return `@${this.handle}@${domain}`
  }

  /**
   * Serialize to plain object for storage
   */
  toJSON(): GroupType {
    return {
      id: this.id,
      name: this.name,
      handle: this.handle,
      type: this.type,
      description: this.description,
      location: this.location,
      members: [...this.members],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  /**
   * Check if group matches search query
   */
  matchesSearch(query: string): boolean {
    const lowerQuery = query.toLowerCase()
    return (
      this.name.toLowerCase().includes(lowerQuery) ||
      this.handle.toLowerCase().includes(lowerQuery) ||
      (this.description?.toLowerCase().includes(lowerQuery) ?? false)
    )
  }

  /**
   * Check if group matches location filter
   */
  matchesLocation(location: string): boolean {
    if (!this.location) return false
    return this.location.toLowerCase().includes(location.toLowerCase())
  }
}
