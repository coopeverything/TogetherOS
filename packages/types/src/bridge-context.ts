/**
 * Bridge Context Types
 * Data models for context-aware recommendations system
 *
 * Phase 1: Context Foundation
 * - UserContext: User's location, interests, activity
 * - CityContext: City's groups, events, trends
 */

// ===========================
// User Context Types
// ===========================

export interface InterestScore {
  topic: string;
  score: number; // 0-100 confidence
  derivedFrom: 'profile' | 'post' | 'comment' | 'feed_view' | 'support_points' | 'event_attendance';
  lastUpdated: Date;
}

export interface BridgeGroupMembership {
  groupId: string;
  groupName: string;
  joinedAt: Date;
  role?: 'member' | 'admin' | 'moderator';
}

export interface BridgeEventAttendance {
  eventId: string;
  eventName: string;
  attendedAt: Date;
  rsvpStatus: 'attending' | 'attended' | 'cancelled';
}

export interface FeedInteraction {
  postId: string;
  interactionType: 'view' | 'like' | 'comment' | 'share';
  topic?: string;
  timestamp: Date;
}

export interface SupportPointAllocation {
  targetType: 'post' | 'idea' | 'project';
  targetId: string;
  targetTopic?: string;
  points: number;
  allocatedAt: Date;
}

export interface UserContext {
  userId: string;

  // Location
  city: string;
  region: string;
  country: string;

  // Interests
  explicitInterests: string[]; // From profile tags
  implicitInterests: InterestScore[]; // Derived from behavior

  // Activity
  groupMemberships: BridgeGroupMembership[];
  eventAttendance: BridgeEventAttendance[];
  feedInteractions: FeedInteraction[];
  supportPointsAllocated: SupportPointAllocation[];
  postsCount: number;
  commentsCount: number;
  lastActiveAt: Date;

  // Engagement level
  engagementScore: number; // 0-100
  onboardingComplete: boolean;

  // Cache metadata
  fetchedAt: Date;
}

// ===========================
// City Context Types
// ===========================

export interface GroupSummary {
  id: string;
  name: string;
  memberCount: number;
  category: string;
  topics: string[];
  isActive: boolean; // Active in last 30 days
  lastActivityAt: Date;
}

export interface EventSummary {
  id: string;
  title: string;
  date: Date;
  location: string;
  category: string;
  topics: string[];
  rsvpCount: number;
  isUpcoming: boolean;
}

export interface PostSummary {
  id: string;
  title: string;
  excerpt: string;
  authorId: string;
  topics: string[];
  reactionCount: number;
  commentCount: number;
  postedAt: Date;
}

export interface DiscussionSummary {
  id: string;
  title: string;
  groupId: string;
  groupName: string;
  topics: string[];
  participantCount: number;
  commentCount: number;
  lastActivityAt: Date;
}

export interface CityContext {
  city: string;
  region: string;
  country: string;

  // Groups
  activeGroups: GroupSummary[];
  totalGroupMembers: number;

  // Events
  upcomingEvents: EventSummary[]; // Next 30 days
  recentEvents: EventSummary[]; // Last 30 days

  // Activity
  recentPosts: PostSummary[]; // Last 7 days
  activeDiscussions: DiscussionSummary[]; // Last 7 days

  // Trends
  trendingTopics: string[];
  popularInterests: string[];
  growthRate: number; // Month-over-month member growth

  // Cache metadata
  fetchedAt: Date;
}

// ===========================
// Static Activity Data (Phase 2)
// ===========================

export interface ActivityRecommendation {
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rewardPoints: number;
  timeCommitment: string; // e.g., "2 hours", "ongoing"
  prerequisites: string[]; // e.g., ["group_formed", "venue_access"]
  citySize: '5-15' | '15-30' | '30-50' | '50-100' | '100+';
  examples?: string[]; // Success stories from other cities
}

export interface ActivityByCitySize {
  '5-15': ActivityRecommendation[];
  '15-30': ActivityRecommendation[];
  '30-50': ActivityRecommendation[];
  '50-100': ActivityRecommendation[];
  '100+': ActivityRecommendation[];
}

// ===========================
// Recommendation Types (Phase 3)
// ===========================

export type RecommendationType =
  | 'local_group'
  | 'event'
  | 'discussion'
  | 'activity'
  | 'thematic_group'
  | 'social_share';

export type RecommendationUrgency = 'low' | 'medium' | 'high';

export type RecommendationStatus = 'pending' | 'shown' | 'acted_on' | 'dismissed';

export interface Recommendation {
  id: string;
  userId: string;
  type: RecommendationType;

  // Content
  title: string;
  description: string;
  targetId: string; // Group ID, Event ID, etc.
  targetUrl?: string;

  // Context
  relevanceScore: number; // 0-100
  matchedInterests: string[];
  cityContext?: string;

  // Incentives
  rewardPoints?: number;
  urgency?: RecommendationUrgency;

  // State
  status: RecommendationStatus;
  shownAt?: Date;
  actedOnAt?: Date;
  dismissedAt?: Date;

  // Tracking
  nudgeCount: number; // How many times shown
  maxNudges: number; // Stop after this many

  // Audit
  createdAt: Date;
  updatedAt: Date;
}

// ===========================
// Recommendation Templates (Phase 2)
// ===========================

export interface RecommendationTemplate {
  type: RecommendationType;
  template: string;
  variables: string[];
  tone: string;
  example: string;
}

// ===========================
// Bridge Context (Combined)
// ===========================

export interface BridgeContext {
  userContext: UserContext;
  cityContext: CityContext;
  recommendations: Recommendation[];
  suggestedActivities: ActivityRecommendation[];
}

// ===========================
// Input Types
// ===========================

export interface FetchUserContextInput {
  userId: string;
  includeImplicitInterests?: boolean;
  includeActivityHistory?: boolean;
}

export interface FetchCityContextInput {
  city: string;
  region: string;
  includeUpcomingEvents?: boolean;
  includeRecentActivity?: boolean;
}

export interface GenerateRecommendationsInput {
  userContext: UserContext;
  cityContext: CityContext;
  questionIntent?: string;
  maxRecommendations?: number;
}
