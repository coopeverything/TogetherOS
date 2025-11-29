import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { AnchorHTMLAttributes } from 'react'

interface Props {
  params: Promise<{ slug: string }>
}

/**
 * Custom link component that transforms .md links to work on the live site.
 * - Relative .md links (./foo.md, ../bar.md) → /docs/modules/foo, /docs/bar
 * - Absolute GitHub links → external (unchanged)
 * - Other links → unchanged
 */
function MarkdownLink({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!href) {
    return <span {...props}>{children}</span>
  }

  // Handle relative .md links
  if (href.endsWith('.md') && !href.startsWith('http')) {
    // Remove .md extension
    let newHref = href.replace(/\.md$/, '')

    // Handle relative paths
    if (newHref.startsWith('./')) {
      // Same directory: ./foo.md → /docs/modules/foo
      newHref = `/docs/modules/${newHref.slice(2)}`
    } else if (newHref.startsWith('../')) {
      // Parent directory: ../contributors/GETTING_STARTED.md → /docs/contributors/GETTING_STARTED
      newHref = newHref.replace(/^\.\.\//, '/docs/')
    } else if (!newHref.startsWith('/')) {
      // No prefix: foo.md → /docs/modules/foo
      newHref = `/docs/modules/${newHref}`
    }

    return (
      <Link href={newHref} {...props}>
        {children}
      </Link>
    )
  }

  // External links
  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  }

  // Other internal links
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}

// Map of valid slugs to their file names
const VALID_MODULES = [
  'admin-accountability',
  'bridge',
  'events',
  'feed',
  'forum',
  'gamification',
  'governance',
  'groups',
  'metrics',
  'moderation-transparency',
  'observability',
  'onboarding',
  'rewards',
  'search',
  'security',
  'social-economy',
  'support-points-ui',
] as const

/**
 * Get the path to the docs/modules directory.
 * Works in both development and production builds.
 * In monorepo: apps/web runs with cwd at apps/web, so ../../docs/modules
 * Falls back to checking from project root if that fails.
 */
function getDocsPath(slug: string): string | null {
  // Try relative path from apps/web (build context)
  const relativePath = path.join(process.cwd(), '..', '..', 'docs', 'modules', `${slug}.md`)
  if (fs.existsSync(relativePath)) {
    return relativePath
  }

  // Try from project root (some CI contexts)
  const rootPath = path.join(process.cwd(), 'docs', 'modules', `${slug}.md`)
  if (fs.existsSync(rootPath)) {
    return rootPath
  }

  // Try absolute path construction
  const absolutePath = path.resolve(__dirname, '..', '..', '..', '..', '..', '..', 'docs', 'modules', `${slug}.md`)
  if (fs.existsSync(absolutePath)) {
    return absolutePath
  }

  return null
}

export async function generateStaticParams() {
  return VALID_MODULES.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const title = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    title: `${title} | TogetherOS Modules`,
    description: `Documentation for the ${title} module in TogetherOS`,
  }
}

export default async function ModuleDocPage({ params }: Props) {
  const { slug } = await params

  // Validate slug against known modules
  if (!VALID_MODULES.includes(slug as (typeof VALID_MODULES)[number])) {
    notFound()
  }

  // Find the markdown file
  const filePath = getDocsPath(slug)

  if (!filePath) {
    notFound()
  }

  const content = fs.readFileSync(filePath, 'utf-8')

  // Extract title from first H1 if present
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const pageTitle = titleMatch
    ? titleMatch[1]
    : slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <Link
            href="/modules"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Modules
          </Link>
        </nav>

        {/* Content */}
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/*
            Prose styling with improved paragraph spacing:
            - prose-p:mb-6 adds bottom margin to paragraphs
            - prose-li:mb-2 adds spacing between list items
            - prose-headings:mt-8 adds top margin to headings
          */}
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:mt-8 prose-headings:mb-4 prose-p:text-gray-700 prose-p:mb-6 prose-p:leading-relaxed prose-li:mb-2 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-medium prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:p-3 prose-th:text-left prose-td:border prose-td:border-gray-300 prose-td:p-3 prose-hr:my-8 prose-ul:my-6 prose-ol:my-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{ a: MarkdownLink }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between text-sm text-gray-600">
          <Link
            href="/modules"
            className="text-blue-600 hover:text-blue-700"
          >
            View all modules
          </Link>
          <a
            href={`https://github.com/coopeverything/TogetherOS/blob/yolo/docs/modules/${slug}.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            Edit on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
