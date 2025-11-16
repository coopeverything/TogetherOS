// apps/api/src/modules/groups/repos/PostgresGroupRepo.ts
// PostgreSQL implementation of GroupRepo

import type { GroupRepo } from './GroupRepo'
import type {
  Group as GroupType,
  GroupFilters,
  CreateGroupInput,
  UpdateGroupInput,
} from '@togetheros/types/groups'
import { Group } from '../entities/Group'
import { query } from '@togetheros/db'

/**
 * PostgreSQL group repository
 * Stores groups in PostgreSQL database
 */
export class PostgresGroupRepo implements GroupRepo {
  async create(input: CreateGroupInput): Promise<GroupType> {
    // Check handle uniqueness
    const handleExists = await this.handleExists(input.handle)
    if (handleExists) {
      throw new Error(`Group handle "${input.handle}" already exists`)
    }

    // Create group entity (validates input)
    const group = Group.create(input)

    // Insert into database
    const result = await query<GroupType>(
      `INSERT INTO groups (id, name, handle, type, description, location, members, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        group.id,
        group.name,
        group.handle,
        group.type,
        group.description,
        group.location,
        JSON.stringify(group.members),
        group.createdAt,
        group.updatedAt,
      ]
    )

    return this.mapRowToGroup(result.rows[0])
  }

  async findById(id: string): Promise<GroupType | null> {
    const result = await query<any>(
      'SELECT * FROM groups WHERE id = $1 AND deleted_at IS NULL',
      [id]
    )

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToGroup(result.rows[0])
  }

  async findByHandle(handle: string): Promise<GroupType | null> {
    const normalized = handle.toLowerCase()

    const result = await query<any>(
      'SELECT * FROM groups WHERE handle = $1 AND deleted_at IS NULL',
      [normalized]
    )

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToGroup(result.rows[0])
  }

  async list(filters: GroupFilters = {}): Promise<GroupType[]> {
    const conditions: string[] = ['deleted_at IS NULL']
    const params: any[] = []
    let paramIndex = 1

    // Apply type filter
    if (filters.type) {
      conditions.push(`type = $${paramIndex}`)
      params.push(filters.type)
      paramIndex++
    }

    // Apply location filter (case-insensitive LIKE)
    if (filters.location) {
      conditions.push(`location ILIKE $${paramIndex}`)
      params.push(`%${filters.location}%`)
      paramIndex++
    }

    // Apply member count filter
    if (filters.memberCount) {
      const { min, max } = filters.memberCount

      if (min !== undefined) {
        conditions.push(`jsonb_array_length(members) >= $${paramIndex}`)
        params.push(min)
        paramIndex++
      }

      if (max !== undefined) {
        conditions.push(`jsonb_array_length(members) <= $${paramIndex}`)
        params.push(max)
        paramIndex++
      }
    }

    // Apply search filter (name, handle, or description)
    if (filters.search) {
      conditions.push(
        `(name ILIKE $${paramIndex} OR handle ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
      )
      params.push(`%${filters.search}%`)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Build ORDER BY clause
    const sortBy = filters.sortBy ?? 'newest'
    let orderByClause = ''

    switch (sortBy) {
      case 'newest':
        orderByClause = 'ORDER BY created_at DESC'
        break
      case 'oldest':
        orderByClause = 'ORDER BY created_at ASC'
        break
      case 'most_members':
        orderByClause = 'ORDER BY jsonb_array_length(members) DESC'
        break
      case 'alphabetical':
        orderByClause = 'ORDER BY name ASC'
        break
      default:
        orderByClause = 'ORDER BY created_at DESC'
    }

    // Apply pagination if provided
    let limitClause = ''
    if (filters.limit !== undefined) {
      limitClause = `LIMIT $${paramIndex}`
      params.push(filters.limit)
      paramIndex++

      if (filters.offset !== undefined) {
        limitClause += ` OFFSET $${paramIndex}`
        params.push(filters.offset)
        paramIndex++
      }
    }

    const result = await query<any>(
      `SELECT * FROM groups ${whereClause} ${orderByClause} ${limitClause}`,
      params
    )

    return result.rows.map((row) => this.mapRowToGroup(row))
  }

  async update(id: string, updates: UpdateGroupInput): Promise<GroupType> {
    // Fetch existing group
    const existing = await this.findById(id)
    if (!existing) {
      throw new Error(`Group with ID ${id} not found`)
    }

    // Reconstitute entity and apply updates
    const group = Group.fromData(existing)
    const updated = group.update(updates)

    // Update in database
    const result = await query<any>(
      `UPDATE groups
       SET name = $1, description = $2, location = $3, updated_at = $4
       WHERE id = $5 AND deleted_at IS NULL
       RETURNING *`,
      [updated.name, updated.description, updated.location, updated.updatedAt, id]
    )

    if (result.rows.length === 0) {
      throw new Error(`Failed to update group ${id}`)
    }

    return this.mapRowToGroup(result.rows[0])
  }

  async addMember(groupId: string, memberId: string): Promise<void> {
    // Fetch existing group
    const existing = await this.findById(groupId)
    if (!existing) {
      throw new Error(`Group with ID ${groupId} not found`)
    }

    // Reconstitute entity and add member (includes validation)
    const group = Group.fromData(existing)
    const updated = group.addMember(memberId)

    // Update in database
    await query(
      `UPDATE groups
       SET members = $1, updated_at = $2
       WHERE id = $3 AND deleted_at IS NULL`,
      [JSON.stringify(updated.members), updated.updatedAt, groupId]
    )
  }

  async removeMember(groupId: string, memberId: string): Promise<void> {
    // Fetch existing group
    const existing = await this.findById(groupId)
    if (!existing) {
      throw new Error(`Group with ID ${groupId} not found`)
    }

    // Reconstitute entity and remove member (includes validation)
    const group = Group.fromData(existing)
    const updated = group.removeMember(memberId)

    // Update in database
    await query(
      `UPDATE groups
       SET members = $1, updated_at = $2
       WHERE id = $3 AND deleted_at IS NULL`,
      [JSON.stringify(updated.members), updated.updatedAt, groupId]
    )
  }

  async delete(id: string): Promise<void> {
    // Soft delete
    await query('UPDATE groups SET deleted_at = NOW() WHERE id = $1', [id])
  }

  async count(filters: GroupFilters = {}): Promise<number> {
    const conditions: string[] = ['deleted_at IS NULL']
    const params: any[] = []
    let paramIndex = 1

    // Apply same filters as list() for consistency
    if (filters.type) {
      conditions.push(`type = $${paramIndex}`)
      params.push(filters.type)
      paramIndex++
    }

    if (filters.location) {
      conditions.push(`location ILIKE $${paramIndex}`)
      params.push(`%${filters.location}%`)
      paramIndex++
    }

    if (filters.memberCount) {
      const { min, max } = filters.memberCount

      if (min !== undefined) {
        conditions.push(`jsonb_array_length(members) >= $${paramIndex}`)
        params.push(min)
        paramIndex++
      }

      if (max !== undefined) {
        conditions.push(`jsonb_array_length(members) <= $${paramIndex}`)
        params.push(max)
        paramIndex++
      }
    }

    if (filters.search) {
      conditions.push(
        `(name ILIKE $${paramIndex} OR handle ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
      )
      params.push(`%${filters.search}%`)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM groups ${whereClause}`,
      params
    )

    return parseInt(result.rows[0].count)
  }

  async handleExists(handle: string): Promise<boolean> {
    const normalized = handle.toLowerCase()

    const result = await query<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM groups WHERE handle = $1 AND deleted_at IS NULL) as exists',
      [normalized]
    )

    return result.rows[0].exists
  }

  /**
   * Map database row to Group type
   */
  private mapRowToGroup(row: any): GroupType {
    return {
      id: row.id,
      name: row.name,
      handle: row.handle,
      type: row.type,
      description: row.description,
      location: row.location,
      members: typeof row.members === 'string' ? JSON.parse(row.members) : row.members,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}

// Export singleton instance
export const groupRepo = new PostgresGroupRepo()
