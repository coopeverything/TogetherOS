/**
 * Bridge Teaching Session database operations
 */

import { query, getClient } from './index'
import type {
  TeachingSession,
  ConversationTurn,
  ExtractedPattern,
  UserArchetype,
  PatternSummary,
  PatternUsage,
  TeachingStats,
  SessionStatus,
  SessionIntent,
  ConversationMode,
  Speaker,
  FeedbackRating,
  TrustLevel,
} from '@togetheros/types'

// ============================================================================
// ARCHETYPES
// ============================================================================

/**
 * Get all active archetypes
 */
export async function getArchetypes(): Promise<UserArchetype[]> {
  const result = await query<any>(
    `SELECT * FROM bridge_archetypes WHERE is_active = TRUE ORDER BY name`
  )
  return result.rows.map(mapRowToArchetype)
}

/**
 * Get archetype by ID
 */
export async function getArchetypeById(id: string): Promise<UserArchetype | null> {
  const result = await query<any>(
    `SELECT * FROM bridge_archetypes WHERE id = $1`,
    [id]
  )
  if (result.rows.length === 0) return null
  return mapRowToArchetype(result.rows[0])
}

function mapRowToArchetype(row: any): UserArchetype {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    mindset: row.mindset,
    sentimentMarkers: row.sentiment_markers || [],
    trustLevel: row.trust_level as TrustLevel,
    needs: row.needs || [],
    antiPatterns: row.anti_patterns || [],
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ============================================================================
// TEACHING SESSIONS
// ============================================================================

/**
 * Create a new teaching session
 * archetypeId is optional - sessions can be created for:
 * - information: Knowledge lookup from CoopEverything's knowledge base
 * - brainstorm: Exploring and developing ideas
 * - articulation: Help putting words on thoughts
 * - roleplay: Traditional archetype-based training (requires archetypeId)
 * - general: No specific intent
 */
export async function createTeachingSession(
  trainerId: string,
  topic: string,
  archetypeId?: string | null,
  intent: SessionIntent = 'general'
): Promise<TeachingSession> {
  // Auto-set intent to 'roleplay' if archetype is provided but no intent specified
  const resolvedIntent = archetypeId && intent === 'general' ? 'roleplay' : intent

  const result = await query<any>(
    `INSERT INTO bridge_teaching_sessions (trainer_id, topic, archetype_id, intent, status)
     VALUES ($1, $2, $3, $4, 'active')
     RETURNING *`,
    [trainerId, topic, archetypeId || null, resolvedIntent]
  )

  const session = result.rows[0]
  const archetype = archetypeId ? await getArchetypeById(archetypeId) : null

  return {
    id: session.id,
    trainerId: session.trainer_id,
    topic: session.topic,
    archetypeId: session.archetype_id,
    archetype: archetype,
    intent: session.intent as SessionIntent,
    status: session.status as SessionStatus,
    turns: [],
    extractedPatterns: [],
    totalDemoTurns: session.total_demo_turns,
    totalPracticeTurns: session.total_practice_turns,
    practiceSuccessRate: session.practice_success_rate,
    createdAt: session.created_at,
    updatedAt: session.updated_at,
    completedAt: session.completed_at,
  }
}

/**
 * Get teaching session by ID with all turns and patterns
 */
export async function getTeachingSessionById(id: string): Promise<TeachingSession | null> {
  const sessionResult = await query<any>(
    `SELECT s.*, u.name as trainer_name
     FROM bridge_teaching_sessions s
     LEFT JOIN users u ON s.trainer_id = u.id
     WHERE s.id = $1`,
    [id]
  )

  if (sessionResult.rows.length === 0) return null

  const session = sessionResult.rows[0]
  const archetype = session.archetype_id ? await getArchetypeById(session.archetype_id) : null
  const turns = await getSessionTurns(id)
  const patterns = await getSessionPatterns(id)

  return {
    id: session.id,
    trainerId: session.trainer_id,
    trainerName: session.trainer_name,
    topic: session.topic,
    archetypeId: session.archetype_id,
    archetype: archetype,
    intent: (session.intent || 'general') as SessionIntent,
    status: session.status as SessionStatus,
    turns,
    extractedPatterns: patterns,
    totalDemoTurns: session.total_demo_turns,
    totalPracticeTurns: session.total_practice_turns,
    practiceSuccessRate: session.practice_success_rate ? parseFloat(session.practice_success_rate) : null,
    createdAt: session.created_at,
    updatedAt: session.updated_at,
    completedAt: session.completed_at,
  }
}

/**
 * List teaching sessions with filters
 */
export async function listTeachingSessions(options?: {
  trainerId?: string
  status?: SessionStatus
  limit?: number
  offset?: number
}): Promise<{ sessions: TeachingSession[]; total: number }> {
  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (options?.trainerId) {
    conditions.push(`s.trainer_id = $${paramIndex}`)
    params.push(options.trainerId)
    paramIndex++
  }

  if (options?.status) {
    conditions.push(`s.status = $${paramIndex}`)
    params.push(options.status)
    paramIndex++
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM bridge_teaching_sessions s ${whereClause}`,
    params
  )
  const total = parseInt(countResult.rows[0].count)

  // Get sessions
  const limit = options?.limit || 20
  const offset = options?.offset || 0

  const result = await query<any>(
    `SELECT s.*, u.name as trainer_name
     FROM bridge_teaching_sessions s
     LEFT JOIN users u ON s.trainer_id = u.id
     ${whereClause}
     ORDER BY s.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  )

  const sessions: TeachingSession[] = []
  for (const row of result.rows) {
    const archetype = row.archetype_id ? await getArchetypeById(row.archetype_id) : null
    sessions.push({
      id: row.id,
      trainerId: row.trainer_id,
      trainerName: row.trainer_name,
      topic: row.topic,
      archetypeId: row.archetype_id,
      archetype: archetype,
      intent: (row.intent || 'general') as SessionIntent,
      status: row.status as SessionStatus,
      turns: [], // Don't load turns for list view
      extractedPatterns: [],
      totalDemoTurns: row.total_demo_turns,
      totalPracticeTurns: row.total_practice_turns,
      practiceSuccessRate: row.practice_success_rate ? parseFloat(row.practice_success_rate) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at,
    })
  }

  return { sessions, total }
}

/**
 * Update session status
 */
export async function updateSessionStatus(
  id: string,
  status: SessionStatus
): Promise<TeachingSession | null> {
  const completedAt = status === 'completed' ? 'NOW()' : 'NULL'

  await query(
    `UPDATE bridge_teaching_sessions
     SET status = $1, completed_at = ${status === 'completed' ? 'NOW()' : 'completed_at'}, updated_at = NOW()
     WHERE id = $2`,
    [status, id]
  )

  return getTeachingSessionById(id)
}

/**
 * Delete a teaching session and all related data
 * Cascades to: turns, patterns, and clears related training examples
 */
export async function deleteSession(id: string): Promise<boolean> {
  const client = await getClient()

  try {
    await client.query('BEGIN')

    // Delete pattern usage records for patterns in this session
    await client.query(
      `DELETE FROM bridge_pattern_usage
       WHERE pattern_id IN (
         SELECT id FROM bridge_learned_patterns WHERE session_id = $1
       )`,
      [id]
    )

    // Delete patterns associated with this session
    await client.query(
      `DELETE FROM bridge_learned_patterns WHERE session_id = $1`,
      [id]
    )

    // Delete turns associated with this session
    await client.query(
      `DELETE FROM bridge_teaching_turns WHERE session_id = $1`,
      [id]
    )

    // Delete the session itself
    const result = await client.query(
      `DELETE FROM bridge_teaching_sessions WHERE id = $1`,
      [id]
    )

    await client.query('COMMIT')

    return (result.rowCount ?? 0) > 0
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Update session details (topic, archetype, intent)
 */
export async function updateSession(
  id: string,
  updates: {
    topic?: string
    archetypeId?: string | null
    intent?: SessionIntent
    status?: SessionStatus
  }
): Promise<TeachingSession | null> {
  const setClauses: string[] = ['updated_at = NOW()']
  const params: any[] = []
  let paramIndex = 1

  if (updates.topic !== undefined) {
    setClauses.push(`topic = $${paramIndex}`)
    params.push(updates.topic)
    paramIndex++
  }

  if (updates.archetypeId !== undefined) {
    setClauses.push(`archetype_id = $${paramIndex}`)
    params.push(updates.archetypeId)
    paramIndex++
  }

  if (updates.intent !== undefined) {
    setClauses.push(`intent = $${paramIndex}`)
    params.push(updates.intent)
    paramIndex++
  }

  if (updates.status !== undefined) {
    setClauses.push(`status = $${paramIndex}`)
    params.push(updates.status)
    paramIndex++
    if (updates.status === 'completed') {
      setClauses.push(`completed_at = NOW()`)
    }
  }

  if (params.length === 0) {
    return getTeachingSessionById(id)
  }

  await query(
    `UPDATE bridge_teaching_sessions
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex}`,
    [...params, id]
  )

  return getTeachingSessionById(id)
}

// ============================================================================
// CONVERSATION TURNS
// ============================================================================

/**
 * Get turns for a session
 */
async function getSessionTurns(sessionId: string): Promise<ConversationTurn[]> {
  const result = await query<any>(
    `SELECT * FROM bridge_teaching_turns
     WHERE session_id = $1
     ORDER BY turn_order ASC`,
    [sessionId]
  )

  return result.rows.map(mapRowToTurn)
}

function mapRowToTurn(row: any): ConversationTurn {
  return {
    id: row.id,
    sessionId: row.session_id,
    mode: row.mode as ConversationMode,
    speaker: row.speaker as Speaker,
    role: row.role || '',
    message: row.message,
    feedback: row.feedback_rating ? {
      rating: row.feedback_rating as FeedbackRating,
      comment: row.feedback_comment,
      retryRequested: row.retry_requested,
    } : undefined,
    explanation: row.explanation,
    isDebate: row.is_debate,
    debateType: row.debate_type,
    debateResolved: row.debate_resolved,
    turnOrder: row.turn_order,
    createdAt: row.created_at,
  }
}

/**
 * Add a turn to a session
 */
export async function addTurn(
  sessionId: string,
  mode: ConversationMode,
  speaker: Speaker,
  message: string,
  options?: {
    role?: string
    explanation?: string
    isDebate?: boolean
    debateType?: string
  }
): Promise<ConversationTurn> {
  // Get next turn order
  const orderResult = await query<{ max: number }>(
    `SELECT COALESCE(MAX(turn_order), 0) as max FROM bridge_teaching_turns WHERE session_id = $1`,
    [sessionId]
  )
  const turnOrder = (orderResult.rows[0].max || 0) + 1

  const result = await query<any>(
    `INSERT INTO bridge_teaching_turns
     (session_id, mode, speaker, role, message, explanation, is_debate, debate_type, turn_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      sessionId,
      mode,
      speaker,
      options?.role || null,
      message,
      options?.explanation || null,
      options?.isDebate || false,
      options?.debateType || null,
      turnOrder,
    ]
  )

  return mapRowToTurn(result.rows[0])
}

/**
 * Provide feedback on a turn
 */
export async function provideFeedback(
  turnId: string,
  rating: FeedbackRating,
  comment?: string,
  retryRequested?: boolean
): Promise<ConversationTurn | null> {
  const result = await query<any>(
    `UPDATE bridge_teaching_turns
     SET feedback_rating = $1, feedback_comment = $2, retry_requested = $3
     WHERE id = $4
     RETURNING *`,
    [rating, comment || null, retryRequested || false, turnId]
  )

  if (result.rows.length === 0) return null
  return mapRowToTurn(result.rows[0])
}

/**
 * Delete a turn
 */
export async function deleteTurn(turnId: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM bridge_teaching_turns WHERE id = $1`,
    [turnId]
  )
  return (result.rowCount ?? 0) > 0
}

// ============================================================================
// LEARNED PATTERNS
// ============================================================================

/**
 * Get patterns for a session
 */
async function getSessionPatterns(sessionId: string): Promise<ExtractedPattern[]> {
  const result = await query<any>(
    `SELECT * FROM bridge_learned_patterns
     WHERE session_id = $1
     ORDER BY created_at DESC`,
    [sessionId]
  )

  return result.rows.map(mapRowToPattern)
}

function mapRowToPattern(row: any): ExtractedPattern {
  return {
    id: row.id,
    sessionId: row.session_id,
    archetype: row.archetype,
    sentimentMarkers: row.sentiment_markers || [],
    topicContext: row.topic_context || [],
    principle: row.principle,
    responseGuidelines: row.response_guidelines || {},
    examples: row.examples || [],
    confidence: parseFloat(row.confidence),
    usageCount: row.usage_count,
    lastUsedAt: row.last_used_at,
    isActive: row.is_active,
    createdAt: row.created_at,
    refinedAt: row.refined_at,
    createdBy: row.created_by,
  }
}

/**
 * Create a new pattern
 */
export async function createPattern(
  sessionId: string | null,
  archetype: string,
  principle: string,
  options?: {
    sentimentMarkers?: string[]
    topicContext?: string[]
    responseGuidelines?: any
    examples?: any[]
    confidence?: number
    createdBy?: string
  }
): Promise<ExtractedPattern> {
  const result = await query<any>(
    `INSERT INTO bridge_learned_patterns
     (session_id, archetype, principle, sentiment_markers, topic_context, response_guidelines, examples, confidence, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      sessionId,
      archetype,
      principle,
      options?.sentimentMarkers || [],
      options?.topicContext || [],
      JSON.stringify(options?.responseGuidelines || {}),
      JSON.stringify(options?.examples || []),
      options?.confidence || 0.5,
      options?.createdBy || null,
    ]
  )

  return mapRowToPattern(result.rows[0])
}

/**
 * List patterns with filters
 */
export async function listPatterns(options?: {
  archetype?: string
  isActive?: boolean
  minConfidence?: number
  limit?: number
  offset?: number
}): Promise<{ patterns: PatternSummary[]; total: number }> {
  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (options?.archetype) {
    conditions.push(`archetype = $${paramIndex}`)
    params.push(options.archetype)
    paramIndex++
  }

  if (options?.isActive !== undefined) {
    conditions.push(`is_active = $${paramIndex}`)
    params.push(options.isActive)
    paramIndex++
  }

  if (options?.minConfidence !== undefined) {
    conditions.push(`confidence >= $${paramIndex}`)
    params.push(options.minConfidence)
    paramIndex++
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // Get total
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM bridge_pattern_summary ${whereClause}`,
    params
  )
  const total = parseInt(countResult.rows[0].count)

  // Get patterns
  const limit = options?.limit || 20
  const offset = options?.offset || 0

  const result = await query<any>(
    `SELECT * FROM bridge_pattern_summary
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  )

  const patterns: PatternSummary[] = result.rows.map((row: any) => ({
    id: row.id,
    archetype: row.archetype,
    principle: row.principle,
    confidence: parseFloat(row.confidence),
    usageCount: row.usage_count,
    isActive: row.is_active,
    createdAt: row.created_at,
    refinedAt: row.refined_at,
    topic: row.topic,
    sessionId: row.session_id,
    trainerId: row.trainer_id,
    trainerName: row.trainer_name,
    trainerEmail: row.trainer_email,
    avgRating: parseFloat(row.avg_rating) || 0,
    helpfulRate: parseFloat(row.helpful_rate) || 0,
  }))

  return { patterns, total }
}

/**
 * Update pattern
 */
export async function updatePattern(
  id: string,
  updates: {
    principle?: string
    responseGuidelines?: any
    examples?: any[]
    sentimentMarkers?: string[]
    topicContext?: string[]
    confidence?: number
    isActive?: boolean
  }
): Promise<ExtractedPattern | null> {
  const setClauses: string[] = ['refined_at = NOW()']
  const params: any[] = []
  let paramIndex = 1

  if (updates.principle !== undefined) {
    setClauses.push(`principle = $${paramIndex}`)
    params.push(updates.principle)
    paramIndex++
  }

  if (updates.responseGuidelines !== undefined) {
    setClauses.push(`response_guidelines = $${paramIndex}`)
    params.push(JSON.stringify(updates.responseGuidelines))
    paramIndex++
  }

  if (updates.examples !== undefined) {
    setClauses.push(`examples = $${paramIndex}`)
    params.push(JSON.stringify(updates.examples))
    paramIndex++
  }

  if (updates.sentimentMarkers !== undefined) {
    setClauses.push(`sentiment_markers = $${paramIndex}`)
    params.push(updates.sentimentMarkers)
    paramIndex++
  }

  if (updates.topicContext !== undefined) {
    setClauses.push(`topic_context = $${paramIndex}`)
    params.push(updates.topicContext)
    paramIndex++
  }

  if (updates.confidence !== undefined) {
    setClauses.push(`confidence = $${paramIndex}`)
    params.push(updates.confidence)
    paramIndex++
  }

  if (updates.isActive !== undefined) {
    setClauses.push(`is_active = $${paramIndex}`)
    params.push(updates.isActive)
    paramIndex++
  }

  const result = await query<any>(
    `UPDATE bridge_learned_patterns
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    [...params, id]
  )

  if (result.rows.length === 0) return null
  return mapRowToPattern(result.rows[0])
}

// ============================================================================
// PATTERN USAGE
// ============================================================================

/**
 * Record pattern usage
 */
export async function recordPatternUsage(
  patternId: string,
  userMessage: string,
  bridgeResponse: string,
  matchConfidence: number,
  conversationId?: string
): Promise<PatternUsage> {
  const result = await query<any>(
    `INSERT INTO bridge_pattern_usage
     (pattern_id, conversation_id, user_message, bridge_response, match_confidence)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [patternId, conversationId || null, userMessage, bridgeResponse, matchConfidence]
  )

  const row = result.rows[0]
  return {
    id: row.id,
    patternId: row.pattern_id,
    conversationId: row.conversation_id,
    userMessage: row.user_message,
    bridgeResponse: row.bridge_response,
    matchConfidence: parseFloat(row.match_confidence),
    userRating: row.user_rating,
    wasHelpful: row.was_helpful,
    createdAt: row.created_at,
  }
}

/**
 * Rate pattern usage
 */
export async function ratePatternUsage(
  usageId: string,
  rating: number,
  wasHelpful: boolean
): Promise<void> {
  await query(
    `UPDATE bridge_pattern_usage
     SET user_rating = $1, was_helpful = $2
     WHERE id = $3`,
    [rating, wasHelpful, usageId]
  )
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get teaching statistics
 */
export async function getTeachingStats(): Promise<TeachingStats> {
  // Get session counts
  const sessionResult = await query<any>(
    `SELECT
       COUNT(*) as total,
       COUNT(*) FILTER (WHERE status = 'completed') as completed
     FROM bridge_teaching_sessions`
  )

  // Get pattern counts
  const patternResult = await query<any>(
    `SELECT
       COUNT(*) as total,
       COUNT(*) FILTER (WHERE is_active = TRUE) as active
     FROM bridge_learned_patterns`
  )

  // Get average success rate
  const successResult = await query<any>(
    `SELECT AVG(practice_success_rate) as avg
     FROM bridge_teaching_sessions
     WHERE practice_success_rate IS NOT NULL`
  )

  // Get patterns by archetype
  const archetypeResult = await query<any>(
    `SELECT archetype, COUNT(*) as count
     FROM bridge_learned_patterns
     GROUP BY archetype`
  )

  const patternsByArchetype: Record<string, number> = {}
  archetypeResult.rows.forEach((row: any) => {
    patternsByArchetype[row.archetype] = parseInt(row.count)
  })

  // Get recent sessions
  const recentResult = await query<any>(
    `SELECT s.*, u.name as trainer_name
     FROM bridge_teaching_sessions s
     LEFT JOIN users u ON s.trainer_id = u.id
     ORDER BY s.created_at DESC
     LIMIT 5`
  )

  const recentSessions: TeachingSession[] = []
  for (const row of recentResult.rows) {
    const archetype = row.archetype_id ? await getArchetypeById(row.archetype_id) : null
    recentSessions.push({
      id: row.id,
      trainerId: row.trainer_id,
      trainerName: row.trainer_name,
      topic: row.topic,
      archetypeId: row.archetype_id,
      archetype: archetype,
      intent: (row.intent || 'general') as SessionIntent,
      status: row.status as SessionStatus,
      turns: [],
      extractedPatterns: [],
      totalDemoTurns: row.total_demo_turns,
      totalPracticeTurns: row.total_practice_turns,
      practiceSuccessRate: row.practice_success_rate ? parseFloat(row.practice_success_rate) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at,
    })
  }

  return {
    totalSessions: parseInt(sessionResult.rows[0].total),
    completedSessions: parseInt(sessionResult.rows[0].completed),
    totalPatterns: parseInt(patternResult.rows[0].total),
    activePatterns: parseInt(patternResult.rows[0].active),
    avgPracticeSuccessRate: successResult.rows[0].avg ? parseFloat(successResult.rows[0].avg) : 0,
    patternsByArchetype,
    recentSessions,
  }
}

/**
 * Find matching patterns for a user message
 */
export async function findMatchingPatterns(
  userMessage: string,
  archetype?: string,
  limit: number = 3
): Promise<ExtractedPattern[]> {
  // Extract keywords from message
  const commonWords = ['what', 'how', 'can', 'could', 'should', 'would', 'do', 'does', 'is', 'are', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'my', 'i']
  const keywords = userMessage
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 5)

  const searchPattern = keywords.length > 0
    ? `(${keywords.join('|')})`
    : userMessage

  let query_text = `
    SELECT * FROM bridge_learned_patterns
    WHERE is_active = TRUE
      AND (
        principle ~* $1
        OR $1 = ANY(topic_context)
        OR EXISTS (
          SELECT 1 FROM unnest(sentiment_markers) m WHERE $2 ~* m
        )
      )
  `
  const params: any[] = [searchPattern, userMessage]

  if (archetype) {
    query_text += ` AND archetype = $3`
    params.push(archetype)
  }

  query_text += ` ORDER BY confidence DESC, usage_count DESC LIMIT $${params.length + 1}`
  params.push(limit)

  const result = await query<any>(query_text, params)
  return result.rows.map(mapRowToPattern)
}
