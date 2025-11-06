/**
 * MemberStateClassifier
 * Classifies member behavioral state from signals
 */

import type {
  MemberState,
  MemberStateSignals,
  MemberStateClassification,
} from '@togetheros/types';

import type { MemberStateRepo } from '../repos';

export class MemberStateClassifier {
  constructor(private memberStateRepo: MemberStateRepo) {}

  /**
   * Classify member state from signals
   */
  async classify(
    userId: string,
    signals: MemberStateSignals
  ): Promise<MemberStateClassification> {
    // Calculate state scores
    const scores = {
      decisive: this.scoreDecisive(signals),
      hesitant: this.scoreHesitant(signals),
      explorer: this.scoreExplorer(signals),
      stalled: this.scoreStalled(signals),
      overloaded: this.scoreOverloaded(signals),
    };

    // Find highest scoring state
    const entries = Object.entries(scores) as [MemberState, number][];
    const [state, confidence] = entries.reduce((max, entry) =>
      entry[1] > max[1] ? entry : max
    );

    // Generate reasoning
    const reasoning = this.generateReasoning(state, signals, scores);

    // Create classification
    const classification: MemberStateClassification = {
      state,
      confidence,
      signals,
      classifiedAt: new Date(),
      reasoning,
    };

    // Persist classification
    await this.memberStateRepo.createClassification({
      userId,
      sessionId: signals.riskBudgetRemaining.toString(), // TODO: Get real session ID
      state,
      confidence,
      reasoning,
      signals,
    });

    return classification;
  }

  // ===========================
  // State Scoring Functions
  // ===========================

  private scoreDecisive(signals: MemberStateSignals): number {
    let score = 0;

    // Decisive indicators
    if (signals.questionType === 'actionable') score += 0.3;
    if (signals.completionRate > 0.7) score += 0.2;
    if (signals.timeSinceLastAction < 3600000) score += 0.2; // < 1 hour
    if (signals.abandonmentCount === 0) score += 0.1;
    if (signals.recommendationsActedOn > signals.recommendationsViewed * 0.5) score += 0.2;

    return Math.min(1, score);
  }

  private scoreHesitant(signals: MemberStateSignals): number {
    let score = 0;

    // Hesitant indicators
    if (signals.questionType === 'help' || signals.questionType === 'vague') score += 0.3;
    if (signals.questionSentiment === 'neutral') score += 0.1;
    if (signals.completionRate < 0.4) score += 0.2;
    if (signals.recommendationsViewed > 3 && signals.recommendationsActedOn === 0) score += 0.3;
    if (signals.sessionDuration > 300000 && signals.questionsAsked > 2) score += 0.1; // > 5 min, multiple questions

    return Math.min(1, score);
  }

  private scoreExplorer(signals: MemberStateSignals): number {
    let score = 0;

    // Explorer indicators
    if (signals.questionType === 'exploratory') score += 0.4;
    if (signals.questionSentiment === 'positive') score += 0.2;
    if (signals.questionsAsked > 3) score += 0.2;
    if (signals.sessionDuration > 600000) score += 0.1; // > 10 minutes
    if (signals.consentFlags.allowsEducational) score += 0.1;

    return Math.min(1, score);
  }

  private scoreStalled(signals: MemberStateSignals): number {
    let score = 0;

    // Stalled indicators
    if (signals.timeSinceLastAction > 604800000) score += 0.4; // > 7 days
    if (signals.abandonmentCount > 2) score += 0.3;
    if (signals.questionSentiment === 'frustrated') score += 0.2;
    if (signals.completionRate < 0.2) score += 0.1;

    return Math.min(1, score);
  }

  private scoreOverloaded(signals: MemberStateSignals): number {
    let score = 0;

    // Overloaded indicators
    if (signals.questionSentiment === 'overwhelmed') score += 0.4;
    if (signals.recommendationsViewed > 5 && signals.recommendationsActedOn === 0) score += 0.3;
    if (signals.questionsAsked > 5 && signals.sessionDuration < 600000) score += 0.2; // Many questions in short time
    if (signals.abandonmentCount > 3) score += 0.1;

    return Math.min(1, score);
  }

  // ===========================
  // Reasoning Generation
  // ===========================

  private generateReasoning(
    state: MemberState,
    signals: MemberStateSignals,
    scores: Record<MemberState, number>
  ): string {
    const reasons: string[] = [];

    switch (state) {
      case 'decisive':
        if (signals.questionType === 'actionable') {
          reasons.push('Member asked actionable question');
        }
        if (signals.completionRate > 0.7) {
          reasons.push(`High completion rate (${(signals.completionRate * 100).toFixed(0)}%)`);
        }
        if (signals.timeSinceLastAction < 3600000) {
          reasons.push('Recently active');
        }
        break;

      case 'hesitant':
        if (signals.questionType === 'help' || signals.questionType === 'vague') {
          reasons.push(`Question type: ${signals.questionType}`);
        }
        if (signals.completionRate < 0.4) {
          reasons.push(`Low completion rate (${(signals.completionRate * 100).toFixed(0)}%)`);
        }
        if (signals.recommendationsViewed > 3 && signals.recommendationsActedOn === 0) {
          reasons.push('Viewed recommendations but not acting');
        }
        break;

      case 'explorer':
        if (signals.questionType === 'exploratory') {
          reasons.push('Asked exploratory question');
        }
        if (signals.questionsAsked > 3) {
          reasons.push(`Multiple questions (${signals.questionsAsked})`);
        }
        if (signals.sessionDuration > 600000) {
          reasons.push('Extended session duration');
        }
        break;

      case 'stalled':
        if (signals.timeSinceLastAction > 604800000) {
          const days = Math.floor(signals.timeSinceLastAction / 86400000);
          reasons.push(`Inactive for ${days} days`);
        }
        if (signals.abandonmentCount > 2) {
          reasons.push(`Multiple abandonments (${signals.abandonmentCount})`);
        }
        if (signals.questionSentiment === 'frustrated') {
          reasons.push('Frustrated sentiment detected');
        }
        break;

      case 'overloaded':
        if (signals.questionSentiment === 'overwhelmed') {
          reasons.push('Overwhelmed sentiment detected');
        }
        if (signals.recommendationsViewed > 5 && signals.recommendationsActedOn === 0) {
          reasons.push('Viewed many recommendations without acting');
        }
        if (signals.questionsAsked > 5 && signals.sessionDuration < 600000) {
          reasons.push('Rapid-fire questions suggest overwhelm');
        }
        break;
    }

    // Add confidence context
    const confidence = scores[state];
    const runnerUp = Object.entries(scores)
      .filter(([s]) => s !== state)
      .sort(([, a], [, b]) => b - a)[0];

    if (runnerUp && confidence - runnerUp[1] < 0.2) {
      reasons.push(`Close to ${runnerUp[0]} state (margin: ${((confidence - runnerUp[1]) * 100).toFixed(0)}%)`);
    }

    return reasons.join('; ');
  }
}
