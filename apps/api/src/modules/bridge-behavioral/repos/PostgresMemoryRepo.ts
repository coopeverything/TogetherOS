/**
 * PostgreSQL Memory Repository
 * Production implementation for Bridge's 7-type memory system
 */

import type {
  EpisodicMemory,
  SemanticMemory,
  BridgePreferences,
  MemberCommitment,
  ConsentFlags,
  RiskProfile,
  ContextAffinity,
  MemberMemory,
} from '@togetheros/types';
import type { MemoryRepo } from './MemoryRepo';
import { query } from '@/lib/db';

export class PostgresMemoryRepo implements MemoryRepo {
  // ===========================
  // Complete Memory Retrieval
  // ===========================

  async getMemory(userId: string, sessionId: string): Promise<MemberMemory> {
    const [
      episodic,
      semantic,
      preferences,
      commitments,
      consentFlags,
      riskProfile,
      contextAffinity,
    ] = await Promise.all([
      this.getRecentEvents(userId, { days: 30 }),
      this.getAllSemanticMemories(userId),
      this.getPreferences(userId),
      this.getActiveCommitments(userId),
      this.getConsentFlags(userId),
      this.getRiskProfile(sessionId, userId),
      this.getContextAffinity(userId),
    ]);

    return {
      userId,
      episodic,
      semantic,
      preferences,
      commitments,
      consentFlags,
      riskProfile,
      contextAffinity,
      fetchedAt: new Date(),
    };
  }

  // ===========================
  // Episodic Memory
  // ===========================

  async recordEvent(event: {
    userId: string;
    sessionId: string;
    event: EpisodicMemory['event'];
    memberState: string;
    location?: string;
    payload: Record<string, any>;
  }): Promise<EpisodicMemory> {
    const sql = `
      INSERT INTO episodic_memory (
        user_id, session_id, event, member_state, location, payload
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id, user_id as "userId", event,
        session_id as "sessionId", member_state as "memberState",
        location, payload, created_at as "createdAt"
    `;

    const result = await query(sql, [
      event.userId,
      event.sessionId,
      event.event,
      event.memberState,
      event.location || null,
      JSON.stringify(event.payload),
    ]);

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.userId,
      event: row.event,
      context: {
        sessionId: row.sessionId,
        timestamp: row.createdAt,
        memberState: row.memberState,
        location: row.location,
      },
      payload: row.payload,
      createdAt: row.createdAt,
    };
  }

  async getRecentEvents(
    userId: string,
    options?: {
      days?: number;
      limit?: number;
      eventType?: EpisodicMemory['event'];
    }
  ): Promise<EpisodicMemory[]> {
    const days = options?.days || 30;
    const limit = options?.limit || 100;

    let sql = `
      SELECT
        id, user_id as "userId", event,
        session_id as "sessionId", member_state as "memberState",
        location, payload, created_at as "createdAt"
      FROM episodic_memory
      WHERE user_id = $1
        AND created_at > NOW() - INTERVAL '${days} days'
    `;

    const params: any[] = [userId];

    if (options?.eventType) {
      sql += ` AND event = $${params.length + 1}`;
      params.push(options.eventType);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(sql, params);

    return result.rows.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      event: row.event,
      context: {
        sessionId: row.sessionId,
        timestamp: row.createdAt,
        memberState: row.memberState,
        location: row.location,
      },
      payload: row.payload,
      createdAt: row.createdAt,
    }));
  }

  // ===========================
  // Semantic Memory
  // ===========================

  async updateSemanticMemory(input: {
    userId: string;
    knowledgeType: SemanticMemory['knowledgeType'];
    key: string;
    value: any;
    confidence: number;
    derivedFrom: string[];
  }): Promise<SemanticMemory> {
    const sql = `
      INSERT INTO semantic_memory (
        user_id, knowledge_type, key, value, confidence, derived_from
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, knowledge_type, key) DO UPDATE SET
        value = EXCLUDED.value,
        confidence = EXCLUDED.confidence,
        derived_from = EXCLUDED.derived_from,
        updated_at = NOW()
      RETURNING
        id, user_id as "userId", knowledge_type as "knowledgeType",
        key, value, confidence, derived_from as "derivedFrom",
        updated_at as "updatedAt"
    `;

    const result = await query(sql, [
      input.userId,
      input.knowledgeType,
      input.key,
      JSON.stringify(input.value),
      input.confidence,
      input.derivedFrom,
    ]);

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.userId,
      knowledgeType: row.knowledgeType,
      key: row.key,
      value: row.value,
      confidence: row.confidence,
      derivedFrom: row.derivedFrom,
      updatedAt: row.updatedAt,
    };
  }

  async getSemanticMemory(
    userId: string,
    knowledgeType: SemanticMemory['knowledgeType'],
    key: string
  ): Promise<SemanticMemory | null> {
    const sql = `
      SELECT
        id, user_id as "userId", knowledge_type as "knowledgeType",
        key, value, confidence, derived_from as "derivedFrom",
        updated_at as "updatedAt"
      FROM semantic_memory
      WHERE user_id = $1 AND knowledge_type = $2 AND key = $3
    `;

    const result = await query(sql, [userId, knowledgeType, key]);
    return result.rows[0] || null;
  }

  async getAllSemanticMemories(userId: string): Promise<SemanticMemory[]> {
    const sql = `
      SELECT
        id, user_id as "userId", knowledge_type as "knowledgeType",
        key, value, confidence, derived_from as "derivedFrom",
        updated_at as "updatedAt"
      FROM semantic_memory
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `;

    const result = await query(sql, [userId]);
    return result.rows;
  }

  // ===========================
  // Preferences
  // ===========================

  async getPreferences(userId: string): Promise<BridgePreferences> {
    const sql = `
      INSERT INTO bridge_preferences (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *;

      SELECT
        user_id as "userId",
        intervention_level as "interventionLevel",
        tone_preference as "tonePreference",
        wants_questionnaires as "wantsQuestionnaires",
        wants_microlessons as "wantsMicrolessons",
        wants_challenges as "wantsChallenges",
        wants_ethics_nudges as "wantsEthicsNudges",
        allows_proactive_recommendations as "allowsProactiveRecommendations",
        allows_reminders as "allowsReminders",
        allows_contextual_recommendations as "allowsContextualRecommendations",
        allows_behavioral_tracking as "allowsBehavioralTracking",
        updated_at as "updatedAt"
      FROM bridge_preferences
      WHERE user_id = $1
    `;

    const result = await query(sql, [userId]);
    return result.rows[result.rows.length - 1]; // Last row is the SELECT result
  }

  async updatePreferences(
    userId: string,
    updates: Partial<BridgePreferences>
  ): Promise<BridgePreferences> {
    const fields: string[] = [];
    const values: any[] = [userId];
    let paramIndex = 2;

    const fieldMap: Record<string, string> = {
      interventionLevel: 'intervention_level',
      tonePreference: 'tone_preference',
      wantsQuestionnaires: 'wants_questionnaires',
      wantsMicrolessons: 'wants_microlessons',
      wantsChallenges: 'wants_challenges',
      wantsEthicsNudges: 'wants_ethics_nudges',
      allowsProactiveRecommendations: 'allows_proactive_recommendations',
      allowsReminders: 'allows_reminders',
      allowsContextualRecommendations: 'allows_contextual_recommendations',
      allowsBehavioralTracking: 'allows_behavioral_tracking',
    };

    for (const [camelKey, snakeKey] of Object.entries(fieldMap)) {
      if (camelKey in updates) {
        fields.push(`${snakeKey} = $${paramIndex++}`);
        values.push((updates as any)[camelKey]);
      }
    }

    if (fields.length === 0) {
      return this.getPreferences(userId);
    }

    const sql = `
      UPDATE bridge_preferences
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE user_id = $1
      RETURNING
        user_id as "userId",
        intervention_level as "interventionLevel",
        tone_preference as "tonePreference",
        wants_questionnaires as "wantsQuestionnaires",
        wants_microlessons as "wantsMicrolessons",
        wants_challenges as "wantsChallenges",
        wants_ethics_nudges as "wantsEthicsNudges",
        allows_proactive_recommendations as "allowsProactiveRecommendations",
        allows_reminders as "allowsReminders",
        allows_contextual_recommendations as "allowsContextualRecommendations",
        allows_behavioral_tracking as "allowsBehavioralTracking",
        updated_at as "updatedAt"
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // ===========================
  // Commitments
  // ===========================

  async createCommitment(input: {
    userId: string;
    type: MemberCommitment['type'];
    targetId: string;
    targetTitle: string;
    dueAt?: Date;
  }): Promise<MemberCommitment> {
    const sql = `
      INSERT INTO member_commitments (
        user_id, type, target_id, target_title, due_at
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id, user_id as "userId", type, target_id as "targetId",
        target_title as "targetTitle", promised_at as "promisedAt",
        due_at as "dueAt", completed_at as "completedAt",
        abandoned_at as "abandonedAt", reminder_sent_at as "reminderSentAt",
        reminder_count as "reminderCount"
    `;

    const result = await query(sql, [
      input.userId,
      input.type,
      input.targetId,
      input.targetTitle,
      input.dueAt || null,
    ]);

    return result.rows[0];
  }

  async getActiveCommitments(userId: string): Promise<MemberCommitment[]> {
    const sql = `
      SELECT
        id, user_id as "userId", type, target_id as "targetId",
        target_title as "targetTitle", promised_at as "promisedAt",
        due_at as "dueAt", completed_at as "completedAt",
        abandoned_at as "abandonedAt", reminder_sent_at as "reminderSentAt",
        reminder_count as "reminderCount"
      FROM member_commitments
      WHERE user_id = $1
        AND completed_at IS NULL
        AND abandoned_at IS NULL
      ORDER BY due_at ASC NULLS LAST
    `;

    const result = await query(sql, [userId]);
    return result.rows;
  }

  async completeCommitment(commitmentId: string): Promise<MemberCommitment> {
    const sql = `
      UPDATE member_commitments
      SET completed_at = NOW()
      WHERE id = $1
      RETURNING
        id, user_id as "userId", type, target_id as "targetId",
        target_title as "targetTitle", promised_at as "promisedAt",
        due_at as "dueAt", completed_at as "completedAt",
        abandoned_at as "abandonedAt", reminder_sent_at as "reminderSentAt",
        reminder_count as "reminderCount"
    `;

    const result = await query(sql, [commitmentId]);
    return result.rows[0];
  }

  async abandonCommitment(commitmentId: string): Promise<MemberCommitment> {
    const sql = `
      UPDATE member_commitments
      SET abandoned_at = NOW()
      WHERE id = $1
      RETURNING
        id, user_id as "userId", type, target_id as "targetId",
        target_title as "targetTitle", promised_at as "promisedAt",
        due_at as "dueAt", completed_at as "completedAt",
        abandoned_at as "abandonedAt", reminder_sent_at as "reminderSentAt",
        reminder_count as "reminderCount"
    `;

    const result = await query(sql, [commitmentId]);
    return result.rows[0];
  }

  async recordReminderSent(commitmentId: string): Promise<MemberCommitment> {
    const sql = `
      UPDATE member_commitments
      SET reminder_sent_at = NOW(), reminder_count = reminder_count + 1
      WHERE id = $1
      RETURNING
        id, user_id as "userId", type, target_id as "targetId",
        target_title as "targetTitle", promised_at as "promisedAt",
        due_at as "dueAt", completed_at as "completedAt",
        abandoned_at as "abandonedAt", reminder_sent_at as "reminderSentAt",
        reminder_count as "reminderCount"
    `;

    const result = await query(sql, [commitmentId]);
    return result.rows[0];
  }

  async getOverdueCommitments(): Promise<MemberCommitment[]> {
    const sql = `
      SELECT
        id, user_id as "userId", type, target_id as "targetId",
        target_title as "targetTitle", promised_at as "promisedAt",
        due_at as "dueAt", completed_at as "completedAt",
        abandoned_at as "abandonedAt", reminder_sent_at as "reminderSentAt",
        reminder_count as "reminderCount"
      FROM member_commitments
      WHERE due_at < NOW()
        AND completed_at IS NULL
        AND abandoned_at IS NULL
        AND reminder_count < 2
      ORDER BY due_at ASC
    `;

    const result = await query(sql);
    return result.rows;
  }

  // ===========================
  // Consent Flags
  // ===========================

  async getConsentFlags(userId: string): Promise<ConsentFlags> {
    const sql = `
      INSERT INTO consent_flags (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *;

      SELECT
        user_id as "userId",
        can_suggest_unasked as "canSuggestUnasked",
        can_send_reminders as "canSendReminders",
        can_offer_education as "canOfferEducation",
        can_use_location_context as "canUseLocationContext",
        can_use_activity_history as "canUseActivityHistory",
        can_use_social_graph as "canUseSocialGraph",
        retain_episodic_memory as "retainEpisodicMemory",
        retain_semantic_memory as "retainSemanticMemory",
        updated_at as "updatedAt"
      FROM consent_flags
      WHERE user_id = $1
    `;

    const result = await query(sql, [userId]);
    return result.rows[result.rows.length - 1];
  }

  async updateConsentFlags(
    userId: string,
    updates: Partial<ConsentFlags>
  ): Promise<ConsentFlags> {
    const fields: string[] = [];
    const values: any[] = [userId];
    let paramIndex = 2;

    const fieldMap: Record<string, string> = {
      canSuggestUnasked: 'can_suggest_unasked',
      canSendReminders: 'can_send_reminders',
      canOfferEducation: 'can_offer_education',
      canUseLocationContext: 'can_use_location_context',
      canUseActivityHistory: 'can_use_activity_history',
      canUseSocialGraph: 'can_use_social_graph',
      retainEpisodicMemory: 'retain_episodic_memory',
      retainSemanticMemory: 'retain_semantic_memory',
    };

    for (const [camelKey, snakeKey] of Object.entries(fieldMap)) {
      if (camelKey in updates) {
        fields.push(`${snakeKey} = $${paramIndex++}`);
        values.push((updates as any)[camelKey]);
      }
    }

    if (fields.length === 0) {
      return this.getConsentFlags(userId);
    }

    const sql = `
      UPDATE consent_flags
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE user_id = $1
      RETURNING
        user_id as "userId",
        can_suggest_unasked as "canSuggestUnasked",
        can_send_reminders as "canSendReminders",
        can_offer_education as "canOfferEducation",
        can_use_location_context as "canUseLocationContext",
        can_use_activity_history as "canUseActivityHistory",
        can_use_social_graph as "canUseSocialGraph",
        retain_episodic_memory as "retainEpisodicMemory",
        retain_semantic_memory as "retainSemanticMemory",
        updated_at as "updatedAt"
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // ===========================
  // Risk Profile
  // ===========================

  async getRiskProfile(sessionId: string, userId: string): Promise<RiskProfile> {
    // Try to get existing risk profile for this session
    let sql = `
      SELECT
        id, user_id as "userId", session_id as "sessionId",
        max_risk as "maxRisk", consumed_risk as "consumedRisk",
        remaining_risk as "remainingRisk", interventions,
        session_started_at as "sessionStartedAt",
        last_intervention_at as "lastInterventionAt"
      FROM risk_profiles
      WHERE session_id = $1
    `;

    let result = await query(sql, [sessionId]);

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Create new risk profile
    sql = `
      INSERT INTO risk_profiles (user_id, session_id)
      VALUES ($1, $2)
      RETURNING
        id, user_id as "userId", session_id as "sessionId",
        max_risk as "maxRisk", consumed_risk as "consumedRisk",
        remaining_risk as "remainingRisk", interventions,
        session_started_at as "sessionStartedAt",
        last_intervention_at as "lastInterventionAt"
    `;

    result = await query(sql, [userId, sessionId]);
    return result.rows[0];
  }

  async consumeRiskBudget(input: {
    sessionId: string;
    interventionLevel: string;
    riskCost: number;
    trigger: string;
  }): Promise<RiskProfile> {
    const intervention = {
      timestamp: new Date(),
      interventionLevel: input.interventionLevel,
      riskCost: input.riskCost,
      trigger: input.trigger,
    };

    const sql = `
      UPDATE risk_profiles
      SET
        consumed_risk = consumed_risk + $2,
        interventions = interventions || $3::jsonb,
        last_intervention_at = NOW()
      WHERE session_id = $1
      RETURNING
        id, user_id as "userId", session_id as "sessionId",
        max_risk as "maxRisk", consumed_risk as "consumedRisk",
        remaining_risk as "remainingRisk", interventions,
        session_started_at as "sessionStartedAt",
        last_intervention_at as "lastInterventionAt"
    `;

    const result = await query(sql, [
      input.sessionId,
      input.riskCost,
      JSON.stringify([intervention]),
    ]);

    return result.rows[0];
  }

  // ===========================
  // Context Affinity
  // ===========================

  async getContextAffinity(userId: string): Promise<ContextAffinity> {
    const sql = `
      INSERT INTO context_affinity (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *;

      SELECT
        user_id as "userId",
        cooperation_paths as "cooperationPaths",
        modules,
        groups,
        updated_at as "updatedAt"
      FROM context_affinity
      WHERE user_id = $1
    `;

    const result = await query(sql, [userId]);
    return result.rows[result.rows.length - 1];
  }

  async updatePathAffinity(
    userId: string,
    path: string,
    interactionDelta: number
  ): Promise<ContextAffinity> {
    // Get current affinity
    const affinity = await this.getContextAffinity(userId);
    const paths = affinity.cooperationPaths || [];

    // Find existing path entry
    const existingIndex = paths.findIndex((p: any) => p.path === path);

    if (existingIndex >= 0) {
      // Update existing
      paths[existingIndex].interactions += interactionDelta;
      paths[existingIndex].score = Math.min(100, paths[existingIndex].score + interactionDelta * 2);
      paths[existingIndex].lastInteractionAt = new Date();
    } else {
      // Create new
      paths.push({
        path,
        score: Math.min(100, interactionDelta * 2),
        interactions: interactionDelta,
        lastInteractionAt: new Date(),
      });
    }

    // Update database
    const sql = `
      UPDATE context_affinity
      SET cooperation_paths = $2, updated_at = NOW()
      WHERE user_id = $1
      RETURNING
        user_id as "userId",
        cooperation_paths as "cooperationPaths",
        modules,
        groups,
        updated_at as "updatedAt"
    `;

    const result = await query(sql, [userId, JSON.stringify(paths)]);
    return result.rows[0];
  }

  async updateModuleAffinity(
    userId: string,
    module: string,
    visitDelta: number
  ): Promise<ContextAffinity> {
    const affinity = await this.getContextAffinity(userId);
    const modules = affinity.modules || [];

    const existingIndex = modules.findIndex((m: any) => m.module === module);

    if (existingIndex >= 0) {
      modules[existingIndex].visits += visitDelta;
      modules[existingIndex].score = Math.min(100, modules[existingIndex].score + visitDelta * 2);
      modules[existingIndex].lastVisitAt = new Date();
    } else {
      modules.push({
        module,
        score: Math.min(100, visitDelta * 2),
        visits: visitDelta,
        lastVisitAt: new Date(),
      });
    }

    const sql = `
      UPDATE context_affinity
      SET modules = $2, updated_at = NOW()
      WHERE user_id = $1
      RETURNING
        user_id as "userId",
        cooperation_paths as "cooperationPaths",
        modules,
        groups,
        updated_at as "updatedAt"
    `;

    const result = await query(sql, [userId, JSON.stringify(modules)]);
    return result.rows[0];
  }

  async updateGroupAffinity(
    userId: string,
    groupId: string,
    groupName: string,
    participationDelta: number
  ): Promise<ContextAffinity> {
    const affinity = await this.getContextAffinity(userId);
    const groups = affinity.groups || [];

    const existingIndex = groups.findIndex((g: any) => g.groupId === groupId);

    if (existingIndex >= 0) {
      groups[existingIndex].participationCount += participationDelta;
      groups[existingIndex].score = Math.min(
        100,
        groups[existingIndex].score + participationDelta * 3
      );
      groups[existingIndex].lastParticipationAt = new Date();
    } else {
      groups.push({
        groupId,
        groupName,
        score: Math.min(100, participationDelta * 3),
        participationCount: participationDelta,
        lastParticipationAt: new Date(),
      });
    }

    const sql = `
      UPDATE context_affinity
      SET groups = $2, updated_at = NOW()
      WHERE user_id = $1
      RETURNING
        user_id as "userId",
        cooperation_paths as "cooperationPaths",
        modules,
        groups,
        updated_at as "updatedAt"
    `;

    const result = await query(sql, [userId, JSON.stringify(groups)]);
    return result.rows[0];
  }
}
