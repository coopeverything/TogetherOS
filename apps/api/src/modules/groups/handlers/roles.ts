// apps/api/src/modules/groups/handlers/roles.ts
// Role management handlers for groups

import { query } from '@togetheros/db'
import type { GroupRole, GroupRoleType } from '@togetheros/types/groups'
import { groupRepo } from '../repos/PostgresGroupRepo'

/**
 * Database row type for group_roles table
 */
interface GroupRoleRow {
  id: string
  group_id: string
  member_id: string
  role: GroupRoleType
  granted_at: Date
  expires_at: Date | null
  granted_by: string
  recallable: boolean
}

/**
 * Get all roles for a group (supports both UUIDs and slug-style IDs)
 */
export async function getGroupRoles(groupId: string): Promise<GroupRole[]> {
  if (!groupId || groupId.trim().length === 0) {
    throw new Error('Group ID is required')
  }

  // Check group exists
  const group = await groupRepo.findById(groupId)
  if (!group) {
    throw new Error('Group not found')
  }

  // Query roles from group_roles table
  const result = await query<GroupRoleRow>(
    `SELECT id, group_id, member_id, role, granted_at, expires_at, granted_by, recallable
     FROM group_roles
     WHERE group_id = $1
     ORDER BY granted_at DESC`,
    [groupId]
  )

  return result.rows.map((row: GroupRoleRow) => ({
    id: row.id,
    groupId: row.group_id,
    memberId: row.member_id,
    role: row.role,
    grantedAt: row.granted_at,
    expiresAt: row.expires_at ?? undefined,
    grantedBy: row.granted_by,
    recallable: row.recallable ?? true,
  }))
}

/**
 * Assign a role to a member (supports both UUIDs and slug-style IDs)
 */
export async function assignGroupRole(
  groupId: string,
  memberId: string,
  role: GroupRoleType,
  grantedBy: string,
  options?: {
    expiresAt?: Date
    recallable?: boolean
  }
): Promise<GroupRole> {
  if (!groupId || groupId.trim().length === 0) {
    throw new Error('Group ID is required')
  }
  if (!memberId || memberId.trim().length === 0) {
    throw new Error('Member ID is required')
  }
  if (!grantedBy || grantedBy.trim().length === 0) {
    throw new Error('Granter ID is required')
  }

  // Validate role
  const validRoles: GroupRoleType[] = ['admin', 'coordinator', 'member']
  if (!validRoles.includes(role)) {
    throw new Error('Invalid role type')
  }

  // Check group exists
  const group = await groupRepo.findById(groupId)
  if (!group) {
    throw new Error('Group not found')
  }

  // Check member is in group
  if (!group.members.includes(memberId)) {
    throw new Error('User is not a member of this group')
  }

  // Check if member already has this role
  const existingRole = await query<{ id: string }>(
    `SELECT id FROM group_roles WHERE group_id = $1 AND member_id = $2 AND role = $3`,
    [groupId, memberId, role]
  )

  if (existingRole.rows.length > 0) {
    throw new Error('Member already has this role')
  }

  // Insert new role
  const result = await query<GroupRoleRow>(
    `INSERT INTO group_roles (group_id, member_id, role, granted_at, expires_at, granted_by, recallable)
     VALUES ($1, $2, $3, NOW(), $4, $5, $6)
     RETURNING id, group_id, member_id, role, granted_at, expires_at, granted_by, recallable`,
    [
      groupId,
      memberId,
      role,
      options?.expiresAt ?? null,
      grantedBy,
      options?.recallable ?? true,
    ]
  )

  const row: GroupRoleRow = result.rows[0]
  return {
    id: row.id,
    groupId: row.group_id,
    memberId: row.member_id,
    role: row.role,
    grantedAt: row.granted_at,
    expiresAt: row.expires_at ?? undefined,
    grantedBy: row.granted_by,
    recallable: row.recallable,
  }
}

/**
 * Revoke a role from a member
 */
export async function revokeGroupRole(
  roleId: string,
  revokedBy: string
): Promise<void> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!roleId || !uuidRegex.test(roleId)) {
    throw new Error('Invalid role ID format')
  }
  if (!revokedBy || !uuidRegex.test(revokedBy)) {
    throw new Error('Invalid revoker ID format')
  }

  // Check role exists
  const existing = await query<{ id: string; recallable: boolean }>(
    `SELECT id, recallable FROM group_roles WHERE id = $1`,
    [roleId]
  )

  if (existing.rows.length === 0) {
    throw new Error('Role not found')
  }

  // Check if role is recallable
  if (!existing.rows[0].recallable) {
    throw new Error('This role cannot be revoked')
  }

  // Delete the role
  await query(`DELETE FROM group_roles WHERE id = $1`, [roleId])
}

/**
 * Check if a user has a specific role in a group
 */
export async function hasGroupRole(
  groupId: string,
  memberId: string,
  role: GroupRoleType
): Promise<boolean> {
  const result = await query<{ '?column?': number }>(
    `SELECT 1 FROM group_roles
     WHERE group_id = $1 AND member_id = $2 AND role = $3
     AND (expires_at IS NULL OR expires_at > NOW())`,
    [groupId, memberId, role]
  )

  return result.rows.length > 0
}

/**
 * Check if a user is an admin of a group
 */
export async function isGroupAdmin(
  groupId: string,
  memberId: string
): Promise<boolean> {
  return hasGroupRole(groupId, memberId, 'admin')
}
