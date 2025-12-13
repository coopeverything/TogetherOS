/**
 * Wiki Seed Service
 *
 * Automatically seeds wiki articles and glossary terms from wiki-data.ts
 * into the PostgreSQL database on first startup.
 *
 * This enables Bridge to search wiki content using the unified knowledge system.
 */

import {
  getWikiArticleCount,
  upsertWikiArticle,
  upsertGlossaryTerm,
} from '@togetheros/db';
import { wikiArticles, glossaryTerms } from '@web/data/wiki-data';
import type { WikiArticle, GlossaryTerm } from '@togetheros/types';

// Track if seed has been attempted this session
let seedAttempted = false;
let seedResult: { success: boolean; articlesSeeded: number; termsSeeded: number } | null = null;

/**
 * Map WikiArticle from wiki-data.ts to database format
 */
function mapArticleToDb(article: WikiArticle) {
  // Map status to database status
  const statusMap: Record<string, 'draft' | 'proposed' | 'stable' | 'evolving' | 'contested' | 'archived'> = {
    stable: 'stable',
    evolving: 'evolving',
    contested: 'contested',
  };

  // Map trust tier based on status
  const trustTierMap: Record<string, 'unvalidated' | 'low' | 'medium' | 'high' | 'consensus' | 'stable'> = {
    stable: 'stable',
    evolving: 'medium',
    contested: 'low',
  };

  return {
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    content: article.content,
    status: statusMap[article.status] || 'stable',
    tags: article.tags || [],
    cooperationPaths: article.cooperationPaths || [],
    relatedArticleSlugs: article.relatedArticles || [],
    terms: article.terms || [],
    contributorCount: article.contributorCount || 1,
    trustTier: trustTierMap[article.status] || 'stable',
    discussionTopicId: article.discussionThreadId || null,
    createdBy: null,
    lastEditedBy: null,
    readTimeMinutes: article.readTimeMinutes || 3,
  };
}

/**
 * Map GlossaryTerm from wiki-data.ts to database format
 */
function mapTermToDb(term: GlossaryTerm) {
  return {
    word: term.word,
    slug: term.slug,
    shortDefinition: term.shortDefinition,
    wikiArticleSlug: term.wikiArticleSlug || null,
    discussionTopicId: term.discussionThreadId || null,
    relatedTermSlugs: term.relatedTerms || [],
    cooperationPath: term.cooperationPath || null,
  };
}

/**
 * Seed wiki articles and glossary terms to database
 *
 * Only seeds if the database is empty (first run).
 * Uses upsert to handle re-seeding gracefully.
 */
export async function seedWikiToDatabase(options: { force?: boolean } = {}): Promise<{
  success: boolean;
  articlesSeeded: number;
  termsSeeded: number;
  skipped: boolean;
  error?: string;
}> {
  // Return cached result if already attempted this session
  if (seedAttempted && !options.force && seedResult) {
    return { ...seedResult, skipped: true };
  }

  seedAttempted = true;

  try {
    // Check if wiki is already populated
    const existingCount = await getWikiArticleCount();

    if (existingCount > 0 && !options.force) {
      console.log(`[Wiki Seed] Database already has ${existingCount} wiki articles, skipping seed`);
      seedResult = { success: true, articlesSeeded: 0, termsSeeded: 0 };
      return { ...seedResult, skipped: true };
    }

    console.log(`[Wiki Seed] Seeding ${wikiArticles.length} articles and ${glossaryTerms.length} terms...`);

    // Seed articles
    let articlesSeeded = 0;
    for (const article of wikiArticles) {
      try {
        const dbArticle = mapArticleToDb(article);
        await upsertWikiArticle(dbArticle);
        articlesSeeded++;
      } catch (error) {
        console.error(`[Wiki Seed] Error seeding article ${article.slug}:`, error);
      }
    }

    // Seed glossary terms
    let termsSeeded = 0;
    for (const term of glossaryTerms) {
      try {
        const dbTerm = mapTermToDb(term);
        await upsertGlossaryTerm(dbTerm);
        termsSeeded++;
      } catch (error) {
        console.error(`[Wiki Seed] Error seeding term ${term.slug}:`, error);
      }
    }

    console.log(`[Wiki Seed] Completed: ${articlesSeeded} articles, ${termsSeeded} terms`);

    seedResult = { success: true, articlesSeeded, termsSeeded };
    return { ...seedResult, skipped: false };
  } catch (error) {
    console.error('[Wiki Seed] Failed to seed wiki:', error);
    seedResult = { success: false, articlesSeeded: 0, termsSeeded: 0 };
    return {
      ...seedResult,
      skipped: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if wiki database needs seeding
 */
export async function needsWikiSeed(): Promise<boolean> {
  try {
    const count = await getWikiArticleCount();
    return count === 0;
  } catch {
    // If we can't check, assume we don't need to seed (database might not be ready)
    return false;
  }
}

/**
 * Get seed status
 */
export function getSeedStatus(): {
  attempted: boolean;
  result: typeof seedResult;
} {
  return { attempted: seedAttempted, result: seedResult };
}
