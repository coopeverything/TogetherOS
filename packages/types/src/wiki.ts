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

// =============================================================================
// DATABASE-BACKED WIKI TYPES (Phase 1-4 Unified Knowledge System)
// =============================================================================

/**
 * Wiki article as stored in database
 */
export interface DbWikiArticle {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  status: 'draft' | 'proposed' | 'stable' | 'evolving' | 'contested' | 'archived'
  tags: string[]
  cooperationPaths: string[]
  relatedArticleSlugs: string[]
  terms: string[]
  viewCount: number
  totalSP: number
  spAllocatorCount: number
  contributorCount: number
  trustTier: 'unvalidated' | 'low' | 'medium' | 'high' | 'consensus' | 'stable'
  discussionTopicId: string | null
  createdBy: string | null
  lastEditedBy: string | null
  createdAt: Date
  updatedAt: Date
  readTimeMinutes: number
}

/**
 * Glossary term as stored in database
 */
export interface DbGlossaryTerm {
  id: string
  word: string
  slug: string
  shortDefinition: string
  wikiArticleSlug: string | null
  discussionTopicId: string | null
  relatedTermSlugs: string[]
  cooperationPath: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Search synonym for query expansion
 */
export interface SearchSynonym {
  id: string
  canonicalTerm: string
  synonyms: string[]
  abbreviations: string[]
  category: string
  createdAt: Date
}

/**
 * Wiki edit proposal for governance
 */
export interface WikiEditProposal {
  id: string
  articleId: string
  proposedTitle: string | null
  proposedSummary: string | null
  proposedContent: string
  proposedTags: string[] | null
  changeDescription: string
  rationale: string | null
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn'
  governanceProposalId: string | null
  proposedBy: string
  reviewedBy: string | null
  reviewNotes: string | null
  createdAt: Date
  reviewedAt: Date | null
  appliedAt: Date | null
}

/**
 * Wiki edit history entry
 */
export interface WikiEditHistoryEntry {
  id: string
  articleId: string
  previousContent: string
  newContent: string
  changeDescription: string | null
  editorId: string | null
  editedAt: Date
  editProposalId: string | null
}

/**
 * Wiki minority report - dissenting view on article content
 */
export interface WikiMinorityReport {
  id: string
  articleId: string
  dissentingView: string
  evidence: string | null
  predictions: string | null
  authorId: string
  totalSP: number
  spAllocatorCount: number
  status: 'active' | 'validated' | 'invalidated' | 'superseded'
  validationNotes: string | null
  validatedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Unanswered query tracked by Bridge
 */
export interface BridgeUnansweredQuery {
  id: string
  queryText: string
  queryNormalized: string
  userId: string | null
  sessionContext: Record<string, unknown> | null
  searchResultsCount: number
  contentTypesSearched: string[]
  occurrenceCount: number
  firstSeenAt: Date
  lastSeenAt: Date
  resolved: boolean
  resolvedByArticleId: string | null
  resolvedAt: Date | null
}

/**
 * Unified knowledge search result (covers all content types)
 */
export interface UnifiedSearchResult {
  source: 'wiki' | 'forum' | 'docs' | 'proposal' | 'glossary'
  sourceId: string
  title: string
  summary: string
  content: string | null
  url: string

  // Trust signals
  trustTier: 'unvalidated' | 'low' | 'medium' | 'high' | 'consensus' | 'stable'
  totalSP: number
  hasMinorityReport: boolean
  isContested: boolean

  // Relevance
  score: number
  matchType: 'exact' | 'synonym' | 'semantic'
  matchedTerms: string[]
}

/**
 * Options for unified knowledge search
 */
export interface UnifiedSearchOptions {
  sources?: ('wiki' | 'forum' | 'docs' | 'proposal' | 'glossary')[]
  minTrust?: 'unvalidated' | 'low' | 'medium' | 'high' | 'consensus'
  includeContested?: boolean
  expandSynonyms?: boolean
  limit?: number
  offset?: number
}

/**
 * Knowledge gap analysis result
 */
export interface KnowledgeGap {
  queryNormalized: string
  occurrenceCount: number
  firstSeenAt: Date
  lastSeenAt: Date
  suggestedTopic: string | null
  relatedArticles: string[]
}

/**
 * Wiki export metadata
 */
export interface WikiExportRecord {
  id: string
  exportType: 'git' | 'markdown' | 'json' | 'federation'
  articleCount: number
  exportPath: string | null
  commitSha: string | null
  branchName: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  errorMessage: string | null
  startedAt: Date
  completedAt: Date | null
  initiatedBy: string | null
}
