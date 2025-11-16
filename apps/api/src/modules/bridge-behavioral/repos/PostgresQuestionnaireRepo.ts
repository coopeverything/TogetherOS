/**
 * PostgreSQL Questionnaire Repository
 * Production implementation using real database
 */

import type {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireType,
} from '@togetheros/types';
import type { QuestionnaireRepo } from './QuestionnaireRepo';
import { query } from '@togetheros/db';

export class PostgresQuestionnaireRepo implements QuestionnaireRepo {
  async getAllQuestionnaires(): Promise<Questionnaire[]> {
    const sql = `
      SELECT
        id, type, question, description,
        answer_type as "answerType", options,
        show_if as "showIf", sequence_number as "sequenceNumber",
        estimated_time_seconds as "estimatedTimeSeconds",
        rp_reward as "rpReward"
      FROM questionnaires
      ORDER BY sequence_number ASC
    `;

    const result = await query(sql);
    return result.rows;
  }

  async getQuestionnaireById(id: string): Promise<Questionnaire | null> {
    const sql = `
      SELECT
        id, type, question, description,
        answer_type as "answerType", options,
        show_if as "showIf", sequence_number as "sequenceNumber",
        estimated_time_seconds as "estimatedTimeSeconds",
        rp_reward as "rpReward"
      FROM questionnaires
      WHERE id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  async getQuestionnaireByType(type: QuestionnaireType): Promise<Questionnaire | null> {
    const sql = `
      SELECT
        id, type, question, description,
        answer_type as "answerType", options,
        show_if as "showIf", sequence_number as "sequenceNumber",
        estimated_time_seconds as "estimatedTimeSeconds",
        rp_reward as "rpReward"
      FROM questionnaires
      WHERE type = $1
    `;

    const result = await query(sql, [type]);
    return result.rows[0] || null;
  }

  async getIncompleteQuestionnaires(userId: string): Promise<Questionnaire[]> {
    const sql = `
      SELECT
        q.id, q.type, q.question, q.description,
        q.answer_type as "answerType", q.options,
        q.show_if as "showIf", q.sequence_number as "sequenceNumber",
        q.estimated_time_seconds as "estimatedTimeSeconds",
        q.rp_reward as "rpReward"
      FROM questionnaires q
      LEFT JOIN questionnaire_responses qr
        ON q.id = qr.questionnaire_id AND qr.user_id = $1
      WHERE qr.id IS NULL
      ORDER BY q.sequence_number ASC
    `;

    const result = await query(sql, [userId]);
    return result.rows;
  }

  async createResponse(input: {
    userId: string;
    questionnaireId: string;
    questionnaireType: QuestionnaireType;
    answer: any;
    startedAt: Date;
    completedAt: Date;
    rpAwarded: number;
  }): Promise<QuestionnaireResponse> {
    const sql = `
      INSERT INTO questionnaire_responses (
        user_id, questionnaire_id, questionnaire_type,
        answer, started_at, completed_at, rp_awarded
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, questionnaire_id) DO UPDATE SET
        answer = EXCLUDED.answer,
        completed_at = EXCLUDED.completed_at
      RETURNING
        id, user_id as "userId", questionnaire_id as "questionnaireId",
        questionnaire_type as "questionnaireType", answer,
        started_at as "startedAt", completed_at as "completedAt",
        duration_seconds as "durationSeconds", rp_awarded as "rpAwarded"
    `;

    const result = await query(sql, [
      input.userId,
      input.questionnaireId,
      input.questionnaireType,
      JSON.stringify(input.answer),
      input.startedAt,
      input.completedAt,
      input.rpAwarded,
    ]);

    return result.rows[0];
  }

  async getUserResponses(userId: string): Promise<QuestionnaireResponse[]> {
    const sql = `
      SELECT
        id, user_id as "userId", questionnaire_id as "questionnaireId",
        questionnaire_type as "questionnaireType", answer,
        started_at as "startedAt", completed_at as "completedAt",
        duration_seconds as "durationSeconds", rp_awarded as "rpAwarded"
      FROM questionnaire_responses
      WHERE user_id = $1
      ORDER BY completed_at DESC
    `;

    const result = await query(sql, [userId]);
    return result.rows;
  }

  async getResponse(userId: string, questionnaireId: string): Promise<QuestionnaireResponse | null> {
    const sql = `
      SELECT
        id, user_id as "userId", questionnaire_id as "questionnaireId",
        questionnaire_type as "questionnaireType", answer,
        started_at as "startedAt", completed_at as "completedAt",
        duration_seconds as "durationSeconds", rp_awarded as "rpAwarded"
      FROM questionnaire_responses
      WHERE user_id = $1 AND questionnaire_id = $2
    `;

    const result = await query(sql, [userId, questionnaireId]);
    return result.rows[0] || null;
  }

  async getCompletionStats(userId: string): Promise<{
    totalQuestionnaires: number;
    completedCount: number;
    completionPercentage: number;
    totalRPEarned: number;
  }> {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM questionnaires) as "totalQuestionnaires",
        COUNT(qr.id) as "completedCount",
        COALESCE(SUM(qr.rp_awarded), 0) as "totalRPEarned"
      FROM questionnaire_responses qr
      WHERE qr.user_id = $1
    `;

    const result = await query(sql, [userId]);
    const stats = result.rows[0];

    return {
      totalQuestionnaires: parseInt(stats.totalQuestionnaires, 10),
      completedCount: parseInt(stats.completedCount, 10),
      completionPercentage: stats.totalQuestionnaires > 0
        ? Math.round((stats.completedCount / stats.totalQuestionnaires) * 100)
        : 0,
      totalRPEarned: parseInt(stats.totalRPEarned, 10),
    };
  }
}
