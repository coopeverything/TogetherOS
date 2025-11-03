// apps/api/src/modules/groups/handlers/growth.ts
// API handlers for group growth tracking and milestones

import type { GroupGrowthData, Milestone, MilestoneAchievement } from '@togetheros/types'
import { InMemoryGroupRepo } from '../repos/InMemoryGroupRepo'
import { getFixtureGroups } from '../fixtures'

// Milestone definitions (matching GroupGrowthTracker component)
export const MILESTONES: Milestone[] = [
  {
    id: 'community-ready',
    threshold: 5,
    label: 'Community Ready',
    celebration: 'Your group is officially active!',
    unlocks: ['Basic group features', 'Post creation', 'Member discussions'],
  },
  {
    id: 'active-network',
    threshold: 15,
    label: 'Active Network',
    celebration: 'Your community is growing strong!',
    unlocks: ['Federated partnerships', 'Inter-group proposals', 'Resource sharing'],
    actionNudge: {
      text: 'Invite someone in',
      reward: 25,
    },
  },
  {
    id: 'thriving-hub',
    threshold: 25,
    label: 'Thriving Hub',
    celebration: "You're building something special!",
    unlocks: ['Priority visibility', 'Featured group status', 'Cross-group events'],
    actionNudge: {
      text: 'Invite someone in',
      reward: 50,
    },
  },
  {
    id: 'established-community',
    threshold: 50,
    label: 'Established Community',
    celebration: 'Your community is flourishing!',
    unlocks: ['Advanced governance tools', 'Subgroup creation', 'Regional partnerships'],
    actionNudge: {
      text: 'Invite someone in',
      reward: 100,
    },
  },
  {
    id: 'major-hub',
    threshold: 100,
    label: 'Major Hub',
    celebration: "You're a major force for cooperation!",
    unlocks: ['Leadership training', 'Resource distribution', 'Movement building'],
    actionNudge: {
      text: 'Invite someone in',
      reward: 200,
    },
  },
  {
    id: 'regional-powerhouse',
    threshold: 150,
    label: 'Regional Powerhouse',
    celebration: 'Your community is a model for others!',
    unlocks: ['National federation', 'Policy influence', 'Solidarity economy'],
    actionNudge: {
      text: 'Invite someone in',
      reward: 300,
    },
  },
]

// Singleton repo for in-memory storage
let groupRepo: InMemoryGroupRepo | null = null

/**
 * Get or initialize group repo
 */
function getGroupRepo(): InMemoryGroupRepo {
  if (!groupRepo) {
    groupRepo = new InMemoryGroupRepo(getFixtureGroups())
  }
  return groupRepo
}

/**
 * Mock growth history data
 * In production, this would come from a database tracking member joins/leaves
 */
const mockGrowthHistory = new Map<string, MilestoneAchievement[]>([
  [
    'group-boston-coop',
    [
      {
        milestoneId: 'community-ready',
        achievedAt: new Date('2024-06-20T10:00:00Z'),
        memberCountAtAchievement: 5,
      },
    ],
  ],
  [
    'group-oakland-tools',
    [
      {
        milestoneId: 'community-ready',
        achievedAt: new Date('2024-08-15T09:00:00Z'),
        memberCountAtAchievement: 5,
      },
    ],
  ],
  [
    'group-oss-educators',
    [
      {
        milestoneId: 'community-ready',
        achievedAt: new Date('2024-07-05T12:00:00Z'),
        memberCountAtAchievement: 5,
      },
    ],
  ],
  [
    'group-climate-adaptation',
    [
      {
        milestoneId: 'community-ready',
        achievedAt: new Date('2024-09-10T08:30:00Z'),
        memberCountAtAchievement: 5,
      },
    ],
  ],
  [
    'group-housing-alliance',
    [
      {
        milestoneId: 'community-ready',
        achievedAt: new Date('2024-05-25T14:00:00Z'),
        memberCountAtAchievement: 5,
      },
    ],
  ],
])

/**
 * GET /api/groups/:groupId/growth
 * Get growth data for a specific group
 */
export async function getGroupGrowth(groupId: string): Promise<GroupGrowthData | null> {
  const repo = getGroupRepo()
  const group = await repo.findById(groupId)

  if (!group) {
    return null
  }

  // Calculate recent growth (mock: assume +1 in last week)
  const recentGrowth = group.members.length > 3 ? 1 : 0

  // Get milestone achievements
  const achievedMilestones = mockGrowthHistory.get(groupId) || []

  return {
    groupId: group.id,
    currentMemberCount: group.members.length,
    recentGrowth,
    location: group.location || 'Unknown',
    achievedMilestones,
  }
}

/**
 * GET /api/groups/by-location/:location/growth
 * Get growth data for groups in a specific location
 * Returns the first matching local group
 */
export async function getGroupGrowthByLocation(location: string): Promise<GroupGrowthData | null> {
  const repo = getGroupRepo()

  // Find local groups matching location
  const groups = await repo.list({
    type: 'local',
    location,
    limit: 1,
  })

  if (groups.length === 0) {
    return null
  }

  const group = groups[0]

  // Calculate recent growth
  const recentGrowth = group.members.length > 3 ? 1 : 0

  // Get milestone achievements
  const achievedMilestones = mockGrowthHistory.get(group.id) || []

  return {
    groupId: group.id,
    currentMemberCount: group.members.length,
    recentGrowth,
    location: group.location || location,
    achievedMilestones,
  }
}

/**
 * GET /api/milestones
 * Get all milestone definitions
 */
export async function getMilestones(): Promise<Milestone[]> {
  return MILESTONES
}

/**
 * Calculate which milestones a group has achieved
 */
export function calculateAchievedMilestones(memberCount: number): Milestone[] {
  return MILESTONES.filter((m) => m.threshold <= memberCount)
}

/**
 * Find the next milestone for a group
 */
export function findNextMilestone(memberCount: number): Milestone | null {
  return MILESTONES.find((m) => m.threshold > memberCount) || null
}
