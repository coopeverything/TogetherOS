/**
 * Wiki & Knowledge Base Types
 *
 * TogetherOS has three content types for knowledge sharing:
 * 1. Wiki Articles - Community-owned, collectively edited, evolving
 * 2. Opinion Articles - Author-owned, influential perspectives (future)
 * 3. Forum Posts - Discussions, debates, proposals
 *
 * This module defines types for Wiki Articles and Terms (Glossary).
 */

/**
 * Status of a wiki article indicating community consensus level
 */
export type WikiStatus = 'stable' | 'evolving' | 'contested'

/**
 * A wiki article - community-owned, collectively maintained knowledge
 */
export interface WikiArticle {
  /** Unique identifier */
  id: string

  /** URL-friendly slug (e.g., "coordinator", "consent-based-decisions") */
  slug: string

  /** Article title */
  title: string

  /** Brief description/summary (1-2 sentences) */
  summary: string

  /** Full markdown content */
  content: string

  /** Status indicating consensus level */
  status: WikiStatus

  /** Tags for categorization */
  tags: string[]

  /** Related Cooperation Path(s) */
  cooperationPaths?: string[]

  /** Slugs of related wiki articles */
  relatedArticles?: string[]

  /** Forum discussion thread ID (if linked) */
  discussionThreadId?: string

  /** Terms (glossary entries) that appear in this article */
  terms?: string[]

  /** Number of contributors (for display) */
  contributorCount: number

  /** Last edit timestamp */
  lastEditedAt: string

  /** Created timestamp */
  createdAt: string

  /** Read time in minutes */
  readTimeMinutes: number
}

/**
 * A glossary term - brief definition with links to deeper content
 */
export interface GlossaryTerm {
  /** Unique identifier */
  id: string

  /** The term word/phrase (e.g., "Coordinator", "Support Points") */
  word: string

  /** URL-friendly slug */
  slug: string

  /** Short definition for hover popups (1-2 sentences) */
  shortDefinition: string

  /** Link to the primary wiki article explaining this term */
  wikiArticleSlug?: string

  /** Links to opinion articles about this term (future) */
  relatedOpinionSlugs?: string[]

  /** Forum discussion thread ID */
  discussionThreadId?: string

  /** Related terms (for "See also") */
  relatedTerms?: string[]

  /** Cooperation path this term is most relevant to */
  cooperationPath?: string
}

/**
 * Edit history entry for wiki articles
 */
export interface WikiEdit {
  id: string
  articleId: string
  editorId: string
  editorName: string
  timestamp: string
  changeDescription: string
  previousContent?: string
}

/**
 * Category for organizing wiki articles
 */
export interface WikiCategory {
  id: string
  name: string
  slug: string
  description: string
  articleCount: number
}

/**
 * Helper type for wiki article list views
 */
export type WikiArticleSummary = Pick<
  WikiArticle,
  | 'id'
  | 'slug'
  | 'title'
  | 'summary'
  | 'status'
  | 'tags'
  | 'contributorCount'
  | 'lastEditedAt'
  | 'readTimeMinutes'
>

/**
 * Search result for wiki content
 */
export interface WikiSearchResult {
  type: 'article' | 'term'
  slug: string
  title: string
  excerpt: string
  matchScore: number
}
