// packages/types/src/groups.ts
// TogetherOS Groups Module - Core Entity Definitions

/**
 * Group type classifications
 */
export type GroupType = 'local' | 'national' | 'global'

/**
 * Cooperation Path categories (one of 8 core paths)
 */
export type CooperationPath =
  | 'Collaborative Education'
  | 'Social Economy'
  | 'Common Wellbeing'
  | 'Cooperative Technology'
  | 'Collective Governance'
  | 'Community Connection'
  | 'Collaborative Media & Culture'
  | 'Common Planet'

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

  /** Custom searchable tags (0-5 tags) */
  tags?: string[]

  /** Required cooperation path (one of 8 paths, optional for city groups) */
  cooperationPath?: CooperationPath

  /** Whether this is an auto-created city group */
  isCityGroup?: boolean

  /** Number of moderators (first 5 members for city groups) */
  moderatorCount?: number

  /** User who created the group (null for system-created city groups) */
  creatorId?: string

  /** Geocoded city name (for city groups) */
  geocodedCity?: string

  /** Geocoded state (for city groups) */
  geocodedState?: string

  /** Latitude coordinate */
  latitude?: number

  /** Longitude coordinate */
  longitude?: number

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

  /** Filter by cooperation path */
  cooperationPath?: CooperationPath

  /** Filter by tags (match any of these tags) */
  tags?: string[]

  /** Filter by location (partial match) */
  location?: string

  /** Filter by city (exact match) */
  city?: string

  /** Filter by state */
  state?: string

  /** Exclude city groups */
  excludeCityGroups?: boolean

  /** Only city groups */
  onlyCityGroups?: boolean

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

  /** Custom tags (0-5 tags) */
  tags?: string[]

  /** Required cooperation path (defaults to "Community Connection" for city groups) */
  cooperationPath?: CooperationPath

  /** Whether this is a city group (system-created only) */
  isCityGroup?: boolean

  /** Initial member ID (creator, null for city groups) */
  creatorId?: string

  /** Geocoded city (for city groups) */
  geocodedCity?: string

  /** Geocoded state (for city groups) */
  geocodedState?: string

  /** Latitude (for city groups) */
  latitude?: number

  /** Longitude (for city groups) */
  longitude?: number
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
 * Group moderator assignment
 * First 5 members of city groups become moderators
 */
export interface GroupModerator {
  /** Unique identifier (UUID v4) */
  id: string

  /** Group ID */
  groupId: string

  /** User ID */
  userId: string

  /** When moderator status was granted */
  grantedAt: Date

  /** Who granted moderator status ('system' or user ID) */
  grantedBy: string
}

/**
 * Group member tracking
 * Replaces members JSONB array for better querying
 */
export interface GroupMember {
  /** Unique identifier (UUID v4) */
  id: string

  /** Group ID */
  groupId: string

  /** User ID */
  userId: string

  /** When user joined the group */
  joinedAt: Date

  /** Membership status */
  status: 'active' | 'inactive' | 'left'
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

// ============================================================================
// Group Resources (Shared Resource Pools)
// ============================================================================

/**
 * Resource type categories
 */
export type GroupResourceType =
  | 'money'      // Financial contributions
  | 'time'       // Time contributions (timebanking)
  | 'equipment'  // Shared tools/equipment
  | 'space'      // Meeting rooms, venues
  | 'skill'      // Professional skills/expertise
  | 'material'   // Physical materials/supplies

/**
 * Group resource entity
 * Represents a shared resource in the cooperative pool
 */
export interface GroupResource {
  id: string
  groupId: string
  name: string
  description?: string
  resourceType: GroupResourceType
  quantity: number
  unit?: string
  isAvailable: boolean
  availableFrom?: Date
  availableUntil?: Date
  contributedBy?: string
  contributedAt: Date
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Resource allocation tracking
 */
export interface GroupResourceAllocation {
  id: string
  resourceId: string
  allocatedTo: string
  quantity: number
  purpose?: string
  proposalId?: string
  allocatedAt: Date
  returnBy?: Date
  returnedAt?: Date
  status: 'active' | 'returned' | 'consumed'
}

/**
 * Input for creating a resource
 */
export interface CreateGroupResourceInput {
  groupId: string
  name: string
  description?: string
  resourceType: GroupResourceType
  quantity?: number
  unit?: string
  availableFrom?: Date
  availableUntil?: Date
  tags?: string[]
}

// ============================================================================
// Group Events
// ============================================================================

/**
 * Event type categories
 */
export type GroupEventType =
  | 'meeting'       // Regular meetings
  | 'workshop'      // Skill-sharing workshops
  | 'social'        // Social gatherings
  | 'action'        // Community actions
  | 'assembly'      // General assemblies
  | 'deliberation'  // Deliberation sessions
  | 'other'

/**
 * Event recurrence options
 */
export type EventRecurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom'

/**
 * Group event entity
 */
export interface GroupEvent {
  id: string
  groupId: string
  title: string
  description?: string
  eventType: GroupEventType
  startsAt: Date
  endsAt?: Date
  timezone: string
  recurrence: EventRecurrence
  recurrenceEndDate?: Date
  location?: string
  isVirtual: boolean
  virtualLink?: string
  createdBy: string
  maxAttendees?: number
  proposalId?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Event RSVP status for group events
 */
export type GroupRSVPStatus = 'going' | 'maybe' | 'not_going'

/**
 * Event RSVP entity
 */
export interface GroupEventRSVP {
  id: string
  eventId: string
  userId: string
  status: GroupRSVPStatus
  notes?: string
  respondedAt: Date
}

/**
 * Input for creating an event
 */
export interface CreateGroupEventInput {
  groupId: string
  title: string
  description?: string
  eventType: GroupEventType
  startsAt: Date
  endsAt?: Date
  timezone?: string
  recurrence?: EventRecurrence
  location?: string
  isVirtual?: boolean
  virtualLink?: string
  maxAttendees?: number
  tags?: string[]
}
