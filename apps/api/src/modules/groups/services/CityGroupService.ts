// apps/api/src/modules/groups/services/CityGroupService.ts
// City Group Auto-Creation and Management Service

import type { CreateGroupInput, Group } from '@togetheros/types/groups'
import type { GeocodedLocation } from '../../geo/services/NominatimService'

/**
 * Service for managing auto-created city groups
 * Handles creation, membership, and moderator assignment
 */
export class CityGroupService {
  /**
   * Ensure a city group exists for the given location
   * Creates it if it doesn't exist
   * Returns the city group
   */
  async ensureCityGroup(geocoded: GeocodedLocation): Promise<Group> {
    const handle = this.generateCityGroupHandle(geocoded.city, geocoded.state)
    const name = `${geocoded.city}, ${geocoded.state}`

    // Check if city group already exists
    // Note: This would use groupRepo.findByHandle() in real implementation
    // For now, this is a placeholder that shows the logic flow

    const existingGroup = null // await groupRepo.findByHandle(handle)

    if (existingGroup) {
      return existingGroup
    }

    // Create new city group
    const groupInput: CreateGroupInput = {
      name,
      handle,
      type: 'local',
      description: `Auto-created city group for ${name}`,
      cooperationPath: 'Community Connection', // Default for city groups
      tags: ['city', 'local', geocoded.city.toLowerCase()],
      isCityGroup: true,
      creatorId: undefined, // System-created, no creator
      geocodedCity: geocoded.city,
      geocodedState: geocoded.state,
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
    }

    // Create group (would use groupRepo.create() in real implementation)
    const cityGroup = null as any // await groupRepo.create(groupInput)

    return cityGroup
  }

  /**
   * Add user to city group and grant moderator if first 5 members
   * Returns whether moderator was granted
   */
  async addUserToCityGroup(
    groupId: string,
    userId: string
  ): Promise<{ isModerator: boolean; memberCount: number }> {
    // Add user to group_members table
    // await groupRepo.addMember(groupId, userId)

    // Get current member count
    const memberCount = 0 // await groupRepo.getMemberCount(groupId)

    // Grant moderator if first 5 members
    const isModerator = memberCount <= 5
    if (isModerator) {
      // await groupRepo.addModerator(groupId, userId, 'system')
      // await groupRepo.incrementModeratorCount(groupId)
    }

    return { isModerator, memberCount }
  }

  /**
   * Generate a unique handle for a city group
   * Format: city-state (e.g., "oakland-ca", "new-york-ny")
   */
  private generateCityGroupHandle(city: string, state: string): string {
    const citySlug = city
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const stateSlug = state
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    return `${citySlug}-${stateSlug}`
  }

  /**
   * Check if user is a moderator of a group
   */
  async isModerator(groupId: string, userId: string): Promise<boolean> {
    // Query group_moderators table
    // const result = await groupRepo.isModerator(groupId, userId)
    return false // Placeholder
  }

  /**
   * Get list of local thematic groups in a city
   * Excludes city groups, returns only thematic/national groups in that location
   */
  async getLocalThematicGroups(city: string): Promise<Group[]> {
    // Query groups WHERE geocoded_city = city AND is_city_group = FALSE
    // const groups = await groupRepo.list({
    //   city,
    //   excludeCityGroups: true,
    //   sortBy: 'most_members'
    // })
    return [] // Placeholder
  }
}

// Singleton instance
export const cityGroupService = new CityGroupService()
