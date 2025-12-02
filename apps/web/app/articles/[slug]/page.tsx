import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import type { ReactNode } from 'react'

// Type for ReactMarkdown component props
type MarkdownComponentProps = {
  children?: ReactNode
  href?: string
}
import {
  articles,
  getArticleBySlug,
  getRelatedArticles,
} from '../../../lib/data/articles-data'
import { getWikiArticleBySlug } from '../../../lib/data/wiki-data'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    return { title: 'Article Not Found' }
  }

  return {
    title: `${article.title} | Articles | Coopeverything`,
    description: article.summary,
  }
}

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article || article.status !== 'published') {
    notFound()
  }

  const relatedArticles = getRelatedArticles(article)
  const relatedWikiArticles = article.relatedWikiSlugs
    ?.map((s) => getWikiArticleBySlug(s))
    .filter(Boolean)

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
            <li>
              <Link href="/articles" className="hover:text-orange-600">
                Articles
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
              {article.title}
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white text-lg">
              ✍️
            </div>
            <span className="text-sm font-medium text-orange-600 uppercase tracking-wide">
              Expert Opinion
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {article.title}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 dark:text-gray-500 leading-relaxed mb-6">
            {article.summary}
          </p>

          {/* Author Info */}
          <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-lg font-medium">
              {article.authorName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-white">{article.authorName}</div>
              {article.authorBio && (
                <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{article.authorBio}</div>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 pb-6 border-b border-gray-200 dark:border-gray-700">
            {formattedDate && (
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
                {formattedDate}
              </span>
            )}
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {article.viewCount} views
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {article.likeCount} likes
            </span>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-lg prose-gray max-w-none mb-12">
          <ReactMarkdown
            components={{
              h1: ({ children }: MarkdownComponentProps) => (
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                  {children}
                </h1>
              ),
              h2: ({ children }: MarkdownComponentProps) => (
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {children}
                </h2>
              ),
              h3: ({ children }: MarkdownComponentProps) => (
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  {children}
                </h3>
              ),
              p: ({ children }: MarkdownComponentProps) => (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{children}</p>
              ),
              ul: ({ children }: MarkdownComponentProps) => (
                <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700 dark:text-gray-300">
                  {children}
                </ul>
              ),
              ol: ({ children }: MarkdownComponentProps) => (
                <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700 dark:text-gray-300">
                  {children}
                </ol>
              ),
              li: ({ children }: MarkdownComponentProps) => <li className="text-gray-700 dark:text-gray-300">{children}</li>,
              blockquote: ({ children }: MarkdownComponentProps) => (
                <blockquote className="border-l-4 border-orange-500 pl-4 py-2 my-4 bg-orange-50 rounded-r-lg italic text-gray-700 dark:text-gray-300">
                  {children}
                </blockquote>
              ),
              code: ({ children }: MarkdownComponentProps) => (
                <code className="bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono text-gray-800 dark:text-gray-100">
                  {children}
                </code>
              ),
              strong: ({ children }: MarkdownComponentProps) => (
                <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
              ),
              em: ({ children }: MarkdownComponentProps) => (
                <em className="italic text-gray-700 dark:text-gray-300">{children}</em>
              ),
              hr: () => <hr className="my-8 border-gray-200 dark:border-gray-700" />,
              a: ({ href, children }: MarkdownComponentProps) => (
                <a
                  href={href}
                  className="text-orange-600 hover:text-orange-700 underline"
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
        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Cooperation Paths */}
        {article.cooperationPaths && article.cooperationPaths.length > 0 && (
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
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

        {/* Related Wiki Articles */}
        {relatedWikiArticles && relatedWikiArticles.length > 0 && (
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
              Related Wiki Articles
            </h3>
            <div className="grid gap-3">
              {relatedWikiArticles.map((wiki) => (
                <Link
                  key={wiki!.id}
                  href={`/wiki/${wiki!.slug}`}
                  className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm flex-shrink-0">
                    📖
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{wiki!.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 line-clamp-2">
                      {wiki!.summary}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
              Related Articles
            </h3>
            <div className="grid gap-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/articles/${related.slug}`}
                  className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white text-sm flex-shrink-0">
                    ✍️
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{related.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      By {related.authorName}
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
            href={`/forum?title=${encodeURIComponent(article.title + ' Discussion')}&description=${encodeURIComponent(`Discussion about the article: **${article.title}** by ${article.authorName}\n\n${article.summary}`)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
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
            href="/articles"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
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
            Back to Articles
          </Link>
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-sm text-gray-700 dark:text-gray-300">
          <p>
            <strong>This is an author-owned opinion article.</strong> The views
            expressed here belong to the author and may not represent community
            consensus. Want to share your perspective?{' '}
            <Link href="/articles/new" className="text-orange-600 hover:underline">
              Write your own article
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
