import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import {
  wikiArticles,
  getWikiArticleBySlug,
  getRelatedArticles,
  glossaryTerms,
} from '../../../lib/data/wiki-data'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getWikiArticleBySlug(slug)

  if (!article) {
    return { title: 'Article Not Found | Wiki' }
  }

  return {
    title: `${article.title} | Wiki | Coopeverything`,
    description: article.summary,
  }
}

export async function generateStaticParams() {
  return wikiArticles.map((article) => ({
    slug: article.slug,
  }))
}

function StatusBadge({
  status,
}: {
  status: 'stable' | 'evolving' | 'contested'
}) {
  const styles = {
    stable: 'bg-green-100 text-green-800 border-green-200',
    evolving: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    contested: 'bg-red-100 text-red-800 border-red-200',
  }

  const icons = {
    stable: '●',
    evolving: '◐',
    contested: '◎',
  }

  const descriptions = {
    stable: 'Broad consensus, rarely edited',
    evolving: 'Active refinement, open to input',
    contested: 'Active debate — see discussion',
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${styles[status]}`}
    >
      <span className="text-xs">{icons[status]}</span>
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      <span className="text-xs opacity-75">· {descriptions[status]}</span>
    </div>
  )
}

export default async function WikiArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getWikiArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = getRelatedArticles(article)
  const articleTerms = glossaryTerms.filter(
    (t) => article.terms?.includes(t.slug)
  )

  const formattedDate = new Date(article.lastEditedAt).toLocaleDateString(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/wiki" className="hover:text-blue-600">
                Wiki
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{article.title}</li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg">
              📖
            </div>
            <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
              Wiki Article
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            {article.summary}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <StatusBadge status={article.status} />
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-6 border-b border-gray-200">
            <span className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {article.readTimeMinutes} min read
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {article.contributorCount} contributor
              {article.contributorCount !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Last edited {formattedDate}
            </span>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-lg prose-gray max-w-none mb-12">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 rounded-r-lg italic text-gray-700">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono text-gray-800">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-4">
                  {children}
                </pre>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 bg-gray-50 text-left text-sm font-semibold text-gray-900">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 text-sm text-gray-700 border-t border-gray-200">
                  {children}
                </td>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">
                  {children}
                </strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  {children}
                </a>
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </article>

        {/* Tags */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Cooperation Paths */}
        {article.cooperationPaths && article.cooperationPaths.length > 0 && (
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Cooperation Paths
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.cooperationPaths.map((path) => (
                <span
                  key={path}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {path}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Terms */}
        {articleTerms.length > 0 && (
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Key Terms in This Article
            </h3>
            <div className="grid gap-3">
              {articleTerms.map((term) => (
                <Link
                  key={term.id}
                  href={`/glossary/${term.slug}`}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-xl">📖</span>
                  <div>
                    <div className="font-medium text-gray-900">{term.word}</div>
                    <div className="text-sm text-gray-600">
                      {term.shortDefinition}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Related Articles
            </h3>
            <div className="grid gap-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/wiki/${related.slug}`}
                  className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm flex-shrink-0">
                    📖
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {related.title}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {related.summary}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Discuss This Article
          </Link>
          <Link
            href="/wiki"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Wiki
          </Link>
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
          <p>
            <strong>This is community knowledge.</strong> If you have
            suggestions, corrections, or want to contribute, start a discussion
            in the forum. Wiki articles evolve through collective deliberation.
          </p>
        </div>
      </div>
    </div>
  )
}
