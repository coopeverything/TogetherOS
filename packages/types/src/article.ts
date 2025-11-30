/**
 * Article Types
 *
 * Articles are author-owned expert opinions, distinct from wiki articles
 * which are community-owned and evolving. Articles represent individual
 * perspectives and maintain authorship attribution.
 */

export type ArticleStatus = 'draft' | 'published' | 'archived'

/**
 * Article - An author-owned expert opinion piece
 */
export interface Article {
  /** Unique identifier */
  id: string

  /** URL-friendly slug */
  slug: string

  /** Article title */
  title: string

  /** Brief summary/excerpt (shown in listings) */
  summary: string

  /** Full article content (Markdown) */
  content: string

  /** Publication status */
  status: ArticleStatus

  /** Author information */
  authorId: string
  authorName: string
  authorBio?: string

  /** Categorization */
  tags: string[]
  cooperationPaths?: string[]

  /** Related content links */
  relatedWikiSlugs?: string[]
  relatedArticleSlugs?: string[]

  /** Discussion thread ID in forum */
  discussionThreadId?: string

  /** Metadata */
  createdAt: string
  publishedAt?: string
  updatedAt: string

  /** Reading time in minutes */
  readTimeMinutes: number

  /** Engagement metrics */
  viewCount: number
  likeCount: number
}

/**
 * CreateArticleInput - Data for creating a new article
 */
export interface CreateArticleInput {
  title: string
  summary: string
  content: string
  tags: string[]
  cooperationPaths?: string[]
  status?: ArticleStatus
}

/**
 * UpdateArticleInput - Data for updating an existing article
 */
export interface UpdateArticleInput {
  title?: string
  summary?: string
  content?: string
  tags?: string[]
  cooperationPaths?: string[]
  status?: ArticleStatus
  relatedWikiSlugs?: string[]
  relatedArticleSlugs?: string[]
}

/**
 * ArticleListItem - Lightweight article for listings
 */
export interface ArticleListItem {
  id: string
  slug: string
  title: string
  summary: string
  status: ArticleStatus
  authorId: string
  authorName: string
  tags: string[]
  cooperationPaths?: string[]
  publishedAt?: string
  readTimeMinutes: number
  viewCount: number
  likeCount: number
}
