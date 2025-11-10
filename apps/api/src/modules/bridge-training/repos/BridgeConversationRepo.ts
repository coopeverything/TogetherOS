// apps/api/src/modules/bridge-training/repos/BridgeConversationRepo.ts
// Repository interface for Bridge Conversation Training

import type {
  BridgeConversation,
  BridgeMessage,
  BridgeMessageRating,
  CreateConversationInput,
  AddMessageInput,
  RateMessageInput,
  CompleteConversationInput,
  ConversationFilters,
  PaginatedConversations,
  ConversationWithMessages,
} from '@togetheros/types'

/**
 * Bridge Conversation repository interface
 * Handles multi-turn training conversations
 */
export interface BridgeConversationRepo {
  /**
   * Create a new conversation with initial user message
   */
  createConversation(input: CreateConversationInput, userId: string): Promise<ConversationWithMessages>

  /**
   * Add a message to an existing conversation
   */
  addMessage(input: AddMessageInput, userId: string): Promise<BridgeMessage>

  /**
   * Rate a Bridge message (assistant role only)
   */
  rateMessage(input: RateMessageInput, userId: string): Promise<BridgeMessageRating>

  /**
   * Mark conversation as completed
   */
  completeConversation(input: CompleteConversationInput, userId: string): Promise<BridgeConversation | null>

  /**
   * Find conversation by ID with all messages and ratings
   */
  findById(id: string): Promise<ConversationWithMessages | null>

  /**
   * List conversations with filters and pagination
   */
  list(filters?: ConversationFilters): Promise<PaginatedConversations>

  /**
   * Delete a conversation (soft delete)
   */
  delete(conversationId: string, userId: string): Promise<void>
}
