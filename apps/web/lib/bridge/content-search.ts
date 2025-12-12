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
  searchForumPostsFull,
  searchForumTopicsFull,
  getRecentForumActivity,
  type BridgeForumPost,
  type BridgeForumTopic,
} from '@togetheros/db';
import type {
  ContentSearchOptions,
  ContentSearchResult,
  IndexedContent,
  TrustTier,
  TRUST_TIER_PHRASES,
} from '@togetheros/types';
import { formatEngagementForPrompt } from './trust-calculator';

// Threshold for switching from index to full content
const FULL_CONTENT_THRESHOLD = 5;

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
 * Format a full forum post for Bridge prompt
 * Includes full content and top replies
 */
export function formatFullPostForPrompt(post: BridgeForumPost): string {
  const trustPhrases: Record<TrustTier, string> = {
    unvalidated: '(Unvalidated - new post, no community feedback yet)',
    low: '(Limited community validation)',
    medium: '(Some community support)',
    high: '(Strong community support)',
    consensus: '(Community consensus)',
  };

  let block = `[FORUM POST in "${post.topicTitle}"]\n`;
  block += `Author: ${post.authorName || 'Anonymous'}\n`;
  block += `Trust: ${trustPhrases[post.trustTier]}\n`;
  block += `Engagement: ${post.voteScore} votes, ${post.replyCount} replies`;
  if (post.totalSP > 0) {
    block += `, ${post.totalSP} SP from ${post.spAllocatorCount} members`;
  }
  block += `\n`;
  block += `URL: ${post.url}\n`;
  block += `\n**Full Content:**\n${post.content}\n`;

  if (post.topReplies.length > 0) {
    block += `\n**Top Replies:**\n`;
    for (const reply of post.topReplies) {
      block += `- ${reply.authorName || 'Anonymous'} (${reply.voteScore} votes): "${reply.content.slice(0, 200)}${reply.content.length > 200 ? '...' : ''}"\n`;
    }
  }

  return block;
}

/**
 * Format a full forum topic for Bridge prompt
 * Includes description and top posts
 */
export function formatFullTopicForPrompt(topic: BridgeForumTopic): string {
  const trustPhrases: Record<TrustTier, string> = {
    unvalidated: '(Unvalidated - new topic, no community feedback yet)',
    low: '(Limited community validation)',
    medium: '(Some community support)',
    high: '(Strong community support)',
    consensus: '(Community consensus)',
  };

  let block = `[FORUM TOPIC: ${topic.title}]\n`;
  block += `Category: ${topic.category}\n`;
  block += `Author: ${topic.authorName || 'Anonymous'}\n`;
  block += `Trust: ${trustPhrases[topic.trustTier]}\n`;
  block += `Engagement: ${topic.voteScore} votes, ${topic.postCount} posts, ${topic.participantCount} participants`;
  if (topic.totalSP > 0) {
    block += `, ${topic.totalSP} SP from ${topic.spAllocatorCount} members`;
  }
  block += `\n`;
  block += `URL: ${topic.url}\n`;

  if (topic.description) {
    block += `\n**Description:**\n${topic.description}\n`;
  }

  if (topic.topPosts.length > 0) {
    block += `\n**Top Posts in this Topic:**\n`;
    for (const post of topic.topPosts) {
      const spNote = post.totalSP > 0 ? `, ${post.totalSP} SP` : '';
      block += `- ${post.authorName || 'Anonymous'} (${post.voteScore} votes${spNote}): "${post.content.slice(0, 300)}${post.content.length > 300 ? '...' : ''}"\n`;
    }
  }

  return block;
}

/**
 * Format full posts block for Bridge prompt
 */
export function formatFullPostsBlockForPrompt(
  posts: BridgeForumPost[],
  topics: BridgeForumTopic[]
): string {
  if (posts.length === 0 && topics.length === 0) {
    return '';
  }

  const formattedPosts = posts.map(formatFullPostForPrompt);
  const formattedTopics = topics.map(formatFullTopicForPrompt);
  const allFormatted = [...formattedTopics, ...formattedPosts];

  return `
**LIVE COMMUNITY CONTENT (Full Details):**
I found ${posts.length + topics.length} relevant items. Here are the full details so you can read and summarize them accurately.

Use appropriate language based on trust level:
- Unvalidated: Frame as "one member's opinion" or "a recent suggestion"
- Low/Medium: Frame as "some members think" or "there's interest in"
- High: Frame as "there's strong community support for"
- Consensus: Frame as "the community has reached consensus that"

SP (Support Points) allocation indicates community members have put their governance weight behind this content - treat high SP as a strong signal of community validation.

${allFormatted.join('\n\n---\n\n')}

When citing this content, include the URL so users can explore further.`;
}

/**
 * Smart content retrieval for Bridge
 * - Many results (>threshold): return indexed summaries
 * - Few results (<=threshold): fetch and return full content
 */
export async function getSmartContentForQuery(
  query: string,
  options: ContentSearchOptions = {}
): Promise<{
  mode: 'indexed' | 'full';
  indexedContent?: (ContentSearchResult | IndexedContent)[];
  fullPosts?: BridgeForumPost[];
  fullTopics?: BridgeForumTopic[];
  formattedBlock: string;
}> {
  // First, try indexed search to see how many results
  const indexedResults = await getContentForQuery(query, { ...options, limit: 20 });

  // If many results, use indexed summaries
  if (indexedResults.length > FULL_CONTENT_THRESHOLD) {
    const limitedResults = indexedResults.slice(0, options.limit || 8);
    return {
      mode: 'indexed',
      indexedContent: limitedResults,
      formattedBlock: formatContentBlockForPrompt(limitedResults),
    };
  }

  // Few or no indexed results - fetch full content from database
  const [fullPosts, fullTopics] = await Promise.all([
    searchForumPostsFull(query, options.limit || 5),
    searchForumTopicsFull(query, options.limit || 3),
  ]);

  // If we found full content, use it
  if (fullPosts.length > 0 || fullTopics.length > 0) {
    return {
      mode: 'full',
      fullPosts,
      fullTopics,
      formattedBlock: formatFullPostsBlockForPrompt(fullPosts, fullTopics),
    };
  }

  // Check for recent activity as fallback
  if (isRecentActivityQuery(query)) {
    const recentPosts = await getRecentForumActivity(48, options.limit || 5);
    if (recentPosts.length > 0) {
      return {
        mode: 'full',
        fullPosts: recentPosts,
        fullTopics: [],
        formattedBlock: formatFullPostsBlockForPrompt(recentPosts, []),
      };
    }
  }

  // No content found
  return {
    mode: 'indexed',
    indexedContent: [],
    formattedBlock: '',
  };
}

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
