/**
 * Proposal Ratings database operations
 * Handles multi-dimensional quality ratings for proposals
 */

import { query } from './index';
import type {
  ProposalRating,
  ProposalRatingAggregate,
  ClarityRating,
  ConstructivenessRating,
} from '@togetheros/types/governance';

/**
 * Database row type (snake_case from database)
 */
interface RatingRow {
  id: string;
  proposal_id: string;
  member_id: string;
  clarity: number;
  importance: number;
  urgency: number;
  is_innovative: boolean;
  constructiveness: number;
  feedback?: string;
  rated_at: Date;
  updated_at: Date;
}

/**
 * Convert database row to domain entity (snake_case → camelCase)
 */
function toRating(row: RatingRow): ProposalRating {
  return {
    id: row.id,
    proposalId: row.proposal_id,
    memberId: row.member_id,
    clarity: row.clarity as ClarityRating,
    importance: row.importance,
    urgency: row.urgency,
    isInnovative: row.is_innovative,
    constructiveness: row.constructiveness as ConstructivenessRating,
    feedback: row.feedback,
    ratedAt: row.rated_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Submit or update a rating
 */
export async function submitRating(
  proposalId: string,
  memberId: string,
  clarity: ClarityRating,
  importance: number,
  urgency: number,
  isInnovative: boolean,
  constructiveness: ConstructivenessRating,
  feedback?: string
): Promise<ProposalRating> {
  const result = await query<RatingRow>(
    `INSERT INTO proposal_ratings
       (proposal_id, member_id, clarity, importance, urgency, is_innovative, constructiveness, feedback)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (proposal_id, member_id)
     DO UPDATE SET
       clarity = EXCLUDED.clarity,
       importance = EXCLUDED.importance,
       urgency = EXCLUDED.urgency,
       is_innovative = EXCLUDED.is_innovative,
       constructiveness = EXCLUDED.constructiveness,
       feedback = EXCLUDED.feedback,
       updated_at = NOW()
     RETURNING *`,
    [proposalId, memberId, clarity, importance, urgency, isInnovative, constructiveness, feedback]
  );

  return toRating(result.rows[0]);
}

/**
 * Get a member's rating for a proposal
 */
export async function getRating(
  proposalId: string,
  memberId: string
): Promise<ProposalRating | null> {
  const result = await query<RatingRow>(
    'SELECT * FROM proposal_ratings WHERE proposal_id = $1 AND member_id = $2',
    [proposalId, memberId]
  );

  return result.rows[0] ? toRating(result.rows[0]) : null;
}

/**
 * Get all ratings for a proposal
 */
export async function getProposalRatings(proposalId: string): Promise<ProposalRating[]> {
  const result = await query<RatingRow>(
    'SELECT * FROM proposal_ratings WHERE proposal_id = $1 ORDER BY rated_at DESC',
    [proposalId]
  );

  return result.rows.map(toRating);
}

/**
 * Get rating aggregate for a proposal
 */
export async function getRatingAggregate(proposalId: string): Promise<ProposalRatingAggregate> {
  const result = await query<{
    total_ratings: string;
    avg_clarity: string;
    avg_importance: string;
    avg_urgency: string;
    innovative_count: string;
    avg_constructiveness: string;
    clarity_1: string;
    clarity_2: string;
    clarity_3: string;
    constructiveness_1: string;
    constructiveness_2: string;
    constructiveness_3: string;
  }>(
    `SELECT
       COUNT(*) as total_ratings,
       AVG(clarity) as avg_clarity,
       AVG(importance) as avg_importance,
       AVG(urgency) as avg_urgency,
       SUM(CASE WHEN is_innovative THEN 1 ELSE 0 END) as innovative_count,
       AVG(constructiveness) as avg_constructiveness,
       SUM(CASE WHEN clarity = 1 THEN 1 ELSE 0 END) as clarity_1,
       SUM(CASE WHEN clarity = 2 THEN 1 ELSE 0 END) as clarity_2,
       SUM(CASE WHEN clarity = 3 THEN 1 ELSE 0 END) as clarity_3,
       SUM(CASE WHEN constructiveness = 1 THEN 1 ELSE 0 END) as constructiveness_1,
       SUM(CASE WHEN constructiveness = 2 THEN 1 ELSE 0 END) as constructiveness_2,
       SUM(CASE WHEN constructiveness = 3 THEN 1 ELSE 0 END) as constructiveness_3
     FROM proposal_ratings
     WHERE proposal_id = $1`,
    [proposalId]
  );

  const row = result.rows[0];
  const totalRatings = parseInt(row.total_ratings, 10);

  if (totalRatings === 0) {
    return {
      proposalId,
      totalRatings: 0,
      avgClarity: 0,
      clarityDistribution: { brown: 0, yellow: 0, green: 0 },
      avgImportance: 0,
      avgUrgency: 0,
      innovativeCount: 0,
      innovativePercentage: 0,
      avgConstructiveness: 0,
      constructivenessDistribution: { red: 0, yellow: 0, green: 0 },
      hasRedFlags: false,
      redFlagCount: 0,
    };
  }

  const innovativeCount = parseInt(row.innovative_count, 10);
  const redFlagCount = parseInt(row.constructiveness_1, 10);

  return {
    proposalId,
    totalRatings,
    avgClarity: parseFloat(row.avg_clarity),
    clarityDistribution: {
      brown: parseInt(row.clarity_1, 10),
      yellow: parseInt(row.clarity_2, 10),
      green: parseInt(row.clarity_3, 10),
    },
    avgImportance: parseFloat(row.avg_importance),
    avgUrgency: parseFloat(row.avg_urgency),
    innovativeCount,
    innovativePercentage: innovativeCount / totalRatings,
    avgConstructiveness: parseFloat(row.avg_constructiveness),
    constructivenessDistribution: {
      red: parseInt(row.constructiveness_1, 10),
      yellow: parseInt(row.constructiveness_2, 10),
      green: parseInt(row.constructiveness_3, 10),
    },
    hasRedFlags: redFlagCount > 0,
    redFlagCount,
  };
}
