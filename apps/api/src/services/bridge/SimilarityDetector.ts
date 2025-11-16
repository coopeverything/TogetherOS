/**
 * Similarity Detector Service
 * Detects similar proposals using OpenAI embeddings and pgvector
 */

import { query } from '@togetheros/db';

export interface SimilarProposal {
  id: string;
  title: string;
  summary: string;
  scopeType: 'individual' | 'group';
  scopeId: string;
  authorId: string;
  status: string;
  similarity: number; // 0-1 (cosine similarity)
  createdAt: Date;
}

export interface SimilarityCheckResult {
  similarProposals: SimilarProposal[];
  requiresClarification: boolean; // true if similarity > 0.85
  highestSimilarity: number;
}

/**
 * Generate embedding for text using OpenAI API
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error}`);
  }

  const data = await response.json() as {
    data: Array<{ embedding: number[] }>;
  };
  return data.data[0].embedding;
}

/**
 * Check for similar proposals
 */
export async function checkSimilarity(input: {
  title: string;
  summary: string;
  scopeType: 'individual' | 'group';
  scopeId: string;
  excludeProposalId?: string; // Exclude this proposal (for updates)
}): Promise<SimilarityCheckResult> {
  const { title, summary, scopeType, scopeId, excludeProposalId } = input;

  // Combine title and summary for embedding
  const combinedText = `${title}\n\n${summary}`;

  // Generate embedding
  const embedding = await generateEmbedding(combinedText);

  // Convert embedding to PostgreSQL vector format
  const embeddingStr = `[${embedding.join(',')}]`;

  // Query for similar proposals using cosine similarity
  // cosine distance: 0 = identical, 2 = opposite
  // We convert to similarity: 1 - (distance / 2) = 0 to 1 range
  const sql = `
    SELECT
      id,
      title,
      summary,
      scope_type as "scopeType",
      scope_id as "scopeId",
      author_id as "authorId",
      status,
      1 - (embedding <=> $1::vector) / 2 as similarity,
      created_at as "createdAt"
    FROM proposals
    WHERE
      deleted_at IS NULL
      AND embedding IS NOT NULL
      AND scope_type = $2
      AND scope_id = $3
      ${excludeProposalId ? 'AND id != $4' : ''}
      AND 1 - (embedding <=> $1::vector) / 2 > 0.7
    ORDER BY embedding <=> $1::vector
    LIMIT 10
  `;

  const params = excludeProposalId
    ? [embeddingStr, scopeType, scopeId, excludeProposalId]
    : [embeddingStr, scopeType, scopeId];

  const result = await query<SimilarProposal>(sql, params);

  const similarProposals = result.rows;
  const highestSimilarity = similarProposals.length > 0
    ? similarProposals[0].similarity
    : 0;

  // Require clarification if any proposal has >85% similarity
  const requiresClarification = highestSimilarity > 0.85;

  return {
    similarProposals,
    requiresClarification,
    highestSimilarity,
  };
}

/**
 * Generate and store embedding for a proposal
 */
export async function generateProposalEmbedding(
  proposalId: string,
  title: string,
  summary: string
): Promise<void> {
  const combinedText = `${title}\n\n${summary}`;
  const embedding = await generateEmbedding(combinedText);
  const embeddingStr = `[${embedding.join(',')}]`;

  await query(
    `
    UPDATE proposals
    SET
      embedding = $2::vector,
      bridge_similarity_check_done = TRUE,
      updated_at = NOW()
    WHERE id = $1
    `,
    [proposalId, embeddingStr]
  );
}

/**
 * Update stored similar proposals in database
 */
export async function storeSimilarProposals(
  proposalId: string,
  similarProposals: SimilarProposal[]
): Promise<void> {
  // Store top 5 similar proposals
  const topSimilar = similarProposals.slice(0, 5).map((p) => ({
    id: p.id,
    title: p.title,
    similarity: Math.round(p.similarity * 100) / 100,
  }));

  await query(
    `
    UPDATE proposals
    SET
      bridge_similar_proposals = $2::jsonb,
      updated_at = NOW()
    WHERE id = $1
    `,
    [proposalId, JSON.stringify(topSimilar)]
  );
}

/**
 * Batch regenerate embeddings for existing proposals
 * (Used for migration or when embedding model changes)
 */
export async function regenerateAllEmbeddings(
  options?: {
    limit?: number;
    onlyMissing?: boolean;
  }
): Promise<{ processed: number; errors: number }> {
  const limit = options?.limit || 100;
  const onlyMissing = options?.onlyMissing !== false;

  const sql = `
    SELECT id, title, summary
    FROM proposals
    WHERE deleted_at IS NULL
      ${onlyMissing ? 'AND embedding IS NULL' : ''}
    ORDER BY created_at DESC
    LIMIT $1
  `;

  const result = await query<{ id: string; title: string; summary: string }>(
    sql,
    [limit]
  );

  let processed = 0;
  let errors = 0;

  for (const proposal of result.rows) {
    try {
      await generateProposalEmbedding(proposal.id, proposal.title, proposal.summary);
      processed++;
    } catch (error) {
      console.error(`Failed to generate embedding for proposal ${proposal.id}:`, error);
      errors++;
    }
  }

  return { processed, errors };
}
