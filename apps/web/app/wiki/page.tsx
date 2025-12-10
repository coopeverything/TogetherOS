import type { Metadata } from 'next'
import Link from 'next/link'
import {
  wikiArticles,
  getAllTags,
  getAllCooperationPaths,
} from '../../lib/data/wiki-data'

export const metadata: Metadata = {
  title: 'Wiki | Coopeverything',
  description:
    'Community-owned knowledge base. Explore concepts, governance principles, and cooperative practices.',
}

function StatusBadge({ status }: { status: 'stable' | 'evolving' | 'contested' }) {
  const styles = {
    stable: 'bg-brand-100 text-brand-600 border-brand-500/30',
    evolving: 'bg-joy-100 text-joy-600 border-joy-500/30',
    contested: 'bg-danger-bg text-danger border-danger/30',
  }

  const icons = {
    stable: '●',
    evolving: '◐',
    contested: '◎',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      <span className="text-[10px]">{icons[status]}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function WikiCard({
  slug,
  title,
  summary,
  status,
  tags,
  contributorCount,
  lastEditedAt,
  readTimeMinutes,
}: {
  slug: string
  title: string
  summary: string
  status: 'stable' | 'evolving' | 'contested'
  tags: string[]
  contributorCount: number
  lastEditedAt: string
  readTimeMinutes: number
}) {
  const formattedDate = new Date(lastEditedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="bg-bg-1 rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-sm font-semibold text-ink-900">
          {title}
        </h3>
        <StatusBadge status={status} />
      </div>

      <p className="text-ink-700 leading-relaxed mb-4">{summary}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-bg-2 text-ink-700 rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm text-ink-400">
        <Link
          href={`/wiki/${slug}`}
          className="flex items-center gap-1 text-brand-600 hover:text-brand-500 hover:underline transition-colors"
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {readTimeMinutes} min read
        </Link>
        <span className="flex items-center gap-1">
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
          {contributorCount} contributor{contributorCount !== 1 ? 's' : ''}
        </span>
        <span>Last edited {formattedDate}</span>
      </div>
    </div>
  )
}

export default function WikiPage() {
  const tags = getAllTags()
  const paths = getAllCooperationPaths()

  // Group articles by status
  const stableArticles = wikiArticles.filter((a) => a.status === 'stable')
  const evolvingArticles = wikiArticles.filter((a) => a.status === 'evolving')
  const contestedArticles = wikiArticles.filter((a) => a.status === 'contested')

  return (
    <div className="min-h-screen bg-bg-0">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white">
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-ink-900">Wiki</h1>
              <p className="text-ink-400">Community-owned knowledge</p>
            </div>
          </div>

          <p className="text-sm text-ink-700 leading-relaxed max-w-3xl">
            These articles are <strong>collectively maintained</strong> by the
            community. They represent our evolving understanding of cooperation,
            governance, and how we work together. Every concept is open to
            discussion and improvement.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/glossary"
              className="inline-flex items-center gap-2 px-4 py-2 bg-bg-1 border border-border rounded-lg text-ink-700 hover:border-brand-500 hover:bg-brand-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
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
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              View Glossary
            </Link>
            <Link
              href="/forum"
              className="inline-flex items-center gap-2 px-4 py-2 bg-bg-1 border border-border rounded-lg text-ink-700 hover:border-brand-500 hover:bg-brand-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Join Discussions
            </Link>
          </div>
        </div>

        {/* Status Legend */}
        <div className="bg-bg-1 rounded-xl border border-border p-4 mb-4">
          <h2 className="text-sm font-medium text-ink-700 mb-3">
            Article Status
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <StatusBadge status="stable" />
              <span className="text-sm text-ink-700">
                Broad consensus, rarely edited
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="evolving" />
              <span className="text-sm text-ink-700">
                Active refinement, open to input
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="contested" />
              <span className="text-sm text-ink-700">
                Active debate, see discussion
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-bg-1 rounded-lg border border-border p-4 text-center">
            <div className="text-sm font-bold text-ink-900">
              {wikiArticles.length}
            </div>
            <div className="text-sm text-ink-400">Articles</div>
          </div>
          <div className="bg-bg-1 rounded-lg border border-border p-4 text-center">
            <div className="text-sm font-bold text-brand-600">
              {stableArticles.length}
            </div>
            <div className="text-sm text-ink-400">Stable</div>
          </div>
          <div className="bg-bg-1 rounded-lg border border-border p-4 text-center">
            <div className="text-sm font-bold text-joy-600">
              {evolvingArticles.length}
            </div>
            <div className="text-sm text-ink-400">Evolving</div>
          </div>
          <div className="bg-bg-1 rounded-lg border border-border p-4 text-center">
            <div className="text-sm font-bold text-joy-600">{tags.length}</div>
            <div className="text-sm text-ink-400">Topics</div>
          </div>
        </div>

        {/* All Articles */}
        <section>
          <h2 className="text-sm font-semibold text-ink-900 mb-3">
            All Articles
          </h2>
          <div className="space-y-2">
            {wikiArticles.map((article) => (
              <WikiCard
                key={article.id}
                slug={article.slug}
                title={article.title}
                summary={article.summary}
                status={article.status}
                tags={article.tags}
                contributorCount={article.contributorCount}
                lastEditedAt={article.lastEditedAt}
                readTimeMinutes={article.readTimeMinutes}
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 p-4 bg-brand-100 rounded-xl border border-brand-500/30">
          <h3 className="font-semibold text-ink-900 mb-2">
            This is community knowledge
          </h3>
          <p className="text-ink-700 mb-4">
            Every article can be discussed, challenged, and improved. If you
            disagree with something or have a better way to explain it, start a
            discussion. That's how we learn together.
          </p>
          <div className="flex gap-3">
            <Link
              href="/forum"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Start a Discussion
            </Link>
            <Link
              href="/manifesto"
              className="inline-flex items-center gap-2 px-4 py-2 bg-bg-1 border border-border text-ink-700 rounded-lg hover:bg-bg-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Read the Manifesto
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
