/**
 * ActionPalette
 * Manages the 6 intervention levels and risk budget tracking
 */

import type { ActionLevel, ActionPaletteEntry, RISK_BUDGET } from '@togetheros/types';

export class ActionPalette {
  // Risk costs for each intervention level
  private static readonly RISK_COSTS: Record<string, number> = {
    'micro-nudge': 0.01,
    'gentle-suggest': 0.05,
    'offer': 0.10,
    'recommend': 0.15,
    'request': 0.20,
    'human-help': 0.30,

    // Action type mappings
    'ask_question': 0.05, // gentle-suggest
    'offer_recommendation': 0.15, // recommend
    'suggest_microlesson': 0.10, // offer
    'offer_challenge': 0.10, // offer
    'show_ethics_nudge': 0.01, // micro-nudge
    'send_nudge': 0.05, // gentle-suggest
    'simplify_options': 0.01, // micro-nudge
    'show_recommendation': 0.15, // recommend
  };

  // Content templates for each intervention level
  private static readonly TEMPLATES: Record<ActionLevel, ActionPaletteEntry['content']> = {
    'micro-nudge': {
      template: '{hint}',
      tone: 'neutral',
      examples: [
        '💡 You might find this helpful...',
        '✨ Quick tip:',
        '📌 Consider:',
      ],
    },
    'gentle-suggest': {
      template: '{suggestion} {reason}',
      tone: 'encouraging',
      examples: [
        'You might want to {action}. {reason}',
        'Have you considered {action}? {reason}',
        'Some people find it helpful to {action}. {reason}',
      ],
    },
    'offer': {
      template: 'Would you like to {action}? {benefits}',
      tone: 'empathetic',
      examples: [
        'Would you like to explore {topic}? It could help with {goal}.',
        'I can help you {action} if you\'d like.',
        'There\'s a {resource} that might be useful. Interested?',
      ],
    },
    'recommend': {
      template: 'I recommend {action}. Here\'s why: {reasoning}',
      tone: 'direct',
      examples: [
        'Based on your interests in {topic}, I recommend {action}.',
        'Given your situation, {action} would be a good next step.',
        'I suggest {action} because {reasoning}.',
      ],
    },
    'request': {
      template: 'Could you {action}? {urgency_reason}',
      tone: 'direct',
      examples: [
        'Could you complete {task}? It\'s needed for {reason}.',
        'Would you be able to {action} by {deadline}?',
        'Can you help with {action}? The group needs {reason}.',
      ],
    },
    'human-help': {
      template: 'This might need human assistance. {escalation_reason}',
      tone: 'empathetic',
      examples: [
        'This situation might benefit from talking to a moderator.',
        'I\'ve reached my limits here. Would you like to speak with someone?',
        'Let\'s get a human to help with this.',
      ],
    },
  };

  /**
   * Get risk cost for an action type
   */
  getRiskCost(actionType: string): number {
    return ActionPalette.RISK_COSTS[actionType] || 0.05; // Default: gentle-suggest
  }

  /**
   * Get content template for an intervention level
   */
  getTemplate(level: ActionLevel): ActionPaletteEntry['content'] {
    return ActionPalette.TEMPLATES[level];
  }

  /**
   * Get intervention level from action type
   */
  getLevel(actionType: string): ActionLevel {
    const riskCost = this.getRiskCost(actionType);

    if (riskCost <= 0.01) return 'micro-nudge';
    if (riskCost <= 0.05) return 'gentle-suggest';
    if (riskCost <= 0.10) return 'offer';
    if (riskCost <= 0.15) return 'recommend';
    if (riskCost <= 0.20) return 'request';
    return 'human-help';
  }

  /**
   * Check if action is within risk budget
   */
  isWithinRiskBudget(actionType: string, remainingRisk: number): boolean {
    const riskCost = this.getRiskCost(actionType);
    return remainingRisk >= riskCost;
  }

  /**
   * Get all actions within risk budget
   */
  getAvailableActions(remainingRisk: number): string[] {
    return Object.entries(ActionPalette.RISK_COSTS)
      .filter(([, cost]) => cost <= remainingRisk)
      .map(([action]) => action);
  }

  /**
   * Format intervention content using template
   */
  formatContent(
    level: ActionLevel,
    variables: Record<string, string>
  ): string {
    const template = this.getTemplate(level);
    let content = template.template;

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(`{${key}}`, value);
    }

    return content;
  }
}
