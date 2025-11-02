// apps/api/src/modules/feed/handlers/topics.ts
// API handler for feed topics

import { TopicIntelligence } from '../../../services/bridge/TopicIntelligence'

/**
 * GET /api/feed/topics
 * Returns list of available topics for post categorization
 */
export async function getTopics(): Promise<string[]> {
  return TopicIntelligence.getAvailableTopics()
}

/**
 * POST /api/feed/topics/suggest
 * Suggests topics based on post content
 * Body: { content: string, title?: string }
 */
export async function suggestTopics(body: {
  content: string
  title?: string
}): Promise<Array<{ topic: string; confidence: number; reason: string }>> {
  const { content, title } = body
  return TopicIntelligence.suggestTopics(content, title)
}
