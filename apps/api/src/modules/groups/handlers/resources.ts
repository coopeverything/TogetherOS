// apps/api/src/modules/groups/handlers/resources.ts
// Resource management handlers for groups

import { query } from '@togetheros/db'
import type {
  GroupResource,
  GroupResourceType,
  CreateGroupResourceInput,
} from '@togetheros/types/groups'
import { groupRepo } from '../repos/PostgresGroupRepo'

/**
 * Get all resources for a group
 */
export async function getGroupResources(groupId: string): Promise<GroupResource[]> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!groupId || !uuidRegex.test(groupId)) {
    throw new Error('Invalid group ID format')
  }

  const group = await groupRepo.findById(groupId)
  if (!group) {
    throw new Error('Group not found')
  }

  const result = await query<any>(
    `SELECT * FROM group_resources WHERE group_id = $1 ORDER BY created_at DESC`,
    [groupId]
  )

  return result.rows.map(mapRowToResource)
}

/**
 * Create a new resource
 */
export async function createGroupResource(
  input: CreateGroupResourceInput,
  contributedBy: string
): Promise<GroupResource> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!input.groupId || !uuidRegex.test(input.groupId)) {
    throw new Error('Invalid group ID format')
  }
  if (!contributedBy || !uuidRegex.test(contributedBy)) {
    throw new Error('Invalid contributor ID format')
  }

  const group = await groupRepo.findById(input.groupId)
  if (!group) {
    throw new Error('Group not found')
  }

  if (!input.name || input.name.length < 2 || input.name.length > 100) {
    throw new Error('Resource name must be between 2 and 100 characters')
  }

  const validTypes: GroupResourceType[] = ['money', 'time', 'equipment', 'space', 'skill', 'material']
  if (!validTypes.includes(input.resourceType)) {
    throw new Error('Invalid resource type')
  }

  const result = await query<any>(
    `INSERT INTO group_resources (
      group_id, name, description, resource_type, quantity, unit,
      is_available, available_from, available_until, contributed_by, tags
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      input.groupId,
      input.name,
      input.description || null,
      input.resourceType,
      input.quantity ?? 0,
      input.unit || null,
      true,
      input.availableFrom || null,
      input.availableUntil || null,
      contributedBy,
      JSON.stringify(input.tags || []),
    ]
  )

  return mapRowToResource(result.rows[0])
}

/**
 * Update a resource
 */
export async function updateGroupResource(
  resourceId: string,
  updates: Partial<CreateGroupResourceInput>
): Promise<GroupResource> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!resourceId || !uuidRegex.test(resourceId)) {
    throw new Error('Invalid resource ID format')
  }

  const existing = await query<any>(
    `SELECT * FROM group_resources WHERE id = $1`,
    [resourceId]
  )

  if (existing.rows.length === 0) {
    throw new Error('Resource not found')
  }

  const result = await query<any>(
    `UPDATE group_resources SET
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      quantity = COALESCE($3, quantity),
      unit = COALESCE($4, unit),
      updated_at = NOW()
    WHERE id = $5 RETURNING *`,
    [
      updates.name || null,
      updates.description || null,
      updates.quantity ?? null,
      updates.unit || null,
      resourceId,
    ]
  )

  return mapRowToResource(result.rows[0])
}

/**
 * Delete a resource
 */
export async function deleteGroupResource(resourceId: string): Promise<void> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!resourceId || !uuidRegex.test(resourceId)) {
    throw new Error('Invalid resource ID format')
  }

  await query(`DELETE FROM group_resources WHERE id = $1`, [resourceId])
}

function mapRowToResource(row: any): GroupResource {
  return {
    id: row.id,
    groupId: row.group_id,
    name: row.name,
    description: row.description,
    resourceType: row.resource_type,
    quantity: parseFloat(row.quantity) || 0,
    unit: row.unit,
    isAvailable: row.is_available,
    availableFrom: row.available_from,
    availableUntil: row.available_until,
    contributedBy: row.contributed_by,
    contributedAt: row.contributed_at,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
