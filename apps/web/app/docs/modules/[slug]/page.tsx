import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

interface Props {
  params: Promise<{ slug: string }>
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
  'notifications',
  'observability',
  'onboarding',
  'rewards',
  'search',
  'security',
  'social-economy',
  'support-points-ui',
] as const

// Set of module slugs that have actual internal pages
const INTERNAL_MODULE_ROUTES = new Set<string>(VALID_MODULES)

// GitHub icon component
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

// External link icon component
function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-3 h-3 inline-block ml-1"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

/**
 * Custom link component that transforms .md links to work on the live site.
 * - Sibling module links (./governance.md) → internal routes (if module exists)
 * - Other .md links → GitHub (for files without internal routes)
 * - Absolute GitHub links → external (unchanged)
 * - Other links → unchanged
 */
function createMarkdownLink(slug: string) {
  return function MarkdownLink({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    if (!href) {
      return <span {...props}>{children}</span>
    }

    // Handle relative .md links
    if (href.endsWith('.md') && !href.startsWith('http')) {
      const pathWithoutMd = href.replace(/\.md$/, '')

      // Check if it's a sibling module link (./foo.md) that has an internal page
      if (pathWithoutMd.startsWith('./')) {
        const moduleName = pathWithoutMd.slice(2)
        // Only use internal route if module exists in our VALID_MODULES list
        if (INTERNAL_MODULE_ROUTES.has(moduleName)) {
          return (
            <Link href={`/docs/modules/${moduleName}`} {...props}>
              {children}
            </Link>
          )
        }
      }

      // For all other .md links, redirect to GitHub
      const githubBase = 'https://github.com/coopeverything/TogetherOS/blob/yolo/'
      let githubPath: string

      if (href.startsWith('../')) {
        // Parent directory: ../architecture.md → docs/architecture.md
        githubPath = `docs/${href.slice(3)}`
      } else if (href.startsWith('./')) {
        // Same directory but not a module: ./ui/README.md → docs/modules/ui/README.md
        githubPath = `docs/modules/${href.slice(2)}`
      } else {
        // No prefix: something.md → docs/modules/something.md
        githubPath = `docs/modules/${href}`
      }

      return (
        <a
          href={`${githubBase}${githubPath}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5"
          {...props}
        >
          {children}
          <ExternalLinkIcon className="w-3 h-3 opacity-60" />
        </a>
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
}

/**
 * Custom code component that styles inline code.
 * Block code is rendered with default styling (no replacement needed since
 * Technical Implementation sections now use proper markdown links).
 */
function CodeBlock({
  children,
  className,
  ...props
}: {
  children?: ReactNode
  className?: string
  node?: unknown
}) {
  // Check if this is a code block (has language class like "language-typescript")
  const isCodeBlock = className?.startsWith('language-')

  if (isCodeBlock) {
    // Render code blocks with syntax highlighting styling
    return (
      <code className={`${className} block bg-bg-2 p-4 rounded-lg overflow-x-auto text-sm`} {...props}>
        {children}
      </code>
    )
  }

  // Inline code: styled with background
  return (
    <code className="bg-bg-2 px-1.5 py-0.5 rounded text-sm font-medium" {...props}>
      {children}
    </code>
  )
}

/**
 * Get the path to the docs/modules directory.
 * Works in both development and production builds.
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
    description: `Learn about the ${title} module in TogetherOS - what it does, how it helps members, and how to use it.`,
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

  // Create slug-aware link component
  const MarkdownLink = createMarkdownLink(slug)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Navigation */}
        <nav className="mb-4">
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
        <article className="bg-bg-1 rounded-lg shadow-sm border border-border p-4">
          {/*
            Prose styling with improved paragraph spacing:
            - prose-p:mb-3 adds bottom margin to paragraphs
            - prose-li:mb-2 adds spacing between list items
            - prose-headings:mt-4 adds top margin to headings
          */}
          <div className="prose prose-lg max-w-none prose-headings:text-ink-900 prose-headings:mt-4 prose-headings:mb-4 prose-p:text-ink-700 prose-p:mb-3 prose-p:leading-relaxed prose-li:mb-2 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-bg-2 prose-th:p-3 prose-th:text-left prose-td:border prose-td:border-border prose-td:p-3 prose-hr:my-8 prose-ul:my-6 prose-ol:my-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                a: MarkdownLink,
                code: CodeBlock,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Developer Footer */}
        <div className="mt-4 p-4 bg-bg-1 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 text-ink-700">
            <GitHubIcon className="w-5 h-5" />
            <span className="font-medium">For Developers</span>
          </div>
          <p className="mt-2 text-sm text-ink-700">
            View the complete technical specification including API contracts,
            database schemas, TypeScript interfaces, and implementation details on{' '}
            <a
              href={`https://github.com/coopeverything/TogetherOS/blob/yolo/docs/dev/modules/${slug}-technical.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
            >
              GitHub
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-6 flex items-center justify-between text-sm text-ink-700">
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
            className="inline-flex items-center gap-1.5 text-ink-700 hover:text-ink-900"
          >
            <GitHubIcon className="w-4 h-4" />
            Edit on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
