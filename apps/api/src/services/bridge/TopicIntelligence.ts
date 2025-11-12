// apps/api/src/services/bridge/TopicIntelligence.ts
// Bridge intelligence service for topic detection and semantic matching
// Phase 3: Uses keyword matching (MVP), will be enhanced with AI/embeddings later

import type { Post, DiscussionThread } from '@togetheros/types'
import { AVAILABLE_TOPICS } from '@togetheros/types'

/**
 * Topic suggestion result
 */
export interface TopicSuggestion {
  topic: string
  confidence: number  // 0-1
  reason: string      // Why this topic was suggested
}

/**
 * Similar post result
 */
export interface SimilarPost {
  post: Post
  similarity: number  // 0-1
  matchedKeywords: string[]
}

/**
 * Similar thread result (for duplicate detection)
 */
export interface SimilarThread {
  thread: DiscussionThread
  similarity: number  // 0-1
  matchedKeywords: string[]
}

/**
 * Topic keywords for matching
 * Maps topics to related keywords
 */
const TOPIC_KEYWORDS: Record<string, string[]> = {
  'Housing': ['housing', 'rent', 'home', 'apartment', 'homeless', 'shelter', 'affordable', 'eviction', 'tenant', 'landlord'],
  'Climate': ['climate', 'carbon', 'emissions', 'warming', 'environment', 'sustainability', 'green', 'renewable'],
  'Healthcare': ['health', 'medical', 'doctor', 'hospital', 'medicine', 'clinic', 'care', 'wellness', 'treatment'],
  'Food Systems': ['food', 'farm', 'agriculture', 'garden', 'nutrition', 'hunger', 'grocery', 'local food', 'organic'],
  'Transportation': ['transport', 'transit', 'bus', 'train', 'bike', 'walk', 'car', 'traffic', 'mobility'],
  'Education': ['education', 'school', 'learning', 'teach', 'student', 'class', 'curriculum', 'knowledge'],
  'Social Economy': ['cooperative', 'coop', 'economy', 'economic', 'mutual aid', 'timebank', 'sharing', 'commons'],
  'Collective Governance': ['governance', 'decision', 'vote', 'democracy', 'participatory', 'consensus', 'proposal'],
  'Community Connection': ['community', 'neighborhood', 'local', 'group', 'network', 'connection', 'gathering'],
  'Common Planet': ['planet', 'earth', 'nature', 'ecology', 'biodiversity', 'conservation', 'regeneration'],
  'Cooperative Technology': ['technology', 'software', 'open source', 'digital', 'privacy', 'data', 'platform'],
  'Common Wellbeing': ['wellbeing', 'wellness', 'mental health', 'support', 'care', 'healing', 'therapy'],
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  // Convert to lowercase and remove punctuation
  const cleaned = text.toLowerCase().replace(/[^\w\s]/g, ' ')

  // Split into words
  const words = cleaned.split(/\s+/).filter(w => w.length > 3)

  // Remove common stop words
  const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'been', 'were', 'will', 'would', 'could', 'should', 'about', 'what', 'when', 'where', 'which', 'their', 'there', 'these', 'those'])

  return words.filter(w => !stopWords.has(w))
}

/**
 * Calculate similarity between two sets of keywords
 */
function calculateSimilarity(keywords1: string[], keywords2: string[]): number {
  if (keywords1.length === 0 || keywords2.length === 0) return 0

  const set1 = new Set(keywords1)
  const set2 = new Set(keywords2)

  // Count intersection
  let intersection = 0
  for (const keyword of set1) {
    if (set2.has(keyword)) intersection++
  }

  // Jaccard similarity
  const union = set1.size + set2.size - intersection
  return union > 0 ? intersection / union : 0
}

/**
 * Bridge Topic Intelligence Service
 */
export class TopicIntelligence {
  /**
   * Suggest topics based on post content
   * Phase 3 MVP: Uses keyword matching
   * Future: Will use AI/NLP for semantic understanding
   */
  static suggestTopics(content: string, title?: string): TopicSuggestion[] {
    const fullText = [title, content].filter(Boolean).join(' ')
    const keywords = extractKeywords(fullText)

    const suggestions: TopicSuggestion[] = []

    // Check each topic's keywords
    for (const [topic, topicKeywords] of Object.entries(TOPIC_KEYWORDS)) {
      const matches = keywords.filter(k =>
        topicKeywords.some(tk => k.includes(tk) || tk.includes(k))
      )

      if (matches.length > 0) {
        const confidence = Math.min(matches.length / 3, 1) // Max out at 3 matches
        suggestions.push({
          topic,
          confidence,
          reason: `Matched keywords: ${matches.slice(0, 3).join(', ')}`,
        })
      }
    }

    // Sort by confidence
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
  }

  /**
   * Find posts similar to given content
   * Used for "Show related posts" feature
   */
  static findSimilarPosts(
    targetContent: string,
    targetTopics: string[],
    allPosts: Post[],
    limit = 10
  ): SimilarPost[] {
    const targetKeywords = extractKeywords(targetContent)

    const results: SimilarPost[] = []

    for (const post of allPosts) {
      // Skip if no shared topics
      const sharedTopics = targetTopics.filter(t => post.topics.includes(t))
      if (sharedTopics.length === 0) continue

      // Get post content
      const postContent = [post.title, post.content].filter(Boolean).join(' ')
      const postKeywords = extractKeywords(postContent)

      // Calculate similarity
      const similarity = calculateSimilarity(targetKeywords, postKeywords)

      // Boost similarity if topics match
      const topicBoost = sharedTopics.length * 0.1
      const finalSimilarity = Math.min(similarity + topicBoost, 1)

      if (finalSimilarity > 0.1) {
        const matchedKeywords = targetKeywords.filter(k => postKeywords.includes(k))
        results.push({
          post,
          similarity: finalSimilarity,
          matchedKeywords: matchedKeywords.slice(0, 5),
        })
      }
    }

    // Sort by similarity and return top results
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, limit)
  }

  /**
   * Detect duplicate discussion threads
   * Prevents fragmentation by suggesting existing threads
   */
  static findSimilarThreads(
    title: string,
    content: string,
    topic: string,
    allThreads: DiscussionThread[],
    limit = 5
  ): SimilarThread[] {
    const targetText = `${title} ${content}`
    const targetKeywords = extractKeywords(targetText)

    const results: SimilarThread[] = []

    for (const thread of allThreads) {
      // Only compare threads with same primary topic
      if (thread.topic !== topic) continue

      const threadKeywords = extractKeywords(thread.title)
      const similarity = calculateSimilarity(targetKeywords, threadKeywords)

      if (similarity > 0.2) {  // Threshold for suggesting as duplicate
        const matchedKeywords = targetKeywords.filter(k => threadKeywords.includes(k))
        results.push({
          thread,
          similarity,
          matchedKeywords: matchedKeywords.slice(0, 5),
        })
      }
    }

    // Sort by similarity
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, limit)
  }

  /**
   * Get all available topics
   */
  static getAvailableTopics(): string[] {
    return AVAILABLE_TOPICS
  }

  /**
   * Validate topic exists
   */
  static isValidTopic(topic: string): boolean {
    return AVAILABLE_TOPICS.includes(topic)
  }
}
