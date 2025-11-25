/**
 * Milestone type definitions for group growth tracking
 * Based on gamification spec (docs/modules/gamification.md)
 */

/**
 * Milestone definition (static configuration)
 */
export interface Milestone {
  id: string
  threshold: number
  label: string
  celebration: string
  unlocks: string[]
  actionNudge?: {
    text: string
    reward: number // Reward Points (RP)
  }
}

/**
 * Database record for gamification_milestones table
 */
export interface MilestoneRecord {
  id: string
  groupId: string
  threshold: number
  achievedAt: Date
  memberCount: number
  triggeredByMemberId: string | null
  createdAt: Date
}

/**
 * Database record for gamification_milestone_celebrations table
 */
export interface MilestoneCelebrationRecord {
  id: string
  milestoneId: string
  userId: string
  shownAt: Date
  actionTaken: boolean
  actionTakenAt: Date | null
  createdAt: Date
}

/**
 * Pending celebration to show to user
 */
export interface PendingCelebration {
  milestoneId: string
  milestone: Milestone
  groupId: string
  groupName: string
  achievedAt: Date
  memberCount: number
}

/**
 * Milestone achievement (for display)
 */
export interface MilestoneAchievement {
  milestoneId: string
  achievedAt: Date
  memberCountAtAchievement: number
}

/**
 * Group growth data for sidebar display
 */
export interface GroupGrowthData {
  groupId: string
  currentMemberCount: number
  recentGrowth: number
  location: string
  achievedMilestones: MilestoneAchievement[]
}

/**
 * User gamification settings
 */
export interface GamificationUserSettings {
  userId: string
  quietMode: boolean
  hideRpBalance: boolean
  showMilestones: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Milestone definitions (based on Dunbar research)
 */
export const MILESTONES: Milestone[] = [
  {
    id: 'core-circle',
    threshold: 5,
    label: 'Core Circle Formed',
    celebration: "You've formed a core support network! Five people ready to build something together.",
    unlocks: ['Private group chat', 'Schedule first planning call', 'Draft shared purpose statement'],
    actionNudge: {
      text: 'Will you be the first to suggest a shared goal?',
      reward: 50,
    },
  },
  {
    id: 'community-ready',
    threshold: 15,
    label: 'Community Ready',
    celebration: "You've built a close community! Time to meet in person and strengthen bonds.",
    unlocks: ['Host public meetups', 'Create subgroups for focused work', 'Run local proposals'],
    actionNudge: {
      text: "We're 15 now, will you be the first to organize a meetup?",
      reward: 100,
    },
  },
  {
    id: 'active-network',
    threshold: 25,
    label: 'Active Network',
    celebration: "Your community is thriving! You've passed the awkward phase where coordination gets tricky.",
    unlocks: ['Federated partnerships with other local groups', 'Resource sharing board', 'Event calendar integration'],
    actionNudge: {
      text: 'Ready to connect with other TogetherOS groups in your region?',
      reward: 75,
    },
  },
  {
    id: 'sustainable-community',
    threshold: 50,
    label: 'Sustainable Community',
    celebration: "You've reached sustainable size! This is a proven community scale for long-term coordination.",
    unlocks: ['Working groups', 'Collective purchasing', 'Time bank activation'],
    actionNudge: {
      text: 'Will you launch the first working group or mutual aid project?',
      reward: 150,
    },
  },
  {
    id: 'strong-coalition',
    threshold: 100,
    label: 'Strong Coalition',
    celebration: "100 strong! You're a model for other communities building cooperative power.",
    unlocks: ['Multi-group initiatives', 'Regional influence', 'Mentorship program'],
    actionNudge: {
      text: 'Ready to mentor a new local group?',
      reward: 200,
    },
  },
  {
    id: 'dunbar-community',
    threshold: 150,
    label: 'Dunbar Community',
    celebration: "You've reached the classic Dunbar number! This is peak community cohesion—everyone can know everyone.",
    unlocks: ['Full governance autonomy', 'Chapter recognition', 'Grant eligibility'],
    actionNudge: {
      text: "Will you draft your community's first formal governance proposal?",
      reward: 250,
    },
  },
]

/**
 * Get milestone definition by threshold
 */
export function getMilestoneByThreshold(threshold: number): Milestone | undefined {
  return MILESTONES.find(m => m.threshold === threshold)
}

/**
 * Get next milestone for a given member count
 */
export function getNextMilestone(memberCount: number): Milestone | undefined {
  return MILESTONES.find(m => m.threshold > memberCount)
}

/**
 * Calculate progress to next milestone (0-100)
 */
export function calculateMilestoneProgress(memberCount: number): number {
  const achieved = MILESTONES.filter(m => m.threshold <= memberCount)
  const next = getNextMilestone(memberCount)

  if (!next) return 100 // All milestones achieved

  const previous = achieved.length > 0 ? achieved[achieved.length - 1] : { threshold: 0 }
  const progress = ((memberCount - previous.threshold) / (next.threshold - previous.threshold)) * 100

  return Math.min(100, Math.max(0, Math.round(progress)))
}
