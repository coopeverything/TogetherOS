/**
 * Onboarding type definitions for enhanced onboarding wizard
 * Based on gamification Phase 2 spec
 */

/**
 * Onboarding step types
 */
export type OnboardingStep =
  | 'welcome'
  | 'name'
  | 'location'
  | 'paths'
  | 'questionnaires'
  | 'group-join'
  | 'completion'

/**
 * RP rewards earned during onboarding
 */
export interface OnboardingReward {
  step: OnboardingStep
  amount: number
  label: string
  description: string
}

/**
 * Default RP rewards for each onboarding step
 */
export const ONBOARDING_REWARDS: OnboardingReward[] = [
  {
    step: 'name',
    amount: 10,
    label: 'Profile Started',
    description: 'Set your name',
  },
  {
    step: 'location',
    amount: 15,
    label: 'Location Set',
    description: 'Shared your location',
  },
  {
    step: 'paths',
    amount: 20,
    label: 'Paths Chosen',
    description: 'Selected cooperation paths',
  },
  {
    step: 'questionnaires',
    amount: 25,
    label: 'Interests Shared',
    description: 'Completed matching questionnaire',
  },
  {
    step: 'group-join',
    amount: 30,
    label: 'Community Joined',
    description: 'Joined your first group',
  },
]

/**
 * Total RP available from onboarding
 */
export const ONBOARDING_TOTAL_RP = ONBOARDING_REWARDS.reduce((sum, r) => sum + r.amount, 0)

/**
 * Onboarding session state (persisted to localStorage)
 */
export interface OnboardingSession {
  userId: string
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
  earnedRP: number
  formData: OnboardingFormData
  invitationContext?: OnboardingInvitationContext
  startedAt: Date
  updatedAt: Date
}

/**
 * Form data collected during onboarding
 */
export interface OnboardingFormData {
  name: string
  location?: UserLocation
  paths: string[]
  skills: string
  questionnaireAnswers: QuestionnaireAnswers
  joinedGroupId?: string
}

/**
 * User location data
 */
export interface UserLocation {
  city: string
  region?: string
  country: string
  latitude?: number
  longitude?: number
}

/**
 * Questionnaire answers for gamification matching
 */
export interface QuestionnaireAnswers {
  cooperationStyle?: 'hands-on' | 'advisory' | 'both'
  availableHours?: 'few' | 'moderate' | 'many'
  preferredActivities?: string[]
  motivations?: string[]
}

/**
 * Invitation context passed through signup
 */
export interface OnboardingInvitationContext {
  inviterName: string
  groupId: string
  groupName: string
  groupLocation?: string
  rpBonus: number
  personalMessage?: string
}

/**
 * Cooperation path definition (for paths step)
 * Named CooperationPathInfo to avoid conflict with CooperationPath type from groups.ts
 */
export interface CooperationPathInfo {
  id: string
  name: string
  emoji: string
  description: string
  color?: string
}

/**
 * Standard cooperation paths
 */
export const COOPERATION_PATHS: CooperationPathInfo[] = [
  {
    id: 'education',
    name: 'Collaborative Education',
    emoji: '📚',
    description: 'Learning together, teaching each other',
    color: '#8B5CF6',
  },
  {
    id: 'economy',
    name: 'Social Economy',
    emoji: '💰',
    description: 'Fair trade, worker ownership, mutual aid',
    color: '#F59E0B',
  },
  {
    id: 'wellbeing',
    name: 'Common Wellbeing',
    emoji: '🫶',
    description: 'Mental health, physical health, community care',
    color: '#EC4899',
  },
  {
    id: 'technology',
    name: 'Cooperative Technology',
    emoji: '💻',
    description: 'Open source, ethical tech, digital commons',
    color: '#3B82F6',
  },
  {
    id: 'governance',
    name: 'Collective Governance',
    emoji: '🏛️',
    description: 'Democratic decision-making, consensus building',
    color: '#6366F1',
  },
  {
    id: 'community',
    name: 'Community Connection',
    emoji: '🤝',
    description: 'Building relationships, organizing locally',
    color: '#10B981',
  },
  {
    id: 'media',
    name: 'Collaborative Media',
    emoji: '🎨',
    description: 'Independent media, creative commons, storytelling',
    color: '#F43F5E',
  },
  {
    id: 'planet',
    name: 'Common Planet',
    emoji: '🌍',
    description: 'Sustainability, climate action, ecological justice',
    color: '#22C55E',
  },
]

/**
 * Group suggestion for group join step
 */
export interface GroupSuggestion {
  id: string
  name: string
  description?: string
  location?: string
  memberCount: number
  matchScore: number
  matchReasons: string[]
  isInvited?: boolean
  inviterName?: string
}

/**
 * Onboarding completion result
 */
export interface OnboardingCompletionResult {
  success: boolean
  totalRPEarned: number
  invitationBonus: number
  joinedGroupId?: string
  joinedGroupName?: string
  nextSteps: string[]
}

/**
 * Get reward for a specific step
 */
export function getRewardForStep(step: OnboardingStep): OnboardingReward | undefined {
  return ONBOARDING_REWARDS.find(r => r.step === step)
}

/**
 * Calculate total RP earned from completed steps
 */
export function calculateEarnedRP(completedSteps: OnboardingStep[]): number {
  return ONBOARDING_REWARDS
    .filter(r => completedSteps.includes(r.step))
    .reduce((sum, r) => sum + r.amount, 0)
}

/**
 * Get next step in onboarding flow
 */
export function getNextStep(currentStep: OnboardingStep): OnboardingStep | null {
  const steps: OnboardingStep[] = [
    'welcome',
    'name',
    'location',
    'paths',
    'questionnaires',
    'group-join',
    'completion',
  ]
  const currentIndex = steps.indexOf(currentStep)
  return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null
}

/**
 * Get previous step in onboarding flow
 */
export function getPreviousStep(currentStep: OnboardingStep): OnboardingStep | null {
  const steps: OnboardingStep[] = [
    'welcome',
    'name',
    'location',
    'paths',
    'questionnaires',
    'group-join',
    'completion',
  ]
  const currentIndex = steps.indexOf(currentStep)
  return currentIndex > 0 ? steps[currentIndex - 1] : null
}

/**
 * Get step number (1-indexed)
 */
export function getStepNumber(step: OnboardingStep): number {
  const steps: OnboardingStep[] = [
    'welcome',
    'name',
    'location',
    'paths',
    'questionnaires',
    'group-join',
    'completion',
  ]
  return steps.indexOf(step) + 1
}

/**
 * Total number of onboarding steps
 */
export const TOTAL_ONBOARDING_STEPS = 7
