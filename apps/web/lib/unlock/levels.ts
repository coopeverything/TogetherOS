/**
 * Progressive Disclosure / Mystery Onboarding Levels
 *
 * Users start at level 0 (The Threshold) and progressively unlock
 * platform features as they complete onboarding challenges.
 */

export type UnlockLevelId = 0 | 1 | 2 | 3 | 4 | 5;

export interface UnlockLevel {
  id: UnlockLevelId;
  name: string;
  description: string;
  unlockedBy: string;
  unlocks: string[];
  bridgeTone: string;
}

export const UNLOCK_LEVELS: Record<UnlockLevelId, UnlockLevel> = {
  0: {
    id: 0,
    name: 'The Threshold',
    description: 'Welcome to something new',
    unlockedBy: 'Signup',
    unlocks: [
      'Bridge chat',
      'Personality questionnaire',
    ],
    bridgeTone: 'mysterious and inviting',
  },
  1: {
    id: 1,
    name: 'First Steps',
    description: 'Your journey begins',
    unlockedBy: 'Complete personality questionnaire',
    unlocks: [
      'Microlessons',
      'First challenge',
    ],
    bridgeTone: 'encouraging and curious',
  },
  2: {
    id: 2,
    name: 'Awakening',
    description: 'The community becomes visible',
    unlockedBy: 'Complete 1 challenge',
    unlocks: [
      'Member count in your city (teaser)',
    ],
    bridgeTone: 'intriguing and revealing',
  },
  3: {
    id: 3,
    name: 'Community Peek',
    description: 'You see others on the path',
    unlockedBy: 'Complete 3 challenges',
    unlocks: [
      'Feed preview (5 posts)',
      'Groups list',
    ],
    bridgeTone: 'welcoming and guiding',
  },
  4: {
    id: 4,
    name: 'Group Discovery',
    description: 'You find your people',
    unlockedBy: 'Join first group',
    unlocks: [
      'Full feed',
      'Member profiles',
      'Governance preview',
    ],
    bridgeTone: 'collegial and supportive',
  },
  5: {
    id: 5,
    name: 'Citizen',
    description: 'Full access unlocked',
    unlockedBy: 'Complete first week OR 7 challenges',
    unlocks: [
      'Everything',
      'All governance features',
      'Create proposals',
      'Support Points allocation',
    ],
    bridgeTone: 'collaborative and empowering',
  },
};

/**
 * Feature visibility based on unlock level
 */
export interface FeatureVisibility {
  feature: string;
  minLevel: UnlockLevelId;
  teaser?: string;
  unlockHint?: string;
}

export const FEATURE_VISIBILITY: FeatureVisibility[] = [
  {
    feature: 'bridge',
    minLevel: 0,
  },
  {
    feature: 'personality-questionnaire',
    minLevel: 0,
  },
  {
    feature: 'microlessons',
    minLevel: 1,
    teaser: 'Learning content is waiting for you...',
    unlockHint: 'Complete the personality questionnaire',
  },
  {
    feature: 'challenges',
    minLevel: 1,
    teaser: 'Challenges await...',
    unlockHint: 'Complete the personality questionnaire',
  },
  {
    feature: 'member-count',
    minLevel: 2,
    teaser: '??? people are already here',
    unlockHint: 'Complete 1 challenge to see how many',
  },
  {
    feature: 'feed-preview',
    minLevel: 3,
    teaser: 'Conversations are happening...',
    unlockHint: 'Complete 3 challenges to peek',
  },
  {
    feature: 'groups-list',
    minLevel: 3,
    teaser: 'Groups are forming around you...',
    unlockHint: 'Complete 3 challenges to discover them',
  },
  {
    feature: 'full-feed',
    minLevel: 4,
    teaser: 'The full community feed...',
    unlockHint: 'Join a group to unlock',
  },
  {
    feature: 'member-profiles',
    minLevel: 4,
    teaser: 'Connect with members...',
    unlockHint: 'Join a group to see profiles',
  },
  {
    feature: 'governance-preview',
    minLevel: 4,
    teaser: 'See how decisions are made...',
    unlockHint: 'Join a group to preview governance',
  },
  {
    feature: 'governance-full',
    minLevel: 5,
    teaser: 'Full governance participation...',
    unlockHint: 'Complete 7 challenges or your first week',
  },
  {
    feature: 'support-points',
    minLevel: 5,
    teaser: 'Allocate Support Points...',
    unlockHint: 'Become a full citizen first',
  },
  {
    feature: 'create-proposals',
    minLevel: 5,
    teaser: 'Create proposals for change...',
    unlockHint: 'Become a full citizen first',
  },
];

/**
 * Check if a feature is visible for a given unlock level
 */
export function isFeatureVisible(feature: string, userLevel: UnlockLevelId): boolean {
  const featureConfig = FEATURE_VISIBILITY.find(f => f.feature === feature);
  if (!featureConfig) return true; // Unknown features are visible by default
  return userLevel >= featureConfig.minLevel;
}

/**
 * Get the teaser text for a locked feature
 */
export function getFeatureTeaser(feature: string): string | undefined {
  const featureConfig = FEATURE_VISIBILITY.find(f => f.feature === feature);
  return featureConfig?.teaser;
}

/**
 * Get the unlock hint for a locked feature
 */
export function getUnlockHint(feature: string): string | undefined {
  const featureConfig = FEATURE_VISIBILITY.find(f => f.feature === feature);
  return featureConfig?.unlockHint;
}

/**
 * Get the next level info for progression
 */
export function getNextLevel(currentLevel: UnlockLevelId): UnlockLevel | null {
  const nextLevelId = (currentLevel + 1) as UnlockLevelId;
  if (nextLevelId > 5) return null;
  return UNLOCK_LEVELS[nextLevelId];
}

/**
 * Calculate progress to next level
 */
export interface LevelProgress {
  currentLevel: UnlockLevel;
  nextLevel: UnlockLevel | null;
  challengesCompleted: number;
  challengesForNextLevel: number;
  progressPercent: number;
}

export function calculateLevelProgress(
  userLevel: UnlockLevelId,
  challengesCompleted: number,
  hasJoinedGroup: boolean,
  daysActive: number
): LevelProgress {
  const currentLevel = UNLOCK_LEVELS[userLevel];
  const nextLevel = getNextLevel(userLevel);

  // Calculate challenges needed for next level
  let challengesForNextLevel = 0;
  if (userLevel === 1) challengesForNextLevel = 1;
  else if (userLevel === 2) challengesForNextLevel = 3;
  else if (userLevel === 3 && !hasJoinedGroup) challengesForNextLevel = 7; // Alternative path
  else if (userLevel === 4) challengesForNextLevel = 7;

  // Calculate progress percent
  let progressPercent = 0;
  if (nextLevel) {
    if (userLevel < 2) {
      // Level 0-1: questionnaire-based (binary)
      progressPercent = 0;
    } else if (userLevel === 2) {
      // Level 2 → 3: need 3 challenges
      progressPercent = Math.min((challengesCompleted / 3) * 100, 100);
    } else if (userLevel === 3) {
      // Level 3 → 4: need to join group
      progressPercent = hasJoinedGroup ? 100 : 0;
    } else if (userLevel === 4) {
      // Level 4 → 5: need 7 challenges OR first week
      const challengeProgress = (challengesCompleted / 7) * 100;
      const timeProgress = (daysActive / 7) * 100;
      progressPercent = Math.min(Math.max(challengeProgress, timeProgress), 100);
    }
  }

  return {
    currentLevel,
    nextLevel,
    challengesCompleted,
    challengesForNextLevel,
    progressPercent: Math.round(progressPercent),
  };
}
