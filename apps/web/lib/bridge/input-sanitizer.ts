/**
 * Input Sanitization for Bridge API
 *
 * Prevents prompt injection and ensures safe input processing
 */

export interface SanitizationResult {
  isValid: boolean
  sanitized: string
  error?: string
}

const MAX_QUESTION_LENGTH = 500
const MAX_HISTORY_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 1000

/**
 * Sanitize user question input
 */
export function sanitizeQuestion(question: string): SanitizationResult {
  if (!question || typeof question !== 'string') {
    return {
      isValid: false,
      sanitized: '',
      error: 'Question must be a non-empty string'
    }
  }

  // Trim and normalize whitespace
  let sanitized = question.trim().replace(/\s+/g, ' ')

  // Check length
  if (sanitized.length === 0) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Question cannot be empty'
    }
  }

  if (sanitized.length > MAX_QUESTION_LENGTH) {
    return {
      isValid: false,
      sanitized: sanitized.substring(0, MAX_QUESTION_LENGTH),
      error: `Question too long (max ${MAX_QUESTION_LENGTH} characters)`
    }
  }

  // Remove potential prompt injection patterns
  // Replace control characters and invisible Unicode
  sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '')

  // Remove excessive repeated characters (potential DoS)
  sanitized = sanitized.replace(/(.)\1{10,}/g, '$1$1$1')

  return {
    isValid: true,
    sanitized,
  }
}

/**
 * Sanitize conversation history
 */
export function sanitizeConversationHistory(
  history: any[]
): SanitizationResult {
  if (!Array.isArray(history)) {
    return {
      isValid: false,
      sanitized: '[]',
      error: 'Conversation history must be an array'
    }
  }

  // Limit number of messages
  const limitedHistory = history.slice(-MAX_HISTORY_MESSAGES)

  // Sanitize each message
  const sanitizedHistory = limitedHistory.map((msg) => {
    if (!msg || typeof msg !== 'object') {
      return null
    }

    const role = msg.role
    const content = typeof msg.content === 'string' ? msg.content : ''

    // Validate role
    if (role !== 'user' && role !== 'assistant') {
      return null
    }

    // Sanitize content
    let sanitizedContent = content.trim().replace(/\s+/g, ' ')
    sanitizedContent = sanitizedContent.replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    sanitizedContent = sanitizedContent.substring(0, MAX_MESSAGE_LENGTH)

    return {
      role,
      content: sanitizedContent,
    }
  }).filter(Boolean) // Remove invalid messages

  return {
    isValid: true,
    sanitized: JSON.stringify(sanitizedHistory),
  }
}

/**
 * Complete request sanitization
 */
export function sanitizeBridgeRequest(body: any): {
  isValid: boolean
  question?: string
  conversationHistory?: any[]
  error?: string
} {
  // Sanitize question
  const questionResult = sanitizeQuestion(body.question)
  if (!questionResult.isValid) {
    return {
      isValid: false,
      error: questionResult.error,
    }
  }

  // Sanitize conversation history
  const historyResult = sanitizeConversationHistory(
    body.conversationHistory || []
  )
  if (!historyResult.isValid) {
    return {
      isValid: false,
      error: historyResult.error,
    }
  }

  return {
    isValid: true,
    question: questionResult.sanitized,
    conversationHistory: JSON.parse(historyResult.sanitized),
  }
}
