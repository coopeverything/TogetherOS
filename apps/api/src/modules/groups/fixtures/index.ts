// apps/api/src/modules/groups/fixtures/index.ts
// Fixture data loader for groups

import type { Group, GroupType } from '@togetheros/types/groups'
import fixtureData from './groups.json'

/**
 * Get all fixture groups
 */
export function getFixtureGroups(): Group[] {
  return fixtureData.groups.map((group) => ({
    ...group,
    type: group.type as GroupType,
    createdAt: new Date(group.createdAt),
    updatedAt: new Date(group.updatedAt),
  }))
}

/**
 * Get fixture group by ID
 */
export function getFixtureGroupById(id: string): Group | undefined {
  const group = fixtureData.groups.find((g) => g.id === id)
  if (!group) return undefined

  return {
    ...group,
    type: group.type as GroupType,
    createdAt: new Date(group.createdAt),
    updatedAt: new Date(group.updatedAt),
  }
}

/**
 * Get fixture group by handle
 */
export function getFixtureGroupByHandle(handle: string): Group | undefined {
  const group = fixtureData.groups.find((g) => g.handle === handle)
  if (!group) return undefined

  return {
    ...group,
    type: group.type as GroupType,
    createdAt: new Date(group.createdAt),
    updatedAt: new Date(group.updatedAt),
  }
}

/**
 * Get all fixture members (basic info)
 */
export function getFixtureMembers() {
  return fixtureData.members
}
