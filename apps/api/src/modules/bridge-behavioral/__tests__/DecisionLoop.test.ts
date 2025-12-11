/**
 * Tests for DecisionLoop Service
 * Tests the 5-phase behavioral decision loop: SENSE → FRAME → CHOOSE → ACT → LEARN
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DecisionLoop, type DecisionLoopContext } from '../services/DecisionLoop'
import { MemberStateClassifier } from '../services/MemberStateClassifier'
import { ActionPalette } from '../services/ActionPalette'
import type {
  MemberMemory,
  MemberStateSignals,
  EpisodicMemory,
  SemanticMemory,
  BridgePreferences,
  MemberCommitment,
  ConsentFlags,
  RiskProfile,
  ContextAffinity,
  MemberStateClassification,
} from '@togetheros/types'

// Mock repos
const createMockMemoryRepo = () => ({
  getMemory: vi.fn(),
  recordEvent: vi.fn(),
  getRecentEvents: vi.fn(),
  updateSemanticMemory: vi.fn(),
  getSemanticMemory: vi.fn(),
  getAllSemanticMemories: vi.fn(),
  getPreferences: vi.fn(),
  updatePreferences: vi.fn(),
  createCommitment: vi.fn(),
  getActiveCommitments: vi.fn(),
  completeCommitment: vi.fn(),
  abandonCommitment: vi.fn(),
  recordReminderSent: vi.fn(),
  getOverdueCommitments: vi.fn(),
  getConsentFlags: vi.fn(),
  updateConsentFlags: vi.fn(),
  getRiskProfile: vi.fn(),
  consumeRiskBudget: vi.fn(),
  getContextAffinity: vi.fn(),
  updatePathAffinity: vi.fn(),
  updateModuleAffinity: vi.fn(),
  updateGroupAffinity: vi.fn(),
})

const createMockMemberStateRepo = () => ({
  createClassification: vi.fn().mockResolvedValue({
    state: 'hesitant',
    confidence: 0.7,
    signals: {},
    classifiedAt: new Date(),
    reasoning: 'Mock classification',
  }),
  getLatestClassification: vi.fn(),
  getClassificationHistory: vi.fn(),
  getSessionClassifications: vi.fn(),
  getClassificationStats: vi.fn(),
})

const createMockDecisionLoopRepo = () => ({
  createCycle: vi.fn(),
  getCycle: vi.fn(),
  updateCycle: vi.fn(),
  getRecentCycles: vi.fn(),
})

describe('DecisionLoop', () => {
  let decisionLoop: DecisionLoop
  let mockMemoryRepo: ReturnType<typeof createMockMemoryRepo>
  let mockMemberStateRepo: ReturnType<typeof createMockMemberStateRepo>
  let mockDecisionLoopRepo: ReturnType<typeof createMockDecisionLoopRepo>
  let classifier: MemberStateClassifier
  let actionPalette: ActionPalette

  const testUserId = 'a0000000-0000-4000-a000-000000000001'
  const testSessionId = 'session-001'

  const defaultContext: DecisionLoopContext = {
    userId: testUserId,
    sessionId: testSessionId,
    currentLocation: '/feed',
  }

  const createMockMemory = (overrides: Partial<MemberMemory> = {}): MemberMemory => ({
    episodic: [],
    semantic: [],
    preferences: {
      tonePreference: 'empathetic',
      interventionLevel: 'balanced',
      motivationType: 'community',
      learningPreference: 'doing',
    },
    commitments: [],
    consentFlags: {
      canSuggestUnasked: true,
      canOfferEducation: true,
      canSendReminders: true,
      canTrackPatterns: true,
      canShareInsights: false,
    },
    riskProfile: {
      sessionId: testSessionId,
      totalBudget: 1.0,
      consumedRisk: 0,
      remainingRisk: 1.0,
      interventions: [],
      sessionStartedAt: new Date(),
    },
    contextAffinity: {
      cooperationPaths: {},
      modules: {},
      groups: {},
      lastUpdated: new Date(),
    },
    ...overrides,
  })

  beforeEach(() => {
    mockMemoryRepo = createMockMemoryRepo()
    mockMemberStateRepo = createMockMemberStateRepo()
    mockDecisionLoopRepo = createMockDecisionLoopRepo()
    classifier = new MemberStateClassifier(mockMemberStateRepo)
    actionPalette = new ActionPalette()

    decisionLoop = new DecisionLoop(
      mockMemberStateRepo,
      mockMemoryRepo,
      mockDecisionLoopRepo,
      classifier,
      actionPalette
    )
  })

  describe('execute', () => {
    it('should return null when member state is decisive and confident', async () => {
      const memory = createMockMemory()
      mockMemoryRepo.getMemory.mockResolvedValue(memory)

      // Mock classifier to return decisive state with high confidence
      vi.spyOn(classifier, 'classify').mockResolvedValue({
        state: 'decisive',
        confidence: 0.9,
        signals: {} as MemberStateSignals,
        reasoning: 'Member knows what they want',
      })

      const result = await decisionLoop.execute(defaultContext)

      expect(result).toBeNull()
    })

    it('should return null when risk budget is exhausted', async () => {
      const memory = createMockMemory({
        riskProfile: {
          sessionId: testSessionId,
          totalBudget: 1.0,
          consumedRisk: 1.0,
          remainingRisk: 0,
          interventions: [],
          sessionStartedAt: new Date(),
        },
      })
      mockMemoryRepo.getMemory.mockResolvedValue(memory)

      vi.spyOn(classifier, 'classify').mockResolvedValue({
        state: 'hesitant',
        confidence: 0.7,
        signals: {} as MemberStateSignals,
        reasoning: 'Member is unsure',
      })

      const result = await decisionLoop.execute(defaultContext)

      expect(result).toBeNull()
    })

    it('should return null when proactive suggestions are disabled', async () => {
      const memory = createMockMemory({
        consentFlags: {
          canSuggestUnasked: false,
          canOfferEducation: true,
          canSendReminders: true,
          canTrackPatterns: true,
          canShareInsights: false,
        },
      })
      mockMemoryRepo.getMemory.mockResolvedValue(memory)

      vi.spyOn(classifier, 'classify').mockResolvedValue({
        state: 'hesitant',
        confidence: 0.7,
        signals: {} as MemberStateSignals,
        reasoning: 'Member is unsure',
      })

      const result = await decisionLoop.execute(defaultContext)

      expect(result).toBeNull()
    })

    it('should complete full cycle for hesitant member', async () => {
      const memory = createMockMemory()
      mockMemoryRepo.getMemory.mockResolvedValue(memory)
      mockMemoryRepo.consumeRiskBudget.mockResolvedValue({
        ...memory.riskProfile,
        consumedRisk: 0.1,
        remainingRisk: 0.9,
      })
      mockDecisionLoopRepo.createCycle.mockResolvedValue(undefined)

      vi.spyOn(classifier, 'classify').mockResolvedValue({
        state: 'hesitant',
        confidence: 0.7,
        signals: {} as MemberStateSignals,
        reasoning: 'Member is unsure about next steps',
      })

      const result = await decisionLoop.execute(defaultContext)

      expect(result).not.toBeNull()
      expect(result?.sense).toBeDefined()
      expect(result?.frame).toBeDefined()
      expect(result?.choose).toBeDefined()
      expect(result?.act).toBeDefined()
      expect(result?.learn).toBeDefined()
      expect(result?.userId).toBe(testUserId)
      expect(result?.sessionId).toBe(testSessionId)
    })

    it('should persist decision cycle to repo', async () => {
      const memory = createMockMemory()
      mockMemoryRepo.getMemory.mockResolvedValue(memory)
      mockMemoryRepo.consumeRiskBudget.mockResolvedValue(memory.riskProfile)
      mockDecisionLoopRepo.createCycle.mockResolvedValue(undefined)

      vi.spyOn(classifier, 'classify').mockResolvedValue({
        state: 'stalled',
        confidence: 0.8,
        signals: {} as MemberStateSignals,
        reasoning: 'Member appears stuck',
      })

      await decisionLoop.execute(defaultContext)

      expect(mockDecisionLoopRepo.createCycle).toHaveBeenCalled()
    })

    it('should consume risk budget after intervention', async () => {
      const memory = createMockMemory()
      mockMemoryRepo.getMemory.mockResolvedValue(memory)
      mockMemoryRepo.consumeRiskBudget.mockResolvedValue(memory.riskProfile)
      mockDecisionLoopRepo.createCycle.mockResolvedValue(undefined)

      vi.spyOn(classifier, 'classify').mockResolvedValue({
        state: 'explorer',
        confidence: 0.8,
        signals: {} as MemberStateSignals,
        reasoning: 'Member wants to learn',
      })

      await decisionLoop.execute(defaultContext)

      expect(mockMemoryRepo.consumeRiskBudget).toHaveBeenCalled()
    })
  })

  describe('member state handling', () => {
    beforeEach(() => {
      const memory = createMockMemory()
      mockMemoryRepo.getMemory.mockResolvedValue(memory)
      mockMemoryRepo.consumeRiskBudget.mockResolvedValue(memory.riskProfile)
      mockDecisionLoopRepo.createCycle.mockResolvedValue(undefined)
    })

    it('should generate ask_question action for hesitant members', async () => {
      vi.spyOn(classifier, 'classify').mockResolvedValue({
        state: 'hesitant',
        confidence: 0.7,
        signals: {} as MemberStateSignals,
        reasoning: 'Member is unsure',
      })

      const result = await decisionLoop.execute(defaultContext)

      expect(result?.frame.candidateActions).toContainEqual(
        expect.objectContaining({ type: 'ask_question' })
      )
    })

    it('should generate offer_recommendation action for decisive members', async () => {
      vi.spyOn(classifier, 'classify').mockResolvedValue({
        state: 'decisive',
        confidence: 0.5, // Low confidence so it passes the needs intervention check
        signals: {} as MemberStateSignals,
        reasoning: 'Member knows what they want but needs help',
      })

      const result = await decisionLoop.execute(defaultContext)

      expect(result?.frame.candidateActions).toContainEqual(
        expect.objectContaining({ type: 'offer_recommendation' })
      )
    })

    it('should generate suggest_microlesson action for explorer members', async () => {
      vi.spyOn(classifier, 'classify').mockResolvedValue({
        state: 'explorer',
        confidence: 0.8,
        signals: {} as MemberStateSignals,
        reasoning: 'Member wants to learn',
      })

      const result = await decisionLoop.execute(defaultContext)

      expect(result?.frame.candidateActions).toContainEqual(
        expect.objectContaining({ type: 'suggest_microlesson' })
      )
    })

    it('should generate simplify_options action for overloaded members', async () => {
      vi.spyOn(classifier, 'classify').mockResolvedValue({
        state: 'overloaded',
        confidence: 0.8,
        signals: {} as MemberStateSignals,
        reasoning: 'Member has too many options',
      })

      const result = await decisionLoop.execute(defaultContext)

      expect(result?.frame.candidateActions).toContainEqual(
        expect.objectContaining({ type: 'simplify_options' })
      )
    })
  })

  describe('consent checking', () => {
    it('should respect consent flags when choosing actions', async () => {
      const memory = createMockMemory({
        consentFlags: {
          canSuggestUnasked: true,
          canOfferEducation: false, // Disabled
          canSendReminders: false,
          canTrackPatterns: true,
          canShareInsights: false,
        },
      })
      mockMemoryRepo.getMemory.mockResolvedValue(memory)
      mockMemoryRepo.consumeRiskBudget.mockResolvedValue(memory.riskProfile)
      mockDecisionLoopRepo.createCycle.mockResolvedValue(undefined)

      vi.spyOn(classifier, 'classify').mockResolvedValue({
        state: 'explorer',
        confidence: 0.8,
        signals: {} as MemberStateSignals,
        reasoning: 'Member wants to learn',
      })

      const result = await decisionLoop.execute(defaultContext)

      // Should not select educational content because consent is disabled
      if (result?.choose.selectedAction) {
        expect(result.choose.selectedAction.type).not.toBe('suggest_microlesson')
        expect(result.choose.selectedAction.type).not.toBe('offer_challenge')
      }
    })
  })

  describe('learn phase', () => {
    it('should handle member response learning', async () => {
      // Currently the learn method is a placeholder
      await expect(
        decisionLoop.learn('cycle-123', {
          type: 'accepted',
          timeToResponse: 1000,
          feedback: { helpful: true },
        })
      ).resolves.not.toThrow()
    })
  })

  describe('error handling', () => {
    it('should return null and log error on failure', async () => {
      mockMemoryRepo.getMemory.mockRejectedValue(new Error('Database error'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await decisionLoop.execute(defaultContext)

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})

describe('MemberStateClassifier', () => {
  let classifier: MemberStateClassifier
  let mockRepo: ReturnType<typeof createMockMemberStateRepo>

  beforeEach(() => {
    mockRepo = createMockMemberStateRepo()
    classifier = new MemberStateClassifier(mockRepo)
  })

  describe('classify', () => {
    it('should classify member based on signals', async () => {
      const signals: MemberStateSignals = {
        questionType: 'actionable',
        questionSentiment: 'neutral',
        completionRate: 0.8,
        timeSinceLastAction: 60000, // 1 minute
        abandonmentCount: 0,
        sessionDuration: 300000, // 5 minutes
        questionsAsked: 2,
        recommendationsViewed: 3,
        recommendationsActedOn: 2,
        consentFlags: {
          allowsProactive: true,
          allowsEducational: true,
          allowsNudges: true,
        },
        riskBudgetRemaining: 0.8,
      }

      const result = await classifier.classify('user-1', signals)

      expect(result.state).toBeDefined()
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
      expect(result.reasoning).toBeDefined()
    })
  })
})

describe('ActionPalette', () => {
  let palette: ActionPalette

  beforeEach(() => {
    palette = new ActionPalette()
  })

  describe('getRiskCost', () => {
    it('should return higher risk for recommendations than micro-nudges', () => {
      const recommendCost = palette.getRiskCost('offer_recommendation')
      const ethicsNudgeCost = palette.getRiskCost('show_ethics_nudge')

      expect(recommendCost).toBeGreaterThan(ethicsNudgeCost)
    })

    it('should return risk cost for all action types', () => {
      const actionTypes = [
        'ask_question',
        'offer_recommendation',
        'suggest_microlesson',
        'offer_challenge',
        'show_ethics_nudge',
        'send_nudge',
        'simplify_options',
        'show_recommendation',
      ]

      actionTypes.forEach(type => {
        const cost = palette.getRiskCost(type)
        expect(cost).toBeGreaterThanOrEqual(0)
        expect(cost).toBeLessThanOrEqual(1)
      })
    })
  })
})
