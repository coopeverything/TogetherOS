// apps/api/src/modules/groups/handlers/crud.ts
// CRUD handlers for groups

import { groupRepo } from '../repos/PostgresGroupRepo';
import type {
  Group,
  CreateGroupInput,
  UpdateGroupInput,
  GroupFilters,
} from '@togetheros/types/groups';

/**
 * Create a new group
 */
export async function createGroup(input: CreateGroupInput): Promise<Group> {
  // Validate required fields
  if (!input.name || input.name.length < 3 || input.name.length > 100) {
    throw new Error('Group name must be between 3 and 100 characters');
  }

  if (!input.handle || !input.handle.match(/^[a-z0-9-]+$/)) {
    throw new Error('Group handle must contain only lowercase letters, numbers, and hyphens');
  }

  if (!input.type || !['local', 'thematic', 'federated'].includes(input.type)) {
    throw new Error('Invalid group type');
  }

  if (!input.creatorId) {
    throw new Error('Creator ID is required');
  }

  // For local groups, location is required
  if (input.type === 'local' && !input.location) {
    throw new Error('Location is required for local groups');
  }

  // Check if handle already exists
  const handleExists = await groupRepo.handleExists(input.handle);
  if (handleExists) {
    throw new Error(`Group handle "${input.handle}" is already taken`);
  }

  // Create group
  const group = await groupRepo.create(input);
  return group;
}

/**
 * Get group by ID
 */
export async function getGroupById(id: string): Promise<Group | null> {
  if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    throw new Error('Invalid group ID format');
  }

  return await groupRepo.findById(id);
}

/**
 * Get group by handle
 */
export async function getGroupByHandle(handle: string): Promise<Group | null> {
  if (!handle) {
    throw new Error('Handle is required');
  }

  return await groupRepo.findByHandle(handle);
}

/**
 * List groups with optional filters
 */
export async function listGroups(filters?: GroupFilters): Promise<{
  groups: Group[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const limit = filters?.limit || 20;
  const offset = filters?.offset || 0;
  const page = Math.floor(offset / limit) + 1;

  const [groups, total] = await Promise.all([
    groupRepo.list(filters),
    groupRepo.count(filters),
  ]);

  return {
    groups,
    total,
    page,
    pageSize: limit,
  };
}

/**
 * Update group metadata
 */
export async function updateGroup(
  id: string,
  updates: UpdateGroupInput
): Promise<Group> {
  if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    throw new Error('Invalid group ID format');
  }

  // Validate updates
  if (updates.name !== undefined) {
    if (updates.name.length < 3 || updates.name.length > 100) {
      throw new Error('Group name must be between 3 and 100 characters');
    }
  }

  if (updates.description !== undefined) {
    if (updates.description.length < 10 || updates.description.length > 500) {
      throw new Error('Description must be between 10 and 500 characters');
    }
  }

  // Check group exists
  const existingGroup = await groupRepo.findById(id);
  if (!existingGroup) {
    throw new Error('Group not found');
  }

  return await groupRepo.update(id, updates);
}

/**
 * Delete group (soft delete)
 */
export async function deleteGroup(id: string): Promise<void> {
  if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    throw new Error('Invalid group ID format');
  }

  // Check group exists
  const existingGroup = await groupRepo.findById(id);
  if (!existingGroup) {
    throw new Error('Group not found');
  }

  await groupRepo.delete(id);
}

/**
 * Add member to group
 */
export async function addGroupMember(
  groupId: string,
  memberId: string
): Promise<void> {
  if (!groupId || !groupId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    throw new Error('Invalid group ID format');
  }

  if (!memberId || !memberId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    throw new Error('Invalid member ID format');
  }

  // Check group exists
  const group = await groupRepo.findById(groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  // Check if already a member
  if (group.members.includes(memberId)) {
    throw new Error('User is already a member of this group');
  }

  await groupRepo.addMember(groupId, memberId);
}

/**
 * Remove member from group
 */
export async function removeGroupMember(
  groupId: string,
  memberId: string
): Promise<void> {
  if (!groupId || !groupId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    throw new Error('Invalid group ID format');
  }

  if (!memberId || !memberId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    throw new Error('Invalid member ID format');
  }

  // Check group exists
  const group = await groupRepo.findById(groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  // Check if member exists in group
  if (!group.members.includes(memberId)) {
    throw new Error('User is not a member of this group');
  }

  await groupRepo.removeMember(groupId, memberId);
}
