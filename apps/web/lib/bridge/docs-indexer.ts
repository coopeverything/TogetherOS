/**
 * Document Indexer for Bridge KB
 *
 * Scans /docs directory and creates a searchable index
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

export interface DocEntry {
  path: string;
  title: string;
  content: string;
  excerpt: string;
  section?: string;
}

export interface SearchResult {
  doc: DocEntry;
  score: number;
  matches: string[];
}

/**
 * Recursively scan directory for markdown files
 */
function scanDocs(dir: string, baseDir: string): DocEntry[] {
  const entries: DocEntry[] = [];

  try {
    const files = readdirSync(dir);

    for (const file of files) {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Recurse into subdirectories
        entries.push(...scanDocs(fullPath, baseDir));
      } else if (file.endsWith('.md')) {
        // Parse markdown file
        const content = readFileSync(fullPath, 'utf-8');
        const relativePath = relative(baseDir, fullPath);

        // Extract title (first # heading or filename)
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : file.replace('.md', '');

        // Extract section (directory name)
        const section = relativePath.split('/')[0];

        // Create excerpt (first paragraph)
        const paragraphs = content
          .split('\n\n')
          .filter(p => !p.startsWith('#') && !p.startsWith('```') && p.trim().length > 0);
        const excerpt = paragraphs[0]?.substring(0, 200) || '';

        entries.push({
          path: relativePath,
          title,
          content,
          excerpt,
          section,
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error);
  }

  return entries;
}

/**
 * Build index of all documents
 */
export function buildIndex(docsDir: string): DocEntry[] {
  return scanDocs(docsDir, docsDir);
}

/**
 * Simple keyword-based search
 * Returns top N results ranked by relevance
 */
export function searchDocs(
  index: DocEntry[],
  query: string,
  limit: number = 5
): SearchResult[] {
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2); // Filter out short words

  const results: SearchResult[] = [];

  for (const doc of index) {
    const searchText = `${doc.title} ${doc.content}`.toLowerCase();
    let score = 0;
    const matches: string[] = [];

    for (const keyword of keywords) {
      // Count occurrences
      const regex = new RegExp(keyword, 'gi');
      const occurrences = (searchText.match(regex) || []).length;

      if (occurrences > 0) {
        // Title matches worth more
        const titleMatches = doc.title.toLowerCase().includes(keyword);
        score += titleMatches ? occurrences * 10 : occurrences;
        matches.push(keyword);
      }
    }

    if (score > 0) {
      results.push({ doc, score, matches });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

/**
 * Get relevant doc excerpts for a query
 */
export function getRelevantExcerpts(
  index: DocEntry[],
  query: string,
  maxChars: number = 2000
): string {
  const results = searchDocs(index, query, 3);

  if (results.length === 0) {
    return '';
  }

  let context = '';

  for (const result of results) {
    const { doc } = result;

    // Extract relevant paragraphs containing keywords
    const keywords = query.toLowerCase().split(/\s+/);
    const paragraphs = doc.content.split('\n\n');
    const relevantParagraphs = paragraphs.filter(p => {
      const pLower = p.toLowerCase();
      return keywords.some(k => pLower.includes(k));
    });

    // Build context entry
    const excerpt = relevantParagraphs.slice(0, 2).join('\n\n').substring(0, 500);
    context += `## From ${doc.title} (${doc.path})\n\n${excerpt}\n\n`;

    if (context.length > maxChars) {
      break;
    }
  }

  return context.substring(0, maxChars);
}

/**
 * Get sources for citation
 */
export function getSources(
  index: DocEntry[],
  query: string,
  limit: number = 3
): Array<{ title: string; path: string }> {
  const results = searchDocs(index, query, limit);
  return results.map(r => ({
    title: r.doc.title,
    path: r.doc.path,
  }));
}
