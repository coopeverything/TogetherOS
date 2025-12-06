import type { Metadata } from 'next'
import Link from 'next/link'
import { glossaryTerms, getWikiArticleBySlug } from '../../lib/data/wiki-data'

export const metadata: Metadata = {
  title: 'Glossary | Coopeverything',
  description:
    'Terms and definitions used throughout TogetherOS. Quick explanations with links to deeper content.',
}

export default function GlossaryPage() {
  // Group terms alphabetically
  const groupedTerms = glossaryTerms.reduce(
    (acc, term) => {
      const firstLetter = term.word[0].toUpperCase()
      if (!acc[firstLetter]) {
        acc[firstLetter] = []
      }
      acc[firstLetter].push(term)
      return acc
    },
    {} as Record<string, typeof glossaryTerms>
  )

  const sortedLetters = Object.keys(groupedTerms).sort()
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
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
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">Glossary</h1>
              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Quick definitions, deeper links</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 leading-relaxed max-w-3xl">
            Terms used throughout TogetherOS. Each term has a brief definition
            and links to wiki articles for deeper understanding. When you see a{' '}
            <span className="border-b border-dotted border-gray-400 cursor-help">
              dotted underline
            </span>{' '}
            on the site, hover for a quick definition.
          </p>

          <div className="mt-6">
            <Link
              href="/wiki"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Browse Wiki Articles
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {glossaryTerms.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Terms Defined</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-sm font-bold text-emerald-600">
              {sortedLetters.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Letters Used</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center md:col-span-1 col-span-2">
            <div className="text-sm font-bold text-blue-600">
              {glossaryTerms.filter((t) => t.wikiArticleSlug).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">With Wiki Articles</div>
          </div>
        </div>

        {/* Alphabet Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4 sticky top-4 z-10">
          <div className="flex flex-wrap gap-1 justify-center">
            {alphabet.map((letter) => {
              const hasTerms = groupedTerms[letter]
              return (
                <a
                  key={letter}
                  href={hasTerms ? `#letter-${letter}` : undefined}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                    hasTerms
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-gray-50 text-gray-300 cursor-default'
                  }`}
                >
                  {letter}
                </a>
              )
            })}
          </div>
        </div>

        {/* Terms List */}
        <div className="space-y-10">
          {sortedLetters.map((letter) => (
            <section key={letter} id={`letter-${letter}`}>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  {letter}
                </span>
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  {groupedTerms[letter].length} term
                  {groupedTerms[letter].length !== 1 ? 's' : ''}
                </span>
              </h2>

              <div className="space-y-3">
                {groupedTerms[letter].map((term) => {
                  const wikiArticle = term.wikiArticleSlug
                    ? getWikiArticleBySlug(term.wikiArticleSlug)
                    : null

                  return (
                    <Link
                      key={term.id}
                      href={`/glossary/${term.slug}`}
                      className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-emerald-300 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors mb-1">
                            {term.word}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 leading-relaxed">
                            {term.shortDefinition}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                            {term.cooperationPath && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                {term.cooperationPath}
                              </span>
                            )}
                            {wikiArticle && (
                              <span className="text-emerald-600 flex items-center gap-1">
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
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                  />
                                </svg>
                                Read more in Wiki
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors">
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
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Language is never final
          </h3>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">
            Every term here represents our current understanding. If you think a
            definition could be clearer or more inclusive, start a discussion.
            The glossary evolves through collective input.
          </p>
          <div className="flex gap-3">
            <Link
              href="/forum"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Suggest Improvements
            </Link>
            <Link
              href="/wiki/mental-flexibility"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Why Language Matters
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
