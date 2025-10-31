// packages/types/src/groups.ts
// TogetherOS Groups Module - Core Entity Definitions

/**
 * Group type classifications
 */
export type GroupType = 'local' | 'thematic' | 'federated'

/**
 * Member role within a group
 */
export type GroupRoleType = 'admin' | 'coordinator' | 'member'

/**
 * Membership status states
 */
export type MembershipStatus = 'active' | 'inactive' | 'pending' | 'suspended'

/**
 * Core group entity
 * Represents a cooperative organization or community
 */
export interface Group {
  /** Unique identifier (UUID v4) */
  id: string

  /** Display name (3-100 chars) */
  name: string

  /** Unique handle for federation (@group@domain.tld format) */
  handle: string

  /** Group classification */
  type: GroupType

  /** Description of the group's purpose (10-500 chars, optional) */
  description?: string

  /** Geographic location for local groups (optional) */
  location?: string

  /** Array of member IDs */
  members: string[]

  /** When group was created */
  createdAt: Date

  /** Last modification timestamp */
  updatedAt: Date
}

/**
 * Group role assignment
 * Tracks member roles with rotation and recall capabilities
 */
export interface GroupRole {
  /** Unique identifier (UUID v4) */
  id: string

  /** Group this role belongs to */
  groupId: string

  /** Member assigned to this role */
  memberId: string

  /** Role type */
  role: GroupRoleType

  /** When role was granted */
  grantedAt: Date

  /** Optional expiration date for term limits */
  expiresAt?: Date

  /** Member ID who granted this role */
  grantedBy: string

  /** Whether this role can be recalled by the group */
  recallable: boolean
}

/**
 * Group membership tracking
 * Records member participation and activity within a group
 */
export interface GroupMembership {
  /** Unique identifier (UUID v4) */
  id: string

  /** Group ID */
  groupId: string

  /** Member ID */
  memberId: string

  /** Current membership status */
  status: MembershipStatus

  /** When member joined the group */
  joinedAt: Date

  /** Last time member was active in group (optional) */
  lastActiveAt?: Date

  /** Optional introduction message */
  introMessage?: string
}

/**
 * Contribution record within a group
 */
export interface GroupContribution {
  /** Unique identifier (UUID v4) */
  id: string

  /** Group ID */
  groupId: string

  /** Member who made the contribution */
  memberId: string

  /** Type of contribution */
  type: 'proposal' | 'event' | 'mutual_aid' | 'resource' | 'coordination'

  /** Title/summary of contribution */
  title: string

  /** Detailed description (optional) */
  description?: string

  /** When contribution was made */
  timestamp: Date

  /** Whether contribution has been verified */
  verified: boolean
}

/**
 * Filters for querying groups
 */
export interface GroupFilters {
  /** Filter by group type */
  type?: GroupType

  /** Filter by location (partial match) */
  location?: string

  /** Filter by member count range */
  memberCount?: {
    min?: number
    max?: number
  }

  /** Search term (matches name or description) */
  search?: string

  /** Maximum results to return */
  limit?: number

  /** Pagination offset */
  offset?: number

  /** Sort order */
  sortBy?: 'newest' | 'oldest' | 'most_members' | 'alphabetical'
}

/**
 * Input for creating a new group
 */
export interface CreateGroupInput {
  /** Display name */
  name: string

  /** Unique handle */
  handle: string

  /** Group type */
  type: GroupType

  /** Optional description */
  description?: string

  /** Optional location (required for local groups) */
  location?: string

  /** Initial member ID (creator) */
  creatorId: string
}

/**
 * Input for updating an existing group
 */
export interface UpdateGroupInput {
  /** Updated name (optional) */
  name?: string

  /** Updated description (optional) */
  description?: string

  /** Updated location (optional) */
  location?: string
}

/**
 * Input for joining a group
 */
export interface JoinGroupInput {
  /** Group to join */
  groupId: string

  /** Member requesting to join */
  memberId: string

  /** Optional introduction message */
  message?: string
}

/**
 * Group statistics and metadata
 */
export interface GroupStats {
  /** Group ID */
  groupId: string

  /** Total member count */
  memberCount: number

  /** Number of active members (active in last 30 days) */
  activeMemberCount: number

  /** Total proposals created */
  proposalCount: number

  /** Total events organized */
  eventCount: number

  /** Group activity score (0-100) */
  activityScore: number

  /** Last time stats were calculated */
  calculatedAt: Date
}

/**
 * Federation sync metadata (future use)
 */
export interface FederatedGroupSync {
  /** Local group ID */
  localGroupId: string

  /** Remote group handle (@group@domain.tld) */
  remoteGroupHandle: string

  /** Remote instance domain */
  remoteInstance: string

  /** Last successful sync */
  syncedAt: Date

  /** Operations enabled for federation */
  operations: ('proposals' | 'events' | 'members')[]

  /** Sync status */
  status: 'active' | 'paused' | 'error'
}
