/**
 * Bridge Content Search Service
 *
 * Provides search and retrieval of indexed site content for Bridge.
 * Formats results with trust-appropriate context for the LLM.
 */

import {
  searchContent as dbSearchContent,
  getRecentContent as dbGetRecentContent,
  getHighSPContent as dbGetHighSPContent,
  getTrustThresholds,
} from '@togetheros/db';
import type {
  ContentSearchOptions,
  ContentSearchResult,
  IndexedContent,
  TrustTier,
  TRUST_TIER_PHRASES,
} from '@togetheros/types';
import { formatEngagementForPrompt } from './trust-calculator';

// Re-export trust tier phrases for convenience
export { TRUST_TIER_PHRASES } from '@togetheros/types';

/**
 * Search for content relevant to a user's question
 */
export async function searchRelevantContent(
  query: string,
  options: ContentSearchOptions = {}
): Promise<ContentSearchResult[]> {
  return dbSearchContent(query, {
    limit: options.limit || 8,
    ...options,
  });
}

/**
 * Get recent content for "what's new" style queries
 */
export async function getRecentContent(
  hours: number = 24,
  limit: number = 5
): Promise<IndexedContent[]> {
  return dbGetRecentContent(hours, limit);
}

/**
 * Get content with significant SP backing
 */
export async function getHighValueContent(
  minSP: number = 10,
  limit: number = 5
): Promise<IndexedContent[]> {
  return dbGetHighSPContent(minSP, limit);
}

/**
 * Format content for inclusion in Bridge prompt
 * Includes trust context and engagement metrics
 */
export function formatContentForPrompt(item: ContentSearchResult | IndexedContent): string {
  const trustPhrases: Record<TrustTier, string> = {
    unvalidated: '(Unvalidated - new post, no community feedback yet)',
    low: '(Limited community validation)',
    medium: '(Some community support)',
    high: '(Strong community support)',
    consensus: '(Community consensus)',
  };

  const engagement = formatEngagementForPrompt(
    {
      voteScore: item.voteScore,
      ratingAvg: item.ratingAvg,
      replyCount: item.replyCount,
      participantCount: item.participantCount,
      totalSP: item.totalSP,
      spAllocatorCount: item.spAllocatorCount,
    },
    item.trustTier
  );

  const contentTypeLabels: Record<string, string> = {
    forum_post: 'FORUM POST',
    forum_topic: 'FORUM TOPIC',
    article: 'ARTICLE',
    proposal: 'PROPOSAL',
    wiki: 'WIKI',
    event: 'EVENT',
  };

  const label = contentTypeLabels[item.contentType] || item.contentType.toUpperCase();

  // Build formatted block
  let block = `[${label}: ${item.title}]\n`;
  block += `Trust: ${trustPhrases[item.trustTier]}\n`;
  block += `URL: ${item.url}\n`;

  // Show engagement for validated content
  if (item.trustTier !== 'unvalidated') {
    block += `Engagement: ${engagement}\n`;
  }

  block += `\n${item.summary || item.fullText?.slice(0, 500) || '(No summary available)'}`;

  return block;
}

/**
 * Format multiple content items for Bridge prompt
 * Includes header and guidance for the LLM
 */
export function formatContentBlockForPrompt(items: (ContentSearchResult | IndexedContent)[]): string {
  if (items.length === 0) {
    return '';
  }

  const formattedItems = items.map(formatContentForPrompt);

  return `
**LIVE COMMUNITY CONTENT:**
The following content was found on the platform. Use appropriate language based on trust level:
- Unvalidated: Frame as "one member's opinion" or "a recent suggestion"
- Low/Medium: Frame as "some members think" or "there's interest in"
- High: Frame as "there's strong community support for"
- Consensus: Frame as "the community has reached consensus that"

${formattedItems.join('\n\n---\n\n')}

When citing this content, include the URL so users can explore further.`;
}

/**
 * Detect if a query is asking about recent activity
 */
export function isRecentActivityQuery(query: string): boolean {
  const recentPatterns = [
    /what'?s new/i,
    /recent(ly)?/i,
    /latest/i,
    /today/i,
    /this week/i,
    /just (posted|shared|added)/i,
    /any new/i,
  ];

  return recentPatterns.some((pattern) => pattern.test(query));
}

/**
 * Detect if a query is asking about popular/supported content
 */
export function isPopularContentQuery(query: string): boolean {
  const popularPatterns = [
    /popular/i,
    /most (voted|supported|liked)/i,
    /community (supports?|backs?|agrees?)/i,
    /consensus/i,
    /trending/i,
    /top (posts?|topics?|ideas?)/i,
    /what do (people|members|everyone) (think|support|want)/i,
  ];

  return popularPatterns.some((pattern) => pattern.test(query));
}

/**
 * Get content based on query type
 * Automatically detects if user wants recent, popular, or specific content
 */
export async function getContentForQuery(
  query: string,
  options: ContentSearchOptions = {}
): Promise<(ContentSearchResult | IndexedContent)[]> {
  // Check for special query types first
  if (isRecentActivityQuery(query)) {
    const recent = await getRecentContent(48, options.limit || 5);
    // Also search for relevant content
    const relevant = await searchRelevantContent(query, { ...options, limit: 3 });
    // Combine and dedupe
    const combined = [...recent];
    for (const item of relevant) {
      if (!combined.find((c) => c.contentId === item.contentId)) {
        combined.push(item);
      }
    }
    return combined.slice(0, options.limit || 8);
  }

  if (isPopularContentQuery(query)) {
    const highValue = await getHighValueContent(5, options.limit || 5);
    // Also search for relevant content with high trust
    const relevant = await searchRelevantContent(query, {
      ...options,
      minTrust: 'medium',
      limit: 3,
    });
    // Combine and dedupe
    const combined = [...highValue];
    for (const item of relevant) {
      if (!combined.find((c) => c.contentId === item.contentId)) {
        combined.push(item);
      }
    }
    return combined.slice(0, options.limit || 8);
  }

  // Default: search for relevant content
  return searchRelevantContent(query, options);
}
