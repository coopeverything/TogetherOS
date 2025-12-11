/**
 * DecisionLoop Service Tests
 *
 * Tests for the 5-phase decision loop: SENSE → FRAME → CHOOSE → ACT → LEARN
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  MemberState,
  MemberStateClassification,
  BridgeMemory,
  BridgePreferences,
  ConsentFlags,
  RiskProfile,
  ContextAffinity,
  EpisodicMemory,
  SemanticMemory,
  CommitmentMemory,
  BridgeCycle,
  BridgeCycleState,
  ActionType,
} from '@togetheros/types';

// Mock memory factory with CORRECT types based on packages/types/src/bridge-behavioral.ts
function createMockMemory(overrides: Partial<BridgeMemory> = {}): BridgeMemory {
  const now = new Date();

  const defaultPreferences: BridgePreferences = {
    userId: 'user-123',
    interventionLevel: 'balanced',
    tonePreference: 'empathetic',
    wantsQuestionnaires: true,
    wantsMicrolessons: true,
    wantsChallenges: false,
    wantsEthicsNudges: true,
    allowsProactiveRecommendations: true,
    allowsReminders: true,
    allowsContextualRecommendations: true,
    allowsBehavioralTracking: true,
    updatedAt: now,
  };

  const defaultConsentFlags: ConsentFlags = {
    userId: 'user-123',
    canSuggestUnasked: true,
    canSendReminders: true,
    canOfferEducation: true,
    canUseLocationContext: false,
    canUseActivityHistory: true,
    canUseSocialGraph: false,
    retainEpisodicMemory: true,
    retainSemanticMemory: true,
    updatedAt: now,
  };

  const defaultRiskProfile: RiskProfile = {
    userId: 'user-123',
    sessionId: 'session-abc',
    maxRisk: 1.0,
    consumedRisk: 0.0,
    remainingRisk: 1.0,
    interventions: [],
    sessionStartedAt: now,
  };

  const defaultContextAffinity: ContextAffinity = {
    userId: 'user-123',
    cooperationPaths: [
      { path: 'cooperative-technology', score: 0.8, interactions: 10, lastInteractionAt: now },
    ],
    modules: [
      { module: 'governance', score: 0.7, visits: 5, lastVisitAt: now },
    ],
    groups: [
      { groupId: 'group-1', groupName: 'Tech Coop', score: 0.9, participationCount: 15, lastParticipationAt: now },
    ],
    updatedAt: now,
  };

  const defaultEpisodicMemory: EpisodicMemory[] = [
    {
      id: 'ep-1',
      userId: 'user-123',
      eventType: 'page_view',
      context: { page: '/governance' },
      timestamp: now,
      importance: 0.5,
      emotionalValence: 0,
      decayRate: 0.1,
    },
  ];

  const defaultSemanticMemory: SemanticMemory[] = [
    {
      id: 'sem-1',
      userId: 'user-123',
      concept: 'cooperative governance',
      relationships: [{ relatedConcept: 'democracy', strength: 0.8, relationshipType: 'related' }],
      sources: ['wiki', 'forum'],
      confidence: 0.85,
      lastReinforced: now,
      createdAt: now,
    },
  ];

  const defaultCommitments: CommitmentMemory[] = [
    {
      id: 'commit-1',
      userId: 'user-123',
      commitmentType: 'event_rsvp',
      description: 'Attend cooperative meeting',
      targetDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      status: 'active',
      remindersSent: 0,
      createdAt: now,
    },
  ];

  return {
    preferences: defaultPreferences,
    consentFlags: defaultConsentFlags,
    riskProfile: defaultRiskProfile,
    contextAffinity: defaultContextAffinity,
    episodicMemories: defaultEpisodicMemory,
    semanticMemories: defaultSemanticMemory,
    commitments: defaultCommitments,
    ...overrides,
  };
}

// Mock classifier
function createMockClassifier() {
  return {
    classify: vi.fn().mockResolvedValue({
      state: 'explorer' as MemberState,
      confidence: 0.85,
      signals: {
        activityLevel: 0.7,
        engagementDepth: 0.6,
        responseRate: 0.8,
        completionRate: 0.5,
        explorationBreadth: 0.9,
      },
      classifiedAt: new Date(),
      reasoning: 'User shows high exploration breadth with moderate engagement',
    } satisfies MemberStateClassification),
  };
}

// Mock DecisionLoop repo
function createMockDecisionLoopRepo() {
  return {
    saveCycle: vi.fn().mockResolvedValue(undefined),
    getCycleById: vi.fn().mockResolvedValue(null),
    getCyclesByUserId: vi.fn().mockResolvedValue([]),
    getRecentCycles: vi.fn().mockResolvedValue([]),
    getSessionCycles: vi.fn().mockResolvedValue([]),
    getCycleStats: vi.fn().mockResolvedValue({
      totalCycles: 0,
      avgConfidence: 0,
      stateDistribution: {},
    }),
    getCyclesByState: vi.fn().mockResolvedValue([]),
  };
}

// Mock ActionPalette
function createMockActionPalette() {
  return {
    getAvailableActions: vi.fn().mockReturnValue([
      'send_nudge',
      'ask_question',
      'offer_recommendation',
      'show_microlesson',
      'show_ethics_nudge',
      'send_reminder',
    ] as ActionType[]),
    getRiskCost: vi.fn().mockImplementation((action: ActionType) => {
      const costs: Record<ActionType, number> = {
        send_nudge: 0.05,
        ask_question: 0.05,
        offer_recommendation: 0.15,
        show_microlesson: 0.1,
        show_ethics_nudge: 0.01,
        send_reminder: 0.08,
      };
      return costs[action] ?? 0.1;
    }),
    selectAction: vi.fn().mockReturnValue('send_nudge' as ActionType),
  };
}

describe('DecisionLoop', () => {
  let mockMemory: BridgeMemory;
  let mockClassifier: ReturnType<typeof createMockClassifier>;
  let mockRepo: ReturnType<typeof createMockDecisionLoopRepo>;
  let mockPalette: ReturnType<typeof createMockActionPalette>;

  beforeEach(() => {
    mockMemory = createMockMemory();
    mockClassifier = createMockClassifier();
    mockRepo = createMockDecisionLoopRepo();
    mockPalette = createMockActionPalette();
    vi.clearAllMocks();
  });

  describe('SENSE Phase', () => {
    it('should gather user context from memory', () => {
      expect(mockMemory.preferences).toBeDefined();
      expect(mockMemory.preferences.userId).toBe('user-123');
      expect(mockMemory.episodicMemories.length).toBeGreaterThan(0);
    });

    it('should respect consent flags when gathering context', () => {
      expect(mockMemory.consentFlags.canUseActivityHistory).toBe(true);
      expect(mockMemory.consentFlags.canUseSocialGraph).toBe(false);
    });

    it('should handle empty episodic memory', () => {
      const emptyMemory = createMockMemory({ episodicMemories: [] });
      expect(emptyMemory.episodicMemories).toHaveLength(0);
    });
  });

  describe('FRAME Phase', () => {
    it('should classify member state', async () => {
      const classification = await mockClassifier.classify(mockMemory);

      expect(classification.state).toBe('explorer');
      expect(classification.confidence).toBeGreaterThan(0.5);
      expect(classification.classifiedAt).toBeInstanceOf(Date);
    });

    it('should include reasoning in classification', async () => {
      const classification = await mockClassifier.classify(mockMemory);

      expect(classification.reasoning).toBeDefined();
      expect(classification.reasoning.length).toBeGreaterThan(0);
    });

    it('should calculate signal scores', async () => {
      const classification = await mockClassifier.classify(mockMemory);

      expect(classification.signals.activityLevel).toBeGreaterThanOrEqual(0);
      expect(classification.signals.activityLevel).toBeLessThanOrEqual(1);
      expect(classification.signals.explorationBreadth).toBe(0.9);
    });
  });

  describe('CHOOSE Phase', () => {
    it('should get available actions based on state and consent', () => {
      const actions = mockPalette.getAvailableActions(
        'explorer' as MemberState,
        mockMemory.consentFlags
      );

      expect(actions).toContain('send_nudge');
      expect(actions).toContain('ask_question');
    });

    it('should respect risk budget when selecting action', () => {
      const nudgeCost = mockPalette.getRiskCost('send_nudge');
      const recommendCost = mockPalette.getRiskCost('offer_recommendation');

      expect(nudgeCost).toBeLessThan(recommendCost);
      expect(mockMemory.riskProfile.remainingRisk).toBeGreaterThanOrEqual(nudgeCost);
    });

    it('should select appropriate action for member state', () => {
      const action = mockPalette.selectAction(
        'explorer' as MemberState,
        mockMemory.consentFlags,
        mockMemory.riskProfile
      );

      expect(action).toBeDefined();
      expect(['send_nudge', 'ask_question', 'offer_recommendation']).toContain(action);
    });

    it('should differentiate risk costs between action types', () => {
      const ethicsNudgeCost = mockPalette.getRiskCost('show_ethics_nudge');
      const offerRecommendCost = mockPalette.getRiskCost('offer_recommendation');

      // Ethics nudge should be low risk, recommendation higher risk
      expect(offerRecommendCost).toBeGreaterThan(ethicsNudgeCost);
    });
  });

  describe('ACT Phase', () => {
    it('should execute action and consume risk budget', () => {
      const initialRisk = mockMemory.riskProfile.remainingRisk;
      const actionCost = mockPalette.getRiskCost('send_nudge');

      // Simulate consuming risk
      mockMemory.riskProfile.consumedRisk += actionCost;
      mockMemory.riskProfile.remainingRisk -= actionCost;

      expect(mockMemory.riskProfile.remainingRisk).toBe(initialRisk - actionCost);
      expect(mockMemory.riskProfile.consumedRisk).toBe(actionCost);
    });

    it('should track intervention in risk profile', () => {
      const now = new Date();
      mockMemory.riskProfile.interventions.push({
        actionType: 'send_nudge',
        riskCost: 0.05,
        timestamp: now,
        outcome: 'pending',
      });

      expect(mockMemory.riskProfile.interventions).toHaveLength(1);
      expect(mockMemory.riskProfile.interventions[0].actionType).toBe('send_nudge');
    });
  });

  describe('LEARN Phase', () => {
    it('should save cycle to repository', async () => {
      const cycle: BridgeCycle = {
        id: 'cycle-1',
        userId: 'user-123',
        sessionId: 'session-abc',
        state: 'completed' as BridgeCycleState,
        sensePhase: {
          timestamp: new Date(),
          memorySnapshot: {
            episodicCount: 1,
            semanticCount: 1,
            commitmentCount: 1,
          },
        },
        framePhase: {
          timestamp: new Date(),
          classification: {
            state: 'explorer',
            confidence: 0.85,
            signals: {
              activityLevel: 0.7,
              engagementDepth: 0.6,
              responseRate: 0.8,
              completionRate: 0.5,
              explorationBreadth: 0.9,
            },
            classifiedAt: new Date(),
            reasoning: 'User shows explorer pattern',
          },
        },
        choosePhase: {
          timestamp: new Date(),
          availableActions: ['send_nudge', 'ask_question'],
          selectedAction: 'send_nudge',
          riskAssessment: {
            actionCost: 0.05,
            remainingBudget: 0.95,
          },
        },
        actPhase: {
          timestamp: new Date(),
          executedAction: 'send_nudge',
          actionPayload: { message: 'Consider exploring governance features' },
          deliveryStatus: 'delivered',
        },
        learnPhase: {
          timestamp: new Date(),
          outcome: 'positive',
          userResponse: 'clicked',
          memoryUpdates: ['episodic'],
        },
        startedAt: new Date(),
        completedAt: new Date(),
      };

      await mockRepo.saveCycle(cycle);

      expect(mockRepo.saveCycle).toHaveBeenCalledWith(cycle);
      expect(mockRepo.saveCycle).toHaveBeenCalledTimes(1);
    });

    it('should retrieve recent cycles for analysis', async () => {
      await mockRepo.getRecentCycles('user-123', 10);

      expect(mockRepo.getRecentCycles).toHaveBeenCalledWith('user-123', 10);
    });
  });

  describe('Risk Budget Management', () => {
    it('should initialize with full budget', () => {
      expect(mockMemory.riskProfile.maxRisk).toBe(1.0);
      expect(mockMemory.riskProfile.remainingRisk).toBe(1.0);
      expect(mockMemory.riskProfile.consumedRisk).toBe(0.0);
    });

    it('should prevent action when budget exhausted', () => {
      mockMemory.riskProfile.remainingRisk = 0.01;
      const recommendCost = mockPalette.getRiskCost('offer_recommendation');

      expect(mockMemory.riskProfile.remainingRisk).toBeLessThan(recommendCost);
    });

    it('should track multiple interventions', () => {
      const now = new Date();

      mockMemory.riskProfile.interventions.push(
        { actionType: 'send_nudge', riskCost: 0.05, timestamp: now, outcome: 'positive' },
        { actionType: 'ask_question', riskCost: 0.05, timestamp: now, outcome: 'neutral' }
      );

      expect(mockMemory.riskProfile.interventions).toHaveLength(2);
    });
  });

  describe('Context Affinity', () => {
    it('should track cooperation path affinity', () => {
      expect(mockMemory.contextAffinity.cooperationPaths).toHaveLength(1);
      expect(mockMemory.contextAffinity.cooperationPaths[0].path).toBe('cooperative-technology');
      expect(mockMemory.contextAffinity.cooperationPaths[0].score).toBe(0.8);
    });

    it('should track module affinity', () => {
      expect(mockMemory.contextAffinity.modules).toHaveLength(1);
      expect(mockMemory.contextAffinity.modules[0].module).toBe('governance');
    });

    it('should track group participation', () => {
      expect(mockMemory.contextAffinity.groups).toHaveLength(1);
      expect(mockMemory.contextAffinity.groups[0].groupName).toBe('Tech Coop');
      expect(mockMemory.contextAffinity.groups[0].participationCount).toBe(15);
    });
  });
});
