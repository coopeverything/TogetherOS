/**
 * Unified Knowledge Search for Bridge
 *
 * Provides a single search interface for Bridge to query all knowledge sources:
 * - Wiki articles (with minority reports)
 * - Forum posts and topics
 * - Proposals
 * - Glossary terms
 *
 * Features:
 * - Automatic synonym expansion ("SP" finds "Support Points")
 * - Trust-weighted results
 * - Formatted context block for LLM consumption
 * - Unanswered query tracking for gap analysis
 */

import {
  unifiedKnowledgeSearch,
  recordUnansweredQuery,
  getWikiMinorityReports,
} from '@togetheros/db';
import { seedWikiToDatabase, needsWikiSeed } from './wiki-seed-service';
import type { UnifiedSearchResult, UnifiedSearchOptions } from '@togetheros/types';

// Ensure wiki is seeded on first search
let wikiSeedChecked = false;

/**
 * Format trust tier for human-readable display
 */
function formatTrustTier(tier: UnifiedSearchResult['trustTier']): string {
  switch (tier) {
    case 'consensus':
      return 'Strong consensus';
    case 'high':
      return 'High community support';
    case 'stable':
      return 'Stable wiki content';
    case 'medium':
      return 'Moderate engagement';
    case 'low':
      return 'Limited engagement';
    case 'unvalidated':
      return 'New/unvalidated';
    default:
      return 'Unknown';
  }
}

/**
 * Format source type for display
 */
function formatSourceType(source: UnifiedSearchResult['source']): string {
  switch (source) {
    case 'wiki':
      return 'Wiki Article';
    case 'forum':
      return 'Forum Discussion';
    case 'proposal':
      return 'Governance Proposal';
    case 'glossary':
      return 'Glossary Term';
    case 'docs':
      return 'Documentation';
    default:
      return 'Content';
  }
}

/**
 * Search all knowledge sources and format for Bridge LLM context
 */
export async function searchKnowledgeForBridge(
  query: string,
  options: {
    limit?: number;
    includeMinorityReports?: boolean;
    userId?: string;
  } = {}
): Promise<{
  results: UnifiedSearchResult[];
  formattedBlock: string | null;
  queriedSources: string[];
  hadResults: boolean;
}> {
  const { limit = 10, includeMinorityReports = true, userId } = options;

  // Ensure wiki is seeded on first search
  if (!wikiSeedChecked) {
    wikiSeedChecked = true;
    try {
      if (await needsWikiSeed()) {
        console.log('[Bridge] Wiki database empty, seeding from wiki-data.ts...');
        await seedWikiToDatabase();
      }
    } catch (error) {
      console.warn('[Bridge] Failed to check/seed wiki:', error);
    }
  }

  try {
    // Search all sources with synonym expansion
    const results = await unifiedKnowledgeSearch(query, {
      sources: ['wiki', 'forum', 'proposal', 'glossary'],
      expandSynonyms: true,
      includeContested: true,
      limit,
    });

    const queriedSources = ['wiki', 'forum', 'proposal', 'glossary'];
    const hadResults = results.length > 0;

    // Track unanswered queries for gap analysis
    if (!hadResults) {
      try {
        await recordUnansweredQuery(query, {
          userId,
          resultsCount: 0,
          contentTypes: queriedSources,
        });
      } catch {
        // Don't fail the search if tracking fails
      }
    }

    // Format results for LLM context
    if (!hadResults) {
      return {
        results,
        formattedBlock: null,
        queriedSources,
        hadResults,
      };
    }

    // Build formatted block for system prompt
    let formattedBlock = `

**KNOWLEDGE BASE SEARCH RESULTS** (searched: wiki, forum, proposals, glossary)
Query: "${query}"
Found: ${results.length} relevant items

`;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const trustLabel = formatTrustTier(result.trustTier);
      const sourceLabel = formatSourceType(result.source);

      formattedBlock += `---
### ${i + 1}. ${result.title}
**Source:** ${sourceLabel} | **Trust:** ${trustLabel}${result.totalSP > 0 ? ` | **SP:** ${result.totalSP}` : ''}
**URL:** ${result.url}

${result.summary}
${result.content ? `\n${result.content.substring(0, 1500)}${result.content.length > 1500 ? '... [truncated]' : ''}` : ''}
`;

      // Add minority reports for wiki articles
      if (result.source === 'wiki' && includeMinorityReports && result.hasMinorityReport) {
        try {
          const minorityReports = await getWikiMinorityReports(result.sourceId);
          if (minorityReports.length > 0) {
            formattedBlock += `
**⚠️ MINORITY REPORT(S) ON THIS ARTICLE:**
`;
            for (const report of minorityReports.slice(0, 2)) {
              formattedBlock += `> "${report.dissentingView.substring(0, 300)}${report.dissentingView.length > 300 ? '...' : ''}"
> (${report.totalSP} SP backing from ${report.spAllocatorCount} member(s))

`;
            }
          }
        } catch {
          // Continue without minority reports if fetch fails
        }
      }

      // Mark contested content
      if (result.isContested) {
        formattedBlock += `
**⚠️ CONTESTED:** This content is actively disputed. Present multiple perspectives.
`;
      }
    }

    formattedBlock += `
---

**HOW TO USE THIS CONTENT:**
- Wiki articles are authoritative explanations of TogetherOS concepts
- Glossary terms provide quick definitions - link to wiki for depth
- Forum posts represent community opinions - cite trust level
- Proposals show active governance discussions
- When content has minority reports, acknowledge dissenting views
- When content is contested, present balanced perspectives
`;

    return {
      results,
      formattedBlock,
      queriedSources,
      hadResults,
    };
  } catch (error) {
    console.error('[Bridge] Knowledge search error:', error);
    return {
      results: [],
      formattedBlock: null,
      queriedSources: [],
      hadResults: false,
    };
  }
}

/**
 * Quick search for synonym expansion preview
 * (For future autocomplete/suggestions feature)
 */
export async function previewSearchExpansion(query: string): Promise<string[]> {
  try {
    const { expandQueryWithSynonyms } = await import('@togetheros/db');
    return await expandQueryWithSynonyms(query);
  } catch {
    return [query];
  }
}
