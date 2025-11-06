/**
 * Bridge Behavioral AI Types
 *
 * Types for the behavioral decision-making system that powers
 * Bridge's adaptive, context-aware guidance for members.
 *
 * Core Components:
 * 1. Member States (Decisive, Hesitant, Explorer, Stalled, Overloaded)
 * 2. Memory System (7 types: Episodic, Semantic, Preferences, Commitments, Consent Flags, Risk Profile, Context Affinity)
 * 3. Decision Loop (5 phases: Sense → Frame → Choose → Act → Learn)
 * 4. Action Palette (6 intervention levels with risk budget)
 * 5. Questionnaires (10 micro-questionnaires for cold-start)
 * 6. Educational Content (Microlessons, Challenges, Ethics Nudges)
 * 7. If-Then Rules (12 conditional behavioral rules)
 */

// ===========================
// Member States
// ===========================

/**
 * Member behavioral states drive Bridge's intervention strategy
 */
export type MemberState =
  | 'decisive'      // Clear intent, wants action recommendations
  | 'hesitant'      // Unsure, needs clarifying questions
  | 'explorer'      // Curious, wants to learn
  | 'stalled'       // Stuck, needs encouragement
  | 'overloaded'    // Too many options, needs simplification

/**
 * Signals used to classify member state
 */
export interface MemberStateSignals {
  // Recent interaction patterns
  questionType: 'actionable' | 'exploratory' | 'help' | 'vague';
  questionSentiment: 'positive' | 'neutral' | 'frustrated' | 'overwhelmed';

  // Historical patterns
  completionRate: number; // 0-1: % of accepted recommendations completed
  timeSinceLastAction: number; // milliseconds
  abandonmentCount: number; // times started but didn't complete action

  // Current session context
  sessionDuration: number; // milliseconds
  questionsAsked: number;
  recommendationsViewed: number;
  recommendationsActedOn: number;

  // Consent and risk
  consentFlags: {
    allowsProactive: boolean; // Can Bridge suggest without being asked?
    allowsEducational: boolean; // Can Bridge offer microlessons?
    allowsNudges: boolean; // Can Bridge send reminders?
  };
  riskBudgetRemaining: number; // 0-0.3, tracks intervention "pushiness"
}

/**
 * Member state classification result
 */
export interface MemberStateClassification {
  state: MemberState;
  confidence: number; // 0-1
  signals: MemberStateSignals;
  classifiedAt: Date;
  reasoning: string; // Human-readable explanation
}

// ===========================
// Memory System (7 Types)
// ===========================

/**
 * Episodic Memory: Specific interaction events
 */
export interface EpisodicMemory {
  id: string;
  userId: string;

  event: 'question_asked' | 'recommendation_accepted' | 'recommendation_dismissed' |
         'action_completed' | 'action_abandoned' | 'questionnaire_completed' |
         'microlesson_viewed' | 'challenge_completed';

  context: {
    sessionId: string;
    timestamp: Date;
    memberState: MemberState;
    location?: string; // e.g., '/bridge', '/governance/123'
  };

  payload: Record<string, any>; // Event-specific data

  createdAt: Date;
}

/**
 * Semantic Memory: General knowledge about cooperation patterns
 */
export interface SemanticMemory {
  id: string;
  userId: string;

  knowledgeType: 'cooperation_path' | 'module_usage' | 'group_participation' |
                 'decision_making_pattern' | 'communication_style';

  key: string; // e.g., 'preferred_cooperation_path'
  value: any; // e.g., 'collaborative-education'

  confidence: number; // 0-1: How certain Bridge is about this knowledge
  derivedFrom: string[]; // IDs of episodic memories that support this

  updatedAt: Date;
}

/**
 * Preferences: Explicit user choices about Bridge behavior
 */
export interface BridgePreferences {
  userId: string;

  // Interaction preferences
  interventionLevel: 'minimal' | 'balanced' | 'proactive'; // Default: 'balanced'
  tonePreference: 'formal' | 'casual' | 'empathetic'; // Default: 'empathetic'

  // Content preferences
  wantsQuestionnaires: boolean; // Default: true (cold-start)
  wantsMicrolessons: boolean; // Default: true
  wantsChallenges: boolean; // Default: true
  wantsEthicsNudges: boolean; // Default: true

  // Notification preferences
  allowsProactiveRecommendations: boolean; // Default: false (opt-in)
  allowsReminders: boolean; // Default: false (opt-in)

  // Privacy preferences
  allowsContextualRecommendations: boolean; // Default: true (city/group context)
  allowsBehavioralTracking: boolean; // Default: true (memory system)

  updatedAt: Date;
}

/**
 * Commitments: Promises the member has made
 */
export interface MemberCommitment {
  id: string;
  userId: string;

  type: 'attend_event' | 'complete_action' | 'respond_to_discussion' |
        'complete_questionnaire' | 'complete_challenge';

  targetId: string; // Event ID, recommendation ID, questionnaire ID, etc.
  targetTitle: string;

  promisedAt: Date;
  dueAt?: Date;
  completedAt?: Date;
  abandonedAt?: Date;

  reminderSentAt?: Date;
  reminderCount: number; // Max 2 reminders before considering abandoned
}

/**
 * Consent Flags: Granular permissions for Bridge interventions
 */
export interface ConsentFlags {
  userId: string;

  // Proactive interventions
  canSuggestUnasked: boolean; // Can Bridge offer recommendations without a question?
  canSendReminders: boolean; // Can Bridge remind about commitments?
  canOfferEducation: boolean; // Can Bridge suggest microlessons/challenges?

  // Context usage
  canUseLocationContext: boolean; // Can Bridge use city/region for recommendations?
  canUseActivityHistory: boolean; // Can Bridge analyze past actions?
  canUseSocialGraph: boolean; // Can Bridge recommend based on connections?

  // Data retention
  retainEpisodicMemory: boolean; // Keep detailed interaction history?
  retainSemanticMemory: boolean; // Keep derived insights?

  updatedAt: Date;
}

/**
 * Risk Profile: Tracks "pushiness" to prevent overwhelming members
 */
export interface RiskProfile {
  userId: string;
  sessionId: string;

  // Risk budget (0.3 per session)
  maxRisk: number; // Always 0.3
  consumedRisk: number; // Sum of all intervention risks in session
  remainingRisk: number; // maxRisk - consumedRisk

  // Risk consumption history
  interventions: Array<{
    timestamp: Date;
    interventionLevel: ActionLevel;
    riskCost: number; // From ACTION_PALETTE risk values
    trigger: string; // What caused this intervention
  }>;

  // Session metadata
  sessionStartedAt: Date;
  lastInterventionAt?: Date;
}

/**
 * Context Affinity: Which contexts member engages with most
 */
export interface ContextAffinity {
  userId: string;

  // Cooperation paths affinity
  cooperationPaths: Array<{
    path: string; // e.g., 'collaborative-education'
    score: number; // 0-100
    interactions: number; // How many times engaged
    lastInteractionAt: Date;
  }>;

  // Module affinity
  modules: Array<{
    module: string; // e.g., 'governance', 'feed', 'bridge'
    score: number; // 0-100
    visits: number;
    lastVisitAt: Date;
  }>;

  // Group affinity
  groups: Array<{
    groupId: string;
    groupName: string;
    score: number; // 0-100
    participationCount: number;
    lastParticipationAt: Date;
  }>;

  updatedAt: Date;
}

/**
 * Complete memory system for a member
 */
export interface MemberMemory {
  userId: string;

  episodic: EpisodicMemory[]; // Recent events (last 30 days)
  semantic: SemanticMemory[]; // Derived knowledge
  preferences: BridgePreferences;
  commitments: MemberCommitment[]; // Active commitments
  consentFlags: ConsentFlags;
  riskProfile: RiskProfile; // Current session
  contextAffinity: ContextAffinity;

  fetchedAt: Date;
}

// ===========================
// Decision Loop (5 Phases)
// ===========================

/**
 * Decision Loop Phase 1: SENSE
 * Detect member's current state and needs
 */
export interface SensePhase {
  // Input signals
  signals: MemberStateSignals;
  memory: MemberMemory;
  currentContext: {
    location: string; // Current page URL
    sessionDuration: number;
    questionsAsked: number;
  };

  // Output classification
  classification: MemberStateClassification;

  timestamp: Date;
}

/**
 * Decision Loop Phase 2: FRAME
 * Interpret the situation and identify possible interventions
 */
export interface FramePhase {
  // Input from SENSE
  memberState: MemberState;
  signals: MemberStateSignals;

  // Situation framing
  situation: {
    problem: string; // What's blocking the member?
    opportunity: string; // What could help them progress?
    urgency: 'low' | 'medium' | 'high';
  };

  // Possible interventions
  candidateActions: Array<{
    type: 'ask_question' | 'offer_recommendation' | 'suggest_microlesson' |
          'offer_challenge' | 'show_ethics_nudge' | 'simplify_options';
    rationale: string;
    expectedOutcome: string;
  }>;

  timestamp: Date;
}

/**
 * Decision Loop Phase 3: CHOOSE
 * Select best intervention based on context, memory, risk budget
 */
export interface ChoosePhase {
  // Input from FRAME
  candidateActions: FramePhase['candidateActions'];
  riskProfile: RiskProfile;
  consentFlags: ConsentFlags;

  // Selection criteria
  scoredActions: Array<{
    action: FramePhase['candidateActions'][0];
    score: number; // 0-100
    riskCost: number; // From ACTION_PALETTE
    consentCheck: boolean; // Does user consent to this intervention?
    withinRiskBudget: boolean; // remainingRisk >= riskCost?
  }>;

  // Selected action (or null if no valid option)
  selectedAction: FramePhase['candidateActions'][0] | null;
  selectionReason: string;

  timestamp: Date;
}

/**
 * Decision Loop Phase 4: ACT
 * Execute the chosen intervention
 */
export interface ActPhase {
  // Input from CHOOSE
  selectedAction: FramePhase['candidateActions'][0] | null;

  // Execution
  executed: boolean;
  executionMethod: 'inline' | 'notification' | 'recommendation_card' | 'modal';

  // Content delivered
  content: {
    title?: string;
    body: string;
    actionButton?: {
      label: string;
      action: string; // URL or action identifier
    };
  };

  // Risk budget update
  riskConsumed: number;
  riskRemaining: number;

  timestamp: Date;
}

/**
 * Decision Loop Phase 5: LEARN
 * Observe member's response and update memory
 */
export interface LearnPhase {
  // Input from ACT
  intervention: ActPhase;

  // Member's response
  response: {
    type: 'accepted' | 'dismissed' | 'ignored' | 'completed';
    timeToResponse?: number; // milliseconds
    feedback?: {
      helpful: boolean;
      comment?: string;
    };
  };

  // Memory updates
  memoryUpdates: {
    episodicCreated: EpisodicMemory[];
    semanticUpdated: SemanticMemory[];
    preferencesUpdated: Partial<BridgePreferences>;
    affinityUpdated: Partial<ContextAffinity>;
  };

  // Learning outcome
  outcome: 'success' | 'neutral' | 'failure';
  insight: string; // What did Bridge learn?

  timestamp: Date;
}

/**
 * Complete decision loop cycle
 */
export interface DecisionCycle {
  id: string;
  userId: string;
  sessionId: string;

  sense: SensePhase;
  frame: FramePhase;
  choose: ChoosePhase;
  act: ActPhase;
  learn: LearnPhase;

  startedAt: Date;
  completedAt: Date;
  durationMs: number;
}

// ===========================
// Action Palette (6 Levels)
// ===========================

/**
 * Action intervention levels (escalating pushiness)
 */
export type ActionLevel =
  | 'micro-nudge'      // Risk: 0.01 - Tiny hint, barely noticeable
  | 'gentle-suggest'   // Risk: 0.05 - Soft suggestion, easy to dismiss
  | 'offer'            // Risk: 0.10 - Clear option, but member chooses
  | 'recommend'        // Risk: 0.15 - Direct recommendation with reasoning
  | 'request'          // Risk: 0.20 - Asks member to do something specific
  | 'human-help'       // Risk: 0.30 - Escalate to human moderator

/**
 * Action palette entry
 */
export interface ActionPaletteEntry {
  level: ActionLevel;
  riskCost: number; // How much risk budget this consumes

  trigger: {
    memberState: MemberState[];
    minConfidence: number; // 0-1: Minimum state classification confidence
    conditions: string[]; // Additional conditions (e.g., 'has_active_commitment')
  };

  content: {
    template: string; // Message template with variables
    tone: 'neutral' | 'encouraging' | 'empathetic' | 'direct';
    examples: string[];
  };

  consentRequired: keyof ConsentFlags; // Which consent flag must be true

  // Learning feedback
  historicalEffectiveness: number; // 0-1: How often this works
  lastUpdated: Date;
}

/**
 * Risk budget constants
 */
export const RISK_BUDGET = {
  MAX_PER_SESSION: 0.3,
  MICRO_NUDGE: 0.01,
  GENTLE_SUGGEST: 0.05,
  OFFER: 0.10,
  RECOMMEND: 0.15,
  REQUEST: 0.20,
  HUMAN_HELP: 0.30,
} as const;

// ===========================
// Questionnaires (10 Types)
// ===========================

/**
 * Micro-questionnaire types for cold-start problem
 */
export type QuestionnaireType =
  | 'location'         // "Where are you based?"
  | 'interests'        // "What cooperation paths interest you?"
  | 'experience'       // "Have you organized before?"
  | 'resources'        // "What resources do you have?"
  | 'network-size'     // "How many people could you reach?"
  | 'time-commitment'  // "How much time can you contribute?"
  | 'goals'            // "What are you hoping to achieve?"
  | 'obstacles'        // "What's blocking you?"
  | 'skills'           // "What skills do you have?"
  | 'values'           // "What values matter most?"

/**
 * Questionnaire definition
 */
export interface Questionnaire {
  id: string;
  type: QuestionnaireType;

  question: string;
  description?: string;

  answerType: 'single_choice' | 'multiple_choice' | 'text' | 'scale';
  options?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;

  // Conditional logic
  showIf?: {
    previousAnswers: Record<QuestionnaireType, any>;
  };

  // Ordering and sequencing
  sequenceNumber: number; // 1-10
  estimatedTimeSeconds: number; // 30-90 seconds

  // Reward
  rpReward: number; // Readiness Points for completing
}

/**
 * Questionnaire response
 */
export interface QuestionnaireResponse {
  id: string;
  userId: string;
  questionnaireId: string;
  questionnaireType: QuestionnaireType;

  answer: any; // Type depends on answerType

  startedAt: Date;
  completedAt: Date;
  durationSeconds: number;

  // Reward tracking
  rpAwarded: number;
}

// ===========================
// Educational Content
// ===========================

/**
 * Microlesson: 60-90 second learning modules
 */
export interface Microlesson {
  id: string;

  title: string;
  topic: string; // e.g., 'consensus-building', 'bias-awareness'
  cooperationPath: string; // One of the 8 paths

  content: {
    intro: string;
    keyPoint1: string;
    keyPoint2: string;
    keyPoint3: string;
    callToAction: string;
  };

  estimatedTimeSeconds: number; // 60-90
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  // Related content
  relatedQuestionnaire?: QuestionnaireType;
  relatedChallenge?: string; // Challenge ID

  // Reward
  rpReward: number;
}

/**
 * Bias Challenge: Interactive exercises
 */
export interface BiasChallenge {
  id: string;

  title: string;
  biasType: 'confirmation' | 'groupthink' | 'sunk-cost' | 'recency' | 'availability';

  scenario: string;
  question: string;

  options: Array<{
    value: string;
    label: string;
    feedback: string; // Explanation after selection
    isBiased: boolean; // True if this option demonstrates bias
  }>;

  correctAnswer: string;
  explanation: string; // Why this matters for cooperation

  // Reward
  rpReward: number;
  rpBonus: number; // Extra RP for correct answer
}

/**
 * Ethics Nudge: Gentle reminders about cooperation values
 */
export interface EthicsNudge {
  id: string;

  trigger: {
    context: string; // e.g., 'before_voting', 'before_commenting'
    condition: string; // e.g., 'low_deliberation_time'
  };

  message: string;
  tone: 'neutral' | 'encouraging' | 'cautionary';

  // Dismissible
  canDismiss: boolean;
  dismissText?: string;
}

/**
 * Micro-Challenge: Quick actionable tasks
 */
export interface MicroChallenge {
  id: string;

  title: string;
  description: string;

  actionType: 'post_comment' | 'allocate_support_points' | 'invite_friend' |
              'attend_event' | 'create_proposal' | 'complete_profile';

  targetModule: string; // e.g., 'feed', 'governance', 'social-economy'

  // Completion criteria
  completionCriteria: {
    metric: string; // e.g., 'comments_posted'
    threshold: number;
  };

  // Reward
  rpReward: number;
  rpBonus: number; // Bonus for quick completion
}

/**
 * Educational content response
 */
export interface EducationalContentResponse {
  id: string;
  userId: string;

  contentType: 'microlesson' | 'bias_challenge' | 'ethics_nudge' | 'micro_challenge';
  contentId: string;

  viewedAt: Date;
  completedAt?: Date;

  // Response (for challenges/nudges)
  response?: {
    answer?: any;
    correct?: boolean;
    feedback?: string;
  };

  // Reward tracking
  rpAwarded: number;
}

// ===========================
// Alternating Content Strategy
// ===========================

/**
 * Content sequencing logic
 */
export interface ContentSequence {
  userId: string;
  sessionId: string;

  // Sequence of content shown
  sequence: Array<{
    position: number; // 1, 2, 3...
    contentType: 'questionnaire' | 'microlesson' | 'bias_challenge' | 'micro_challenge' | 'ethics_nudge';
    contentId: string;
    shownAt: Date;
    respondedAt?: Date;
  }>;

  // Fatigue tracking
  questionnaireCount: number; // How many questionnaires shown
  educationalCount: number; // How many educational items shown
  alternationRatio: number; // Target: 1:1 (questionnaire:educational)

  // Strategy parameters
  maxConsecutiveQuestionnaires: number; // Max 2 before switching
  minTimeBetweenQuestionnaires: number; // Milliseconds (default: 5 minutes)
}

// ===========================
// If-Then Rules (12 Rules)
// ===========================

/**
 * Conditional behavioral rule
 */
export interface IfThenRule {
  id: string;

  name: string;
  description: string;

  // Condition (IF)
  condition: {
    memberState?: MemberState;
    context?: string; // e.g., 'viewing_proposal', 'in_feed'
    memoryCheck?: {
      type: 'episodic' | 'semantic' | 'preference' | 'commitment' | 'affinity';
      key: string;
      operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains';
      value: any;
    };
    timeCheck?: {
      type: 'time_since_last_action' | 'session_duration' | 'time_of_day';
      operator: 'greaterThan' | 'lessThan';
      value: number;
    };
  };

  // Action (THEN)
  action: {
    type: 'show_questionnaire' | 'offer_microlesson' | 'suggest_challenge' |
          'show_recommendation' | 'send_nudge' | 'simplify_ui';
    parameters: Record<string, any>;
  };

  // Execution constraints
  maxExecutionsPerSession: number;
  minTimeBetweenExecutions: number; // milliseconds

  // Learning
  executionCount: number;
  successRate: number; // 0-1: How often member responds positively
  enabled: boolean;
}

/**
 * Rule execution log
 */
export interface RuleExecutionLog {
  id: string;
  ruleId: string;
  userId: string;
  sessionId: string;

  conditionMet: boolean;
  actionExecuted: boolean;

  reason: string; // Why was/wasn't action executed

  memberResponse?: 'accepted' | 'dismissed' | 'ignored';

  executedAt: Date;
}

// ===========================
// RP Economy Integration
// ===========================

/**
 * Readiness Points award
 */
export interface RPAward {
  id: string;
  userId: string;

  source: 'questionnaire' | 'microlesson' | 'bias_challenge' | 'micro_challenge' |
          'recommendation_completed' | 'manual_award';

  sourceId: string; // ID of the questionnaire, microlesson, etc.

  basePoints: number;
  bonusPoints: number;
  totalPoints: number;

  // Diminishing returns
  diminishingFactor: number; // 1.0 first time, 0.5 second time, 0.25 third time...

  awardedAt: Date;
}

// ===========================
// Vision Ladders
// ===========================

/**
 * Growth milestone thresholds
 */
export type VisionLadderMilestone = 100 | 200 | 400 | 600 | 1000;

/**
 * Vision ladder status
 */
export interface VisionLadder {
  userId: string;

  currentMemberCount: number;
  nextMilestone: VisionLadderMilestone;

  milestonesReached: Array<{
    milestone: VisionLadderMilestone;
    reachedAt: Date;
    celebration?: string; // Special message or reward
  }>;

  progressPercentage: number; // % to next milestone

  updatedAt: Date;
}
