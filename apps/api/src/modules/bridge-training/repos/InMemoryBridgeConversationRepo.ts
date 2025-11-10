// apps/api/src/modules/bridge-training/repos/InMemoryBridgeConversationRepo.ts
// In-memory implementation of BridgeConversationRepo

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
import { BridgeConversationRepo } from './BridgeConversationRepo'

export class InMemoryBridgeConversationRepo implements BridgeConversationRepo {
  private conversations: Map<string, BridgeConversation> = new Map()
  private messages: Map<string, BridgeMessage> = new Map()
  private ratings: Map<string, BridgeMessageRating> = new Map()

  async createConversation(
    input: CreateConversationInput,
    userId: string
  ): Promise<ConversationWithMessages> {
    const now = new Date()
    const conversationId = this.generateId('conv')

    // Create conversation
    const conversation: BridgeConversation = {
      id: conversationId,
      title: input.title,
      category: input.category,
      status: 'in_progress',
      totalMessages: 1, // Initial user message
      ratedMessages: 0,
      trainingStatus: 'pending',
      usedInTraining: false,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    }

    // Create initial user message
    const message: BridgeMessage = {
      id: this.generateId('msg'),
      conversationId,
      role: 'user',
      content: input.initialQuestion,
      sequenceNumber: 0,
      createdAt: now,
    }

    this.conversations.set(conversationId, conversation)
    this.messages.set(message.id, message)

    return {
      conversation,
      messages: [message],
      ratings: [],
    }
  }

  async addMessage(input: AddMessageInput, userId: string): Promise<BridgeMessage> {
    const conversation = this.conversations.get(input.conversationId)
    if (!conversation) {
      throw new Error(`Conversation ${input.conversationId} not found`)
    }

    // Get current message count for sequence number
    const conversationMessages = Array.from(this.messages.values()).filter(
      (m) => m.conversationId === input.conversationId && !m.deletedAt
    )

    const message: BridgeMessage = {
      id: this.generateId('msg'),
      conversationId: input.conversationId,
      role: input.role,
      content: input.content,
      bridgeModel: input.bridgeModel,
      bridgeTemperature: input.bridgeTemperature,
      bridgeSources: input.bridgeSources,
      bridgeResponseTimeMs: input.bridgeResponseTimeMs,
      sequenceNumber: conversationMessages.length,
      createdAt: new Date(),
    }

    this.messages.set(message.id, message)

    // Update conversation stats
    conversation.totalMessages += 1
    conversation.updatedAt = new Date()

    return message
  }

  async rateMessage(input: RateMessageInput, userId: string): Promise<BridgeMessageRating> {
    const message = this.messages.get(input.messageId)
    if (!message) {
      throw new Error(`Message ${input.messageId} not found`)
    }

    if (message.role !== 'assistant') {
      throw new Error('Can only rate assistant messages')
    }

    const now = new Date()

    // Check if rating already exists for this message
    const existingRating = Array.from(this.ratings.values()).find(
      (r) => r.messageId === input.messageId
    )

    if (existingRating) {
      // Update existing rating
      existingRating.qualityScore = input.qualityScore
      existingRating.idealResponse = input.idealResponse
      existingRating.idealSources = input.idealSources
      existingRating.ratingNotes = input.ratingNotes
      existingRating.updatedAt = now

      // Update conversation stats
      const conversation = this.conversations.get(message.conversationId)
      if (conversation) {
        this.updateConversationQualityScore(conversation)
      }

      return existingRating
    }

    // Create new rating
    const rating: BridgeMessageRating = {
      id: this.generateId('rating'),
      messageId: input.messageId,
      conversationId: message.conversationId,
      qualityScore: input.qualityScore,
      idealResponse: input.idealResponse,
      idealSources: input.idealSources,
      ratingNotes: input.ratingNotes,
      ratedBy: userId,
      ratedAt: now,
      updatedAt: now,
    }

    this.ratings.set(rating.id, rating)

    // Update conversation stats
    const conversation = this.conversations.get(message.conversationId)
    if (conversation) {
      conversation.ratedMessages += 1
      this.updateConversationQualityScore(conversation)
    }

    return rating
  }

  async completeConversation(
    input: CompleteConversationInput,
    userId: string
  ): Promise<BridgeConversation | null> {
    const conversation = this.conversations.get(input.conversationId)
    if (!conversation) return null

    conversation.status = 'completed'
    conversation.completedAt = new Date()
    conversation.updatedAt = new Date()
    conversation.trainingStatus = 'reviewed'

    return conversation
  }

  async findById(id: string): Promise<ConversationWithMessages | null> {
    const conversation = this.conversations.get(id)
    if (!conversation || conversation.deletedAt) return null

    const messages = Array.from(this.messages.values())
      .filter((m) => m.conversationId === id && !m.deletedAt)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)

    const ratings = Array.from(this.ratings.values()).filter(
      (r) => r.conversationId === id
    )

    return {
      conversation,
      messages,
      ratings,
    }
  }

  async list(filters: ConversationFilters = {}): Promise<PaginatedConversations> {
    let items = Array.from(this.conversations.values()).filter((c) => !c.deletedAt)

    // Apply filters
    if (filters.status) {
      items = items.filter((c) => c.status === filters.status)
    }
    if (filters.trainingStatus) {
      items = items.filter((c) => c.trainingStatus === filters.trainingStatus)
    }
    if (filters.category) {
      items = items.filter((c) => c.category === filters.category)
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      items = items.filter((c) => {
        const conversationMessages = Array.from(this.messages.values()).filter(
          (m) => m.conversationId === c.id
        )
        return (
          c.title?.toLowerCase().includes(query) ||
          conversationMessages.some((m) => m.content.toLowerCase().includes(query))
        )
      })
    }
    if (filters.minQualityScore !== undefined) {
      items = items.filter(
        (c) => (c.averageQualityScore ?? 0) >= filters.minQualityScore!
      )
    }

    // Sort
    const sortBy = filters.sortBy || 'createdAt'
    const sortOrder = filters.sortOrder || 'desc'
    items.sort((a, b) => {
      let aVal: any
      let bVal: any

      switch (sortBy) {
        case 'averageQualityScore':
          aVal = a.averageQualityScore ?? 0
          bVal = b.averageQualityScore ?? 0
          break
        case 'totalMessages':
          aVal = a.totalMessages
          bVal = b.totalMessages
          break
        default: // createdAt
          aVal = a.createdAt.getTime()
          bVal = b.createdAt.getTime()
      }

      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      return sortOrder === 'desc' ? -comparison : comparison
    })

    // Paginate
    const page = filters.page || 1
    const pageSize = filters.pageSize || 20
    const total = items.length
    const totalPages = Math.ceil(total / pageSize)
    const offset = (page - 1) * pageSize
    const paginatedItems = items.slice(offset, offset + pageSize)

    return {
      items: paginatedItems,
      total,
      page,
      pageSize,
      totalPages,
    }
  }

  async delete(conversationId: string, userId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId)
    if (conversation) {
      conversation.deletedAt = new Date()
      conversation.deletedBy = userId
      conversation.updatedAt = new Date()

      // Soft delete all messages in conversation
      Array.from(this.messages.values())
        .filter((m) => m.conversationId === conversationId)
        .forEach((m) => {
          m.deletedAt = new Date()
        })
    }
  }

  /**
   * Helper: Update conversation's average quality score
   */
  private updateConversationQualityScore(conversation: BridgeConversation): void {
    const conversationRatings = Array.from(this.ratings.values()).filter(
      (r) => r.conversationId === conversation.id
    )

    if (conversationRatings.length > 0) {
      const sum = conversationRatings.reduce((acc, r) => acc + r.qualityScore, 0)
      conversation.averageQualityScore = Math.round((sum * 100) / (conversationRatings.length * 5))
    }

    conversation.updatedAt = new Date()
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
