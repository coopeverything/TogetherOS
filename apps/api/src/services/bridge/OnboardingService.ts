/**
 * Onboarding Service
 * Manages user onboarding flow with step sequencing and completion tracking
 */

import { query } from '@togetheros/db';

export interface OnboardingProgress {
  userId: string;
  currentStep: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  progress: {
    questionnairesCompleted: number;
    questionnairesTotal: number;
    profileComplete: boolean;
    groupsJoined: number;
    firstPost: boolean;
  };
  completionPercentage: number;
  isComplete: boolean;
  nextSteps: OnboardingStep[];
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  url?: string;
  priority: 'required' | 'recommended' | 'optional';
}

/**
 * Completion criteria for onboarding
 */
const COMPLETION_CRITERIA = {
  questionnairesMin: 5, // Must complete at least 5/10 questionnaires
  questionnairesTotal: 10,
  groupsMin: 1, // Must join at least 1 group
  profileRequired: true, // Must complete profile
};

/**
 * Get user's onboarding progress
 */
export async function getOnboardingProgress(userId: string): Promise<OnboardingProgress> {
  // Query 1: Get user's onboarding status
  const userResult = await query<{
    onboarding_step: string | null;
    onboarding_started_at: Date | null;
    onboarding_completed_at: Date | null;
    onboarding_progress: any;
    name: string | null;
    bio: string | null;
    city: string | null;
    paths: string[];
  }>(
    `
    SELECT
      onboarding_step, onboarding_started_at, onboarding_completed_at,
      onboarding_progress, name, bio, city, paths
    FROM users
    WHERE id = $1 AND deleted_at IS NULL
    `,
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new Error(`User ${userId} not found`);
  }

  const user = userResult.rows[0];

  // Query 2: Count completed questionnaires
  const questionnaireResult = await query<{ completed_count: number }>(
    `
    SELECT COUNT(*) as completed_count
    FROM questionnaire_responses
    WHERE user_id = $1
    `,
    [userId]
  );

  const questionnairesCompleted = Number(questionnaireResult.rows[0]?.completed_count) || 0;

  // Query 3: Count groups joined
  const groupsResult = await query<{ groups_count: number }>(
    `
    SELECT COUNT(*) as groups_count
    FROM group_memberships
    WHERE user_id = $1 AND deleted_at IS NULL
    `,
    [userId]
  );

  const groupsJoined = Number(groupsResult.rows[0]?.groups_count) || 0;

  // Query 4: Check if user has made first post (placeholder - table may not exist)
  let firstPost = false;
  try {
    const postResult = await query<{ post_count: number }>(
      `
      SELECT COUNT(*) as post_count
      FROM feed_posts
      WHERE author_id = $1
      LIMIT 1
      `,
      [userId]
    );
    firstPost = Number(postResult.rows[0]?.post_count) > 0;
  } catch {
    // Feed table doesn't exist yet
    firstPost = false;
  }

  // Determine if profile is complete
  const profileComplete =
    !!user.name &&
    !!user.bio &&
    !!user.city &&
    Array.isArray(user.paths) &&
    user.paths.length > 0;

  // Calculate progress
  const progress = {
    questionnairesCompleted,
    questionnairesTotal: COMPLETION_CRITERIA.questionnairesTotal,
    profileComplete,
    groupsJoined,
    firstPost,
  };

  // Check if onboarding is complete
  const isComplete =
    questionnairesCompleted >= COMPLETION_CRITERIA.questionnairesMin &&
    groupsJoined >= COMPLETION_CRITERIA.groupsMin &&
    (COMPLETION_CRITERIA.profileRequired ? profileComplete : true);

  // Calculate completion percentage
  const totalSteps = 3; // questionnaires, profile, groups
  let completedSteps = 0;
  if (questionnairesCompleted >= COMPLETION_CRITERIA.questionnairesMin) completedSteps++;
  if (profileComplete) completedSteps++;
  if (groupsJoined >= COMPLETION_CRITERIA.groupsMin) completedSteps++;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  // Generate next steps
  const nextSteps = generateNextSteps(progress, user.onboarding_step);

  return {
    userId,
    currentStep: user.onboarding_step,
    startedAt: user.onboarding_started_at,
    completedAt: user.onboarding_completed_at,
    progress,
    completionPercentage,
    isComplete,
    nextSteps,
  };
}

/**
 * Generate recommended next steps based on current progress
 */
function generateNextSteps(
  progress: OnboardingProgress['progress'],
  currentStep: string | null
): OnboardingStep[] {
  const steps: OnboardingStep[] = [];

  // Step 1: Complete questionnaires
  if (progress.questionnairesCompleted < COMPLETION_CRITERIA.questionnairesMin) {
    steps.push({
      id: 'questionnaires',
      title: 'Complete Getting Started Questions',
      description: `Answer ${COMPLETION_CRITERIA.questionnairesMin - progress.questionnairesCompleted} more questionnaires to help us understand you better`,
      estimatedMinutes: (COMPLETION_CRITERIA.questionnairesMin - progress.questionnairesCompleted) * 1,
      completed: false,
      url: '/onboarding/questionnaires',
      priority: 'required',
    });
  }

  // Step 2: Complete profile
  if (!progress.profileComplete) {
    steps.push({
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your name, bio, location, and cooperation paths',
      estimatedMinutes: 3,
      completed: false,
      url: '/profile/edit',
      priority: 'required',
    });
  }

  // Step 3: Join a group
  if (progress.groupsJoined < COMPLETION_CRITERIA.groupsMin) {
    steps.push({
      id: 'join_group',
      title: 'Join Your First Group',
      description: 'Find and join a group that matches your interests',
      estimatedMinutes: 5,
      completed: false,
      url: '/groups',
      priority: 'required',
    });
  }

  // Step 4: Make first post (recommended, not required)
  if (!progress.firstPost && progress.questionnairesCompleted >= 3) {
    steps.push({
      id: 'first_post',
      title: 'Share Your First Post',
      description: 'Introduce yourself or share what brings you to TogetherOS',
      estimatedMinutes: 5,
      completed: false,
      url: '/feed',
      priority: 'recommended',
    });
  }

  // Step 5: Explore more questionnaires (optional)
  if (
    progress.questionnairesCompleted >= COMPLETION_CRITERIA.questionnairesMin &&
    progress.questionnairesCompleted < progress.questionnairesTotal
  ) {
    steps.push({
      id: 'more_questionnaires',
      title: 'Complete More Questionnaires',
      description: `Answer ${progress.questionnairesTotal - progress.questionnairesCompleted} more to earn bonus RP`,
      estimatedMinutes: (progress.questionnairesTotal - progress.questionnairesCompleted) * 1,
      completed: false,
      url: '/onboarding/questionnaires',
      priority: 'optional',
    });
  }

  return steps;
}

/**
 * Update user's onboarding step
 */
export async function updateOnboardingStep(
  userId: string,
  step: string
): Promise<void> {
  await query(
    `
    UPDATE users
    SET
      onboarding_step = $2,
      onboarding_started_at = COALESCE(onboarding_started_at, NOW()),
      updated_at = NOW()
    WHERE id = $1
    `,
    [userId, step]
  );
}

/**
 * Mark onboarding as complete
 */
export async function completeOnboarding(userId: string): Promise<void> {
  // Verify completion criteria are met
  const progress = await getOnboardingProgress(userId);

  if (!progress.isComplete) {
    throw new Error(
      `Onboarding criteria not met: questionnaires=${progress.progress.questionnairesCompleted}/${COMPLETION_CRITERIA.questionnairesMin}, groups=${progress.progress.groupsJoined}/${COMPLETION_CRITERIA.groupsMin}, profile=${progress.progress.profileComplete}`
    );
  }

  // Mark as complete
  await query(
    `
    UPDATE users
    SET
      onboarding_completed_at = NOW(),
      onboarding_step = 'completed',
      updated_at = NOW()
    WHERE id = $1 AND onboarding_completed_at IS NULL
    `,
    [userId]
  );
}

/**
 * Record progress update (for JSON field)
 */
export async function recordProgress(
  userId: string,
  progressUpdate: Partial<OnboardingProgress['progress']>
): Promise<void> {
  await query(
    `
    UPDATE users
    SET
      onboarding_progress = onboarding_progress || $2::jsonb,
      updated_at = NOW()
    WHERE id = $1
    `,
    [userId, JSON.stringify(progressUpdate)]
  );
}
