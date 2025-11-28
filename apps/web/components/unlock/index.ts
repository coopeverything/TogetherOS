/**
 * Progressive Disclosure / Mystery Onboarding Components
 *
 * These components implement a mystery-driven onboarding experience
 * where users progressively unlock platform features.
 */

export { LockedSection } from './LockedSection';
export { MysteryReveal } from './MysteryReveal';
export { UnlockCelebration } from './UnlockCelebration';

// Re-export level utilities
export {
  UNLOCK_LEVELS,
  FEATURE_VISIBILITY,
  isFeatureVisible,
  getFeatureTeaser,
  getUnlockHint,
  getNextLevel,
  calculateLevelProgress,
} from '../../lib/unlock/levels';

export type { UnlockLevelId, UnlockLevel, FeatureVisibility, LevelProgress } from '../../lib/unlock/levels';
