/**
 * DecisionLoop Service
 * Implements the 5-phase behavioral decision loop:
 * SENSE → FRAME → CHOOSE → ACT → LEARN
 */

import type {
  MemberState,
  MemberStateSignals,
  MemberMemory,
  SensePhase,
  FramePhase,
  ChoosePhase,
  ActPhase,
  LearnPhase,
  DecisionCycle,
} from '@togetheros/types';

import type { MemberStateRepo, MemoryRepo, DecisionLoopRepo } from '../repos';
import { MemberStateClassifier } from './MemberStateClassifier';
import { ActionPalette } from './ActionPalette';

export interface DecisionLoopContext {
  userId: string;
  sessionId: string;
  currentLocation: string; // URL path
  questionAsked?: string; // If member asked a question
}

export class DecisionLoop {
  constructor(
    private memberStateRepo: MemberStateRepo,
    private memoryRepo: MemoryRepo,
    private decisionLoopRepo: DecisionLoopRepo,
    private classifier: MemberStateClassifier,
    private actionPalette: ActionPalette
  ) {}

  /**
   * Execute a complete decision loop cycle
   * Returns null if no intervention is warranted
   */
  async execute(context: DecisionLoopContext): Promise<DecisionCycle | null> {
    const startTime = Date.now();

    try {
      // PHASE 1: SENSE - Detect member's current state and needs
      const sensePhase = await this.sense(context);

      // If member state is clear and no intervention needed, return early
      if (!this.needsIntervention(sensePhase)) {
        return null;
      }

      // PHASE 2: FRAME - Interpret situation and identify possible interventions
      const framePhase = await this.frame(sensePhase, context);

      // If no candidate actions, return early
      if (framePhase.candidateActions.length === 0) {
        return null;
      }

      // PHASE 3: CHOOSE - Select best intervention based on context, memory, risk budget
      const choosePhase = await this.choose(framePhase, sensePhase.memory);

      // If no action selected, return early
      if (!choosePhase.selectedAction) {
        return null;
      }

      // PHASE 4: ACT - Execute the chosen intervention
      const actPhase = await this.act(choosePhase, context);

      // Record risk consumption in memory
      if (actPhase.executed) {
        await this.memoryRepo.consumeRiskBudget({
          sessionId: context.sessionId,
          interventionLevel: choosePhase.selectedAction.type,
          riskCost: actPhase.riskConsumed,
          trigger: choosePhase.selectionReason,
        });
      }

      // PHASE 5: LEARN - Observe member's response and update memory
      // Note: Learn phase is called asynchronously after member responds
      // For now, we create a placeholder learn phase
      const learnPhase: LearnPhase = {
        intervention: actPhase,
        response: {
          type: 'ignored', // Default; will be updated when member responds
        },
        memoryUpdates: {
          episodicCreated: [],
          semanticUpdated: [],
          preferencesUpdated: {},
          affinityUpdated: {},
        },
        outcome: 'neutral',
        insight: 'Awaiting member response',
        timestamp: new Date(),
      };

      // Create complete decision cycle
      const cycle: DecisionCycle = {
        id: crypto.randomUUID(),
        userId: context.userId,
        sessionId: context.sessionId,
        sense: sensePhase,
        frame: framePhase,
        choose: choosePhase,
        act: actPhase,
        learn: learnPhase,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        durationMs: Date.now() - startTime,
      };

      // Persist cycle
      await this.decisionLoopRepo.createCycle({
        userId: cycle.userId,
        sessionId: cycle.sessionId,
        sense: cycle.sense,
        frame: cycle.frame,
        choose: cycle.choose,
        act: cycle.act,
        learn: cycle.learn,
        startedAt: cycle.startedAt,
        completedAt: cycle.completedAt,
      });

      return cycle;
    } catch (error) {
      console.error('[DecisionLoop] Error executing cycle:', error);
      return null;
    }
  }

  /**
   * PHASE 1: SENSE
   * Detect member's current state and needs
   */
  private async sense(context: DecisionLoopContext): Promise<SensePhase> {
    // Get member's memory
    const memory = await this.memoryRepo.getMemory(context.userId, context.sessionId);

    // Build signals from memory and context
    const signals: MemberStateSignals = await this.buildSignals(memory, context);

    // Classify member state
    const classification = await this.classifier.classify(context.userId, signals);

    return {
      signals,
      memory,
      currentContext: {
        location: context.currentLocation,
        sessionDuration: this.calculateSessionDuration(memory.riskProfile.sessionStartedAt),
        questionsAsked: this.countRecentQuestions(memory.episodic),
      },
      classification,
      timestamp: new Date(),
    };
  }

  /**
   * PHASE 2: FRAME
   * Interpret the situation and identify possible interventions
   */
  private async frame(sensePhase: SensePhase, context: DecisionLoopContext): Promise<FramePhase> {
    const { classification, signals, memory } = sensePhase;

    // Determine situation based on member state
    const situation = this.determineSituation(classification.state, signals, memory);

    // Generate candidate actions based on situation
    const candidateActions = this.generateCandidateActions(
      classification.state,
      situation,
      context
    );

    return {
      memberState: classification.state,
      signals,
      situation,
      candidateActions,
      timestamp: new Date(),
    };
  }

  /**
   * PHASE 3: CHOOSE
   * Select best intervention based on context, memory, risk budget
   */
  private async choose(framePhase: FramePhase, memory: MemberMemory): Promise<ChoosePhase> {
    const { candidateActions } = framePhase;
    const { riskProfile, consentFlags } = memory;

    // Score each candidate action
    const scoredActions = candidateActions.map((action) => {
      // Get risk cost from action palette
      const riskCost = this.actionPalette.getRiskCost(action.type);

      // Check consent
      const consentCheck = this.checkConsent(action.type, consentFlags);

      // Check risk budget
      const withinRiskBudget = riskProfile.remainingRisk >= riskCost;

      // Calculate score (0-100)
      const score = this.scoreAction(action, riskCost, consentCheck, withinRiskBudget);

      return {
        action,
        score,
        riskCost,
        consentCheck,
        withinRiskBudget,
      };
    });

    // Filter valid actions (consent + risk budget)
    const validActions = scoredActions.filter(
      (sa) => sa.consentCheck && sa.withinRiskBudget
    );

    // Select highest scoring action (or null if no valid actions)
    const selectedScoredAction = validActions.sort((a, b) => b.score - a.score)[0] || null;

    return {
      candidateActions,
      riskProfile,
      consentFlags,
      scoredActions,
      selectedAction: selectedScoredAction?.action || null,
      selectionReason: selectedScoredAction
        ? `Selected "${selectedScoredAction.action.type}" (score: ${selectedScoredAction.score})`
        : 'No valid actions (consent or risk budget exceeded)',
      timestamp: new Date(),
    };
  }

  /**
   * PHASE 4: ACT
   * Execute the chosen intervention
   */
  private async act(choosePhase: ChoosePhase, context: DecisionLoopContext): Promise<ActPhase> {
    const { selectedAction } = choosePhase;

    if (!selectedAction) {
      return {
        selectedAction: null,
        executed: false,
        executionMethod: 'inline',
        content: { body: '' },
        riskConsumed: 0,
        riskRemaining: choosePhase.riskProfile.remainingRisk,
        timestamp: new Date(),
      };
    }

    // Generate content for the intervention
    const content = await this.generateInterventionContent(selectedAction, context);

    // Determine execution method
    const executionMethod = this.determineExecutionMethod(selectedAction.type);

    // Calculate risk consumed
    const riskCost = this.actionPalette.getRiskCost(selectedAction.type);
    const riskConsumed = riskCost;
    const riskRemaining = choosePhase.riskProfile.remainingRisk - riskCost;

    return {
      selectedAction,
      executed: true,
      executionMethod,
      content,
      riskConsumed,
      riskRemaining,
      timestamp: new Date(),
    };
  }

  /**
   * PHASE 5: LEARN (called after member responds)
   * Observe member's response and update memory
   */
  async learn(
    cycleId: string,
    response: {
      type: 'accepted' | 'dismissed' | 'ignored' | 'completed';
      timeToResponse?: number;
      feedback?: {
        helpful: boolean;
        comment?: string;
      };
    }
  ): Promise<void> {
    // TODO: Implement learning logic
    // 1. Fetch the decision cycle
    // 2. Record episodic event
    // 3. Update semantic memory
    // 4. Update preferences if feedback provided
    // 5. Update context affinity
    // 6. Update if-then rule success rates
    console.log(`[DecisionLoop] Learning from response for cycle ${cycleId}:`, response);
  }

  // ===========================
  // Helper Methods
  // ===========================

  private async buildSignals(
    memory: MemberMemory,
    context: DecisionLoopContext
  ): Promise<MemberStateSignals> {
    // Analyze recent episodic events to build signals
    const recentEvents = memory.episodic.slice(0, 20); // Last 20 events

    // Determine question type if question was asked
    const questionType = context.questionAsked
      ? this.classifyQuestionType(context.questionAsked)
      : 'actionable';

    // Determine sentiment
    const questionSentiment = context.questionAsked
      ? this.analyzeSentiment(context.questionAsked)
      : 'neutral';

    // Calculate completion rate
    const completionRate = this.calculateCompletionRate(recentEvents);

    // Calculate time since last action
    const timeSinceLastAction = this.calculateTimeSinceLastAction(recentEvents);

    // Count abandonments
    const abandonmentCount = recentEvents.filter(
      (e) => e.event === 'action_abandoned'
    ).length;

    // Calculate session metrics
    const sessionEvents = recentEvents.filter((e) => e.sessionId === context.sessionId);
    const sessionDuration = this.calculateSessionDuration(memory.riskProfile.sessionStartedAt);
    const questionsAsked = sessionEvents.filter((e) => e.event === 'question_asked').length;
    const recommendationsViewed = sessionEvents.filter(
      (e) => e.event === 'recommendation_accepted' || e.event === 'recommendation_dismissed'
    ).length;
    const recommendationsActedOn = sessionEvents.filter(
      (e) => e.event === 'recommendation_accepted'
    ).length;

    return {
      questionType,
      questionSentiment,
      completionRate,
      timeSinceLastAction,
      abandonmentCount,
      sessionDuration,
      questionsAsked,
      recommendationsViewed,
      recommendationsActedOn,
      consentFlags: {
        allowsProactive: memory.consentFlags.canSuggestUnasked,
        allowsEducational: memory.consentFlags.canOfferEducation,
        allowsNudges: memory.consentFlags.canSendReminders,
      },
      riskBudgetRemaining: memory.riskProfile.remainingRisk,
    };
  }

  private needsIntervention(sensePhase: SensePhase): boolean {
    // Don't intervene if member state is confident and decisive
    if (
      sensePhase.classification.state === 'decisive' &&
      sensePhase.classification.confidence > 0.8
    ) {
      return false;
    }

    // Don't intervene if risk budget is exhausted
    if (sensePhase.memory.riskProfile.remainingRisk <= 0.01) {
      return false;
    }

    // Don't intervene if member has disabled proactive suggestions
    if (!sensePhase.memory.consentFlags.canSuggestUnasked) {
      return false;
    }

    return true;
  }

  private determineSituation(
    memberState: MemberState,
    signals: MemberStateSignals,
    memory: MemberMemory
  ): FramePhase['situation'] {
    switch (memberState) {
      case 'decisive':
        return {
          problem: 'Member knows what they want',
          opportunity: 'Provide direct action recommendation',
          urgency: 'medium',
        };

      case 'hesitant':
        return {
          problem: 'Member is unsure about next steps',
          opportunity: 'Ask clarifying questions to narrow options',
          urgency: 'low',
        };

      case 'explorer':
        return {
          problem: 'Member wants to learn more',
          opportunity: 'Offer microlesson or challenge',
          urgency: 'low',
        };

      case 'stalled':
        return {
          problem: 'Member is stuck and not progressing',
          opportunity: 'Provide encouragement and simplify options',
          urgency: 'high',
        };

      case 'overloaded':
        return {
          problem: 'Member has too many options',
          opportunity: 'Simplify UI and focus on one next step',
          urgency: 'high',
        };

      default:
        return {
          problem: 'Unknown member state',
          opportunity: 'Monitor and learn',
          urgency: 'low',
        };
    }
  }

  private generateCandidateActions(
    memberState: MemberState,
    situation: FramePhase['situation'],
    context: DecisionLoopContext
  ): FramePhase['candidateActions'] {
    const actions: FramePhase['candidateActions'] = [];

    switch (memberState) {
      case 'decisive':
        actions.push({
          type: 'offer_recommendation',
          rationale: 'Member is decisive, provide actionable recommendation',
          expectedOutcome: 'Member accepts and completes action',
        });
        break;

      case 'hesitant':
        actions.push({
          type: 'ask_question',
          rationale: 'Member is hesitant, ask clarifying question',
          expectedOutcome: 'Member provides more context',
        });
        actions.push({
          type: 'simplify_options',
          rationale: 'Member may be overwhelmed by choices',
          expectedOutcome: 'Member narrows focus',
        });
        break;

      case 'explorer':
        actions.push({
          type: 'suggest_microlesson',
          rationale: 'Member wants to learn, offer educational content',
          expectedOutcome: 'Member completes microlesson',
        });
        actions.push({
          type: 'offer_challenge',
          rationale: 'Member is curious, provide interactive challenge',
          expectedOutcome: 'Member completes challenge',
        });
        break;

      case 'stalled':
        actions.push({
          type: 'show_recommendation',
          rationale: 'Member is stuck, provide clear next step',
          expectedOutcome: 'Member takes action',
        });
        actions.push({
          type: 'send_nudge',
          rationale: 'Member needs encouragement',
          expectedOutcome: 'Member re-engages',
        });
        break;

      case 'overloaded':
        actions.push({
          type: 'simplify_options',
          rationale: 'Member has too many options, focus on one',
          expectedOutcome: 'Member feels less overwhelmed',
        });
        actions.push({
          type: 'show_ethics_nudge',
          rationale: 'Remind member to take it slow',
          expectedOutcome: 'Member takes a breath',
        });
        break;
    }

    return actions;
  }

  private checkConsent(actionType: string, consentFlags: typeof import('@togetheros/types').ConsentFlags.prototype): boolean {
    // Map action types to consent flags
    const consentMap: Record<string, keyof typeof consentFlags> = {
      ask_question: 'canSuggestUnasked',
      offer_recommendation: 'canSuggestUnasked',
      suggest_microlesson: 'canOfferEducation',
      offer_challenge: 'canOfferEducation',
      show_ethics_nudge: 'canOfferEducation',
      send_nudge: 'canSendReminders',
      simplify_options: 'canSuggestUnasked',
      show_recommendation: 'canSuggestUnasked',
    };

    const requiredFlag = consentMap[actionType];
    return requiredFlag ? consentFlags[requiredFlag] : false;
  }

  private scoreAction(
    action: FramePhase['candidateActions'][0],
    riskCost: number,
    consentCheck: boolean,
    withinRiskBudget: boolean
  ): number {
    let score = 50; // Base score

    // Penalty if no consent
    if (!consentCheck) score -= 100;

    // Penalty if over risk budget
    if (!withinRiskBudget) score -= 100;

    // Bonus for low risk cost (prefer gentle interventions)
    score += (0.3 - riskCost) * 100;

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  private async generateInterventionContent(
    action: FramePhase['candidateActions'][0],
    context: DecisionLoopContext
  ): Promise<ActPhase['content']> {
    // TODO: Use action palette templates
    // For now, return placeholder content
    return {
      title: action.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      body: action.rationale,
      actionButton: {
        label: 'Continue',
        action: context.currentLocation,
      },
    };
  }

  private determineExecutionMethod(actionType: string): ActPhase['executionMethod'] {
    // Map action types to execution methods
    const methodMap: Record<string, ActPhase['executionMethod']> = {
      ask_question: 'inline',
      offer_recommendation: 'recommendation_card',
      suggest_microlesson: 'modal',
      offer_challenge: 'modal',
      show_ethics_nudge: 'inline',
      send_nudge: 'notification',
      simplify_options: 'inline',
      show_recommendation: 'recommendation_card',
    };

    return methodMap[actionType] || 'inline';
  }

  private classifyQuestionType(question: string): MemberStateSignals['questionType'] {
    const lowerQuestion = question.toLowerCase();

    if (
      lowerQuestion.includes('how do i') ||
      lowerQuestion.includes('what should i') ||
      lowerQuestion.includes('where can i')
    ) {
      return 'actionable';
    }

    if (
      lowerQuestion.includes('what is') ||
      lowerQuestion.includes('why') ||
      lowerQuestion.includes('how does')
    ) {
      return 'exploratory';
    }

    if (lowerQuestion.includes('help') || lowerQuestion.includes('stuck')) {
      return 'help';
    }

    return 'vague';
  }

  private analyzeSentiment(question: string): MemberStateSignals['questionSentiment'] {
    const lowerQuestion = question.toLowerCase();

    if (
      lowerQuestion.includes('frustrated') ||
      lowerQuestion.includes('confused') ||
      lowerQuestion.includes('stuck')
    ) {
      return 'frustrated';
    }

    if (
      lowerQuestion.includes('overwhelmed') ||
      lowerQuestion.includes('too many') ||
      lowerQuestion.includes("don't know")
    ) {
      return 'overwhelmed';
    }

    if (lowerQuestion.includes('excited') || lowerQuestion.includes('looking forward')) {
      return 'positive';
    }

    return 'neutral';
  }

  private calculateCompletionRate(events: typeof import('@togetheros/types').EpisodicMemory.prototype[]): number {
    const accepted = events.filter((e) => e.event === 'recommendation_accepted').length;
    const completed = events.filter((e) => e.event === 'action_completed').length;

    if (accepted === 0) return 0;
    return completed / accepted;
  }

  private calculateTimeSinceLastAction(events: typeof import('@togetheros/types').EpisodicMemory.prototype[]): number {
    const lastAction = events.find(
      (e) => e.event === 'action_completed' || e.event === 'recommendation_accepted'
    );

    if (!lastAction) return Infinity;
    return Date.now() - new Date(lastAction.createdAt).getTime();
  }

  private calculateSessionDuration(sessionStartedAt: Date): number {
    return Date.now() - new Date(sessionStartedAt).getTime();
  }

  private countRecentQuestions(events: typeof import('@togetheros/types').EpisodicMemory.prototype[]): number {
    return events.filter((e) => e.event === 'question_asked').length;
  }
}
