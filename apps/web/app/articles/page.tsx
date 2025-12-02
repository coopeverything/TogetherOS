import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedArticles } from '../../lib/data/articles-data'

export const metadata: Metadata = {
  title: 'Articles | Expert Opinions | Coopeverything',
  description:
    'Author-owned articles and expert opinions on cooperation, governance, and building alternatives to hierarchy.',
}

function ArticleCard({
  slug,
  title,
  summary,
  authorName,
  publishedAt,
  readTimeMinutes,
  tags,
  cooperationPaths,
  viewCount,
  likeCount,
}: {
  slug: string
  title: string
  summary: string
  authorName: string
  publishedAt?: string
  readTimeMinutes: number
  tags: string[]
  cooperationPaths?: string[]
  viewCount: number
  likeCount: number
}) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <Link
      href={`/articles/${slug}`}
      className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 hover:shadow-lg transition-all duration-200 overflow-hidden group"
    >
      <div className="p-6">
        {/* Author & Date */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-sm font-medium">
            {authorName.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{authorName}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
              {formattedDate} · {readTimeMinutes} min read
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 transition-colors">
          {title}
        </h3>

        {/* Summary */}
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
          {summary}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {cooperationPaths?.slice(0, 2).map((path) => (
            <span
              key={path}
              className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium"
            >
              {path}
            </span>
          ))}
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Engagement */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {viewCount}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {likeCount}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function ArticlesPage() {
  const articles = getPublishedArticles()

  const totalViews = articles.reduce((sum, a) => sum + a.viewCount, 0)
  const totalLikes = articles.reduce((sum, a) => sum + a.likeCount, 0)
  const uniqueAuthors = new Set(articles.map((a) => a.authorId)).size

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white text-2xl">
              ✍️
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Articles</h1>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Expert opinions & perspectives</p>
            </div>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-400 dark:text-gray-500 max-w-3xl mb-6">
            Author-owned articles representing individual perspectives on cooperation,
            governance, and alternatives to hierarchy. Unlike wiki articles, these
            maintain clear authorship and represent personal viewpoints.
          </p>

          {/* Stats & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-6">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{articles.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Articles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueAuthors}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Authors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalViews}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Total Views</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalLikes}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Total Likes</div>
              </div>
            </div>

            <Link
              href="/articles/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Write Article
            </Link>
          </div>
        </header>

        {/* Info Box */}
        <div className="mb-8 p-4 bg-gradient-to-r from-orange-50 to-rose-50 rounded-xl border border-orange-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Articles vs Wiki
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Articles</strong> are author-owned expert opinions—the author's
                name stays attached, and they own their perspective.{' '}
                <strong>Wiki articles</strong> are community-owned and evolve through
                collective editing. Both contribute to our shared knowledge, just in
                different ways.
              </p>
              <div className="mt-2 flex gap-4">
                <Link
                  href="/wiki"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse Wiki →
                </Link>
                <Link
                  href="/glossary"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Glossary →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No articles yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-6">
              Be the first to share your perspective!
            </p>
            <Link
              href="/articles/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Write an Article
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                slug={article.slug}
                title={article.title}
                summary={article.summary}
                authorName={article.authorName}
                publishedAt={article.publishedAt}
                readTimeMinutes={article.readTimeMinutes}
                tags={article.tags}
                cooperationPaths={article.cooperationPaths}
                viewCount={article.viewCount}
                likeCount={article.likeCount}
              />
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Have something to say?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">
            Share your perspective, experience, or expertise with the community.
            Your voice matters.
          </p>
          <Link
            href="/articles/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Write an Article
          </Link>
        </div>
      </div>
    </div>
  )
}
