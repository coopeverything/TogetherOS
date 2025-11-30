import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  glossaryTerms,
  getGlossaryTermBySlug,
  getWikiArticleBySlug,
  getRelatedTerms,
} from '../../../lib/data/wiki-data'

type Props = {
  params: Promise<{ term: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { term: termSlug } = await params
  const term = getGlossaryTermBySlug(termSlug)

  if (!term) {
    return { title: 'Term Not Found | Glossary' }
  }

  return {
    title: `${term.word} | Glossary | Coopeverything`,
    description: term.shortDefinition,
  }
}

export async function generateStaticParams() {
  return glossaryTerms.map((term) => ({
    term: term.slug,
  }))
}

export default async function GlossaryTermPage({ params }: Props) {
  const { term: termSlug } = await params
  const term = getGlossaryTermBySlug(termSlug)

  if (!term) {
    notFound()
  }

  const wikiArticle = term.wikiArticleSlug
    ? getWikiArticleBySlug(term.wikiArticleSlug)
    : null
  const relatedTerms = getRelatedTerms(term)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/glossary" className="hover:text-emerald-600">
                Glossary
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{term.word}</li>
          </ol>
        </nav>

        {/* Term Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl">
              📖
            </div>
            <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide">
              Glossary Term
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{term.word}</h1>

          {term.cooperationPath && (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mb-4">
              {term.cooperationPath}
            </span>
          )}
        </header>

        {/* Definition Box */}
        <div className="bg-white rounded-xl border-2 border-emerald-200 p-6 mb-8">
          <h2 className="text-sm font-medium text-emerald-600 uppercase tracking-wide mb-3">
            Definition
          </h2>
          <p className="text-xl text-gray-800 leading-relaxed">
            {term.shortDefinition}
          </p>
        </div>

        {/* Wiki Article Link */}
        {wikiArticle && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Learn More
            </h2>
            <Link
              href={`/wiki/${wikiArticle.slug}`}
              className="block bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg flex-shrink-0">
                  📖
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                      Wiki Article
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        wikiArticle.status === 'stable'
                          ? 'bg-green-100 text-green-800'
                          : wikiArticle.status === 'evolving'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {wikiArticle.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {wikiArticle.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    {wikiArticle.summary}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{wikiArticle.readTimeMinutes} min read</span>
                    <span>
                      {wikiArticle.contributorCount} contributor
                      {wikiArticle.contributorCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Related Terms */}
        {relatedTerms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Related Terms
            </h2>
            <div className="grid gap-3">
              {relatedTerms.map((related) => (
                <Link
                  key={related.id}
                  href={`/glossary/${related.slug}`}
                  className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors group"
                >
                  <span className="text-lg">📖</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {related.word}
                    </div>
                    <div className="text-sm text-gray-600">
                      {related.shortDefinition}
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
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
            Discuss This Term
          </Link>
          <Link
            href="/glossary"
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
            Back to Glossary
          </Link>
        </div>

        {/* Usage Note */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
          <p>
            <strong>How terms work on this site:</strong> When you see a term
            with a dotted underline, hover over it to see this definition. Click
            to visit this page. This helps you explore concepts without leaving
            your current context.
          </p>
        </div>
      </div>
    </div>
  )
}
