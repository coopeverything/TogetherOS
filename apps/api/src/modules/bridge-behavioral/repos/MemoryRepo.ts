/**
 * MemoryRepo
 * Repository interface for Bridge's 7-type memory system
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

export interface MemoryRepo {
  // ===========================
  // Complete Memory Retrieval
  // ===========================

  /**
   * Get complete memory system for a user
   */
  getMemory(userId: string, sessionId: string): Promise<MemberMemory>;

  // ===========================
  // Episodic Memory
  // ===========================

  /**
   * Record an episodic event
   */
  recordEvent(event: {
    userId: string;
    sessionId: string;
    event: EpisodicMemory['event'];
    memberState: string;
    location?: string;
    payload: Record<string, any>;
  }): Promise<EpisodicMemory>;

  /**
   * Get recent episodic events for a user
   */
  getRecentEvents(
    userId: string,
    options?: {
      days?: number; // Default: 30
      limit?: number; // Default: 100
      eventType?: EpisodicMemory['event'];
    }
  ): Promise<EpisodicMemory[]>;

  // ===========================
  // Semantic Memory
  // ===========================

  /**
   * Update or create semantic memory
   */
  updateSemanticMemory(input: {
    userId: string;
    knowledgeType: SemanticMemory['knowledgeType'];
    key: string;
    value: any;
    confidence: number;
    derivedFrom: string[]; // Array of episodic_memory IDs
  }): Promise<SemanticMemory>;

  /**
   * Get semantic memory by key
   */
  getSemanticMemory(
    userId: string,
    knowledgeType: SemanticMemory['knowledgeType'],
    key: string
  ): Promise<SemanticMemory | null>;

  /**
   * Get all semantic memories for a user
   */
  getAllSemanticMemories(userId: string): Promise<SemanticMemory[]>;

  // ===========================
  // Preferences
  // ===========================

  /**
   * Get or create user preferences (with defaults)
   */
  getPreferences(userId: string): Promise<BridgePreferences>;

  /**
   * Update user preferences
   */
  updatePreferences(
    userId: string,
    updates: Partial<BridgePreferences>
  ): Promise<BridgePreferences>;

  // ===========================
  // Commitments
  // ===========================

  /**
   * Create a new commitment
   */
  createCommitment(input: {
    userId: string;
    type: MemberCommitment['type'];
    targetId: string;
    targetTitle: string;
    dueAt?: Date;
  }): Promise<MemberCommitment>;

  /**
   * Get active commitments for a user
   */
  getActiveCommitments(userId: string): Promise<MemberCommitment[]>;

  /**
   * Mark commitment as completed
   */
  completeCommitment(commitmentId: string): Promise<MemberCommitment>;

  /**
   * Mark commitment as abandoned
   */
  abandonCommitment(commitmentId: string): Promise<MemberCommitment>;

  /**
   * Record reminder sent
   */
  recordReminderSent(commitmentId: string): Promise<MemberCommitment>;

  /**
   * Get overdue commitments (for reminder system)
   */
  getOverdueCommitments(): Promise<MemberCommitment[]>;

  // ===========================
  // Consent Flags
  // ===========================

  /**
   * Get or create consent flags (with defaults)
   */
  getConsentFlags(userId: string): Promise<ConsentFlags>;

  /**
   * Update consent flags
   */
  updateConsentFlags(
    userId: string,
    updates: Partial<ConsentFlags>
  ): Promise<ConsentFlags>;

  // ===========================
  // Risk Profile
  // ===========================

  /**
   * Get or create risk profile for current session
   */
  getRiskProfile(sessionId: string, userId: string): Promise<RiskProfile>;

  /**
   * Consume risk budget (record intervention)
   */
  consumeRiskBudget(input: {
    sessionId: string;
    interventionLevel: string;
    riskCost: number;
    trigger: string;
  }): Promise<RiskProfile>;

  // ===========================
  // Context Affinity
  // ===========================

  /**
   * Get or create context affinity
   */
  getContextAffinity(userId: string): Promise<ContextAffinity>;

  /**
   * Update cooperation path affinity
   */
  updatePathAffinity(
    userId: string,
    path: string,
    interactionDelta: number
  ): Promise<ContextAffinity>;

  /**
   * Update module affinity
   */
  updateModuleAffinity(
    userId: string,
    module: string,
    visitDelta: number
  ): Promise<ContextAffinity>;

  /**
   * Update group affinity
   */
  updateGroupAffinity(
    userId: string,
    groupId: string,
    groupName: string,
    participationDelta: number
  ): Promise<ContextAffinity>;
}
