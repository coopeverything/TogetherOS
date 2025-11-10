/**
 * QuestionnaireRepo
 * Repository interface for questionnaires and responses
 */

import type {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireType,
} from '@togetheros/types';

export interface QuestionnaireRepo {
  /**
   * Get all questionnaires in sequence order
   */
  getAllQuestionnaires(): Promise<Questionnaire[]>;

  /**
   * Get a questionnaire by ID
   */
  getQuestionnaireById(id: string): Promise<Questionnaire | null>;

  /**
   * Get a questionnaire by type
   */
  getQuestionnaireByType(type: QuestionnaireType): Promise<Questionnaire | null>;

  /**
   * Get questionnaires that a user hasn't completed yet
   */
  getIncompleteQuestionnaires(userId: string): Promise<Questionnaire[]>;

  /**
   * Create a questionnaire response
   */
  createResponse(input: {
    userId: string;
    questionnaireId: string;
    questionnaireType: QuestionnaireType;
    answer: any;
    startedAt: Date;
    completedAt: Date;
    rpAwarded: number;
  }): Promise<QuestionnaireResponse>;

  /**
   * Get all responses for a user
   */
  getUserResponses(userId: string): Promise<QuestionnaireResponse[]>;

  /**
   * Get a specific response
   */
  getResponse(userId: string, questionnaireId: string): Promise<QuestionnaireResponse | null>;

  /**
   * Get completion stats for a user
   */
  getCompletionStats(userId: string): Promise<{
    totalQuestionnaires: number;
    completedCount: number;
    completionPercentage: number;
    totalRPEarned: number;
  }>;
}
